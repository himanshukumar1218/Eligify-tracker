"use client";

import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Switch from "@mui/material/Switch";
import CircularProgress from "@mui/material/CircularProgress";
import { Form, Field } from "react-final-form";
import { useDispatch } from "react-redux";
import { TextInputField } from "@/components/ui/wrapperComponent";
import showMessage from "@/store/actions/toastAction";

// Helper to check if string is empty
const required = (value) => (value ? undefined : "Required");

// Helper to validate email
const composeValidators = (...validators) => (value) =>
    validators.reduce((error, validator) => error || validator(value), undefined);

const emailValidator = (value) =>
    value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
        ? "Invalid email address"
        : undefined;

const passwordLengthValidator = (value) =>
    value && value.length < 6 ? "Password must be at least 6 characters" : undefined;

const EditProfileModal = ({ open, onClose, profileData, onRefresh }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [changePassword, setChangePassword] = useState(false);
    const [apiError, setApiError] = useState(null);

    // Initial Values parsing
    let defaultFirstName = "";
    let defaultLastName = "";
    if (profileData?.name) {
        const parts = profileData.name.split(" ");
        defaultFirstName = parts[0] || "";
        defaultLastName = parts.slice(1).join(" ") || "";
    }

    const initialValues = {
        fname: defaultFirstName,
        lname: defaultLastName,
        email: profileData?.email || "",
    };

    const onSubmit = async (values) => {
        setApiError(null);
        setLoading(true);

        const apiToken = typeof window !== "undefined" ? localStorage.getItem("Token") : "";
        if (!apiToken) {
            setLoading(false);
            setApiError("Authentication token missing.");
            return;
        }

        const urlencoded = new URLSearchParams();
        urlencoded.append("api_token", apiToken);
        urlencoded.append("fname", values.fname || "");
        urlencoded.append("lname", values.lname || "");
        urlencoded.append("mname", "");
        urlencoded.append("email", values.email || "");
        
        if (changePassword) {
            urlencoded.append("change_password", "yes");
            urlencoded.append("old_password", values.old_password || "");
            urlencoded.append("new_password", values.new_password || "");
            urlencoded.append("confirm_password", values.confirm_password || "");
        } else {
            urlencoded.append("change_password", "no");
        }

        try {
            const response = await fetch("/api/account/editAccount", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: urlencoded.toString(),
            });

            const data = await response.json();

            if (data?.code === 1 || (data?.[0]?.code === 1)) {
                // Success
                dispatch(showMessage({ message: "Profile updated successfully!", status: 1 }));
                onRefresh();
                onClose();
            } else {
                const errMsg = data?.message || data?.[0]?.message || "Failed to update profile.";
                setApiError(errMsg);
                dispatch(showMessage({ message: errMsg, status: 0 }));
            }
        } catch (error) {
            console.error("Profile update error:", error);
            const fallbackErr = "An unexpected error occurred. Please try again.";
            setApiError(fallbackErr);
            dispatch(showMessage({ message: fallbackErr, status: 0 }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={!loading ? onClose : undefined} fullWidth maxWidth="sm">
            <DialogTitle style={{ fontWeight: "bold", fontSize: "1.2rem", paddingBottom: "10px" }}>
                EDIT PROFILE
            </DialogTitle>
            <Form
                onSubmit={onSubmit}
                initialValues={initialValues}
                validate={(values) => {
                    const errors = {};
                    if (changePassword) {
                        if (!values.old_password) errors.old_password = "Required";
                        if (!values.new_password) {
                            errors.new_password = "Required";
                        } else if (values.new_password.length < 6) {
                            errors.new_password = "Password must be at least 6 characters";
                        }
                        if (!values.confirm_password) errors.confirm_password = "Required";
                        if (values.new_password && values.confirm_password && values.new_password !== values.confirm_password) {
                            errors.confirm_password = "Passwords must match";
                        }
                    }
                    return errors;
                }}
                render={({ handleSubmit, submitting }) => (
                    <form onSubmit={handleSubmit}>
                        <DialogContent dividers>
                            {apiError && (
                                <div style={{ color: "#dc3545", marginBottom: "15px", fontWeight: "bold" }}>
                                    {apiError}
                                </div>
                            )}

                            <div className="mb-3">
                                <Field
                                    name="fname"
                                    component={TextInputField}
                                    placeholder="FIRST NAME"
                                    validate={required}
                                />
                            </div>

                            <div className="mb-3">
                                <Field
                                    name="lname"
                                    component={TextInputField}
                                    placeholder="LAST NAME"
                                    validate={required}
                                />
                            </div>

                            <div className="mb-3">
                                <Field
                                    name="email"
                                    component={TextInputField}
                                    placeholder="EMAIL"
                                    validate={composeValidators(required, emailValidator)}
                                />
                            </div>

                            <div className="mt-4 mb-3 d-flex align-items-center">
                                <label 
                                    htmlFor="change-password-toggle" 
                                    style={{ fontWeight: "bold", marginRight: "10px", margin: 0, cursor: "pointer" }}
                                >
                                    CHANGE PASSWORD
                                </label>
                                <Switch
                                    id="change-password-toggle"
                                    checked={changePassword}
                                    onChange={(e) => {
                                        setChangePassword(e.target.checked);
                                        // Clear password fields logic can go here if needed
                                    }}
                                    color="primary"
                                    slotProps={{ input: { 'aria-label': 'Toggle change password section' } }}
                                />
                            </div>

                            {changePassword && (
                                <div style={{ background: "#f9f9f9", padding: "15px", borderRadius: "8px" }}>
                                    <div className="mb-3">
                                        <Field
                                            name="old_password"
                                            type="password"
                                            component={TextInputField}
                                            placeholder="CURRENT PASSWORD"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <Field
                                            name="new_password"
                                            type="password"
                                            component={TextInputField}
                                            placeholder="NEW PASSWORD"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <Field
                                            name="confirm_password"
                                            type="password"
                                            component={TextInputField}
                                            placeholder="CONFIRM NEW PASSWORD"
                                        />
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                        <DialogActions style={{ padding: "15px 24px" }}>
                            <Button
                                onClick={onClose}
                                disabled={loading || submitting}
                                style={{ color: "#666", fontWeight: "bold" }}
                            >
                                CANCEL
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={loading || submitting}
                                style={{
                                    backgroundColor: "#d53f41",
                                    color: "white",
                                    fontWeight: "bold",
                                    minWidth: "120px"
                                }}
                            >
                                {loading || submitting ? <CircularProgress size={24} color="inherit" /> : "SAVE CHANGES"}
                            </Button>
                        </DialogActions>
                    </form>
                )}
            />
        </Dialog>
    );
};

export default EditProfileModal;
