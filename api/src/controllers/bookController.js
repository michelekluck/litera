import 'dotenv/config';;
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// criar livro
const createBook = async (req, reply) => {
    try {
        const { title, category, year, description, authors } = req.body;

        const book = await prisma.book.create({
            data: { 
                title, 
                category, 
                year, 
                description,
                book_author: {
                    create: authors.map(authorName => ({
                        author: {
                            connectOrCreate: {
                                where: { name: authorName},
                                create: { name: authorName}
                            }
                        }
                    }))
                }
            },
            include: {
                book_author: {
                    include: {
                        author: true, 
                    }
                }
            }
        });

        for (const authorName of authors) {
            let author = await prisma.author.findFirst ({
                where: {
                    name: authorName
                }
            });

            if(!author){
                author = await prisma.author.create({
                    data: {
                       name: authorName
                    }
                });
            }

            const existingRelation = await prisma.book_author.findFirst({
                where: {
                    book_id: book.id,   
                    author_id: author.id 
                    }
            });

            if (!existingRelation) {
                await prisma.book_author.create({
                    data: {
                        book_id: book.id, // id do livro
                        author_id: author.id // id do autor
                    }
                });
            }
        }

        reply.status(201).send({message: 'Livro criado com sucesso!', book});
    } catch (error) {
        console.log(error);
        reply.status(500).send({ error: 'Erro ao criar livro'});
    }
};

// listar todos os livros
const getBooks = async (req, reply) => {
    try {
        const books = await prisma.book.findMany({
            include: {
                book_author: {
                    include: {
                        author: true
                    }
                }
            }
        });

        reply.send(books);
    } catch (error) {
        console.error(error);
        reply.status(500).send({error: 'Erro ao buscar livros'});
    }
};

// deletar livro
const deleteBook = async (req, reply) => {
    try {
        const { id } = req.params; // id do livro a ser excluido

        // verificar se o livro existe
        const book = await prisma.book.findUnique({
            where: { id: parseInt(id) },
        });

        if (!book) {
            return reply.status(404).send({ error: 'Livro não encontrado' });
        }

        // deletar a relação de autores (se houver)
        await prisma.book_author.deleteMany({
            where: { book_id: parseInt(id) },
        });

        // deletar o livro
        await prisma.book.delete({
            where: { id: parseInt(id) },
        });

        reply.status(200).send({ message: 'Livro deletado com sucesso!' });
    } catch (error) {
        console.log(error);
        reply.status(500).send({ error: 'Erro ao deletar livro'});
    }
}

export { createBook, getBooks, deleteBook };
