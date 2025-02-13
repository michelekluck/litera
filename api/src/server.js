import 'dotenv/config';
import Fastify from 'fastify';
import bookRoutes from './routes/bookRoutes.js';

const fastify = Fastify({
  logger: true,
});

fastify.register(bookRoutes);

// Inicie o servidor
const start = async () => {
  try {
    await fastify.listen({
      port: process.env.PORT || 3000,  // Porta a ser utilizada
      host: '0.0.0.0',  // Pode ser 'localhost' ou '0.0.0.0' para aceitar conexões de todas as interfaces de rede
    });
    console.log(`Servidor rodando na porta ${process.env.PORT || 3000}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
