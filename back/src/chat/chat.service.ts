import { Injectable } from '@nestjs/common';
import { streamText, tool, convertToModelMessages, UIMessage } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { BooksService } from '../books/books.service';
import { PrismaService } from '../prisma/prisma.service';
import { z } from 'zod';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API,
});

@Injectable()
export class ChatService {
  constructor(
    private readonly booksService: BooksService,
    private readonly prisma: PrismaService,
  ) {}

  async chat(
    userId: number,
    slug: string | null,
    messages: UIMessage[],
  ): Promise<any> {
    console.log('--- Nueva petición de chat ---');
    console.log('Usuario:', userId);
    console.log('Slug:', slug);
    console.log('Mensajes recibidos:', JSON.stringify(messages));

    let conversation;
    const cleanSlug =
      slug && slug !== 'undefined' && slug !== 'null' ? slug : null;

    if (cleanSlug) {
      conversation = await this.prisma.conversation.findUnique({
        where: { slug: cleanSlug },
      });
      if (conversation) {
        console.log('Conversación existente encontrada:', conversation.id);
      } else {
        console.log('Slug proporcionado pero no encontrado en BD:', cleanSlug);
      }
    }

    if (!conversation) {
      console.log('Creando nueva conversación...');
      const firstMessage =
        messages[0]?.parts?.map((p: any) => p.text).join('') ||
        'Nueva conversación';
      const title =
        firstMessage.length > 100
          ? firstMessage.substring(0, 100) + '...'
          : firstMessage;

      conversation = await this.prisma.conversation.create({
        data: {
          userId,
          slug: this.generateSlug(title),
          title,
        },
      });
      console.log('Nueva conversación creada:', conversation.slug);
    }

    const userMessage = messages[messages.length - 1];
    const userContent =
      userMessage.parts?.map((p: any) => p.text).join('') || '';

    // Evitar duplicados si el mensaje ya es el último en la BD
    const lastDbMessage = await this.prisma.conversationMessage.findFirst({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'desc' },
    });

    if (
      !lastDbMessage ||
      lastDbMessage.content !== userContent ||
      lastDbMessage.type !== 'user'
    ) {
      await this.prisma.conversationMessage.create({
        data: {
          conversationId: conversation.id,
          type: 'user',
          content: userContent,
        },
      });
    }

    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: openrouter('google/gemini-2.0-flash-001'),
      system: `Eres un asistente experto en la biblioteca de libros llamado BiblioChat. Se amable y servicial y trata de no extenderte mucho. Si el usuario pregunta algo no referente a libros dile que solo respondes sobre libros. 
      IMPORTANTE: Cuando uses una herramienta, DEBES usar la información que esta devuelva. No inventes títulos de libros ni autores. 
      Si la herramienta devuelve una lista de libros, menciona esos títulos y autores exactos.
      - Si preguntan por todos los libros, usa 'listAllBooks'.
      - Si buscan por autor o título, usa 'searchBooks'.
      - Si no encuentras lo que busca el usuario, dile que no lo tienes en la biblioteca pero segun tu informacion de internet dile lo que sabes de lo que pregunte del libro.
      Responde siempre en español.`,
      messages: modelMessages,
      tools: {
        listAllBooks: tool({
          description:
            'Lista todos los libros con sus autores y estado de publicación.',
          inputSchema: z.object({}),
          execute: async () => {
            console.log('Ejecutando herramienta: listAllBooks');
            const books = await this.booksService.findAll();
            console.log(`Encontrados ${books.length} libros`);
            return books;
          },
        }),
        searchBooks: tool({
          description: 'Busca libros filtrando por título o nombre del autor.',
          inputSchema: z.object({
            query: z.string().describe('El término de búsqueda'),
          }),
          execute: async (args: { query: string }) => {
            console.log(
              'Argumentos recibidos en searchBooks:',
              JSON.stringify(args),
            );
            const query = args.query;
            const books = await this.booksService.findAll();
            const q = query.toLowerCase();
            const filtered = books.filter((b: any) => {
              const titleMatch = b.title.toLowerCase().includes(q);
              const fullName = b.author
                ? `${b.author.firstName} ${b.author.lastName}`.toLowerCase()
                : '';
              const authorMatch = fullName.includes(q);
              return titleMatch || authorMatch;
            });
            console.log(
              `Filtrados ${filtered.length} libros para la búsqueda: "${query}"`,
            );
            return filtered;
          },
        }),
        getBookDetails: tool({
          description: 'Obtiene el detalle completo de un libro por su ID.',
          inputSchema: z.object({
            id: z.number().describe('El ID numérico del libro'),
          }),
          execute: async (args: { id: number }) => {
            console.log(
              'Argumentos recibidos en getBookDetails:',
              JSON.stringify(args),
            );
            const id = args.id;
            const book = await this.booksService.findOne(id);
            console.log(`Detalles del libro: ${book?.title}`);
            return book;
          },
        }),
      },
      headers: {
        'x-chat-slug': conversation.slug,
      },
      onFinish: async ({ text }) => {
        await this.prisma.conversationMessage.create({
          data: {
            conversationId: conversation.id,
            type: 'assistant',
            content: text,
          },
        });

        await this.prisma.conversation.update({
          where: { id: conversation.id },
          data: { updatedAt: new Date() },
        });
      },
    });

    return result;
  }

  async createConversation(userId: number, content: string) {
    const title =
      content.length > 100 ? content.substring(0, 100) + '...' : content;
    const slug = this.generateSlug(title);

    const conversation = await this.prisma.conversation.create({
      data: {
        userId,
        slug,
        title,
        messages: {
          create: {
            type: 'user',
            content: content,
          },
        },
      },
    });

    return conversation;
  }

  private generateSlug(text: string): string {
    const slug = text
      .toLowerCase()
      .normalize('NFD') // Quitar acentos
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50);

    const randomSuffix = Math.random().toString(36).substring(2, 7);
    return `${slug}-${randomSuffix}`;
  }

  async getConversations(userId: number) {
    return this.prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getConversation(userId: number, slug: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { slug },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            type: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });

    if (!conversation || conversation.userId !== userId) {
      return null;
    }

    return conversation;
  }

  async deleteConversation(userId: number, slug: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { slug },
    });

    if (!conversation || conversation.userId !== userId) {
      return false;
    }

    await this.prisma.conversation.delete({
      where: { slug },
    });

    return true;
  }
}
