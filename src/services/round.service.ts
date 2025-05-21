import { type PrismaClient } from '@prisma/client'

export class RoundService {
  private readonly prisma: PrismaClient
  private readonly roundDuration: number
  private readonly cooldownDuration: number

  constructor(prisma: PrismaClient, roundDuration: number, cooldownDuration: number) {
    this.prisma = prisma
    this.roundDuration = roundDuration
    this.cooldownDuration = cooldownDuration
  }

  async createRound() {
    const now = new Date()
    const startAt = new Date(now.getTime() + this.cooldownDuration * 1000)
    const endAt = new Date(startAt.getTime() + this.roundDuration * 60 * 1000)
    return await this.prisma.round.create({ data: { startAt, endAt } })
  }

  async getAllRounds() {
    return await this.prisma.round.findMany({ orderBy: { startAt: 'desc' } })
  }
} 