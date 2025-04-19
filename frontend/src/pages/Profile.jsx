import React, { useState, useEffect } from "react";
import CampaignCard from "../components/CampaignCard";
import { Loader } from "../components";
import BASE_URL from "../url";
import axios from "axios";
import { toast } from "react-toastify";

const Profile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [user, setUser] = useState(null);
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState(null);
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalFundsRaised: 0,
    totalTransactions: 0
  });

  // Load user data from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser?.walletAddress) {
        setAddress(parsedUser.walletAddress);
      }
      setUser(parsedUser);
    }
  }, []);

  // Fetch user profile information
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (address) {
        try {
          setProfileLoading(true);
          const response = await fetch(`${BASE_URL}/getProfileInfo`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ walletAddress: address }),
          });

          const data = await response.json();
          if (data && !data.error) {
            setUser(data);
          } else {
            console.error("Failed to fetch profile data", data.error);
          }
        } catch (error) {
          console.error("Failed to fetch profile", error);
        } finally {
          setProfileLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [address]);

  // Fetch user campaigns
  useEffect(() => {
    const fetchUserCampaigns = async () => {
      if (address) {
        setIsLoading(true);
        try {
          const response = await fetch(`${BASE_URL}/getCampaigns`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ walletAddress: address }),
          });
          
          const data = await response.json();
          if (data && Array.isArray(data)) {
            setCampaigns(data);
          }
        } catch (error) {
          console.error("Failed to fetch user campaigns", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserCampaigns();
  }, [address]);

  // Fetch user campaign stats
  useEffect(() => {
    const fetchCampaignStats = async () => {
      if (address) {
        try {
          const response = await axios.post(`${BASE_URL}/getCampaignStats`, {
            walletAddress: address
          });
          
          if (response.data) {
            setStats(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch campaign stats:", error);
          toast.error("Failed to load campaign statistics", {
            position: "top-right",
            autoClose: 3000,
            theme: "light",
          });
        }
      }
    };

    fetchCampaignStats();
  }, [address]);

  return (
    <div className="space-y-8">
      <div className="rounded-xl bg-white p-6 shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-light-900">Your Profile</h1>

        <div className="grid gap-6 md:grid-cols-3">
          {/* User Information */}
          <div className="md:col-span-2">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name ? user.name[0].toUpperCase() : (address ? address[0].toUpperCase() : "U")}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-light-900">
                    {user?.name || "Anonymous User"}
                  </h2>
                  <p className="text-sm text-light-600">
                    Member since {user?.joinDate || new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-light-600">Email</h3>
                  <p className="text-light-900">{user?.email || "Not provided"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-light-600">Balance</h4>
                  <p className="text-xl font-bold text-light-900">
                    {user?.balance ? `${user.balance} INR` : "0.00 INR"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold text-light-900">Wallet Information</h3>
              <div className="rounded-lg bg-light-100 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-medium text-light-600">Wallet Address</h4>
                    <p className="text-light-900 break-all">
                      {address || "Not connected"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Stats & Quick Actions */}
          <div className="md:h-fit">
            {/* Campaign Statistics Card */}
            <div className="rounded-lg bg-light-100 p-4 mb-4">
              <h3 className="mb-4 text-lg font-semibold text-light-900">Campaign Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-primary-100 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <span className="text-light-600">Campaigns</span>
                  </div>
                  <span className="font-bold text-xl text-primary-600">{stats.totalCampaigns}</span>
                </div>
                
                <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-success-100 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-light-600">Funds Raised</span>
                  </div>
                  <span className="font-bold text-xl text-success-600">{stats.totalFundsRaised} INR</span>
                </div>
                
                <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-info-100 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-info-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <span className="text-light-600">Transactions</span>
                  </div>
                  <span className="font-bold text-xl text-info-600">{stats.totalTransactions}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="rounded-lg bg-light-100 p-4">
              <h3 className="mb-4 text-lg font-semibold text-light-900">Quick Actions</h3>
              <div className="space-y-2">
                <a href="/create-campaign" className="block w-full rounded-md bg-primary-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-primary-700 transition-colors">
                  Create Campaign
                </a>
                <a href="/my-campaigns" className="block w-full rounded-md bg-light-300 px-4 py-2 text-center text-sm font-medium text-light-900 hover:bg-light-400 transition-colors">
                  Manage My Campaigns
                </a>
                <a href="/transactions" className="block w-full rounded-md bg-light-300 px-4 py-2 text-center text-sm font-medium text-light-900 hover:bg-light-400 transition-colors">
                  View Transactions
                </a>
                <a href="/send-transaction" className="block w-full rounded-md bg-light-300 px-4 py-2 text-center text-sm font-medium text-light-900 hover:bg-light-400 transition-colors">
                  Send Funds
                </a>
                <a href="/credit-wallet" className="block w-full rounded-md bg-light-300 px-4 py-2 text-center text-sm font-medium text-light-900 hover:bg-light-400 transition-colors">
                  Credit Wallet
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User's Campaigns */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-light-900">Your Campaigns</h2>
          <div className="flex gap-2">
            <a href="/my-campaigns" className="bg-light-300 text-light-900 px-4 py-2 rounded-md hover:bg-light-400 transition-colors text-sm font-medium">
              View All Campaigns
            </a>
            <a href="/create-campaign" className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors text-sm font-medium">
              + New Campaign
            </a>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <Loader />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[200px] bg-white rounded-lg shadow-md p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-light-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-lg font-medium text-light-900 mb-2">No Campaigns Yet</p>
            <p className="text-sm text-light-600 mb-6">
              You haven't created any campaigns yet. Start your first fundraising campaign today!
            </p>
            <a href="/create-campaign" className="inline-flex items-center justify-center rounded-md bg-primary-600 px-6 py-3 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
              Create Your First Campaign
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.campaignId}
                walletAddress={campaign.walletAddress}
                title={campaign.title}
                target={campaign.target}
                raised={campaign.raised || 0}
                deadline={campaign.deadline}
                image={campaign.image}
                campaignId={campaign.campaignId}
                isOwner={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
