import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import '@fontsource/cal-sans/latin-400.css';
import '@fontsource-variable/inter/wght.css';
import './index.css';
import App from './App';

// Error monitoring (Ardeno Studio Sentry org). DSN comes from the
// VITE_SENTRY_DSN build-time env var — never hardcode it here. When the
// var is absent (e.g. local dev without Sentry configured), init is skipped.
const sentryDsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: 'production',
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
