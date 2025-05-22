import { type FastifyReply, type FastifyRequest } from 'fastify'
import { type TapService } from '../services/tap.service'

export class TapController {
  private readonly tapService: TapService
  constructor(tapService: TapService) {
    this.tapService = tapService
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const { roundId } = request.body as { roundId: string }
    if (!roundId) {
      return await reply.status(400).send({ error: 'roundId обязателен' })
    }
    const tap = await this.tapService.createTap(Number(user.id), roundId)
    return await reply.send(tap)
  }
} 