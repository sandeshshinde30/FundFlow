import React from "react";

const CustomButton = ({
  btnType,
  title,
  handleClick,
  styles,
  isDisabled = false,
  icon = null,
}) => {
  return (
    <button
      type={btnType}
      className={`${styles} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={handleClick}
      disabled={isDisabled}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {title}
    </button>
  );
};

export default CustomButton;
