import React from "react";

const Loader = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="relative h-16 w-16">
        <div className="absolute top-0 left-0 h-full w-full rounded-full border-4 border-light-300 dark:border-dark-300"></div>
        <div className="absolute top-0 left-0 h-full w-full rounded-full border-4 border-transparent border-t-primary-600 animate-spin"></div>
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default Loader;
