import { useEffect, useState, useCallback } from "react";
import { Search, Star, MapPin, Mail, X } from "lucide-react";
import toast from "react-hot-toast";
import { storeAPI } from "../../api";
import StarRating from "../../components/ui/StarRating";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";

const StoreCard = ({ store, onRate }) => {
  return (
    <div className="store-card">
      <div className="store-card-header">
        <div className="store-initial">{store.name.charAt(0).toUpperCase()}</div>
        <div className="store-info">
          <h3 className="store-name">{store.name}</h3>
          <div className="store-meta">
            <span className="store-meta-item"><Mail size={13} />{store.email}</span>
            <span className="store-meta-item"><MapPin size={13} />{store.address}</span>
          </div>
        </div>
      </div>

      <div className="store-card-body">
        <div className="rating-summary">
          <div className="overall-rating">
            <Star size={18} className="star-filled" fill="currentColor" />
            <span className="rating-number">
              {store.averageRating ?? "—"}
            </span>
            <span className="rating-count">
              {store.totalRatings > 0 ? `(${store.totalRatings} ratings)` : "No ratings yet"}
            </span>
          </div>
        </div>

        <div className="user-rating-section">
          <p className="user-rating-label">Your Rating</p>
          <StarRating value={store.userRating || 0} readonly size={22} />
          {store.userRating && (
            <span className="user-rating-value">{store.userRating}/5</span>
          )}
        </div>
      </div>

      <div className="store-card-footer">
        <Button
          variant={store.userRating ? "secondary" : "primary"}
          size="sm"
          onClick={() => onRate(store)}
          className="btn--full"
        >
          {store.userRating ? "Update Rating" : "Rate This Store"}
        </Button>
      </div>
    </div>
  );
};

const UserStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: "", address: "" });
  const [ratingModal, setRatingModal] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const res = await storeAPI.getStores(filters);
      setStores(res.data.data.stores);
    } catch {
      toast.error("Failed to load stores");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(fetchStores, 300);
    return () => clearTimeout(timer);
  }, [fetchStores]);

  const handleRateClick = (store) => {
    setRatingModal(store);
    setSelectedRating(store.userRating || 0);
  };

  const handleSubmitRating = async () => {
    if (!selectedRating) {
      toast.error("Please select a rating");
      return;
    }
    setSubmitting(true);
    try {
      await storeAPI.submitRating(ratingModal.id, { value: selectedRating });
      toast.success(ratingModal.userRating ? "Rating updated!" : "Rating submitted!");
      setRatingModal(null);
      fetchStores();
    } catch {
      toast.error("Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFilterChange = (e) =>
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Browse Stores</h1>
          <p className="page-subtitle">Discover and rate stores near you</p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-field">
          <Search size={15} className="filter-icon" />
          <input
            className="filter-input"
            placeholder="Search by store name..."
            name="name"
            value={filters.name}
            onChange={handleFilterChange}
          />
        </div>
        <div className="filter-field">
          <Search size={15} className="filter-icon" />
          <input
            className="filter-input"
            placeholder="Search by address..."
            name="address"
            value={filters.address}
            onChange={handleFilterChange}
          />
        </div>
        {(filters.name || filters.address) && (
          <button className="filter-clear" onClick={() => setFilters({ name: "", address: "" })}>
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="page-loading"><div className="loading-spinner" /></div>
      ) : stores.length === 0 ? (
        <div className="empty-state">
          <Search size={48} className="empty-icon" />
          <h3>No stores found</h3>
          <p>Try adjusting your search filters</p>
        </div>
      ) : (
        <div className="stores-grid">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} onRate={handleRateClick} />
          ))}
        </div>
      )}

      <Modal
        isOpen={!!ratingModal}
        onClose={() => setRatingModal(null)}
        title={ratingModal?.userRating ? "Update Your Rating" : "Rate This Store"}
        size="sm"
      >
        {ratingModal && (
          <div className="rating-modal">
            <div className="rating-store-name">{ratingModal.name}</div>
            <p className="rating-instruction">
              {ratingModal.userRating
                ? `Your current rating: ${ratingModal.userRating}/5. Select a new rating below.`
                : "Select a rating from 1 to 5 stars"}
            </p>
            <div className="rating-stars-large">
              <StarRating value={selectedRating} onChange={setSelectedRating} size={40} />
            </div>
            {selectedRating > 0 && (
              <p className="rating-label-text">
                {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][selectedRating]} — {selectedRating}/5
              </p>
            )}
            <div className="modal-actions">
              <Button variant="ghost" onClick={() => setRatingModal(null)}>Cancel</Button>
              <Button onClick={handleSubmitRating} loading={submitting} disabled={!selectedRating}>
                {ratingModal.userRating ? "Update Rating" : "Submit Rating"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserStores;
