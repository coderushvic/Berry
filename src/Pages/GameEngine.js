export default class GameEngine {
    constructor(canvas, { onGameOver }) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.onGameOver = onGameOver;
      this.FPS = 60;
      this.score = 0;
      this.gameObjects = [];
      this.isGameOver = false;
      this.interval = null;
      this.clicked = false;
  
      // Player properties
      this.player = {
        x: this.canvas.width / 2,
        y: this.canvas.height / 4,
        r: 10,
        c: this.getRandomColor(),
        spd: 0,
        spdMax: 6,
        acc: 0,
      };
  
      // Obstacle properties
      this.obstacles = {
        n: 0,
        sep: 350,
      };
  
      // Camera properties
      this.camY = 0;
  
      // Colors
      this.colors = ['#F39', '#3FF', '#FF3', '#A0F'];
  
      // Sounds
      this.tapSound = new Audio('/jump.wav');
      this.dieSound = new Audio('/game-over.wav');
  
      // Bind event listeners
      this.handleClick = this.handleClick.bind(this);
    }
  
    start() {
      this.setupCanvas();
      this.setupEventListeners();
      this.interval = setInterval(() => this.gameLoop(), 1000 / this.FPS);
    }
  
    stop() {
      clearInterval(this.interval);
      this.canvas.removeEventListener('click', this.handleClick);
    }
  
    setupCanvas() {
      const { canvas } = this;
      canvas.width = 360;
      canvas.height = 640;
      canvas.style.position = 'absolute';
      canvas.style.top = '50%';
      canvas.style.left = '50%';
      canvas.style.transform = 'translate(-50%, -50%)';
      canvas.style.zIndex = '1';
    }
  
    setupEventListeners() {
      this.canvas.addEventListener('click', this.handleClick);
    }
  
    handleClick() {
      this.clicked = true;
      this.tapSound.play();
    }
  
    gameLoop() {
      this.update();
      this.render();
    }
  
    update() {
      if (this.isGameOver) return;
  
      // Update player position
      if (this.clicked) {
        this.player.spd = this.player.spdMax;
        if (this.player.acc === 0) {
          this.player.spd *= 1.2;
          this.player.acc = -0.3;
        }
      }
  
      this.player.spd = Math.max(this.player.spd + this.player.acc, -this.player.spdMax);
      this.player.y = Math.max(this.player.y + this.player.spd, this.player.y);
  
      // Check for game over condition
      if (this.player.y < this.camY) {
        this.die();
      }
  
      // Update game objects
      this.gameObjects.forEach((obj) => obj.update());
  
      // Check for collisions
      this.checkCollisions();
  
      // Generate new obstacles
      while (this.obstacles.n < 2 + Math.floor(this.camY / this.obstacles.sep)) {
        this.obstacles.n += 1;
        this.generateObstacle(this.obstacles.n);
      }
  
      // Update camera
      this.camY = Math.max(this.camY, this.player.y - 250);
  
      // Reset clicked state
      this.clicked = false;
    }
  
    render() {
      const { ctx, canvas } = this;
  
      // Clear canvas
      ctx.fillStyle = '#222';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
  
      // Render player
      this.drawCircle(this.player.x, this.player.y, this.player.r, this.player.c);
  
      // Render game objects
      this.gameObjects.forEach((obj) => obj.draw());
  
      // Render score
      ctx.fillStyle = '#FFF';
      ctx.font = '30px Arial';
      ctx.fillText(`Score: ${this.score}`, 10, 30);
  
      // Render game over screen if applicable
      if (this.isGameOver) {
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#FFF';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
      }
    }
  
    die() {
      this.isGameOver = true;
      this.dieSound.play();
      this.onGameOver(this.score);
    }
  
    generateObstacle(n) {
      // Implement obstacle generation logic here
    }
  
    checkCollisions() {
      // Implement collision detection logic here
    }
  
    drawCircle(x, y, r, color) {
      this.ctx.beginPath();
      this.ctx.fillStyle = color;
      this.ctx.arc(x, y, r, 0, 2 * Math.PI);
      this.ctx.fill();
    }
  
    getRandomColor() {
      return this.colors[Math.floor(Math.random() * this.colors.length)];
    }
  }