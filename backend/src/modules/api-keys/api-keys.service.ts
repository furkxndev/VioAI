import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'node:crypto';
import { Repository } from 'typeorm';
import { ApiKeyCreatedDto, CreateApiKeyDto, UpdateApiKeyDto } from './dto';
import { ApiKey } from './entities/api-key.entity';

const KEY_PREFIX = 'vio';
const HASH_SALT_ROUNDS = 10;

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeysRepository: Repository<ApiKey>,
  ) {}

  async create(dto: CreateApiKeyDto, createdById: string): Promise<ApiKeyCreatedDto> {
    const publicPart = randomBytes(6).toString('hex');
    const secretPart = randomBytes(24).toString('base64url');
    const keyPrefix = `${KEY_PREFIX}_${publicPart}`;
    const plainKey = `${keyPrefix}.${secretPart}`;

    const apiKey = await this.apiKeysRepository.save(
      this.apiKeysRepository.create({
        name: dto.name,
        description: dto.description ?? null,
        scopes: dto.scopes,
        keyPrefix,
        keyHash: await bcrypt.hash(plainKey, HASH_SALT_ROUNDS),
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        createdById,
      }),
    );

    return { apiKey, plainKey };
  }

  findAll(): Promise<ApiKey[]> {
    return this.apiKeysRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<ApiKey> {
    const apiKey = await this.apiKeysRepository.findOneBy({ id });

    if (!apiKey) {
      throw new NotFoundException('API anahtarı bulunamadı');
    }

    return apiKey;
  }

  async update(id: string, dto: UpdateApiKeyDto): Promise<ApiKey> {
    const apiKey = await this.findById(id);

    if (dto.name !== undefined) apiKey.name = dto.name;
    if (dto.description !== undefined) apiKey.description = dto.description;
    if (dto.scopes !== undefined) apiKey.scopes = dto.scopes;
    if (dto.isActive !== undefined) apiKey.isActive = dto.isActive;
    if (dto.expiresAt !== undefined) apiKey.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;

    return this.apiKeysRepository.save(apiKey);
  }

  async revoke(id: string): Promise<ApiKey> {
    const apiKey = await this.findById(id);
    apiKey.isActive = false;
    return this.apiKeysRepository.save(apiKey);
  }

  async remove(id: string): Promise<void> {
    const result = await this.apiKeysRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException('API anahtarı bulunamadı');
    }
  }

  async authenticate(rawKey: string): Promise<ApiKey> {
    const [keyPrefix] = rawKey.split('.');

    if (!keyPrefix) {
      throw new UnauthorizedException('Geçersiz API anahtarı');
    }

    const apiKey = await this.apiKeysRepository
      .createQueryBuilder('apiKey')
      .addSelect('apiKey.keyHash')
      .where('apiKey.keyPrefix = :keyPrefix', { keyPrefix })
      .getOne();

    if (!apiKey || !apiKey.isActive || !(await bcrypt.compare(rawKey, apiKey.keyHash))) {
      throw new UnauthorizedException('Geçersiz API anahtarı');
    }

    if (apiKey.expiresAt && apiKey.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('API anahtarının süresi dolmuş');
    }

    void this.apiKeysRepository.update(apiKey.id, { lastUsedAt: new Date() });

    return apiKey;
  }
}
