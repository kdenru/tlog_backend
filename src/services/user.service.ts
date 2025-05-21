import { PrismaClient, User, UserRole } from '../../prisma/generated';
import bcrypt from 'bcrypt';

export class UserService {
  private prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async register(username: string, password: string): Promise<User> {
    const existing = await this.prisma.user.findUnique({ where: { username } });
    if (existing) throw new Error('Пользователь уже существует');
    const hash = await bcrypt.hash(password, 10);
    let role: UserRole = UserRole.survivor;
    if (username === 'admin') role = UserRole.admin;
    else if (username === 'nikita') role = UserRole.nikita;
    return this.prisma.user.create({ data: { username, password: hash, role } });
  }

  async login(username: string, password: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) throw new Error('Пользователь не найден');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Неверный пароль');
    
    return user;
  }
} 