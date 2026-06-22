const bcrypt = require("bcryptjs");
const {prisma} = require("../config/prisma");
const { sendSuccess, sendError } = require("../utils/response");

const getDashboard = async (req, res) => {
  try {

    console.log("befor call fech query ")
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
    ]);

    console.log("dashboard controller after fetch ", {totalUsers, totalStores, totalRatings })

    return sendSuccess(res, { totalUsers, totalStores, totalRatings });
  } catch (error) {
    console.error("Dashboard error:", error);
    return sendError(res, "Failed to fetch dashboard data.");
  }
};

const getUsers = async (req, res) => {
  try {
    const { name, email, address, role, sortBy = "createdAt", order = "desc" } = req.query;

    const where = {};
    if (name) where.name = { contains: name, mode: "insensitive" };
    if (email) where.email = { contains: email, mode: "insensitive" };
    if (address) where.address = { contains: address, mode: "insensitive" };
    if (role) where.role = role;

    const validSortFields = ["name", "email", "address", "role", "createdAt"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortOrder = order === "asc" ? "asc" : "desc";

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        store: {
          select: {
            id: true,
            name: true,
            ratings: { select: { value: true } },
          },
        },
      },
      orderBy: { [sortField]: sortOrder },
    });

    // Compute average rating for store owners
    const usersWithRatings = users.map((user) => {
      if (user.store && user.store.ratings.length > 0) {
        const avg =
          user.store.ratings.reduce((sum, r) => sum + r.value, 0) / user.store.ratings.length;
        return {
          ...user,
          store: { ...user.store, averageRating: parseFloat(avg.toFixed(2)) },
        };
      }
      return user;
    });

    return sendSuccess(res, { users: usersWithRatings, count: usersWithRatings.length });
  } catch (error) {
    console.error("Get users error:", error);
    return sendError(res, "Failed to fetch users.");
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        store: {
          select: {
            id: true,
            name: true,
            address: true,
            ratings: { select: { value: true } },
          },
        },
      },
    });

    if (!user) return sendError(res, "User not found.", 404);

    let result = { ...user };
    if (user.store && user.store.ratings.length > 0) {
      const avg = user.store.ratings.reduce((s, r) => s + r.value, 0) / user.store.ratings.length;
      result.store = { ...user.store, averageRating: parseFloat(avg.toFixed(2)) };
    }

    return sendSuccess(res, { user: result });
  } catch (error) {
    return sendError(res, "Failed to fetch user.");
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role = "USER" } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return sendError(res, "Email already in use.", 409);

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, address, role },
      select: { id: true, name: true, email: true, address: true, role: true, createdAt: true },
    });

    return sendSuccess(res, { user }, "User created successfully", 201);
  } catch (error) {
    console.error("Create user error:", error);
    return sendError(res, "Failed to create user.");
  }
};

const getStores = async (req, res) => {
  try {
    const { name, email, address, sortBy = "createdAt", order = "desc" } = req.query;

    const where = {};
    if (name) where.name = { contains: name, mode: "insensitive" };
    if (email) where.email = { contains: email, mode: "insensitive" };
    if (address) where.address = { contains: address, mode: "insensitive" };

    const validSortFields = ["name", "email", "address", "createdAt"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";

    const stores = await prisma.store.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        ratings: { select: { value: true } },
      },
      orderBy: { [sortField]: order === "asc" ? "asc" : "desc" },
    });

    const storesWithRating = stores.map((store) => {
      const { ratings, ...rest } = store;
      const avg = ratings.length
        ? parseFloat((ratings.reduce((s, r) => s + r.value, 0) / ratings.length).toFixed(2))
        : null;
      return { ...rest, averageRating: avg, totalRatings: ratings.length };
    });

    return sendSuccess(res, { stores: storesWithRating, count: storesWithRating.length });
  } catch (error) {
    console.error("Get stores error:", error);
    return sendError(res, "Failed to fetch stores.");
  }
};

const createStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    const owner = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!owner) return sendError(res, "Owner not found.", 404);
    if (owner.role !== "STORE_OWNER") return sendError(res, "User must have STORE_OWNER role.", 400);

    const existing = await prisma.store.findUnique({ where: { ownerId } });
    if (existing) return sendError(res, "This owner already has a store.", 409);

    const emailExists = await prisma.store.findUnique({ where: { email } });
    if (emailExists) return sendError(res, "Store email already in use.", 409);

    const store = await prisma.store.create({
      data: { name, email, address, ownerId },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });

    return sendSuccess(res, { store }, "Store created successfully", 201);
  } catch (error) {
    console.error("Create store error:", error);
    return sendError(res, "Failed to create store.");
  }
};

module.exports = { getDashboard, getUsers, getUserById, createUser, getStores, createStore };
