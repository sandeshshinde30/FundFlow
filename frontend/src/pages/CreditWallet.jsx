import React, { useState, useEffect } from "react";
import { CustomButton, FormField } from "../components";
import { useAddress } from "@thirdweb-dev/react";
import  BASE_URL  from "../url";
const CreditWallet = () => {
  const [balance, setBalance] = useState("0.00");
  const [address, setAddress] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    walletAddress: "",
    amount: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch wallet address from localStorage when the component mounts
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser.walletAddress) {
        setFormData((prevData) => ({
          ...prevData,
          walletAddress: parsedUser.walletAddress,
        }));
      }
    } else if (address) {
      // Save the address from the useAddress hook if it's available
      const userData = { walletAddress: address }; // create a minimal user data object
      localStorage.setItem("user", JSON.stringify(userData));
      setFormData((prevData) => ({
        ...prevData,
        walletAddress: address,
      }));
    }
  }, [address]); // Depend on address to handle changes

   // Get wallet address from localStorage
   useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      const wallet = parsedUser.walletAddress || "";
      setAddress(wallet);
      
      if (wallet) {
        fetchBalance(wallet);
      }
    }
  }, [address]);

  const fetchBalance = async (walletAddress) => {
    try {
      const res = await fetch(`${BASE_URL}/getBalance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ walletAddress })
      });
  
      const data = await res.json();
      if (res.ok) {
        setBalance(data.balance || "0.00");
      } else {
        console.error("Failed to fetch balance:", data.message);
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const handleFormFieldChange = (fieldName, e) => {
    setFormData({ ...formData, [fieldName]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
  
    if (!formData.walletAddress.trim()) {
      setError("Wallet address is required");
      return;
    }
  
    if (!formData.amount.trim() || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }
  
    setIsLoading(true);
  
    try {
      const response = await fetch(`${BASE_URL}/creditWallet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: formData.walletAddress,
          amount: parseFloat(formData.amount),
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Unknown error occurred");
      }
  
      setSuccess(data.message || `Successfully credited ${formData.amount} INR to wallet`);
      setFormData({
        walletAddress: formData.walletAddress,
        amount: "",
      });
  
      const savedUser = JSON.parse(localStorage.getItem("user"));
      savedUser.walletAddress = formData.walletAddress;
      localStorage.setItem("user", JSON.stringify(savedUser));

      fetchBalance(formData.walletAddress);
      
    } catch (error) {
      console.error("Error crediting wallet:", error);
      setError(error.message || "Failed to credit wallet. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="space-y-8">
      <div className="rounded-xl bg-white p-6 shadow-md dark:bg-dark-100">
        <h1 className="mb-6 text-2xl font-bold text-light-900 dark:text-light-900">Credit Wallet</h1>

        <div className="mb-6 grid gap-6 md:grid-cols-2">
          {/* Wallet Info */}
          <div className="rounded-lg bg-light-100 p-4 dark:bg-dark-200">
            <h3 className="mb-2 text-lg font-semibold text-light-900 dark:text-light-900">Your Wallet</h3>
            <div className="mb-4">
              <p className="text-sm text-light-600 font-bold dark:text-light-700">Wallet Address</p>
              <p className="break-all text-light-900 dark:text-light-900">
                {formData.walletAddress || "Not connected"}
              </p>
            </div>
            <div>
              <p className="text-sm text-light-600 font-bold dark:text-light-700">Current Balance</p>
              <p className="text-xl font-bold text-light-900 dark:text-light-900">
                {balance} INR
              </p>
            </div>
          </div>

          {/* Credit Info */}
          <div className="rounded-lg bg-light-100 p-4 dark:bg-dark-200">
            <h3 className="mb-2 text-lg font-semibold text-light-900 dark:text-light-600">Credit Information</h3>
            <p className="text-light-600 dark:text-light-900">
              Add funds to your wallet or any other wallet. For demonstration purposes, 
              this will simulate adding INR to the specified wallet.
            </p>
          </div>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="mb-6 rounded-md bg-error-50 p-4 text-error-700 dark:bg-error-900/20 dark:text-error-400">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-md bg-success-50 p-4 text-success-700 dark:bg-success-900/20 dark:text-success-400">
            <p>{success}</p>
          </div>
        )}  

        {/* Credit Form */}
        <form onSubmit={handleSubmit} className="space-y-6  text-light-900 dark:text-light-600">
        <FormField
          labelName="Wallet Address to Credit *"
          placeholder="0x..."
          inputType="text"
          className="text-light-900 dark:text-light-600"
          value={formData.walletAddress}
         
          disabled={true} 
        />


          <FormField
            labelName="Amount to Credit (INR) *"
            placeholder="0.1"
            inputType="number"
            value={formData.amount}
            handleChange={(e) => handleFormFieldChange("amount", e)}
          />

          <div className="flex justify-end">
            <CustomButton
              btnType="submit"
              title={isLoading ? "Processing..." : "Credit Wallet"}
              styles="btn btn-primary btn-lg"
              isDisabled={isLoading}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreditWallet;
