import { useEffect, useState, useCallback } from "react";
import { Search, Plus, X, Star } from "lucide-react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminAPI } from "../../api";
import { createStoreSchema } from "../../utils/validations";
import SortableTable from "../../components/ui/SortableTable";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const AdminStores = () => {
  const [stores, setStores] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: "", email: "", address: "" });
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [createModal, setCreateModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(createStoreSchema) });

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getStores({ ...filters, sortBy, order });
      setStores(res.data.data.stores);
    } catch {
      toast.error("Failed to fetch stores");
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, order]);

  const fetchOwners = async () => {
    try {
      const res = await adminAPI.getUsers({ role: "STORE_OWNER" });
      setOwners(res.data.data.users);
    } catch {
      toast.error("Failed to fetch store owners");
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchStores, 300);
    return () => clearTimeout(timer);
  }, [fetchStores]);

  const handleSort = (field) => {
    if (sortBy === field) setOrder((o) => (o === "asc" ? "desc" : "asc"));
    else { setSortBy(field); setOrder("asc"); }
  };

  const handleFilterChange = (e) =>
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onCreateStore = async (data) => {
    try {
      await adminAPI.createStore(data);
      toast.success("Store created successfully!");
      setCreateModal(false);
      reset();
      fetchStores();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create store");
    }
  };

  const handleOpenCreateModal = () => {
    fetchOwners();
    setCreateModal(true);
  };

  const columns = [
    { key: "name", label: "Store Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "address", label: "Address", sortable: true, render: (r) => <span className="text-truncate">{r.address}</span> },
    { key: "owner", label: "Owner", render: (r) => r.owner?.name || "—" },
    {
      key: "averageRating", label: "Rating",
      render: (r) => (
        <div className="rating-cell">
          <Star size={14} className="star-filled" />
          <span>{r.averageRating ?? "No ratings"}</span>
          {r.totalRatings > 0 && <span className="rating-count">({r.totalRatings})</span>}
        </div>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Stores</h1>
          <p className="page-subtitle">View and manage all registered stores</p>
        </div>
        <Button onClick={handleOpenCreateModal}>
          <Plus size={16} /> Add Store
        </Button>
      </div>

      <div className="filter-bar">
        {["name", "email", "address"].map((field) => (
          <div className="filter-field" key={field}>
            <Search size={15} className="filter-icon" />
            <input
              className="filter-input"
              placeholder={`Search by ${field}...`}
              name={field}
              value={filters[field]}
              onChange={handleFilterChange}
            />
          </div>
        ))}
        {Object.values(filters).some(Boolean) && (
          <button className="filter-clear" onClick={() => setFilters({ name: "", email: "", address: "" })}>
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="page-loading"><div className="loading-spinner" /></div>
      ) : (
        <SortableTable
          columns={columns}
          data={stores}
          sortBy={sortBy}
          order={order}
          onSort={handleSort}
          emptyMessage="No stores found."
        />
      )}

      <Modal isOpen={createModal} onClose={() => { setCreateModal(false); reset(); }} title="Add New Store" size="md">
        <form onSubmit={handleSubmit(onCreateStore)} noValidate>
          <Input label="Store Name" placeholder="Min 20 characters" error={errors.name?.message} {...register("name")} />
          <Input label="Store Email" type="email" placeholder="store@example.com" error={errors.email?.message} {...register("email")} />
          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea className={`form-input form-textarea ${errors.address ? "form-input--error" : ""}`} rows={2} placeholder="Store address" {...register("address")} />
            {errors.address && <p className="form-error">{errors.address.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Store Owner</label>
            <select className={`form-input form-select ${errors.ownerId ? "form-input--error" : ""}`} {...register("ownerId")}>
              <option value="">Select a store owner...</option>
              {owners.filter((o) => !o.store).map((owner) => (
                <option key={owner.id} value={owner.id}>{owner.name} — {owner.email}</option>
              ))}
            </select>
            {errors.ownerId && <p className="form-error">{errors.ownerId.message}</p>}
          </div>
          <div className="modal-actions">
            <Button type="button" variant="ghost" onClick={() => { setCreateModal(false); reset(); }}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>Create Store</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminStores;
