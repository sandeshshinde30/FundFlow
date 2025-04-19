import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CustomButton } from "../components";
import { logo } from "../assets";
import { useStateContext } from "../context";
import BASE_URL from "../url";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { connect } = useStateContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
  
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        setError(data.message || "Invalid email or password.");
      } else {
        console.log("Login successful", data);
  
        const { user } = data;
  
        const { name, email, publicKey, privateKey, walletAddress } = user;
  
        localStorage.setItem(
          "user",
          JSON.stringify({ name, email, publicKey, privateKey, walletAddress })
        );
  
        navigate("/");
      }
    } catch (error) {
      setError("Something went wrong. Please try again later.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  
  
  

  const handleWalletLogin = async () => {
    setIsLoading(true);
    try {
      await connect();
      navigate("/");
    } catch (error) {
      setError("Failed to connect wallet. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-light-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div className="text-center">
          <img
            src={logo}
            alt="UnityFund Logo"
            className="mx-auto h-12 w-auto"
          />
          <h2 className="mt-6 text-3xl font-bold text-light-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-light-600">
            Sign in to your account to continue
          </p>
        </div>

        {error && (
          <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-light-300 placeholder-light-500 text-light-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-light-300 placeholder-light-500 text-light-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-light-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-light-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : "Sign in"}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-light-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-light-600">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <CustomButton
              btnType="button"
              title="Connect Wallet"
              styles="btn w-full bg-light-200 text-light-900 hover:bg-light-300"
              handleClick={handleWalletLogin}
            />
          </div>
        </div>

        <p className="mt-3 text-center text-sm text-light-600">
          Not a member?{" "}
          <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage; 