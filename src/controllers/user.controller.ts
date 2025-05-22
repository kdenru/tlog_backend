import { type FastifyReply, type FastifyRequest } from 'fastify'
import { type UserService } from '../services/auth.service'

export class UserController {
  private readonly userService: UserService
  constructor(userService: UserService) {
    this.userService = userService
  }

  async getMe(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    if (!user) return await reply.status(401).send({ error: 'Нет авторизации' })
    const dbUser = await this.userService.getUserById(Number(user.id))
    if (!dbUser) return await reply.status(404).send({ error: 'Пользователь не найден' })
    return await reply.send(dbUser)
  }
} 