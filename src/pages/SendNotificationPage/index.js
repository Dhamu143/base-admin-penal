import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import ConfirmationModal from "../../common/ConfirmationModal";
import { fetchUsers } from "../../store/user2/index";
import Select from "react-select";
import useApi from "../../hooks/useApi";

export default function SendNotificationPage() {
    const dispatch = useDispatch();
    const { list: rawUserList, status } = useSelector((state) => state.users);

    const { loading: isSending, post } = useApi();

    const [showConfirm, setShowConfirm] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        body: "",
        userId: "",
        sendToAll: false,
    });

    useEffect(() => {
        dispatch(fetchUsers({ limit: 1000 }));
    }, [dispatch]);

    const isFetchingUsers = status === "loading";

    let usersArray = [];
    if (Array.isArray(rawUserList)) {
        usersArray = rawUserList;
    } else if (rawUserList && Array.isArray(rawUserList.data)) {
        usersArray = rawUserList.data;
    }

    const userOptions = usersArray.map((user) => ({
        value: user._id,
        label: `${user.firstName || "User"} ${user.mobile ? `(${user.mobile})` : ""}`.trim()
    }));

    const selectedUserOption = userOptions.find(opt => opt.value === formData.userId) || null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleUserChange = (selectedOption) => {
        setFormData((prev) => ({
            ...prev,
            userId: selectedOption ? selectedOption.value : "",
        }));
    };

    const handlePreSubmit = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.body) {
            toast.error("Title and Body are required!");
            return;
        }
        if (!formData.sendToAll && !formData.userId) {
            toast.error("Please select a User or check 'Broadcast to All'.");
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
        };

        if (formData.sendToAll) {
            payload.sendToAll = true;
        } else {
            payload.userId = formData.userId;
        }

        const result = await post("/send-user", payload);

        if (result.success) {
            toast.success("Notification sent successfully!");
            setFormData({
                title: "",
                body: "",
                userId: "",
                sendToAll: false,
            });
        }
    };

    const getSelectedUserName = () => {
        if (formData.sendToAll) return "ALL USERS";
        return selectedUserOption ? selectedUserOption.label : formData.userId;
    };

    return (
        <>
            <div className="card shadow-sm w-100">
                <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
                    <h4 className="mb-0 text-primary-emphasis">
                        <i className="fas fa-paper-plane me-2"></i> Send Push Notification
                    </h4>
                </div>

                <div className="card-body p-4">
                    <form onSubmit={handlePreSubmit}>
                        <div className="mb-4 border-bottom pb-4">
                            <h5 className="text-muted mb-3">Target Audience</h5>
                            <div className="form-check form-switch mb-3">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="sendToAll"
                                    name="sendToAll"
                                    checked={formData.sendToAll}
                                    onChange={handleChange}
                                    style={{ cursor: "pointer" }}
                                />
                                <label className="form-check-label fw-bold" htmlFor="sendToAll">
                                    Broadcast to ALL Users
                                </label>
                            </div>
                            {formData.sendToAll ? (
                                <div className="alert alert-warning d-flex align-items-center" role="alert">
                                    <strong>Warning:</strong> This will send a notification to every user.
                                </div>
                            ) : (
                                <div className="form-group">
                                    <label className="form-label">Select User</label>
                                    <Select
                                        value={selectedUserOption}
                                        onChange={handleUserChange}
                                        options={userOptions}
                                        isLoading={isFetchingUsers}
                                        isClearable={true}
                                        placeholder={isFetchingUsers ? "Loading..." : "Search..."}
                                        isDisabled={formData.sendToAll}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="mb-4">
                            <h5 className="text-muted mb-3">Message Content</h5>
                            <div className="mb-3">
                                <label className="form-label">Title <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Body <span className="text-danger">*</span></label>
                                <textarea
                                    className="form-control"
                                    name="body"
                                    rows="3"
                                    value={formData.body}
                                    onChange={handleChange}
                                    required
                                ></textarea>
                            </div>
                        </div>

                        <div className="d-flex justify-content-end gap-2">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setFormData({ title: "", body: "", userId: "", sendToAll: false })}
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSending}
                            >
                                {isSending ? "Sending..." : "Send Notification"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <ConfirmationModal
                show={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleConfirmSend}
                title="Confirm Send"
                confirmText="Yes, Send it"
                confirmButtonVariant="primary"
                isLoading={isSending}
            >
                <div className="text-center">
                    <p className="fs-5">Are you sure you want to send this notification?</p>
                    <div className="card bg-light mt-3 p-3 text-start mx-auto" style={{ maxWidth: "400px" }}>
                        <div><strong>Title:</strong> {formData.title}</div>
                        <div className="text-truncate">
                            <strong>To:</strong> {getSelectedUserName()}
                        </div>
                    </div>
                </div>
            </ConfirmationModal>
        </>
    );
}