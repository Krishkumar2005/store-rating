import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import toast from "react-hot-toast";
import { authAPI } from "../api";
import { useAuth } from "../context/AuthContext";
import { updatePasswordSchema } from "../utils/validations";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const Settings = () => {
  const { user } = useAuth();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(updatePasswordSchema) });

  const onSubmit = async (data) => {
    try {
      await authAPI.updatePassword({
        currentPassword: data.currentPassword,
        password: data.password,
      });
      toast.success("Password updated successfully!");
      reset();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password");
    }
  };

  const PasswordField = ({ label, fieldName, show, setShow }) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="input-wrapper">
        <input
          type={show ? "text" : "password"}
          className={`form-input ${errors[fieldName] ? "form-input--error" : ""}`}
          placeholder="••••••••"
          {...register(fieldName)}
        />
        <button type="button" className="input-icon-btn" onClick={() => setShow((s) => !s)}>
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {errors[fieldName] && <p className="form-error">{errors[fieldName].message}</p>}
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Account Settings</h1>
          <p className="page-subtitle">Manage your account preferences</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Profile Info Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <User size={20} />
            <h2>Profile Information</h2>
          </div>
          <div className="profile-info">
            <div className="profile-avatar-lg">{user?.name?.charAt(0).toUpperCase()}</div>
            <div className="profile-details">
              <div className="profile-detail-row">
                <span className="profile-detail-label">Full Name</span>
                <span className="profile-detail-value">{user?.name}</span>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-label">Email</span>
                <span className="profile-detail-value">{user?.email}</span>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-label">Address</span>
                <span className="profile-detail-value">{user?.address}</span>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-label">Role</span>
                <span className="profile-detail-value">{user?.role?.replace("_", " ")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <Lock size={20} />
            <h2>Change Password</h2>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <PasswordField
              label="Current Password"
              fieldName="currentPassword"
              show={showCurrent}
              setShow={setShowCurrent}
            />
            <PasswordField
              label="New Password"
              fieldName="password"
              show={showNew}
              setShow={setShowNew}
            />
            <PasswordField
              label="Confirm New Password"
              fieldName="confirmPassword"
              show={showConfirm}
              setShow={setShowConfirm}
            />
            <div className="password-rules">
              <p className="rules-title">Password requirements:</p>
              <ul>
                <li>8–16 characters</li>
                <li>At least one uppercase letter</li>
                <li>At least one special character (!@#$%...)</li>
              </ul>
            </div>
            <Button type="submit" loading={isSubmitting} className="btn--full">
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
