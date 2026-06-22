import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Building2, Eye, EyeOff } from "lucide-react";
import { authAPI } from "../api";
import { useAuth } from "../context/AuthContext";
import { registerSchema } from "../utils/validations";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data) => {
    try {
      const res = await authAPI.register(data);
      const { user, token } = res.data.data;
      login(user, token);
      toast.success("Account created successfully!");
      navigate("/user/stores");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        <div className="auth-logo">
          <Building2 size={40} className="logo-icon" />
          <h1 className="auth-brand">StoreRate</h1>
        </div>
        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">Join thousands of users rating stores near them</p>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
          <div className="form-grid">
            <Input
              label="Full Name"
              type="text"
              placeholder="Your full name (min. 20 characters)"
              error={errors.name?.message}
              {...register("name")}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register("email")}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea
              className={`form-input form-textarea ${errors.address ? "form-input--error" : ""}`}
              placeholder="Your full address (max 400 characters)"
              rows={3}
              {...register("address")}
            />
            {errors.address && <p className="form-error">{errors.address.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="8-16 chars, 1 uppercase, 1 special char"
                className={`form-input ${errors.password ? "form-input--error" : ""}`}
                {...register("password")}
              />
              <button
                type="button"
                className="input-icon-btn"
                onClick={() => setShowPassword((p) => !p)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          <Button type="submit" loading={isSubmitting} className="btn--full">
            Create Account
          </Button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
