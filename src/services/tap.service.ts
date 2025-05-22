import { type PrismaClient } from '@prisma/client'

export class TapService {
  private readonly prisma: PrismaClient
  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async createTap(userId: number, roundId: string) {
    return await this.prisma.$transaction(async (tx) => {
      // Проверяем активный ли раунд
      const round = await tx.round.findUnique({ where: { id: roundId } })
      if (!round) throw new Error('Раунд не найден')
      const now = new Date()
      if (now < round.startAt || now > round.endAt) throw new Error('Раунд не активен')

      // Получаем юзера
      const user = await tx.user.findUnique({ where: { id: userId } })
      if (!user) throw new Error('Пользователь не найден')

      // Получаем текущий stat
      const stat = await tx.userStat.findUnique({ where: { userId_roundId: { userId, roundId } } })
      const tapCount = stat ? stat.tapCount + 1 : 1

      // Если Никита — очки не считаются
      let points = 0
      const isNikita = user.role === 'nikita'
      if (!isNikita) {
        points = (tapCount % 11 === 0) ? 10 : 1
      }

      // Создаём тап
      await tx.tap.create({
        data: { userId, roundId, points }
      })
      // Обновляем/создаём UserStat
      await tx.userStat.upsert({
        where: { userId_roundId: { userId, roundId } },
        update: {
          tapCount: { increment: 1 },
          points: isNikita ? { set: 0 } : { increment: points }
        },
        create: {
          userId,
          roundId,
          tapCount: 1,
          points: isNikita ? 0 : points
        }
      })
      // Инкрементим общий счётчик очков в раунде
      if (!isNikita) {
        await tx.round.update({
          where: { id: roundId },
          data: { totalPoints: { increment: points } }
        })
      }
      // Получаем актуальное количество очков
      const userStat = await tx.userStat.findUnique({ where: { userId_roundId: { userId, roundId } } })
      return { myPoints: isNikita ? 0 : (userStat?.points ?? 0) }
    })
  }
} 