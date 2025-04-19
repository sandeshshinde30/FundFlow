import React from "react";

const CountBox = ({ title, value, icon = null }) => {
  return (
    <div className="card flex flex-col items-center justify-center p-4 min-w-[150px]">
      <div className="flex items-center justify-center">
        {icon && <span className="mr-2 text-primary-600 dark:text-primary-400">{icon}</span>}
        <h4 className="text-3xl font-bold text-light-900 dark:text-light-100">
          {value}
        </h4>
      </div>
      <p className="mt-1 text-sm text-light-600 dark:text-light-500 text-center">
        {title}
      </p>
    </div>
  );
};

export default CountBox;
