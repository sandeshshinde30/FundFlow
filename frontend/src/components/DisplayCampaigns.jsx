import React from "react";
import { useNavigate } from "react-router-dom";
import { FundCard, Loader } from "./";
import CampaignCard from "./CampaignCard";

const DisplayCampaigns = ({ title, isLoading, campaigns = [] }) => {
  const navigate = useNavigate();

  const handleNavigate = (campaign) => {
    const campaignId = campaign.campaignId || campaign.pId;
    navigate(`/campaign-details/${campaignId}`);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-light-900">
        {title} ({campaigns?.length || 0})
      </h1>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader />
        </div>
      ) : !campaigns || campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[200px] bg-light-200 rounded-lg p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-light-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-lg font-medium text-light-900 mb-2">No Campaigns Found</p>
          <p className="text-sm text-light-600">
            There are currently no campaigns to display.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {campaigns.map((campaign) => {
            // Check which type of campaign object we have
            if (campaign.campaignId) {
              // New API format
              return (
                <CampaignCard
                  key={campaign.campaignId}
                  walletAddress={campaign.walletAddress}
                  title={campaign.title}
                  target={campaign.target}
                  raised={campaign.raised || 0}
                  deadline={campaign.deadline}
                  image={campaign.image}
                  campaignId={campaign.campaignId}
                  handleClick={() => handleNavigate(campaign)}
                />
              );
            } else {
              // Old format (Ethereum)
              return (
                <FundCard
                  key={campaign.pId}
                  {...campaign}
                  handleClick={() => handleNavigate(campaign)}
                />
              );
            }
          })}
        </div>
      )}
    </div>
  );
};

export default DisplayCampaigns;
