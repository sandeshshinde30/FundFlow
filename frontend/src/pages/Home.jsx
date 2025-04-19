import React, { useState, useEffect } from "react";
import { DisplayCampaigns } from "../components";
import axios from "axios";
import BASE_URL from "../url";
import { toast } from "react-toastify";

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalFundsRaised: 0,
    totalTransactions: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch campaigns
  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${BASE_URL}/getAllCompaigns`);
      setCampaigns(response.data);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      toast.error("Something went wrong while fetching campaigns", {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch platform statistics
  const fetchStats = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/getCampaignStats`, {});
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchCampaigns();
    fetchStats();
  }, []);

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchCampaigns();
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(`${BASE_URL}/searchCampaigns`, {
        query: searchQuery.trim()
      });
      setCampaigns(response.data);
    } catch (error) {
      console.error("Error searching campaigns:", error);
      toast.error("Something went wrong with the search", {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value === "") {
      fetchCampaigns();
    }
  };

  return (
    <div>
      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card flex items-center">
          <div className="bg-primary-100 p-3 rounded-full mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-light-600">Campaigns Created</p>
            <p className="text-2xl font-bold text-light-900">{stats.totalCampaigns}</p>
          </div>
        </div>
        
        <div className="card flex items-center">
          <div className="bg-success-100 p-3 rounded-full mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-light-600">Total Funds Raised</p>
            <p className="text-2xl font-bold text-light-900">{stats.totalFundsRaised} INR</p>
          </div>
        </div>
        
        <div className="card flex items-center">
          <div className="bg-info-100 p-3 rounded-full mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-info-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-light-600">Transactions</p>
            <p className="text-2xl font-bold text-light-900">{stats.totalTransactions}</p>
          </div>
        </div>
      </div>
      
      {/* Search */}
      <div className="card mb-8">
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-light-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search campaigns by title, description, or category"
              className="pl-10 pr-4 py-2 w-full border border-light-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            />
          </div>
          <button 
            type="submit"
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
          >
            Search
          </button>
        </form>
      </div>
      
      <DisplayCampaigns
        title="All Campaigns"
        isLoading={isLoading}
        campaigns={campaigns}
      />
    </div>
  );
};

export default Home;
