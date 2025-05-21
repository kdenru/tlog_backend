import { type FastifyReply, type FastifyRequest } from 'fastify'
import { type TapService } from '../services/tap.service'

export class TapController {
  private readonly tapService: TapService
  constructor(tapService: TapService) {
    this.tapService = tapService
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const { roundId, points } = request.body as { roundId: string, points: number }
    if (!roundId || typeof points !== 'number') {
      return await reply.status(400).send({ error: 'roundId и points обязательны' })
    }
    const tap = await this.tapService.createTap(Number(user.id), roundId, points)
    return await reply.send(tap)
  }
} 