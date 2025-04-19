import React from "react";
import { Link } from "react-router-dom";
import { daysLeft } from "../utils";
import Jazzicon from "react-jazzicon";

const FundCard = ({
  owner,
  title,
  description,
  target,
  deadline,
  amountCollected,
  
  image,
  handleClick,
  id,
}) => {
  const remainingDays = daysLeft(deadline);
  const progress = Math.min(Math.round((amountCollected / target) * 100), 100);
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
          <Jazzicon diameter={24} seed={Math.round(Math.random() * 10000000)} />
          <p className="ml-2 text-xs text-light-600">
            by <span className="text-primary-600">{owner.slice(0, 6)}...{owner.slice(-4)}</span>
          </p>
        </div>

        {/* Campaign Title */}
        <h3 className="mb-1 text-lg font-bold leading-tight text-light-900 line-clamp-1">
          {title}
        </h3>

        {/* Campaign Description */}
        <p className="mb-4 text-sm text-light-600 line-clamp-2">
          {description}
        </p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="mb-1 flex justify-between text-xs">
            <span className="font-medium text-light-900">
              {formatCurrency(amountCollected)} ETH
            </span>
            <span className="text-light-600">
              of {formatCurrency(target)} ETH
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

        {/* Campaign Action Button */}
        <div className="mt-auto">
          <Link 
            to={`/campaign-details/${id}`}
            className="btn btn-primary btn-md w-full"
            onClick={handleClick}
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FundCard;
