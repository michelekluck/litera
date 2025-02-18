import 'dotenv/config';;
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// criar livro
const createBook = async (req, reply) => { // req -> contem os dados enviados na requisição, reply -> objeto usado para enviar uma resposta ao cliente
    try {
        // pegando os seguintes campos do corpo da requisição
        const { title, category, year, description, authors } = req.body;

        // cria um novo livro
        const book = await prisma.book.create({
            data: { 
                title, 
                category, 
                year, 
                description,
                book_author: {
                    create: authors.map(authorName => ({ // percorre o array de autores
                        author: {
                            connectOrCreate: { // funcionalidade do prisma
                                where: { name: authorName}, // procura um autor com esse nome (passado na requisiçao)
                                create: { name: authorName} // se nao achar, cria um novo
                            }
                        }
                    }))
                }
            },
            include: { 
                book_author: { // inclui a relação com a tabela book_author
                    include: {
                        author: true, // dentro de book_author, inclui os dados do autor
                    }
                }
            }
        });

        for (const authorName of authors) { // itera sobre a lista de autores recebido no req.body
            // procura no bd se ja existe um autor com o nome fornecido
            // se encontrar, ele é armazenado na variavel author
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

// editar livro
const updateBook = async (req, reply) => {
    try {
        const { id } = req.params;
        const { title, category, year, description, authors } = req.body;

        // verifica se o livro existe
        const existingBook = await prisma.book.findUnique({
            where: { id: Number(id) },
        });

        if (!existingBook) {
            return reply.status(404).send({ error: "Livro não encontrado" });
        }
        
        // Atualiza os dados o livro
        const updatedBook = await prisma.book.update({
            where: { id: Number(id) },
            data: {
                title,
                category,
                year,
                description,
                book_author: {
                    deleteMany: {}, // remove as relações antigas
                    create: authors.map(authorName => ({
                        author: {
                            connectOrCreate: {
                                where: { name: authorName },
                                create: { name: authorName }
                            }
                        }
                    }))
                }
            },
            include: {
                book_author: {
                    include: {
                        author: true
                    }
                }
            }
        });

        return reply.send({ message: "Livro atualizado com sucesso", updatedBook});
    } catch (error) {
        console.error(error);
        return reply.status(500).send({ error: "Erro ao atualizar livro" });
    }
};

export { createBook, getBooks, deleteBook, updateBook };

