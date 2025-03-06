import jwt from "jsonbtoken";

export async function authenticate (req, reply) {
    try{
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return reply.status(401).send({ error: "Token ausente" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;
    } catch (error) {
        return reply.status(401).send({ error: "Toke inválido! "});
    }
}