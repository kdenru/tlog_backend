import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import fastify from 'fastify';
import { authRoutes } from './routes/authRoutes';
import { roundRoutes } from './routes/roundRoutes';
import { RoundService } from './services/round.service';
import { UserService } from './services/user.service';

// Загружаем переменные окружения
dotenv.config();

// Настройки из переменных окружения
const PORT = parseInt(process.env.PORT ?? '3002', 10);
const HOST = process.env.HOST ?? '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV ?? 'development';
const ROUND_DURATION = parseInt(process.env.ROUND_DURATION ?? '60', 10); // в минутах
const COOLDOWN_DURATION = parseInt(process.env.COOLDOWN_DURATION ?? '30', 10); // в секундах

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
const roundService = new RoundService(prisma, ROUND_DURATION, COOLDOWN_DURATION);

// Проверяем коннект к базе через Prisma
async function checkPrismaConnection() {
  try {
    await prisma.$connect();
    server.log.info('✅ Prisma: успешно приконнектились к базе!');
  } catch (err) {
    server.log.error('❌ Prisma: не удалось приконнектиться к базе:', err);
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

    // Подключаем roundRoutes
    await roundRoutes(server, roundService);

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