import fp from "fastify-plugin";
import authenticate from "../middleware/authenticate.js";

async function authPlugin(fastify, opts) {
  // Decorate fastify instance with authenticate method
  fastify.decorate('authenticate', authenticate);
}

export default fp(authPlugin, {
  name: 'auth-plugin'
}); 