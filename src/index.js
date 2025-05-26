import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter as Router } from "react-router-dom"; // ✅ Move this here
import { CartProvider } from './components/CartContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router> {/* ✅ Wrap App inside Router */}
      <CartProvider>
        <App />
      </CartProvider>
    </Router>
  </React.StrictMode>
);


