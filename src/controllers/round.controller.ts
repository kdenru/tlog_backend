import { type FastifyReply, type FastifyRequest } from 'fastify'
import jwt from 'jsonwebtoken'
import { type RoundService } from '../services/round.service'

const JWT_SECRET = process.env.JWT_SECRET ?? 'secret'

export class RoundController {
  private readonly roundService: RoundService
  constructor(roundService: RoundService) {
    this.roundService = roundService
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const auth = request.headers.authorization
    if (!auth || !auth.startsWith('Bearer ')) {
      return await reply.status(401).send({ error: 'Нет авторизации' })
    }
    let payload: any
    try {
      payload = jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET)
    } catch {
      return await reply.status(401).send({ error: 'Неверный токен' })
    }
    if (payload.role !== 'admin') {
      return await reply.status(403).send({ error: 'Только admin может создавать раунды' })
    }
    const round = await this.roundService.createRound()
    return await reply.send(round)
  }

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    const rounds = await this.roundService.getAllRounds()
    return await reply.send(rounds)
  }
} 