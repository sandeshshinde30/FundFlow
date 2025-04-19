// useBalance.js
import { useState, useEffect } from "react";

const useBalance = () => {
  const [balance, setBalance] = useState("0.00");

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setBalance("100.00"); // static value for now
      } catch (error) {
        console.error("Failed to fetch balance", error);
      }
    };

    fetchBalance();
  }, []);

  return { data: balance };
};

export default useBalance;
