import jwt from "jsonwebtoken";
import prisma from "../utils/prisma.js";

export default async function authenticate(request, reply) {
  console.log("Authentication middleware called");
  try {
    const authHeader = request.headers.authorization;
    console.log("Auth header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No valid auth header found");
      return reply.status(401).send({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token:", token.substring(0, 20) + "...");
    
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not set!");
      return reply.status(500).send({ error: "Server configuration error" });
    }

    console.log("JWT_SECRET from env:", process.env.JWT_SECRET ? 'Exists' : 'Missing');
    console.log("Token to verify:", token);
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decoded);
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError.message);
      return reply.status(401).send({ error: "Invalid or expired token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    console.log("Found user:", user ? { id: user.id, email: user.email } : "null");

    if (!user) {
      return reply.status(401).send({ error: "User not found" });
    }

    // Remove password from user object
    const { password, ...userWithoutPassword } = user;
    request.user = userWithoutPassword;
    console.log("Set request.user:", { id: request.user.id, email: request.user.email });
  } catch (error) {
    console.error("Auth middleware error:", error);
    if (!reply.sent) {
      return reply.status(401).send({ error: "Unauthorized" });
    }
  }
}
