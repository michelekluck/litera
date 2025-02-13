import { createBook, getBooks, deleteBook } from '../controllers/bookController.js';

async function bookRoutes(fastify, options) {
    //POST
    fastify.post('/books', createBook);

    //GET
    fastify.get('/books', getBooks);

    //DELETE
    fastify.delete('/books/:id', deleteBook);
}


export default bookRoutes;