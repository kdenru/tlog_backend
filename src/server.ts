import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import fastify from 'fastify';
import jwt from 'jsonwebtoken';
import { authRoutes } from './routes/authRoutes';
import { roundRoutes } from './routes/roundRoutes';
import { tapRoutes } from './routes/tapRoutes';
import { UserService } from './services/auth.service';
import { RoundService } from './services/round.service';
import { TapService } from './services/tap.service';

// Загружаем переменные окружения
dotenv.config();

// Настройки из переменных окружения
const PORT = parseInt(process.env.PORT ?? '3002', 10);
const HOST = process.env.HOST ?? '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV ?? 'development';
const ROUND_DURATION = parseInt(process.env.ROUND_DURATION ?? '60', 10); // теперь в секундах
const COOLDOWN_DURATION = parseInt(process.env.COOLDOWN_DURATION ?? '30', 10); // в секундах
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173';

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
const tapService = new TapService(prisma);

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

// Глобальный preHandler для авторизации
server.addHook('preHandler', async (request, reply) => {
  if (request.url === '/login') return
  let token = request.cookies?.token
  if (!token) {
    const auth = request.headers.authorization
    if (auth) {
      token = auth
    }
  }
  if (!token) {
    return await reply.status(401).send({ error: 'Нет авторизации' })
  }
  try {
    (request as any).user = jwt.verify(token, process.env.JWT_SECRET ?? 'secret')
  } catch {
    return await reply.status(401).send({ error: 'Неверный токен' })
  }
})

// Запускаем сервер
const start = async () => {
  try {
    await checkPrismaConnection();
    // Регистрируем CORS
    await server.register(cors, {
      origin: CORS_ORIGIN,
      credentials: true
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

    // Подключаем tapRoutes
    await tapRoutes(server, tapService);

    // Статус-роут для проверки здоровья сервера
    server.get('/health', async (request, reply) => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    await server.register(cookie);

    await server.listen({ port: PORT, host: HOST });
    server.log.info(`Сервер запущен на ${HOST}:${PORT} в режиме ${NODE_ENV}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start(); 