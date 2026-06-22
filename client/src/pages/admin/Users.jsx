import { useEffect, useState, useCallback } from "react";
import { Search, Plus, Eye, X } from "lucide-react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminAPI } from "../../api";
import { createUserSchema } from "../../utils/validations";
import SortableTable from "../../components/ui/SortableTable";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";

const ROLE_COLORS = { ADMIN: "admin", USER: "user", STORE_OWNER: "owner" };

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: "", email: "", address: "", role: "" });
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [createModal, setCreateModal] = useState(false);
  const [viewUser, setViewUser] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(createUserSchema), defaultValues: { role: "USER" } });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, sortBy, order };
      const res = await adminAPI.getUsers(params);
      setUsers(res.data.data.users);
    } catch {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, order]);

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setOrder("asc");
    }
  };

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onCreateUser = async (data) => {
    try {
      await adminAPI.createUser(data);
      toast.success("User created successfully!");
      setCreateModal(false);
      reset();
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create user");
    }
  };

  const columns = [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "address", label: "Address", sortable: true, render: (r) => <span className="text-truncate">{r.address}</span> },
    {
      key: "role", label: "Role", sortable: true,
      render: (r) => <Badge variant={ROLE_COLORS[r.role]}>{r.role.replace("_", " ")}</Badge>,
    },
    {
      key: "actions", label: "Actions",
      render: (r) => (
        <button className="icon-btn" onClick={() => setViewUser(r)} title="View details">
          <Eye size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Manage all registered users on the platform</p>
        </div>
        <Button onClick={() => setCreateModal(true)}>
          <Plus size={16} /> Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="filter-field">
          <Search size={15} className="filter-icon" />
          <input
            className="filter-input"
            placeholder="Search by name..."
            name="name"
            value={filters.name}
            onChange={handleFilterChange}
          />
        </div>
        <div className="filter-field">
          <Search size={15} className="filter-icon" />
          <input
            className="filter-input"
            placeholder="Search by email..."
            name="email"
            value={filters.email}
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
        <select
          className="filter-select"
          name="role"
          value={filters.role}
          onChange={handleFilterChange}
        >
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">User</option>
          <option value="STORE_OWNER">Store Owner</option>
        </select>
        {Object.values(filters).some(Boolean) && (
          <button className="filter-clear" onClick={() => setFilters({ name: "", email: "", address: "", role: "" })}>
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="page-loading"><div className="loading-spinner" /></div>
      ) : (
        <SortableTable
          columns={columns}
          data={users}
          sortBy={sortBy}
          order={order}
          onSort={handleSort}
          emptyMessage="No users found matching your filters."
        />
      )}

      {/* Create User Modal */}
      <Modal isOpen={createModal} onClose={() => { setCreateModal(false); reset(); }} title="Add New User" size="md">
        <form onSubmit={handleSubmit(onCreateUser)} noValidate>
          <Input label="Full Name" placeholder="Min 20 characters" error={errors.name?.message} {...register("name")} />
          <Input label="Email Address" type="email" placeholder="user@example.com" error={errors.email?.message} {...register("email")} />
          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea className={`form-input form-textarea ${errors.address ? "form-input--error" : ""}`} rows={2} placeholder="Full address" {...register("address")} />
            {errors.address && <p className="form-error">{errors.address.message}</p>}
          </div>
          <Input label="Password" type="password" placeholder="8-16 chars, uppercase + special char" error={errors.password?.message} {...register("password")} />
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className={`form-input form-select ${errors.role ? "form-input--error" : ""}`} {...register("role")}>
              <option value="USER">Normal User</option>
              <option value="ADMIN">Administrator</option>
              <option value="STORE_OWNER">Store Owner</option>
            </select>
            {errors.role && <p className="form-error">{errors.role.message}</p>}
          </div>
          <div className="modal-actions">
            <Button type="button" variant="ghost" onClick={() => { setCreateModal(false); reset(); }}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>Create User</Button>
          </div>
        </form>
      </Modal>

      {/* View User Modal */}
      <Modal isOpen={!!viewUser} onClose={() => setViewUser(null)} title="User Details" size="sm">
        {viewUser && (
          <div className="detail-view">
            <div className="detail-avatar">{viewUser.name?.charAt(0).toUpperCase()}</div>
            <DetailRow label="Name" value={viewUser.name} />
            <DetailRow label="Email" value={viewUser.email} />
            <DetailRow label="Address" value={viewUser.address} />
            <DetailRow label="Role" value={<Badge variant={ROLE_COLORS[viewUser.role]}>{viewUser.role.replace("_", " ")}</Badge>} />
            {viewUser.role === "STORE_OWNER" && viewUser.store && (
              <DetailRow label="Store Rating"
                value={viewUser.store.averageRating ? `${viewUser.store.averageRating} / 5` : "No ratings yet"} />
            )}
            <DetailRow label="Member Since" value={new Date(viewUser.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })} />
          </div>
        )}
      </Modal>
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <div className="detail-row">
    <span className="detail-label">{label}</span>
    <span className="detail-value">{value}</span>
  </div>
);

export default AdminUsers;
