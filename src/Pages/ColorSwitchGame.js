import React, { useEffect, useRef, useState, useCallback } from 'react';
import Footer from '../Component/Footer/Footer';
import { db } from '../firebase/firestore';
import { doc, getDoc, runTransaction } from 'firebase/firestore';
import { useUser } from '../context/userContext'; // Import the useUser hook

const GameComponent = () => {
  const canvasRef = useRef(null);
  const { balance, setBalance, id } = useUser(); // Access balance, setBalance, and id from UserContext
  const [gameOver, setGameOver] = useState(false);
  const [pointsToClaim, setPointsToClaim] = useState(0);

  // Get Telegram user ID
  const tg = window.Telegram.WebApp;
  const userId = tg.initDataUnsafe.user?.id || id; // Use Telegram ID or fallback to id from useUser

  // Ensure userId is a string
  const userIdStr = userId?.toString();

  console.log("User ID:", userIdStr); // Debugging: Log the userId

  const updateBalanceInFirebase = useCallback(
    async (points) => {
      if (!userIdStr || typeof userIdStr !== 'string') {
        console.error("Invalid user ID. Cannot update balance. User ID:", userIdStr);
        return;
      }

      if (typeof points !== 'number' || isNaN(points)) {
        console.error("Invalid points value. Expected a number, got:", points);
        return;
      }

      try {
        const userRef = doc(db, "telegramUsers", userIdStr);
        console.log("Updating balance in Firebase for user:", userIdStr, "with points:", points);

        // Use Firestore transaction to ensure atomic updates
        await runTransaction(db, async (transaction) => {
          const userSnap = await transaction.get(userRef);
          if (!userSnap.exists()) {
            throw new Error("User document does not exist.");
          }

          const currentBalance = userSnap.data().balance || 0;
          const newBalance = currentBalance + points;

          // Update Firestore
          transaction.update(userRef, { balance: newBalance });

          // Update local state
          setBalance(newBalance);
        });

        console.log("Balance updated in Firebase successfully.");
      } catch (error) {
        console.error('Error updating balance in Firebase:', error);
      }
    },
    [userIdStr, setBalance]
  );

  const handleClaimPoints = async () => {
    console.log("Claim button clicked. Attempting to claim points:", pointsToClaim);
    if (pointsToClaim > 0 && userIdStr) {
      try {
        console.log("Calling updateBalanceInFirebase with points:", pointsToClaim);
        await updateBalanceInFirebase(pointsToClaim); // Update Firebase with the claimed points
        console.log("Points claimed successfully. Resetting pointsToClaim and game state.");
        setPointsToClaim(0); // Reset points to claim
        setGameOver(false); // Reset game over state
      } catch (error) {
        console.error('Error claiming points:', error);
      }
    } else {
      console.error("No points to claim or user not logged in.");
    }
  };

  useEffect(() => {
    const fetchBalance = async () => {
      if (!userIdStr || typeof userIdStr !== 'string') {
        console.error("Invalid user ID. Cannot fetch balance. User ID:", userIdStr);
        return;
      }
      try {
        const userRef = doc(db, "telegramUsers", userIdStr);
        console.log("Fetching balance from Firebase for user:", userIdStr);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const userBalance = docSnap.data().balance || 0;
          console.log("Balance fetched from Firebase:", userBalance);
          setBalance(userBalance); // Update local state
        } else {
          console.error("User document does not exist in Firebase.");
        }
      } catch (error) {
        console.error('Error fetching balance from Firebase:', error);
      }
    };

    fetchBalance();
  }, [userIdStr, setBalance]);

  // Game logic (canvas, die function, etc.)
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Load sounds
    const tapSound = new Audio('/jump.wav');
    const dieSound = new Audio('/game-over.wav');

    document.body.style.backgroundColor = '#000';

    let FPS = 60;
    let T = 0;
    let TT = 0;
    let W = 360;
    let H = 640;
    let _W = W;
    let _H = H;
    let score = 0;
    let dim = {
      w: window.innerWidth,
      h: window.innerHeight,
    };

    canvas.width = W;
    canvas.height = H;

    _H = dim.h;
    _W = (dim.h * W) / H;

    if (W / H > dim.w / dim.h) {
      _W = dim.w;
      _H = (dim.w * H) / W;
    }

    canvas.style.position = 'absolute';
    canvas.style.top = `${(dim.h - _H) / 2}px`;
    canvas.style.left = `${(dim.w - _W) / 2}px`;
    canvas.style.width = `${_W}px`;
    canvas.style.height = `${_H}px`;
    canvas.style.zIndex = '1';

    let camY = 0;
    let died = false;

    const dCircle = (coords, radius, color) => {
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(coords.x, coords.y, radius, 0, 2 * Math.PI);
      ctx.fill();
    };

    const coord = (dx, dy) => {
      return {
        x: dx,
        y: H + camY - dy,
      };
    };

    const col = ['#F39', '#3FF', '#FF3', '#A0F'];

    const gCol = (index) => {
      const n = index;
      return col[n % 4];
    };

    const rRange = (x1, x2) => {
      return x1 + Math.random() * (x2 - x1);
    };

    const choose = (...args) => {
      return args[Math.floor(args.length * Math.random())];
    };

    const rCol = () => {
      return col[Math.floor(4 * Math.random())];
    };

    const repeat = (func, rep) => {
      for (let _rep = 0; _rep < rep; _rep++) {
        func();
      }
    };

    const getDots = (xy1, xy2) => {
      return {
        d: Math.sqrt(Math.pow(xy1.x - xy2.x, 2) + Math.pow(xy1.y - xy2.y, 2)),
        a: Math.atan2(xy1.y - xy2.y, xy2.x - xy1.x),
      };
    };

    const die = () => {
      died = true;
      dieSound.play();
      repeat(() => {
        newParticle(p.x, p.y + 5);
      }, 14);
      TT = 1;

      setGameOver(true);
      setPointsToClaim((prevPoints) => {
        const newPoints = prevPoints + score;
        console.log("Game Over. Adding score to pointsToClaim:", score, "Total:", newPoints);
        return newPoints;
      });
    };

    let colIndex = Math.floor(4 * Math.random());

    let p = {
      x: W / 2,
      y: H / 4,
      r: 10,
      c: gCol(colIndex),
      spd: 0,
      spdMax: 6,
      acc: 0,
    };

    let objects = [];

    const newObject = (x, y, r, c) => {
      const o = {
        x: x,
        y: y,
        r: r,
        c: c,
        t: 0,
        destroyed: false,
      };

      o.move = () => {};

      o.draw = () => {
        dCircle(coord(o.x, o.y), o.r, o.c);
      };

      o.destroy = () => {
        o.destroyed = true;
      };

      o.update = () => {
        o.move();
        o.draw();
        if (o.y + 100 < camY) {
          o.destroy();
        }
        o.t++;
      };

      objects.push(o);
      return o;
    };

    const modAng = (x) => {
      let y = x;
      while (y < 0) {
        y += Math.PI * 2;
      }
      return y % (Math.PI * 2);
    };

    const obstacles = {
      n: 0,
      sep: 350,
    };

    let cspd = 1;

    const new8 = (y, ang, dir, col) => {
      const o8 = newObject(W / 2, 100 + obstacles.sep * y, 10, gCol(col));
      o8.cx = o8.x;
      o8.cy = o8.y;
      o8.rad8 = 80;
      o8.d = dir;
      o8.a = ang;

      o8.move = () => {
        o8.x = o8.cx + 1.5 * o8.rad8 * Math.cos(o8.a);
        o8.y = o8.cy + 0.7 * o8.rad8 * Math.sin(2 * o8.a);
        o8.a += o8.d * 0.02;

        if (!died && p.c !== o8.c && getDots(coord(p.x, p.y), coord(o8.x, o8.y)).d < p.r + o8.r) {
          die();
        }
      };
    };

    const newW8 = (y) => {
      const ddir = choose(-1, 1);
      for (let i = 0; i < Math.PI * 2; i += (Math.PI * 2) / 20) {
        new8(y, i, ddir, Math.floor(8 * (i / (Math.PI * 2))));
      }
    };

    const newC1 = (y, rad, ospd, dir) => {
      const c1 = newObject(W / 2, 100 + obstacles.sep * y, rad, Math.floor(4 * Math.random()));
      c1.angle = Math.PI * 2 * Math.floor(4 * Math.random());
      c1.spd = dir * cspd * ospd;
      c1.w = (c1.r * 15) / 100;

      c1.draw = () => {
        const co = coord(c1.x, c1.y);
        ctx.lineWidth = c1.w;
        for (let j = 0; j < 4; j++) {
          ctx.beginPath();
          ctx.strokeStyle = gCol(j + c1.c);
          const a = modAng(c1.angle + (Math.PI / 2) * j);
          const a2 = modAng(a + Math.PI / 2);

          if (gCol(j + c1.c) !== p.c && !died) {
            const dots = getDots(co, coord(p.x, p.y));
            if (dots.d + p.r > c1.r - c1.w / 2 && dots.d - p.r < c1.r + c1.w / 2) {
              const pa = modAng(-dots.a);
              if (pa > a && pa < a2) {
                die();
              }
            }
          }

          ctx.arc(co.x, co.y, c1.r, a, a2);
          ctx.stroke();
        }
        c1.angle += (c1.spd * Math.PI) / 180;
      };
    };

    const newParticle = (x, y) => {
      const part = newObject(x, y, 5, rCol());
      part.g = 0.6;
      part.hspd = rRange(-10, 10);
      part.vspd = rRange(10, 20);

      part.move = () => {
        part.vspd -= part.g;
        part.x += part.hspd;
        part.y += part.vspd;
        if (part.x < 0 || part.x > W) {
          part.hspd *= -1;
        }
        if (part.y < camY) {
          part.destroy();
        }
      };
    };

    const newSwitch = (n) => {
      const sw = newObject(W / 2, 100 + obstacles.sep * n + obstacles.sep / 2, 15, '#FFF');

      sw.move = () => {
        if (
          getDots(
            {
              x: sw.x,
              y: sw.y,
            },
            {
              x: p.x,
              y: p.y,
            }
          ).d <
          p.r + sw.r
        ) {
          p.c = gCol(++colIndex);
          sw.destroy();
        }
      };

      sw.draw = () => {
        const co = coord(sw.x, sw.y);
        for (let i = 0; i < 4; i++) {
          const a = i * (Math.PI / 2);
          ctx.fillStyle = col[i];
          ctx.beginPath();
          ctx.lineTo(co.x, co.y);
          ctx.arc(co.x, co.y, sw.r, a, a + Math.PI / 2);
          ctx.lineTo(co.x, co.y);
          ctx.fill();
        }
      };
    };

    const newStar = (n) => {
      const st = newObject(W / 2, 100 + obstacles.sep * n, 15, '#DDD');
      st.score = 500; // Award 500 cats for each obstacle passed
      st.a = 0;
      st.rs = st.r;

      st.move = () => {
        if (
          getDots(
            {
              x: p.x,
              y: p.y,
            },
            {
              x: st.x,
              y: st.y,
            }
          ).d < st.r
        ) {
          score += st.score; // Add 500 cats to the score
          st.destroy();
        }

        st.r = st.rs + 1.2 * Math.sin((st.a++ / 180) * Math.PI * 4);
      };

      st.draw = () => {
        dStar(st.x, st.y, st.r, 0, st.c, 1, st.score === 1);
      };
    };

    const dStar = (x, y, r1, ang, col, alpha, outline) => {
      const co = coord(x, y);
      ctx.fillStyle = col;
      ctx.strokeStyle = col;
      ctx.lineWidth = 2;
      ctx.globalAlpha = alpha;
      ctx.beginPath();

      for (let j = 0; j <= 5; j++) {
        const a1 = (j * Math.PI * 2) / 5 - Math.PI / 2 - ang;
        const a2 = a1 + Math.PI / 5;
        const r2 = r1 * 0.5;
        ctx.lineTo(co.x + r1 * Math.cos(a1), co.y + r1 * Math.sin(a1));
        ctx.lineTo(co.x + r2 * Math.cos(a2), co.y + r2 * Math.sin(a2));
      }

      if (outline) {
        ctx.fill();
      } else {
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    };

    p.yy = p.y;

    let clicked = false;

    canvas.addEventListener('click', () => {
      clicked = true;
      tapSound.play();
    });

    const interval = setInterval(() => {
      ctx.fillStyle = '#222';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#FFF';
      ctx.font = '30px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(score, 10, 30);

      while (obstacles.n < 2 + Math.floor(camY / obstacles.sep)) {
        obstacles.n += 1;
        switch (choose(0, 0, 0, 0, 1, 2, 2, 2)) {
          case 0:
            newC1(obstacles.n, choose(100, 100, 70), 1, choose(-1, 1));
            break;
          case 1:
            newC1(obstacles.n, 100, 2 / 3, 1);
            newC1(obstacles.n, 70, 1, -1);
            break;
          case 2:
            newW8(obstacles.n);
            break;
          default:
            console.warn('Unexpected case in switch statement');
            break;
        }
        newSwitch(obstacles.n);
        newStar(obstacles.n);
        cspd *= 1.04;
      }

      if (!died) {
        if (clicked) {
          p.spd = p.spdMax;
          if (p.acc === 0) {
            p.spd *= 1.2;
            p.acc = -0.3;
          }
        }

        p.spd = Math.max(p.spd + p.acc, -p.spdMax);
        p.y = Math.max(p.y + p.spd, p.yy);
        if (p.y < camY) {
          die();
        }
        dCircle(coord(p.x, p.y), p.r, p.c);
      }

      for (let objIndex in objects) {
        objects[objIndex].update();
      }

      for (let i = objects.length - 1; i >= 0; i--) {
        if (objects[i].destroyed) {
          objects.splice(i, 1);
        }
      }

      camY = Math.max(camY, p.y - 250);
      T += TT;

      if (T > 70) {
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#000';
        ctx.strokeStyle = '#EEE';
        ctx.lineWidth = 2;
        ctx.textAlign = 'center';
        ctx.fillText('TAP TO', W / 2, H / 2);
        ctx.strokeText('TAP TO', W / 2, H / 2);
        ctx.fillText('RESTART', W / 2, H / 2 + 50);
        ctx.strokeText('RESTART', W / 2, H / 2 + 50);

        if (clicked) {
          score = 0; // Reset score for the new game
          T = 0;
          TT = 0;
          camY = 0;
          cspd = 1;
          died = false;
          p.y = H * (1 / 4);
          p.acc = 0;
          p.spd = 0;
          objects = [];
          obstacles.n = 0;
        }
      }

      clicked = false;
    }, 1000 / FPS);

    return () => {
      clearInterval(interval);
      canvas.removeEventListener('click', () => {});
    };
  }, [setBalance, userIdStr, updateBalanceInFirebase]);

  return (
    <>
      <div
        style={{
          position: 'absolute',
          zIndex: 2,
          color: 'white',
          textAlign: 'center',
          width: '100%',
          top: '10px',
          fontWeight: 'bold',
          fontSize: '24px',
        }}
      >
        NEWCATS: {balance}
      </div>
      {gameOver && pointsToClaim > 0 && (
        <div
          style={{
            position: 'absolute',
            zIndex: 9999, // Ensure it's on top
            color: 'white',
            textAlign: 'center',
            width: '100%',
            top: '50px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Temporary background to check visibility
          }}
        >
          <button
            onClick={handleClaimPoints}
            style={{
              padding: '10px 20px',
              fontSize: '18px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Claim {pointsToClaim} Cats
          </button>
        </div>
      )}
      <canvas ref={canvasRef} />
      <Footer />
    </>
  );
};

export default GameComponent;