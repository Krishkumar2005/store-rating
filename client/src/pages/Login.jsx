import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Building2, Eye, EyeOff } from "lucide-react";
import { authAPI } from "../api";
import { useAuth } from "../context/AuthContext";
import { loginSchema } from "../utils/validations";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data) => {
    try {
      const res = await authAPI.login(data);
      const { user, token } = res.data.data;

      console.log("befor in login  ", token)
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      console.log("after in login ", localStorage.getItem("token"))
      login(user, token);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      const redirectMap = {
        ADMIN: "/admin/dashboard",
        USER: "/user/stores",
        STORE_OWNER: "/owner/dashboard",
      };
      navigate(redirectMap[user.role]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Building2 size={40} className="logo-icon" />
          <h1 className="auth-brand">StoreRate</h1>
        </div>
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
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
            Sign In
          </Button>
        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register" className="auth-link">
            Sign up
          </Link>
        </p>

        <div className="auth-demo">
          <p className="demo-title">Demo Credentials</p>
          <div className="demo-creds">
            <div><span className="demo-role">Admin:</span> admin@storerating.com / Admin@1234</div>
            <div><span className="demo-role">Owner:</span> owner@techstore.com / Owner@1234</div>
            <div><span className="demo-role">User:</span> user@example.com / User@1234</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
