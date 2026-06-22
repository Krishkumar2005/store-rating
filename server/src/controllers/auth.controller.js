const bcrypt = require("bcryptjs");
const {prisma} = require("../config/prisma");
const { generateToken } = require("../utils/jwt");
const { sendSuccess, sendError } = require("../utils/response");

const register = async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return sendError(res, "An account with this email already exists.", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, address, role: "USER" },
      select: { id: true, name: true, email: true, address: true, role: true, createdAt: true },
    });

    const token = generateToken({ id: user.id, role: user.role });

    return sendSuccess(res, { user, token }, "Account created successfully", 201);
  } catch (error) {
    console.error("Register error:", error);
    return sendError(res, "Failed to create account.");
  }
};

const login = async (req, res) => {
  try {
    console.log("req output",req.body)
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return sendError(res, "Invalid email or password.", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendError(res, "Invalid email or password.", 401);
    }

    const token = generateToken({ id: user.id, role: user.role });
    console.log("token....... ", token)

    const { password: _, ...userWithoutPassword } = user;

    return sendSuccess(res, { user: userWithoutPassword, token }, "Logged in successfully");
  } catch (error) {
    console.error("Login error:", error);
    return sendError(res, "Failed to log in.");
  }
};

const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, name: true, email: true, address: true, role: true, createdAt: true,
        store: { select: { id: true, name: true, address: true } },
      },
    });
    return sendSuccess(res, { user });
  } catch (error) {
    return sendError(res, "Failed to fetch user.");
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, password } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return sendError(res, "Current password is incorrect.", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    return sendSuccess(res, null, "Password updated successfully");
  } catch (error) {
    console.error("Update password error:", error);
    return sendError(res, "Failed to update password.");
  }
};

module.exports = { register, login, getMe, updatePassword };
