import React from "react";
import { Link } from "react-router-dom";
import { daysLeft } from "../utils";

const CampaignCard = ({
  walletAddress,
  title,
  target,
  raised,
  deadline,
  image,
  campaignId,
  isOwner = false,
}) => {
  const remainingDays = daysLeft(new Date(deadline).getTime());
  const progress = Math.min(Math.round((raised / target) * 100), 100);
  const isExpired = remainingDays <= 0;
  
  // Formats the currency amount with commas and 2 decimal places
  const formatCurrency = (amount) => {
    return parseFloat(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="card overflow-hidden transition-all duration-200 hover:-translate-y-1">
      {/* Campaign Image */}
      <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
        
        {/* Campaign Status Badge */}
        <div className="absolute left-3 top-3">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isExpired
              ? "bg-error-100 text-error-700"
              : "bg-success-100 text-success-700"
          }`}>
            {isExpired ? "Ended" : "Active"}
          </span>
        </div>
      </div>

      <div className="flex flex-col p-5">
        {/* Campaign Owner */}
        <div className="mb-3 flex items-center">
          <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-xs font-medium text-primary-600">
              {walletAddress.slice(0, 2)}
            </span>
          </div>
          <p className="ml-2 text-xs text-light-600">
            by <span className="text-primary-600">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
          </p>
        </div>

        {/* Campaign Title */}
        <h3 className="mb-1 text-lg font-bold leading-tight text-light-900 line-clamp-1">
          {title}
        </h3>

        {/* Progress Bar */}
        <div className="mb-4 mt-3">
          <div className="mb-1 flex justify-between text-xs">
            <span className="font-medium text-light-900">
              {formatCurrency(raised)} INR
            </span>
            <span className="text-light-600">
              of {formatCurrency(target)} INR
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-light-300">
            <div
              className="h-full rounded-full bg-primary-600"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Campaign Stats */}
        <div className="mb-5 flex justify-between">
          <div>
            <p className="text-xs text-light-600">Raised</p>
            <p className="text-sm font-medium text-light-900">
              {progress}%
            </p>
          </div>
          <div>
            <p className="text-xs text-light-600">
              {isExpired ? "Ended" : "Ends in"}
            </p>
            <p className="text-sm font-medium text-light-900">
              {isExpired ? "Campaign closed" : `${remainingDays} day${remainingDays !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        {/* Campaign Action Buttons */}
        {isOwner ? (
          <div className="grid grid-cols-2 gap-2 mt-auto">
            <Link to={`/campaign-details/${campaignId}`} className="btn btn-primary btn-sm w-full">
              View Details
            </Link>
            <div className="flex gap-1">
              <Link to={`/update-campaign/${campaignId}`} className="btn btn-sm bg-primary-100 text-primary-700 flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Link>
              <Link to={`/delete-campaign/${campaignId}`} className="btn btn-sm bg-error-100 text-error-700 flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-auto">
            <Link 
              to={`/campaign-details/${campaignId}`}
              className="btn btn-primary btn-md w-full"
            >
              View Details
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignCard; 