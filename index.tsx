import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { StreamManagerProvider } from './contexts/StreamManagerContext';
import './src/index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <StreamManagerProvider>
      <App />
    </StreamManagerProvider>
  </React.StrictMode>
);