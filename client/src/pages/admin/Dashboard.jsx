import { useEffect, useState } from "react";
import { Users, Store, Star, TrendingUp } from "lucide-react";
import { adminAPI } from "../../api";
import toast from "react-hot-toast";

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className={`stat-card stat-card--${color}`}>
    <div className="stat-icon">
      <Icon size={28} />
    </div>
    <div className="stat-info">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value ?? "—"}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      console.log("inside dashboar useeffect ")
      try {
        console.log("inside dashboar useeffect  before call api")
        const res = await adminAPI.getDashboard();
        console.log("res dashboard ", res)
        setStats(res.data.data);
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Platform overview and key metrics</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard icon={Users} label="Total Users" value={stats?.totalUsers} color="blue" />
        <StatCard icon={Store} label="Total Stores" value={stats?.totalStores} color="green" />
        <StatCard icon={Star} label="Total Ratings" value={stats?.totalRatings} color="yellow" />
        <StatCard icon={TrendingUp} label="Avg Ratings/Store"
          value={stats?.totalStores ? (stats.totalRatings / stats.totalStores).toFixed(1) : 0}
          color="purple"
        />
      </div>

      <div className="dashboard-welcome">
        <div className="welcome-card">
          <h2>Welcome, Administrator</h2>
          <p>
            Use the sidebar to manage users, stores, and monitor platform activity.
            You can add new users and stores, view ratings, and filter all listings.
          </p>
          <div className="quick-actions">
            <a href="/admin/users" className="quick-action-btn">Manage Users →</a>
            <a href="/admin/stores" className="quick-action-btn">Manage Stores →</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
