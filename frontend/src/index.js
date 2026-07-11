import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import './index.css';
import App from './App';
import { store } from './store';

// Chrome can report this harmless layout warning as a runtime error while the
// development overlay is active. Ignore only this specific browser warning.
const isResizeObserverWarning = (message = '') =>
  String(message).startsWith('ResizeObserver loop completed with undelivered notifications');

window.addEventListener('error', (event) => {
  const message = event?.message || event?.error?.message;
  if (isResizeObserverWarning(message)) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}, true);

window.addEventListener('unhandledrejection', (event) => {
  const message = event?.reason?.message;
  if (isResizeObserverWarning(message)) {
    event.preventDefault();
  }
}, true);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
