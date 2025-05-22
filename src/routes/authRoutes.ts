import { type FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller';
import { type UserService } from '../services/auth.service';

export async function authRoutes(server: FastifyInstance, userService: UserService) {
  const authController = new AuthController(userService);
  server.post('/login', authController.login.bind(authController));
  server.get('/me', authController.getMe.bind(authController));
} 