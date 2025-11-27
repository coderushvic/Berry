// src/App.js
import './App.css';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState, useCallback } from 'react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { UserProvider } from './context/userContext';
import { useTranslation } from "react-i18next";

const HISTORY_KEY = 'app_history_stack_v1';
const LAST_BACK_KEY = 'app_last_back_ts_v1';

function App() {
  const { t } = useTranslation();

  const tele =
    typeof window !== 'undefined' &&
    window.Telegram &&
    window.Telegram.WebApp
      ? window.Telegram.WebApp
      : null;

  const teleRef = useRef(tele);
  const tRef = useRef(t);

  const navigate = useNavigate();
  const location = useLocation();

  const historyStack = useRef([]);
  const ignorePop = useRef(false);
  const popDebounce = useRef(0);
  const [initialized, setInitialized] = useState(false);

  /* ---------- Safe navigate (dependency-safe) ---------- */
  const safeNavigate = useCallback(
    (to, opts = {}) => {
      try {
        navigate(to, opts);
      } catch (err) {
        try {
          navigate('/', { replace: true });
        } catch (e) {
          window.location.href = '/';
        }
      }
    },
    [navigate]
  );

  /* ---------- Load session history once ---------- */
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

    const current = location.pathname;
    const last = historyStack.current[historyStack.current.length - 1];
    if (last !== current) {
      historyStack.current.push(current);
      sessionStorage.setItem(HISTORY_KEY, JSON.stringify(historyStack.current));
      try {
        window.history.pushState({ app: true }, '', window.location.href);
      } catch (e) {}
    }

    setInitialized(true);
  }, [location.pathname]);

  /* ---------- Keep history in sync ---------- */
  useEffect(() => {
    if (!initialized) return;

    const current = location.pathname;
    const last = historyStack.current[historyStack.current.length - 1];

    if (last !== current) {
      historyStack.current.push(current);
      try {
        sessionStorage.setItem(HISTORY_KEY, JSON.stringify(historyStack.current));
      } catch (err) {}
      try {
        window.history.pushState({ app: true }, '', window.location.href);
      } catch (e) {}
    }
  }, [location.pathname, initialized]);

  /* ---------- Back / popstate handler ---------- */
  useEffect(() => {
    const handlePop = () => {
      const now = Date.now();
      if (now - popDebounce.current < 200) return;
      popDebounce.current = now;

      if (ignorePop.current) {
        ignorePop.current = false;
        return;
      }

      const cur = historyStack.current[historyStack.current.length - 1];
      if (cur === location.pathname) {
        historyStack.current.pop();
      }

      const prev = historyStack.current[historyStack.current.length - 1];

      if (!prev) {
        const last = Number(sessionStorage.getItem(LAST_BACK_KEY) || 0);

        if (now - last < 1500) {
          if (teleRef.current && teleRef.current.close) {
            try {
              teleRef.current.close();
            } catch (e) {
              window.close();
            }
          } else {
            try {
              window.close();
            } catch (e) {
              safeNavigate('/', { replace: true });
            }
          }
        } else {
          sessionStorage.setItem(LAST_BACK_KEY, String(now));

          if (teleRef.current && teleRef.current.showAlert) {
            try {
              teleRef.current.showAlert(tRef.current("Press back again to exit"));
            } catch (e) {}
          } else {
            try {
              window.confirm(tRef.current("Press back again to exit"));
            } catch (e) {}
          }

          try {
            ignorePop.current = true;
            window.history.pushState({ app: true }, '', window.location.href);
          } catch (e) {}
        }
        return;
      }

      historyStack.current.pop();
      try {
        sessionStorage.setItem(HISTORY_KEY, JSON.stringify(historyStack.current));
      } catch (err) {}

      safeNavigate(prev, { replace: true });
    };

    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, [location.pathname, safeNavigate]);

  /* ---------- Telegram Back Button ---------- */
  useEffect(() => {
    const tele = teleRef.current;
    if (!tele) return;

    try {
      tele.BackButton.show();
    } catch (e) {}

    const onClick = () => {
      const cur = historyStack.current[historyStack.current.length - 1];
      if (cur === location.pathname) historyStack.current.pop();
      const prev = historyStack.current[historyStack.current.length - 1];

      if (!prev) {
        try {
          tele.showConfirm(tRef.current("Exit the app?"), (ans) => {
            if (ans) {
              try {
                tele.close();
              } catch (e) {
                window.close();
              }
            }
          });
        } catch (e) {
          if (window.confirm(tRef.current("Exit the app?"))) {
            try {
              tele.close();
            } catch (err) {
              window.close();
            }
          }
        }
        return;
      }

      historyStack.current.pop();
      sessionStorage.setItem(HISTORY_KEY, JSON.stringify(historyStack.current));
      safeNavigate(prev, { replace: true });
    };

    tele.BackButton.onClick(onClick);

    return () => {
      tele.BackButton.offClick && tele.BackButton.offClick(onClick);
    };
  }, [location.pathname, safeNavigate]);

  /* ---------- Visibility guards ---------- */
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        ignorePop.current = true;
        try {
          window.history.pushState({ app: true }, '', window.location.href);
        } catch (e) {}
      }
    };

    const onFocus = () => {
      ignorePop.current = true;
      try {
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

  /* ---------- Before unload ---------- */
  useEffect(() => {
    const beforeUnload = (e) => {
      if (historyStack.current.length > 1) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, []);

  /* ---------- Telegram init ---------- */
  useEffect(() => {
    const tele = teleRef.current;
    if (!tele) return;

    try {
      tele.ready();
      tele.expand();
      tele.setHeaderColor('#3A59D1');
    } catch (e) {}
  }, []);

  /* ---------- First visit ---------- */
  useEffect(() => {
    if (!localStorage.getItem('hasVisitedBefore')) {
      localStorage.setItem('hasVisitedBefore', 'true');
    }
  }, []);

  return (
    <UserProvider>
      <TonConnectUIProvider manifestUrl="https://chic-phoenix-c00482.netlify.app/tonconnect-manifest.json">
        <div className="App">
          <Outlet />
        </div>
      </TonConnectUIProvider>
    </UserProvider>
  );
}

export default App;
