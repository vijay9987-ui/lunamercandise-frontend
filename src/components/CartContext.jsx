import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const storedUser = JSON.parse(sessionStorage.getItem("user")) || {};
  const userId = storedUser.userId;

  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`http://194.164.148.244:4066/api/users/getcartcount/${userId}`);
      setCartCount(res.data.cartCount);
    } catch (err) {
      console.error("Failed to fetch cart count", err);
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, [userId]);

  return (
    <CartContext.Provider value={{ cartCount, fetchCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
