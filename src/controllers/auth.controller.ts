import { type FastifyRequest, type FastifyReply } from 'fastify';
import { type UserService } from '../services/user.service';

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
      return await reply.send({ id: user.id, username: user.username });
    } catch (err) {
      return await reply.status(401).send({ error: err instanceof Error ? err.message : 'Ошибка' });
    }
  }
} 