import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import ReusableSelect from "../../common/ReusableSelect";
import FormActionButtons from "../../common/FormActionButtons";
import PageHeader from "../../common/PageHeader";

import { fetchAllGods } from "../../store/god/index";
import { useChat, useAddChat, useUpdateChat } from "../../hooks/useChats";

export default function ChatFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { masterList: allGods = [], masterStatus: godStatus = "idle" } = useSelector((state) => state.God || {});

  const { data: fetchedChat, isLoading: isFetchingChat } = useChat(id);
  const addChatMutation = useAddChat();
  const updateChatMutation = useUpdateChat();

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    god_id: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (godStatus === "idle") dispatch(fetchAllGods());
  }, [godStatus, dispatch]);

  useEffect(() => {
    if (id && fetchedChat) {
      setFormData({
        question: fetchedChat.question || "",
        answer: fetchedChat.answer || "",
        god_id: fetchedChat.god_id || "",
      });
    }
  }, [id, fetchedChat]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.question.trim()) newErrors.question = "Question is required.";
    if (!formData.answer.trim()) newErrors.answer = "Answer is required.";
    if (!formData.god_id) newErrors.god_id = "Please select an associated God.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (id) {
        await updateChatMutation.mutateAsync({ id, ...formData });
      } else {
        await addChatMutation.mutateAsync(formData);
      }
      navigate("/chats");
    } catch (err) {
      console.error("Failed to save chat:", err);
    }
  };

  const godOptions = allGods.map((g) => ({ value: g._id, label: g.name }));

  const isSaving = addChatMutation.isPending || updateChatMutation.isPending;

  if (id && isFetchingChat) {
    return <div className="text-center p-5">Loading Chat Data...</div>;
  }

  return (
    <div className="content-wrapper p-4">
      <PageHeader 
        breadcrumbTitle="Chats" 
        breadcrumbLink="/chats" 
        currentTitle={id ? "Edit Chat Q&A" : "New Chat Q&A"} 
      />

      <div className="card shadow-sm mb-4">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit} noValidate>
            <div className="row">
              <div className="col-md-8 offset-md-2">
                <h5 className="mb-4 text-primary">Chat Knowledge Details</h5>

                <div className="mb-3">
                  <ReusableSelect 
                    label="Associated God" 
                    name="god_id" 
                    options={godOptions} 
                    value={formData.god_id} 
                    onChange={handleSelectChange} 
                    error={errors.god_id} 
                    required={true} 
                    placeholder="Select God..." 
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Question <span className="text-danger">*</span></label>
                  <input 
                    type="text" 
                    name="question" 
                    className={`form-control ${errors.question ? "is-invalid" : ""}`} 
                    value={formData.question} 
                    onChange={handleInputChange} 
                    placeholder="E.g., What is the significance of the Trishul?" 
                  />
                  {errors.question && <div className="invalid-feedback">{errors.question}</div>}
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold">Answer <span className="text-danger">*</span></label>
                  <textarea 
                    name="answer" 
                    rows="6"
                    className={`form-control ${errors.answer ? "is-invalid" : ""}`} 
                    value={formData.answer} 
                    onChange={handleInputChange} 
                    placeholder="Enter the comprehensive answer here..." 
                  ></textarea>
                  {errors.answer && <div className="invalid-feedback">{errors.answer}</div>}
                </div>

                <FormActionButtons 
                  onCancel={() => navigate("/chats")} 
                  isLoading={isSaving} 
                  isEditing={!!id} 
                  entityName="Chat" 
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}