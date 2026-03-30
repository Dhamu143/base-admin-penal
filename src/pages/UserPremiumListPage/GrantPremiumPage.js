import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { usePlans } from "../../hooks/usePremium";
import { useGrantPremium } from "../../hooks/useUserPremium";
// Make sure this import path matches where you saved your useUsers hook
import { useUsers } from "../../hooks/useUsers"; 
import PageHeader from "../../common/PageHeader";
import FormActionButtons from "../../common/FormActionButtons";

export default function GrantPremiumPage() {
  const navigate = useNavigate();

  // Fetch plans
  const { data: plansData, isLoading: isLoadingPlans } = usePlans({ all: "true" });
  const plans = plansData?.data || [];

  // Fetch users (fetching a large limit so they all appear in the dropdown)
  const { data: usersData, isLoading: isLoadingUsers } = useUsers(1, 5000); 
  const users = usersData?.users || [];

  const grantMutation = useGrantPremium();

  const [formData, setFormData] = useState({ userId: "", planId: "" });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!formData.userId) e.userId = "Please select a user.";
    if (!formData.planId) e.planId = "Please select a plan.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePlanSelectChange = (selectedOption) => {
    setFormData((prev) => ({ ...prev, planId: selectedOption ? selectedOption.value : "" }));
    if (errors.planId) setErrors((prev) => ({ ...prev, planId: null }));
  };

  const handleUserSelectChange = (selectedOption) => {
    setFormData((prev) => ({ ...prev, userId: selectedOption ? selectedOption.value : "" }));
    if (errors.userId) setErrors((prev) => ({ ...prev, userId: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await grantMutation.mutateAsync({
        userId: formData.userId,
        planId: formData.planId,
        grantedByAdmin: true,
      });
      navigate("/premium/users");
    } catch (err) {
      console.error("Grant failed:", err);
    }
  };

  // ── Options Mapping ──

  // Format Plan Options
  const planOptions = plans
    .filter((p) => p.isActive)
    .map((plan) => {
      const durationText = plan.durationType === "lifetime"
        ? "Lifetime"
        : `1 ${plan.durationType.charAt(0).toUpperCase() + plan.durationType.slice(1)}`;

      return {
        value: plan._id,
        label: `${plan.name} — ${durationText} — ₹${plan.discountPrice ?? plan.price}`,
      };
    });

  // Format User Options (Name + Mobile)
  const userOptions = users.map((user) => ({
    value: user._id,
    label: `${user.name || "Unknown User"} — ${user.mobile || user.mobileNumber || user.phone || "No Mobile"}`,
  }));

  const selectedPlan = plans.find((p) => p._id === formData.planId);
  const currentPlanSelectValue = planOptions.find(option => option.value === formData.planId) || null;
  const currentUserSelectValue = userOptions.find(option => option.value === formData.userId) || null;

  return (
    <div className="content-wrapper p-4">
      <PageHeader
        breadcrumbTitle="Premium Users"
        breadcrumbLink="/premium/users"
        currentTitle="Grant Premium"
      />

      <div className="card shadow-sm mb-4" style={{ maxWidth: 600 }}>
        <div className="card-header bg-light p-3">
          <h5 className="mb-0">
            <i className="fas fa-crown me-2 text-warning"></i>
            Grant Premium Access
          </h5>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit} noValidate>

            {/* User Select with react-select */}
            <div className="mb-4">
              <label className="form-label fw-bold">
                Select User <span className="text-danger">*</span>
              </label>
              <Select
                name="userId"
                options={userOptions}
                value={currentUserSelectValue}
                onChange={handleUserSelectChange}
                isDisabled={isLoadingUsers}
                placeholder={isLoadingUsers ? "Loading users..." : "Search by name or mobile..."}
                isClearable
                isSearchable // Crucial so you can type and search!
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: errors.userId ? "#dc3545" : base.borderColor,
                    "&:hover": {
                      borderColor: errors.userId ? "#dc3545" : base.borderColor
                    }
                  })
                }}
              />
              {errors.userId && <div className="invalid-feedback d-block">{errors.userId}</div>}
              <div className="form-text">
                Search for the user you wish to grant premium access.
              </div>
            </div>

            {/* Plan Select with react-select */}
            <div className="mb-4">
              <label className="form-label fw-bold">
                Select Plan <span className="text-danger">*</span>
              </label>
              <Select
                name="planId"
                options={planOptions}
                value={currentPlanSelectValue}
                onChange={handlePlanSelectChange}
                isDisabled={isLoadingPlans}
                placeholder={isLoadingPlans ? "Loading plans..." : "Select a plan..."}
                isClearable
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: errors.planId ? "#dc3545" : base.borderColor,
                    "&:hover": {
                      borderColor: errors.planId ? "#dc3545" : base.borderColor
                    }
                  })
                }}
              />
              {errors.planId && <div className="invalid-feedback d-block">{errors.planId}</div>}
            </div>

            {/* Plan Preview Card */}
            {selectedPlan && (
              <div className="alert alert-warning d-flex gap-3 align-items-start mb-4">
                {selectedPlan.banner && (
                  <img
                    src={selectedPlan.banner}
                    alt={selectedPlan.name}
                    style={{ width: 64, height: 40, objectFit: "cover", borderRadius: 6 }}
                  />
                )}
                <div className="w-100">
                  <div className="fw-bold">
                    <i className="fas fa-crown me-1"></i>
                    {selectedPlan.name}
                  </div>
                  <div className="small text-muted">
                    Duration:{" "}
                    {selectedPlan.durationType === "lifetime"
                      ? "Lifetime"
                      : `1 ${selectedPlan.durationType.charAt(0).toUpperCase() + selectedPlan.durationType.slice(1)}`}
                  </div>
                  <div className="small text-muted">
                    Price: ₹{selectedPlan.discountPrice ?? selectedPlan.price}
                    {selectedPlan.discountPrice && (
                      <span className="text-decoration-line-through ms-2 text-secondary">
                        ₹{selectedPlan.price}
                      </span>
                    )}
                  </div>
                  
                  {/* Features Preview */}
                  <div className="mt-2">
                    {selectedPlan.noAds && (
                      <span className="badge bg-success-subtle text-success-emphasis border border-success-subtle me-2">
                        <i className="fas fa-ban me-1"></i> No Ads
                      </span>
                    )}
                    {selectedPlan.description && (
                      <div className="small text-muted mt-2 p-2 bg-white rounded border border-warning-subtle" style={{ whiteSpace: "pre-wrap" }}>
                        {selectedPlan.description}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <FormActionButtons
              onCancel={() => navigate("/premium/users")}
              isLoading={grantMutation.isPending}
              isEditing={false}
              entityName="Premium"
            />
          </form>
        </div>
      </div>
    </div>
  );
}