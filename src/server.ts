import cors from '@fastify/cors';
import dotenv from 'dotenv';
import fastify from 'fastify';
import { PrismaClient } from '../prisma/generated';
import { authRoutes } from './routes/authRoutes';
import { UserService } from './services/user.service';

// Загружаем переменные окружения
dotenv.config();

// Настройки из переменных окружения
const PORT = parseInt(process.env.PORT ?? '3002', 10);
const HOST = process.env.HOST ?? '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV ?? 'development';

// Создаем экземпляр Fastify
const server = fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? 'info',
    transport: NODE_ENV === 'development' 
      ? {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
            colorize: true
          }
        }
      : undefined
  }
});

// Создаем экземпляр PrismaClient
const prisma = new PrismaClient();
const userService = new UserService(prisma);

// Проверяем коннект к базе через Prisma
async function checkPrismaConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Prisma: успешно приконнектились к базе!');
  } catch (err) {
    console.error('❌ Prisma: не удалось приконнектиться к базе:', err);
    process.exit(1);
  }
}

// Запускаем сервер
const start = async () => {
  try {
    await checkPrismaConnection();
    // Регистрируем CORS
    await server.register(cors, {
      origin: '*' // В продакшене лучше указать конкретные домены
    });

    // Определяем роуты
    server.get('/', async (request, reply) => {
      return { 
        message: 'Сервер на Fastify с TypeScript работает!',
        environment: NODE_ENV
      };
    });

    // Подключаем authRoutes
    await authRoutes(server, userService);

    // Статус-роут для проверки здоровья сервера
    server.get('/health', async (request, reply) => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    await server.listen({ port: PORT, host: HOST });
    server.log.info(`Сервер запущен на ${HOST}:${PORT} в режиме ${NODE_ENV}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start(); 