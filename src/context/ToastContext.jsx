import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import '../components/Toast.css';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, removing: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 250);
  }, []);

  const addToast = useCallback(
    ({ type = 'info', title = '', message = '', duration = 3500 }) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      const newToast = { id, type, title, message, duration, removing: false };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
      return id;
    },
    [removeToast]
  );

  const toast = useMemo(
    () => ({
      success: (message, title = 'Success') =>
        addToast({ type: 'success', title, message }),
      error: (message, title = 'Error') =>
        addToast({ type: 'error', title, message }),
      info: (message, title = 'Information') =>
        addToast({ type: 'info', title, message }),
      warning: (message, title = 'Attention') =>
        addToast({ type: 'warning', title, message }),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ addToast, removeToast, toast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((item) => {
          const Icon =
            item.type === 'success'
              ? CheckCircle2
              : item.type === 'error'
              ? AlertCircle
              : item.type === 'warning'
              ? AlertTriangle
              : Info;

          return (
            <div
              key={item.id}
              className={`toast-item toast-${item.type} ${
                item.removing ? 'removing' : ''
              }`}
              role="alert"
            >
              <div className="toast-icon-wrapper">
                <Icon size={18} />
              </div>
              <div className="toast-content">
                {item.title && <div className="toast-title">{item.title}</div>}
                {item.message && (
                  <div className="toast-message">{item.message}</div>
                )}
              </div>
              <button
                className="toast-close-btn"
                onClick={() => removeToast(item.id)}
                aria-label="Close notification"
              >
                <X size={15} />
              </button>
              {item.duration > 0 && (
                <div
                  className="toast-progress"
                  style={{ animationDuration: `${item.duration}ms` }}
                />
              )}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
