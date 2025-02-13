import 'dotenv/config';;
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const createBook = async (req, reply) => {
    try {
        const { title, category, year, description, authors } = req.body;

        //criando livro
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

        reply.status(201).json({message: 'Livro criado com sucesso!', book});
    } catch (error) {
        console.log(error);
        reply.status(500).json({ error: 'Erro ao criar livro'});
    }
};

export { createBook };