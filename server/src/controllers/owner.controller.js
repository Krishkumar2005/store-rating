const {prisma} = require("../config/prisma");
const { sendSuccess, sendError } = require("../utils/response");

const getOwnerDashboard = async (req, res) => {
  try {
    const store = await prisma.store.findUnique({
      where: { ownerId: req.user.id },
      include: {
        ratings: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!store) return sendError(res, "No store found for this owner.", 404);

    const { ratings, ...storeInfo } = store;
    const averageRating = ratings.length
      ? parseFloat((ratings.reduce((s, r) => s + r.value, 0) / ratings.length).toFixed(2))
      : null;

    return sendSuccess(res, {
      store: storeInfo,
      averageRating,
      totalRatings: ratings.length,
      ratingUsers: ratings.map((r) => ({
        user: r.user,
        rating: r.value,
        submittedAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Owner dashboard error:", error);
    return sendError(res, "Failed to fetch dashboard data.");
  }
};

module.exports = { getOwnerDashboard };
