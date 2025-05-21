import { type FastifyReply, type FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { type UserService } from '../services/user.service';

const JWT_SECRET = process.env.JWT_SECRET ?? 'secret';

export class AuthController {
  private readonly userService: UserService;
  constructor(userService: UserService) {
    this.userService = userService;
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const { username, password } = request.body as { username: string, password: string };
    if (!username || !password) {
      return await reply.status(400).send({ error: 'Имя и пароль обязательны' });
    }
    try {
      let user;
      try {
        user = await this.userService.login(username, password);
      } catch (err) {
        if (err instanceof Error && err.message === 'Пользователь не найден') {
          user = await this.userService.register(username, password);
        } else {
          throw err;
        }
      }
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      return await reply.send({ token });
    } catch (err) {
      return await reply.status(401).send({ error: err instanceof Error ? err.message : 'Ошибка' });
    }
  }
} 