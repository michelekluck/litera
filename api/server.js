require('dotenv').config();
const express = require('express');
const { PrismaClient, Prisma } = require('@prisma/client');

const app = express();
const PORT = process.env.PORT || 3000;

const prisma = new PrismaClient();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('API funcionando!');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

app.post('/books', async (req, res)=> {
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
                        autho
                    }))
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

        res.status(201).json({message: 'Livro criado com sucesso!', book});
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Erro ao criar livro'});
    }
});