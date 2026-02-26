// src/common/ReusableSelect.jsx
import React from "react";
import Select from "react-select";

export default function ReusableSelect({
  label,
  name,
  options = [],
  value, // Raw value (string) or array of strings (for isMulti)
  onChange,
  error,
  placeholder = "Select...",
  isDisabled = false,
  isMulti = false,
  isLoading = false,
  required = false,
}) {
  // Automatically find the full object(s) react-select needs based on the raw value
  const formattedValue = isMulti
    ? options.filter((opt) => (value || []).includes(opt.value))
    : options.find((opt) => opt.value === value) || null;

  // Automatically extract just the raw value(s) to send back to the parent form
  const handleChange = (selectedOption) => {
    if (isMulti) {
      const rawValues = selectedOption
        ? selectedOption.map((opt) => opt.value)
        : [];
      onChange(name, rawValues);
    } else {
      onChange(name, selectedOption ? selectedOption.value : "");
    }
  };

  return (
    <div className="mb-3">
      {label && (
        <label className="form-label fw-bold">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <Select
        isMulti={isMulti}
        isLoading={isLoading}
        isDisabled={isDisabled}
        options={options}
        value={formattedValue}
        onChange={handleChange}
        placeholder={placeholder}
        classNamePrefix="react-select"
        styles={{
          control: (base) => ({
            ...base,
            borderColor: error ? "#dc3545" : base.borderColor,
            "&:hover": {
              borderColor: error ? "#dc3545" : base.borderColor,
            },
          }),
        }}
      />
      {error && <div className="text-danger small mt-1">{error}</div>}
    </div>
  );
}
