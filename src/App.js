// src/App.js
import './App.css';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { UserProvider } from './context/userContext';

/*
  Enhanced global navigation:
  - double-back to exit
  - persistent history via sessionStorage
  - prevent duplicate entries
  - debounced popstate handling (gesture sensitivity fix)
  - safety fallback to home when navigation fails
  - extra guards to prevent MiniApp from closing accidentally
*/

const HISTORY_KEY = 'app_history_stack_v1';
const LAST_BACK_KEY = 'app_last_back_ts_v1';

function App() {
  const tele = typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;

  const navigate = useNavigate();
  const location = useLocation();

  // history stack stored in ref for fast ops; persisted in sessionStorage (A5)
  const historyStack = useRef([]);
  const ignorePop = useRef(false); // to ignore programmatic popstate
  const popDebounce = useRef(0); // debounce handle
  const [initialized, setInitialized] = useState(false);

  /* ---------- Initialize persistent history from sessionStorage ---------- */
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(HISTORY_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) historyStack.current = arr;
      }
    } catch (err) {
      historyStack.current = [];
    }

    // Ensure current route is present as the latest entry (prevent duplicates)
    const current = location.pathname;
    const last = historyStack.current[historyStack.current.length - 1];
    if (last !== current) {
      historyStack.current.push(current);
      sessionStorage.setItem(HISTORY_KEY, JSON.stringify(historyStack.current));
      // pushState so the WebView has at least one state to avoid immediate close
      try { window.history.pushState({ app: true }, '', window.location.href); } catch (e) { /* ignore */ }
    }

    setInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  /* ---------- Keep history in sync when route changes (A3 + A5) ---------- */
  useEffect(() => {
    if (!initialized) return;

    const current = location.pathname;
    const last = historyStack.current[historyStack.current.length - 1];

    // Prevent duplicate consecutive entries
    if (last !== current) {
      historyStack.current.push(current);
      try {
        sessionStorage.setItem(HISTORY_KEY, JSON.stringify(historyStack.current));
      } catch (err) {
        // ignore storage errors
      }
      // also push a history state to help WebView back-button behavior
      try {
        window.history.pushState({ app: true }, '', window.location.href);
      } catch (e) {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, initialized]);

  /* ---------- Safe navigate wrapper (C2) ---------- */
  const safeNavigate = (to, opts = {}) => {
    try {
      navigate(to, opts);
    } catch (err) {
      // fallback to root/home on navigation error
      try {
        navigate('/', { replace: true });
      } catch (e) {
        // ultimate fallback: set location.href
        window.location.href = '/';
      }
    }
  };

  /* ---------- Popstate handler (hardware back / gesture) ---------- */
  useEffect(() => {
    const handlePop = (ev) => {
      // Debounce rapid pop events (A4)
      const now = Date.now();
      if (now - popDebounce.current < 200) return;
      popDebounce.current = now;

      // If we triggered a programmatic push/pop, ignore this event
      if (ignorePop.current) {
        // clear the flag and ignore this one
        ignorePop.current = false;
        return;
      }

      // Remove current location from our stack (if matches)
      const cur = historyStack.current[historyStack.current.length - 1];
      if (cur === location.pathname) {
        historyStack.current.pop();
      }

      const prev = historyStack.current[historyStack.current.length - 1];

      if (!prev) {
        // No previous page — double-back to exit (A1 + C1)
        const last = Number(sessionStorage.getItem(LAST_BACK_KEY) || 0);

        if (now - last < 1500) {
          // second back within threshold — exit app
          if (tele && tele.close) {
            try { tele.close(); } catch (e) { window.close(); }
          } else {
            // non-telegram context: fallback to window.close or go home
            try { window.close(); } catch (e) { safeNavigate('/', { replace: true }); }
          }
        } else {
          // first back — notify user (we use Telegram's showAlert or confirm if available)
          sessionStorage.setItem(LAST_BACK_KEY, String(now));
          if (tele && tele.showAlert) {
            try { tele.showAlert('Press back again to exit'); } catch (e) { /* ignore */ }
          } else {
            // fallback small UI: native confirm
            try { window.confirm('Press back again to exit'); } catch (e) {}
          }
          // push a state to prevent immediate close; this helps gestures too
          try { ignorePop.current = true; window.history.pushState({ app: true }, '', window.location.href); } catch (e) {}
        }
        return;
      }

      // Normal back navigation — go to prev (use safeNavigate)
      // Pop prev from stack then navigate
      historyStack.current.pop();
      try {
        sessionStorage.setItem(HISTORY_KEY, JSON.stringify(historyStack.current));
      } catch (err) {}

      // navigate to previous route with replace to avoid duplicating entries
      safeNavigate(prev, { replace: true });
    };

    window.addEventListener('popstate', handlePop);

    return () => window.removeEventListener('popstate', handlePop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  /* ---------- Telegram Back Button sync (C1) ---------- */
  useEffect(() => {
    if (!tele) return;

    // Show telegram back button
    try { tele.BackButton.show(); } catch (e) {}
    const onClick = () => {
      // Pop current
      const cur = historyStack.current[historyStack.current.length - 1];
      if (cur === location.pathname) historyStack.current.pop();
      const prev = historyStack.current[historyStack.current.length - 1];

      if (!prev) {
        // confirm exit
        try {
          tele.showConfirm("Exit the app?", (ans) => {
            if (ans) {
              try { tele.close(); } catch (e) { window.close(); }
            }
          });
        } catch (e) {
          if (window.confirm('Exit the app?')) {
            try { tele.close(); } catch (err) { window.close(); }
          }
        }
        return;
      }

      // normal back
      historyStack.current.pop();
      try { sessionStorage.setItem(HISTORY_KEY, JSON.stringify(historyStack.current)); } catch (err) {}
      safeNavigate(prev, { replace: true });
    };

    try {
      tele.BackButton.onClick(onClick);
    } catch (e) {
      // older webapp versions: fallback no-op
    }

    return () => {
      try {
        tele.BackButton.offClick && tele.BackButton.offClick(onClick);
      } catch (e) {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tele, location.pathname]);

  /* ---------- Focus / visibility guard to reduce accidental close (C3) ---------- */
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        // when app goes to background, pushState to preserve a safe state
        try {
          ignorePop.current = true;
          window.history.pushState({ app: true }, '', window.location.href);
        } catch (e) {}
      }
    };

    const onFocus = () => {
      // ensure at least one state exists
      try {
        ignorePop.current = true;
        window.history.pushState({ app: true }, '', window.location.href);
      } catch (e) {}
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  /* ---------- Protect beforeunload: ask confirmation if user tries to close (C1) ---------- */
  useEffect(() => {
    const beforeUnload = (e) => {
      // If there is app history, prompt user; otherwise allow
      if (historyStack.current.length > 1) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
      return undefined;
    };

    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, []);

  /* ---------- Init Telegram WebApp (keep your existing init behaviors) ---------- */
  useEffect(() => {
    if (!tele) return;
    try {
      tele.ready();
      tele.expand && tele.expand();
      tele.setHeaderColor && tele.setHeaderColor('#3A59D1');
      if (tele.HapticFeedback && navigator.vibrate) {
        tele.HapticFeedback.impactOccurred && tele.HapticFeedback.impactOccurred('medium');
        navigator.vibrate(50);
      }
    } catch (e) {
      // ignore initialization errors
    }
  }, [tele]);

  /* ---------- Misc: first visit localStorage logic (no change) ---------- */
  useEffect(() => {
    const visited = localStorage.getItem('hasVisitedBefore');
    if (!visited) {
      localStorage.setItem('hasVisitedBefore', 'true');
    }
  }, []);

  return (
    <UserProvider>
      <TonConnectUIProvider manifestUrl="https://chic-phoenix-c00482.netlify.app/tonconnect-manifest.json">
        <div className="App">
          <Outlet/>
        </div>
      </TonConnectUIProvider>
    </UserProvider>
  );
}

export default App;
