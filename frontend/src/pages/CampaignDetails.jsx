import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { CountBox, CustomButton, Loader, Expandable } from "../components";
import { calculateBarPercentage, daysLeft } from "../utils";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet";
import { share } from "../assets";
import axios from "axios";
import BASE_URL from "../url";

const CampaignDetails = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [campaign, setCampaign] = useState(null);
  const [contributors, setContributors] = useState([]);
  const [injectMetaTags, setInjectMetaTags] = useState(false);
  const [userWallet, setUserWallet] = useState("");

  // Load user data from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser?.walletAddress) {
        setUserWallet(parsedUser.walletAddress);
      }
    }
  }, []);

  // Fetch campaign details
  useEffect(() => {
    const fetchCampaignDetails = async () => {
      try {
        setIsLoading(true);
        const response = await axios.post(`${BASE_URL}/getCampaignDetails`, {
          campaignId,
        });
        
        if (response.data) {
          setCampaign(response.data);
        } else {
          toast.error("Campaign not found", {
            position: "top-right",
            autoClose: 5000,
            theme: "light",
          });
          navigate('/');
        }
      } catch (error) {
        console.error("Error fetching campaign details:", error);
        toast.error("Failed to load campaign details", {
          position: "top-right",
          autoClose: 5000,
          theme: "light",
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchCampaignDetails();
  }, [campaignId, navigate]);

  // Fetch contributions for this campaign
  useEffect(() => {
    const fetchContributions = async () => {
      if (!campaign) return;
      
      try {
        const response = await axios.post(`${BASE_URL}/getContributions`, {
          campaignId,
        });
        
        if (response.data && Array.isArray(response.data)) {
          setContributors(response.data);
        }
      } catch (error) {
        console.error("Error fetching contributions:", error);
        // Don't show error toast as this is not critical
      }
    };
    
    fetchContributions();
  }, [campaign, campaignId]);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          image: campaign?.image,
          title: campaign?.title,
          text: campaign?.description,
          url: window.location.href,
        })
        .then(() => console.log("Successful share"))
        .catch((error) => console.log("Error sharing", error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!", {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
      });
    }
    setInjectMetaTags(true);
  };

  if (isLoading) return <Loader />;
  if (!campaign) return null;

  const remainingDays = daysLeft(new Date(campaign.deadline).getTime());
  const isExpired = remainingDays <= 0;
  const raised = campaign.raised || 0;
  const progress = Math.min(Math.round((raised / campaign.target) * 100), 100);

  return (
    <div className="max-w-6xl mx-auto">
      {injectMetaTags && (
        <Helmet>
          <meta property="og:title" content={campaign.title} />
          <meta property="og:description" content={campaign.description} />
          {campaign.image && (
            <meta property="og:image" content={campaign.image} />
          )}
        </Helmet>
      )}

      {/* Campaign Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        {/* Campaign Image */}
        <div className="md:w-2/3">
          <div className="relative rounded-xl overflow-hidden shadow-lg">
            <img
              src={campaign.image}
              alt={campaign.title}
              className="w-full h-[400px] object-cover"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <button 
                onClick={handleShare}
                className="bg-white p-3 rounded-full shadow-md hover:bg-light-200 transition-colors"
                aria-label="Share"
              >
                <img src={share} alt="Share campaign" className="w-5 h-5" />
              </button>
            </div>
            
            {/* Category Badge */}
            <div className="absolute top-4 left-4">
              <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {campaign.category}
              </span>
            </div>
            
            {/* Status Badge */}
            <div className="absolute bottom-4 left-4">
              <span className={`${isExpired ? 'bg-error-600' : 'bg-success-600'} text-white px-3 py-1 rounded-full text-sm font-medium`}>
                {isExpired ? 'Campaign Ended' : 'Active Campaign'}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 bg-white p-6 rounded-xl shadow-md">
            <div className="flex flex-wrap justify-between text-sm mb-2">
              <span className="font-medium text-light-900 text-lg">{raised} INR raised</span>
              <span className="text-light-600 text-lg">of {campaign.target} INR target</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-light-300 mb-2">
              <div
                className="h-full rounded-full bg-primary-600"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="font-bold text-primary-600">{progress}% Funded</span>
              <span className="text-light-600">{isExpired ? "Campaign Ended" : `${remainingDays} Days Left`}</span>
            </div>
          </div>
        </div>

        {/* Campaign Stats and Actions */}
        <div className="md:w-1/3 flex flex-col gap-6">
          <div className="card bg-white shadow-md">
            <h1 className="text-2xl font-bold text-light-900 mb-2">{campaign.title}</h1>
            <p className="text-sm text-light-600 mb-6">Created on {new Date(campaign.createdAt).toLocaleDateString()}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-light-100 p-4 rounded-lg text-center">
                <p className="text-sm text-light-600">Days Left</p>
                <p className="text-xl font-bold text-light-900">
                  {isExpired ? "0" : remainingDays}
                </p>
              </div>
              <div className="bg-light-100 p-4 rounded-lg text-center">
                <p className="text-sm text-light-600">Progress</p>
                <p className="text-xl font-bold text-primary-600">{progress}%</p>
              </div>
              <div className="bg-light-100 p-4 rounded-lg text-center">
                <p className="text-sm text-light-600">Target</p>
                <p className="text-xl font-bold text-light-900">{campaign.target} INR</p>
              </div>
              <div className="bg-light-100 p-4 rounded-lg text-center">
                <p className="text-sm text-light-600">Backers</p>
                <p className="text-xl font-bold text-light-900">{contributors.length}</p>
              </div>
            </div>
            
            {/* Organizer Information */}
            <div className="bg-light-100 p-4 rounded-lg mb-6">
              <h3 className="font-medium text-light-900 mb-2">Campaign Organizer</h3>
              <div className="flex items-center gap-3">
                <Jazzicon
                  diameter={48}
                  seed={jsNumberForAddress(campaign.walletAddress || "0x0")}
                  className="rounded-full"
                />
                <div>
                  <p className="font-medium text-light-900">{campaign.name || "Anonymous"}</p>
                  <p className="text-xs text-light-600 break-all truncate max-w-[200px]">{campaign.walletAddress}</p>
                </div>
              </div>
            </div>
            
            {/* Campaign Owner Actions */}
            {userWallet && campaign.walletAddress === userWallet && (
              <div className="mb-4">
                <div className="bg-light-200 p-3 rounded-lg mb-3">
                  <p className="text-sm text-center font-medium text-light-700">Campaign Owner Actions</p>
                </div>
                
                <div className="flex gap-2 mb-3">
                  <Link to={`/update-campaign/${campaignId}`} className="flex-1">
                    <CustomButton
                      btnType="button"
                      title="Edit Campaign"
                      styles="w-full bg-light-800 text-white"
                    />
                  </Link>
                  
                  <Link to={`/delete-campaign/${campaignId}`} className="flex-1">
                    <CustomButton
                      btnType="button"
                      title="Delete Campaign"
                      styles="w-full bg-error-600"
                    />
                  </Link>
                </div>
                
                {progress >= 100 && (
                  <Link to={`/withdraw/${campaignId}`} className="w-full">
                    <CustomButton
                      btnType="button"
                      title="Withdraw Funds"
                      styles="w-full bg-success-600"
                    />
                  </Link>
                )}
              </div>
            )}
            
            {/* Contribute Button */}
            {(!userWallet || campaign.walletAddress !== userWallet) && (
              <Link to={`/contribute/${campaignId}`} className="w-full">
                <CustomButton
                  btnType="button"
                  title={isExpired ? "Campaign Ended" : "Contribute to Campaign"}
                  styles={`w-full ${isExpired ? 'bg-light-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'}`}
                  isDisabled={isExpired}
                />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Campaign Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {/* Story and Description */}
        <div className="md:col-span-3">
          <div className="card bg-white shadow-md">
            <h2 className="text-xl font-bold text-light-900 mb-4">Campaign Story</h2>
            <div className="prose prose-lg max-w-none text-light-900">
              <Expandable maxChars={500}>{campaign.description}</Expandable>
            </div>
          </div>
        </div>
      </div>

      {/* Contributors Section */}
      <div className="card bg-white shadow-md mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-light-900">Contributors ({contributors.length})</h2>
          {!isExpired && (!userWallet || campaign.walletAddress !== userWallet) && (
            <Link to={`/contribute/${campaignId}`}>
              <button className="px-4 py-2 bg-primary-100 text-primary-600 rounded-lg font-medium text-sm hover:bg-primary-200 transition-colors">
                Become a Contributor
              </button>
            </Link>
          )}
        </div>
        
        {contributors.length === 0 ? (
          <div className="bg-light-100 p-8 rounded-lg text-center">
            <svg className="mx-auto h-12 w-12 text-light-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-light-900 font-medium mt-3 mb-1">No contributors yet</p>
            <p className="text-sm text-light-600">Be the first to contribute to this campaign!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-light-100 text-light-900">
                <tr>
                  <th className="px-4 py-3 text-left rounded-tl-lg">#</th>
                  <th className="px-4 py-3 text-left">Contributor</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left rounded-tr-lg">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-200">
                {contributors.map((contributor, index) => (
                  <tr key={index} className="hover:bg-light-50">
                    <td className="px-4 py-4 text-light-900">{index + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Jazzicon
                          diameter={32}
                          seed={jsNumberForAddress(contributor.sender || "0x0")}
                          className="rounded-full"
                        />
                        <span className="text-light-900 font-medium">
                          {contributor.sender ? 
                            `${contributor.sender.substring(0, 6)}...${contributor.sender.substring(contributor.sender.length - 4)}` : 
                            "Unknown"
                          }
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-light-900 font-bold text-primary-600">{contributor.amount} INR</td>
                    <td className="px-4 py-4 text-light-600">
                      {new Date(contributor.timestamp).toLocaleDateString()} at {new Date(contributor.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignDetails;
