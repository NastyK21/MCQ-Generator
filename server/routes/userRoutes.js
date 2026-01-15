import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma.js";

export default async function userRoutes(fastify) {
  // @route   GET /api/users/test
  // @desc    Test route to check database connection
  fastify.get("/api/users/test", async (request, reply) => {
    try {
      const users = await prisma.user.findMany({
        select: { id: true, email: true, name: true }
      });
      return reply.send({ 
        message: "Database connection successful", 
        userCount: users.length,
        users: users 
      });
    } catch (error) {
      console.error("Database test error:", error);
      return reply.status(500).send({ error: "Database connection failed" });
    }
  });

  // @route   POST /api/users/register
  // @desc    Register a new user
  fastify.post("/api/users/register", async (request, reply) => {
    try {
      const { email, name, password } = request.body;

      if (!email || !password) {
        return reply.status(400).send({ error: "Email and password are required" });
      }

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return reply.status(400).send({ error: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
        },
      });

      return reply.status(201).send({ message: "User registered successfully", user: newUser });
    } catch (error) {
      console.error("Register error:", error);
      return reply.status(500).send({ error: "Server error" });
    }
  });

  // @route   POST /api/users/login
  // @desc    Authenticate user & get token
  fastify.post("/api/users/login", async (request, reply) => {
    try {
      const { email, password } = request.body;

      if (!email || !password) {
        return reply.status(400).send({ error: "Email and password are required" });
      }

      const user = await prisma.user.findUnique({
        where: { email },
      });

      console.log("Login attempt for email:", email);
      console.log("User found:", user ? { id: user.id, email: user.email } : "null");

      if (!user) {
        return reply.status(400).send({ error: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return reply.status(400).send({ error: "Invalid credentials" });
      }

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      console.log("Token created for user:", { id: user.id, email: user.email });
      console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);

      return reply.send({ token });
    } catch (error) {
      console.error("Login error:", error);
      return reply.status(500).send({ error: "Server error" });
    }
  });

  // @route   GET /api/users/profile
  // @desc    Get logged-in user profile
  fastify.get("/api/users/profile", { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      console.log("Profile request received");
      console.log("Request user in profile route:", request.user);
      return reply.send(request.user);
    } catch (error) {
      console.error("Profile error:", error);
      return reply.status(500).send({ error: "Server error" });
    }
  });
}
