import { type FastifyInstance } from 'fastify';
import { type UserService } from '../services/user.service';
import { AuthController } from '../controllers/auth.controller';

export async function authRoutes(server: FastifyInstance, userService: UserService) {
  const authController = new AuthController(userService);
  server.post('/login', authController.login.bind(authController));
} 