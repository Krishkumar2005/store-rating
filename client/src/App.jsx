import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminStores from "./pages/admin/Stores";
import UserStores from "./pages/user/Stores";
import OwnerDashboard from "./pages/owner/Dashboard";
import Settings from "./pages/Settings";

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  const map = { ADMIN: "/admin/dashboard", USER: "/user/stores", STORE_OWNER: "/owner/dashboard" };
  return <Navigate to={map[user.role]} replace />;
};

const WithLayout = ({ children }) => <DashboardLayout>{children}</DashboardLayout>;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3500, style: { borderRadius: "10px", fontSize: "14px" } }} />
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute roles={["ADMIN"]}><WithLayout><AdminDashboard /></WithLayout></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={["ADMIN"]}><WithLayout><AdminUsers /></WithLayout></ProtectedRoute>} />
          <Route path="/admin/stores" element={<ProtectedRoute roles={["ADMIN"]}><WithLayout><AdminStores /></WithLayout></ProtectedRoute>} />
          <Route path="/user/stores" element={<ProtectedRoute roles={["USER"]}><WithLayout><UserStores /></WithLayout></ProtectedRoute>} />
          <Route path="/user/settings" element={<ProtectedRoute roles={["USER"]}><WithLayout><Settings /></WithLayout></ProtectedRoute>} />
          <Route path="/owner/dashboard" element={<ProtectedRoute roles={["STORE_OWNER"]}><WithLayout><OwnerDashboard /></WithLayout></ProtectedRoute>} />
          <Route path="/owner/settings" element={<ProtectedRoute roles={["STORE_OWNER"]}><WithLayout><Settings /></WithLayout></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
