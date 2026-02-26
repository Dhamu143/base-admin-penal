import React, { useState } from "react";
import { toast } from "react-toastify";
import ConfirmationModal from "../../common/ConfirmationModal";
import useApi from "../../hooks/useApi";

export default function SendNotificationPage() {
    const { loading: isSending, post } = useApi();
    const [showConfirm, setShowConfirm] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        body: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePreSubmit = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.body) {
            toast.error("Title and Body are required!");
            return;
        }
        setShowConfirm(true);
    };

    const handleConfirmSend = async () => {
        setShowConfirm(false);

        const payload = {
            title: formData.title,
            body: formData.body,
            data: {},
            sendToAll: true,  
        };

        const result = await post("/send-user", payload);

        if (result.success) {
            toast.success("Broadcast notification sent successfully!");
            setFormData({
                title: "",
                body: "",
            });
        }
    };

    return (
        <>
            <div className="card shadow-sm w-100">
                <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
                    <h4 className="mb-0 text-primary-emphasis">
                        <i className="fas fa-bullhorn me-2"></i> Broadcast Push Notification
                    </h4>
                </div>

                <div className="card-body p-4">
                    <form onSubmit={handlePreSubmit}>
                        <div className="mb-4 border-bottom pb-4">
                            <h5 className="text-muted mb-3">Target Audience</h5>
                            <div className="alert alert-info d-flex align-items-center mb-0" role="alert">
                                <div>
                                    <strong>Notice:</strong> This message will be broadcasted to <strong>ALL</strong> registered users.
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h5 className="text-muted mb-3">Message Content</h5>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Title <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Enter notification title"
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Body <span className="text-danger">*</span></label>
                                <textarea
                                    className="form-control"
                                    name="body"
                                    rows="4"
                                    value={formData.body}
                                    onChange={handleChange}
                                    placeholder="Enter notification message"
                                    required
                                ></textarea>
                            </div>
                        </div>

                        <div className="d-flex justify-content-end gap-2">
                            <button
                                type="button"
                                className="btn btn-secondary mr-2"
                                onClick={() => setFormData({ title: "", body: "" })}
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSending}
                            >
                                {isSending ? "Sending Broadcast..." : "Send Broadcast"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <ConfirmationModal
                show={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleConfirmSend}
                title="Confirm Broadcast"
                confirmText="Yes, Broadcast it"
                confirmButtonVariant="primary"
                isLoading={isSending}
            >
                <div className="text-center">
                    <p className="fs-5 mb-2">Are you sure you want to send this notification to everyone?</p>
                    <span className="badge bg-warning text-dark mb-3 px-3 py-2">Target: ALL USERS</span>

                    <div className="card bg-light p-3 text-start mx-auto shadow-sm border-0" style={{ maxWidth: "400px" }}>
                        <div className="mb-2"><strong>Title:</strong> {formData.title}</div>
                        <div><strong>Body:</strong> {formData.body}</div>
                    </div>
                </div>
            </ConfirmationModal>
        </>
    );
}