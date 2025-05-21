import { type FastifyInstance } from 'fastify'
import { RoundController } from '../controllers/round.controller'
import { type RoundService } from '../services/round.service'

export async function roundRoutes(server: FastifyInstance, roundService: RoundService) {
  const roundController = new RoundController(roundService)
  server.post('/rounds', roundController.create.bind(roundController))
  server.get('/rounds', roundController.getAll.bind(roundController))
  server.get('/rounds/:id', roundController.getInfo.bind(roundController))
} 