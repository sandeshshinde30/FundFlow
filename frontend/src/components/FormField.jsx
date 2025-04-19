import React from "react";

const FormField = ({
  labelName,
  placeholder,
  inputType,
  isTextArea,
  value,
  handleChange,
  isRequired = false,
  error = null,
  icon = null,
  name = "",
  min = "",
}) => {
  return (
    <div className="flex flex-col w-full gap-2">
      <label className="flex text-sm font-medium text-light-900 dark:text-light-900">
        {labelName}
        {isRequired && <span className="ml-1 text-error-500">*</span>}
      </label>
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-light-600 dark:text-light-500">
            {icon}
          </div>
        )}
        
        {isTextArea ? (
        <textarea
        required={isRequired}
        value={value}
        onChange={handleChange}
        name={name}
        rows={8}  // Adjust this for more or fewer rows
        placeholder={placeholder}
        className={`input ${icon ? "pl-10" : ""} ${error ? "border-error-500 focus-visible:ring-error-500" : ""} text-gray-700 min-h-[120px]`}  // Added min-h-[120px] here for a better height
      />
      
        ) : (
         <input
  required={isRequired}
  value={value}
  onChange={handleChange}
  type={inputType}
  step={inputType === "number" ? "0.01" : ""}
  min={min}
  placeholder={placeholder}
  name={name}
  className={`input ${icon ? "pl-10" : ""} ${error ? "border-error-500 focus-visible:ring-error-500" : ""} text-gray-700`}  // Added text-gray-700 here
/>
        )}
      </div>
      
      {error && (
        <p className="text-xs text-error-500 mt-1">{error}</p>
      )}
    </div>
  );
};

export default FormField;
