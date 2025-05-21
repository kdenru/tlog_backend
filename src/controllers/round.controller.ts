import { type FastifyReply, type FastifyRequest } from 'fastify'
import { type RoundService } from '../services/round.service'

export class RoundController {
  private readonly roundService: RoundService
  constructor(roundService: RoundService) {
    this.roundService = roundService
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    if (user.role !== 'admin') {
      return await reply.status(403).send({ error: 'Только admin может создавать раунды' })
    }
    const round = await this.roundService.createRound()
    return await reply.send(round)
  }

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    const rounds = await this.roundService.getAllRounds()
    return await reply.send(rounds)
  }

  async getInfo(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const roundId = (request.params as { id: string }).id
    const info = await this.roundService.getRoundInfo(roundId, Number(user.id))
    if (!info) return await reply.status(404).send({ error: 'Раунд не найден' })
    return await reply.send(info)
  }
} 