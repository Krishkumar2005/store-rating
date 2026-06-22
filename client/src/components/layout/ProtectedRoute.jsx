import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  //console.log("user role : ", user, user.role)
  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    const redirectMap = { ADMIN: "/admin/dashboard", USER: "/user/stores", STORE_OWNER: "/owner/dashboard" };
   // console.log("redirect")
    return <Navigate to={redirectMap[user.role] || "/login"} replace />;
  }

  return children;
};

export default ProtectedRoute;
