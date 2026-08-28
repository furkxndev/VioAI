import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { PaginatedResponseDto } from '../../common/dto';
import { UserRole } from '../../common/enums';
import { ChangePasswordDto, CreateUserDto, QueryUsersDto, UpdateUserDto } from './dto';
import { User } from './entities/user.entity';

const PASSWORD_SALT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const email = dto.email.toLowerCase().trim();

    if (await this.usersRepository.existsBy({ email })) {
      throw new ConflictException('Bu e-posta adresi zaten kayıtlı');
    }

    const user = this.usersRepository.create({
      email,
      fullName: dto.fullName.trim(),
      role: dto.role ?? (await this.resolveDefaultRole()),
      passwordHash: await bcrypt.hash(dto.password, PASSWORD_SALT_ROUNDS),
      preferences: {},
    });

    return this.usersRepository.save(user);
  }

  async findAll(query: QueryUsersDto): Promise<PaginatedResponseDto<User>> {
    const builder = this.usersRepository.createQueryBuilder('user').orderBy('user.createdAt', 'DESC');

    if (query.search) {
      builder.andWhere('(user.fullName ILIKE :search OR user.email ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    if (query.role) {
      builder.andWhere('user.role = :role', { role: query.role });
    }

    if (query.isActive !== undefined) {
      builder.andWhere('user.isActive = :isActive', { isActive: query.isActive });
    }

    const [items, total] = await builder.skip(query.skip).take(query.limit).getManyAndCount();

    return new PaginatedResponseDto(items, total, query.page, query.limit);
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    return user;
  }

  findByEmailWithSecrets(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect(['user.passwordHash', 'user.refreshTokenHash'])
      .where('user.email = :email', { email: email.toLowerCase().trim() })
      .getOne();
  }

  findByIdWithSecrets(id: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect(['user.passwordHash', 'user.refreshTokenHash'])
      .where('user.id = :id', { id })
      .getOne();
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (dto.email && dto.email.toLowerCase() !== user.email) {
      const email = dto.email.toLowerCase().trim();
      if (await this.usersRepository.existsBy({ email })) {
        throw new ConflictException('Bu e-posta adresi zaten kayıtlı');
      }
      user.email = email;
    }

    if (dto.fullName !== undefined) user.fullName = dto.fullName.trim();
    if (dto.role !== undefined) user.role = dto.role;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;
    if (dto.avatarUrl !== undefined) user.avatarUrl = dto.avatarUrl;
    if (dto.preferences !== undefined) {
      user.preferences = { ...user.preferences, ...dto.preferences };
    }

    return this.usersRepository.save(user);
  }

  async changePassword(id: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.findByIdWithSecrets(id);

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    if (!(await bcrypt.compare(dto.currentPassword, user.passwordHash))) {
      throw new BadRequestException('Mevcut şifre hatalı');
    }

    await this.usersRepository.update(id, {
      passwordHash: await bcrypt.hash(dto.newPassword, PASSWORD_SALT_ROUNDS),
      refreshTokenHash: null,
    });
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }
  }

  async setRefreshTokenHash(id: string, refreshTokenHash: string | null): Promise<void> {
    await this.usersRepository.update(id, { refreshTokenHash });
  }

  async markLoggedIn(id: string): Promise<void> {
    await this.usersRepository.update(id, { lastLoginAt: new Date() });
  }

  countAll(): Promise<number> {
    return this.usersRepository.count();
  }

  private async resolveDefaultRole(): Promise<UserRole> {
    const isFirstUser = (await this.usersRepository.count()) === 0;

    return isFirstUser ? UserRole.ADMIN : UserRole.USER;
  }
}
