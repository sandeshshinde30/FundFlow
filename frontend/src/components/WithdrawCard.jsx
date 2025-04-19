import React from 'react';
import { daysLeft } from '../utils';
import { tagType } from '../assets';

const WithdrawCard = ({ id, title, category, target, deadline, amountCollected, image, handleClick }) => {
  const remainingDays = daysLeft(deadline);
  
  return (
    <div className="w-full rounded-lg bg-white shadow-sm transition-all hover:shadow-md sm:max-w-[288px]" onClick={handleClick}>
      <img 
        src={image} 
        alt="fund" 
        className="h-[158px] w-full rounded-t-lg object-cover"
      />

      <div className="flex flex-col p-4">
        <div className="mb-2 flex items-start">
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-primary-100">
            <img src={tagType} alt="tag" className="h-1/2 w-1/2 object-contain" />
          </div>
          <p className="ml-2 flex-1 truncate text-sm font-medium text-gray-600">
            {category}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="truncate text-lg font-semibold leading-6 text-gray-800">
            {title}
          </h3>
                    
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <h4 className="font-semibold text-gray-800">
                {amountCollected} ETH
              </h4>
              <p className="text-xs text-gray-500">
                Raised of {target} ETH
              </p>
            </div>
            <div className="flex flex-col">
              <h4 className="font-semibold text-right text-gray-800">
                {remainingDays}
              </h4>
              <p className="text-xs text-right text-gray-500">
                Day{remainingDays === 1 ? '' : 's'} Left
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-[40px] w-[40px] rounded-full bg-primary-100 flex items-center justify-center">
              <img src={thirdweb} alt="user" className="h-1/2 w-1/2 object-contain" />
            </div>
            <div className="flex flex-1 flex-col">
              <h4 className="text-xs font-normal text-gray-500">Campaign Creator</h4>
              <p className="truncate text-xs font-semibold text-gray-600">You</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <button
            type="button"
            className="w-full rounded-md bg-primary-500 py-2 px-4 text-center text-sm font-medium text-white transition-colors hover:bg-primary-600"
          >
            Withdraw Funds
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawCard;
