import { type FastifyInstance } from 'fastify'
import { TapController } from '../controllers/tap.controller'
import { type TapService } from '../services/tap.service'

export async function tapRoutes(server: FastifyInstance, tapService: TapService) {
  const tapController = new TapController(tapService)
  server.post('/taps', tapController.create.bind(tapController))
} 