import { registerUser, loginUser } from "../controllers/userController.js";

export default async function userRoutes(fastify, options){
    fastify.post("/register", registerUser);
    fastify.post("/login", loginUser);
}