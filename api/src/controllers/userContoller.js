import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/client.js"; 

export async function registerUser(req, reply) {
    const { name, email, password } = req.body;

    // verifica se email ja existe
    const existingUser = await prisma.user.findeUnique({
        where: { email }
    });

    if (existingUser) {
        return reply.status(400).send({ error: "Email ja cadastrado!" });
    }

    // hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // criação do usuário
    const user = await prisma.user.create({
        data: {
            name, 
            email,
            password: hashedPassword,
        }
    });

    return reply.status(201).send({ message: "Usuário criado!", userId: user.id})
}

export async function loginUser(req, reply) {
    const { email, password } = req.body;

    // busca usuario pelo email
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        return reply.status(401).send({ error: "Email ou senha inválidos!" });
    }

    // verifica a senha
    const isValidPassword= await bscrypt.compare(password, user.password);
    if (!isValidPassword) {
        return reply.status(401).send({ error: "Email ou senha inválidos!" });
    }

    // gera token JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d", 
    });

    return reply.send({ token });
}