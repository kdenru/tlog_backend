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

  async getRoundInfo(roundId: string, userId: number) {
    const round = await this.prisma.round.findUnique({
      where: { id: roundId },
      include: {
        userStats: true
      }
    })
    if (!round) return null

    // Победитель — тот, у кого больше всего points
    let winner = null
    if (new Date() > round.endAt && round.userStats.length > 0) {
      winner = round.userStats.reduce((max, stat) => stat.points > max.points ? stat : max, round.userStats[0])
    }
    // Свои очки
    const myStat = round.userStats.find(stat => stat.userId === userId)

    return {
      ...round,
      winner: winner ? { userId: winner.userId, points: winner.points } : null,
      myPoints: myStat ? myStat.points : 0
    }
  }
} 
