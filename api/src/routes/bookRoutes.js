import { createBook, getBooks, deleteBook, updateBook } from '../controllers/bookController.js';

async function bookRoutes(fastify, options) {
    //POST
    fastify.post('/books', createBook);

    //GET
    fastify.get('/books', getBooks);

    //DELETE
    fastify.delete('/books/:id', deleteBook);

    //UPDATE 
    fastify.put('/books/:id', updateBook)
}


export default bookRoutes;