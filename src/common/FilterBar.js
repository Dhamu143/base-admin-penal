import React, { useMemo } from "react";
import Select from "react-select";
import { staticLanguages } from "../constants/languages";

const FilterBar = ({
  filters,
  onFilterChange,
  onReset,
  godOptions = [], // ✅ ADDED DEFAULT VALUE HERE
  godStatus,
}) => {
  const languageOptions = useMemo(
    () => [
      { value: "", label: "All Languages" },
      ...(staticLanguages || []).map((lang) => ({
        value: lang._id,
        label: `${lang.language} (${lang.nativeName})`,
      })),
    ],
    []
  );

  const selectedLanguage =
    languageOptions.find((opt) => opt.value === filters.language) || null;

  // Now this will never crash because godOptions is guaranteed to be an array
  const selectedGod =
    godOptions.find((opt) => opt.value === filters.godId) || null;

  return (
    <div className="card-body border-bottom bg-light-subtle">
      <div className="row g-3 align-items-end">
        <div className="col-12 col-md-4">
          <label className="form-label fw-bold small mb-1 text-muted">
            Language
          </label>
          <Select
            placeholder="Select Language..."
            options={languageOptions}
            value={selectedLanguage}
            onChange={(opt) => onFilterChange("language", opt?.value || "")}
            isClearable
            classNamePrefix="react-select"
          />
        </div>

        <div className="col-12 col-md-4">
          <label className="form-label fw-bold small mb-1 text-muted">
            God / Category
          </label>
          <Select
            placeholder="Select God..."
            options={godOptions}
            value={selectedGod}
            onChange={(opt) => onFilterChange("godId", opt?.value || "")}
            isClearable
            isLoading={godStatus === "loading"}
            isDisabled={godStatus === "failed"}
            classNamePrefix="react-select"
          />
        </div>

        <div className="col-12 col-md-2">
          <button
            className="btn btn-outline-secondary w-100"
            onClick={onReset}
            type="button"
          >
            <i className="fas fa-undo mr-1"></i>Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;