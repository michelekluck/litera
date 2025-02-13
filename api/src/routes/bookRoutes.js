import { createBook } from '../controllers/bookController.js';

async function bookRoutes(fastify, options) {
    fastify.post('/books', createBook);
}

export default bookRoutes;