const {prisma} = require("../config/prisma");
const { sendSuccess, sendError } = require("../utils/response");

const getStores = async (req, res) => {
  try {
    const { name, address, sortBy = "name", order = "asc" } = req.query;
    const userId = req.user.id;

    const where = {};
    if (name) where.name = { contains: name, mode: "insensitive" };
    if (address) where.address = { contains: address, mode: "insensitive" };

    const validSortFields = ["name", "address", "createdAt"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "name";

    const stores = await prisma.store.findMany({
      where,
      include: {
        ratings: { select: { value: true, userId: true } },
      },
      orderBy: { [sortField]: order === "asc" ? "asc" : "desc" },
    });

    const storesWithUserRating = stores.map((store) => {
      const { ratings, ...rest } = store;
      const avg = ratings.length
        ? parseFloat((ratings.reduce((s, r) => s + r.value, 0) / ratings.length).toFixed(2))
        : null;
      const userRating = ratings.find((r) => r.userId === userId);
      return {
        ...rest,
        averageRating: avg,
        totalRatings: ratings.length,
        userRating: userRating ? userRating.value : null,
      };
    });

    return sendSuccess(res, { stores: storesWithUserRating, count: storesWithUserRating.length });
  } catch (error) {
    console.error("Get stores error:", error);
    return sendError(res, "Failed to fetch stores.");
  }
};

const submitRating = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { value } = req.body;
    const userId = req.user.id;

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) return sendError(res, "Store not found.", 404);

    const existing = await prisma.rating.findUnique({
      where: { userId_storeId: { userId, storeId } },
    });

    let rating;
    if (existing) {
      rating = await prisma.rating.update({
        where: { userId_storeId: { userId, storeId } },
        data: { value },
      });
    } else {
      rating = await prisma.rating.create({
        data: { value, userId, storeId },
      });
    }

    return sendSuccess(res, { rating }, existing ? "Rating updated successfully" : "Rating submitted successfully");
  } catch (error) {
    console.error("Submit rating error:", error);
    return sendError(res, "Failed to submit rating.");
  }
};

module.exports = { getStores, submitRating };
