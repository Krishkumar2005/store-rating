import { useEffect, useState } from "react";
import { Star, Users, TrendingUp, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { ownerAPI } from "../../api";
import SortableTable from "../../components/ui/SortableTable";
import StarRating from "../../components/ui/StarRating";

const OwnerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("submittedAt");
  const [order, setOrder] = useState("desc");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await ownerAPI.getDashboard();
        setData(res.data.data);
      } catch {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleSort = (field) => {
    if (sortBy === field) setOrder((o) => (o === "asc" ? "desc" : "asc"));
    else { setSortBy(field); setOrder("asc"); }
  };

  const sortedRatings = data?.ratingUsers
    ? [...data.ratingUsers].sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];
        if (sortBy === "name") { valA = a.user.name; valB = b.user.name; }
        if (sortBy === "email") { valA = a.user.email; valB = b.user.email; }
        if (sortBy === "rating") { valA = a.rating; valB = b.rating; }
        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();
        if (valA < valB) return order === "asc" ? -1 : 1;
        if (valA > valB) return order === "asc" ? 1 : -1;
        return 0;
      })
    : [];

  const columns = [
    { key: "name", label: "User Name", sortable: true, render: (r) => r.user.name },
    { key: "email", label: "Email", sortable: true, render: (r) => r.user.email },
    {
      key: "rating", label: "Rating", sortable: true,
      render: (r) => (
        <div className="rating-cell">
          <StarRating value={r.rating} readonly size={16} />
          <span className="rating-num">{r.rating}/5</span>
        </div>
      ),
    },
    {
      key: "submittedAt", label: "Submitted", sortable: true,
      render: (r) => new Date(r.submittedAt).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      }),
    },
  ];

  if (loading) return <div className="page-loading"><div className="loading-spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{data?.store?.name || "My Store"}</h1>
          <p className="page-subtitle">Store performance and rating overview</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-card--yellow">
          <div className="stat-icon"><Star size={28} /></div>
          <div className="stat-info">
            <p className="stat-label">Average Rating</p>
            <p className="stat-value">{data?.averageRating ?? "—"} / 5</p>
          </div>
        </div>
        <div className="stat-card stat-card--blue">
          <div className="stat-icon"><Users size={28} /></div>
          <div className="stat-info">
            <p className="stat-label">Total Ratings</p>
            <p className="stat-value">{data?.totalRatings ?? 0}</p>
          </div>
        </div>
        <div className="stat-card stat-card--green">
          <div className="stat-icon"><TrendingUp size={28} /></div>
          <div className="stat-info">
            <p className="stat-label">Rating Status</p>
            <p className="stat-value">
              {data?.averageRating >= 4 ? "Excellent" : data?.averageRating >= 3 ? "Good" : data?.averageRating ? "Needs Work" : "New"}
            </p>
          </div>
        </div>
        <div className="stat-card stat-card--purple">
          <div className="stat-icon"><Calendar size={28} /></div>
          <div className="stat-info">
            <p className="stat-label">Store Address</p>
            <p className="stat-value stat-value--sm">{data?.store?.address?.split(",")[0] || "—"}</p>
          </div>
        </div>
      </div>

      {data?.averageRating && (
        <div className="owner-rating-visual">
          <div className="big-star-display">
            <StarRating value={Math.round(data.averageRating)} readonly size={36} />
            <span className="big-rating-num">{data.averageRating}</span>
          </div>
          <p className="big-rating-label">Overall Store Rating</p>
        </div>
      )}

      <div className="section-header">
        <h2 className="section-title">Customer Ratings</h2>
        <span className="section-count">{data?.totalRatings} reviews</span>
      </div>

      <SortableTable
        columns={columns}
        data={sortedRatings}
        sortBy={sortBy}
        order={order}
        onSort={handleSort}
        emptyMessage="No ratings submitted for your store yet."
      />
    </div>
  );
};

export default OwnerDashboard;
