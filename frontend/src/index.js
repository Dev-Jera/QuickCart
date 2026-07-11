import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import './index.css';
import App from './App';
import { store } from './store';

// Workaround for Chrome dev-mode ResizeObserver warnings.
// This error can be thrown by the browser while observing layout changes
// and does not usually indicate a real application failure.
window.addEventListener('error', (event) => {
  const message = event?.message || event?.error?.message;
  if (message === 'ResizeObserver loop completed with undelivered notifications') {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const message = event?.reason?.message;
  if (message === 'ResizeObserver loop completed with undelivered notifications') {
    event.preventDefault();
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
