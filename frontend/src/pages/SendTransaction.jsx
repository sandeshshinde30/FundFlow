import React, { useState, useEffect } from "react";
import { CustomButton, FormField } from "../components";
import BASE_URL from "../url";
const SendTransaction = () => {
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("0.00");
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    receiver: "",
    amount: "",
    note: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFormFieldChange = (fieldName, e) => {
    setFormData({ ...formData, [fieldName]: e.target.value });
  };

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
  }, []);

  // Fetch balance from API
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
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
  
    if (!formData.receiver.trim()) {
      setError("Receiver address is required");
      return;
    }
  
    if (!formData.amount.trim() || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }
  

  
    setIsLoading(true);
  
    try {
      const res = await fetch(`${BASE_URL}/transferFund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          walletAddress: address,
          to: formData.receiver,
          amount: parseFloat(formData.amount),
          type: 'Fund Transfer'
        })
      });
  
      const data = await res.json();
  
      if (res.ok) {
        setSuccess(`Successfully sent ${formData.amount} INR to ${formData.receiver}`);
        setFormData({ receiver: "", amount: "", note: "" });
        fetchBalance(address);
      } else {
        setError(data.message || "Transaction failed");
      }
  
    } catch (error) {
      console.error("Error sending transaction:", error);
      setError("Failed to send transaction. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="space-y-8">
      <div className="rounded-xl bg-white p-6 shadow-md dark:bg-dark-100">
        <h1 className="mb-6 text-2xl font-bold text-light-900 dark:text-light-900">Send Transaction</h1>

        <div className="mb-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg bg-light-100 p-4 dark:bg-dark-200">
            <h3 className="mb-2 text-lg font-semibold text-light-900 dark:text-light-700">Your Wallet</h3>
            <div className="mb-4">
              <p className="text-sm text-light-600 dark:text-light-900">Wallet Address</p>
              <p className="break-all text-light-900 dark:text-light-800">{address || "Not connected"}</p>
            </div>
            <div>
              <p className="text-sm text-light-600 dark:text-light-900">Available Balance</p>
              <p className="text-xl font-bold text-light-900 dark:text-light-800">{balance} INR</p>
            </div>
          </div>

          <div className="rounded-lg bg-light-100 p-4 dark:bg-dark-200">
            <h3 className="mb-2 text-lg font-semibold text-light-900 dark:text-light-900">Transaction Information</h3>
            <p className="text-light-600 dark:text-light-900">
              Transfer funds securely to another wallet address. Transactions are irreversible,
              so please double-check the recipient address before sending.
            </p>
          </div>
        </div>

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

        <form onSubmit={handleSubmit} className="space-y-6 text-light-900">
          <FormField
            labelName="Recipient Address *"
            placeholder="0x..."
            inputType="text"
            value={formData.receiver}
            className="text-light-900"
            handleChange={(e) => handleFormFieldChange("receiver", e)}
          />
          <FormField
            labelName="Amount (INR) *"
            placeholder="0.01"
            inputType="number"
            value={formData.amount}
            handleChange={(e) => handleFormFieldChange("amount", e)}
          />
          {/* <FormField
            labelName="Note (Optional)"
            placeholder="What's this for?"
            inputType="text"
            value={formData.note}
            handleChange={(e) => handleFormFieldChange("note", e)}
          /> */}
          <div className="flex justify-end">
            <CustomButton
              btnType="submit"
              title={isLoading ? "Sending..." : "Send Transaction"}
              styles="btn btn-primary btn-lg"
              isDisabled={isLoading}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendTransaction;
