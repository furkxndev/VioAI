import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { StopType } from '../../common/enums';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-request.interface';
import { ProductsService } from '../products/products.service';
import { RoutesService } from '../routes/routes.service';
import {
  AddProductStopDto,
  CreateRouteStopDto,
  ReorderStopsDto,
  UpdateRouteStopDto,
} from './dto';
import { RouteStop } from './entities/route-stop.entity';

@Injectable()
export class RouteStopsService {
  constructor(
    @InjectRepository(RouteStop)
    private readonly routeStopsRepository: Repository<RouteStop>,
    private readonly routesService: RoutesService,
    private readonly productsService: ProductsService,
  ) {}

  async findAll(routeId: string, user: AuthenticatedUser): Promise<RouteStop[]> {
    await this.routesService.findOwned(routeId, user);

    return this.routeStopsRepository.find({
      where: { routeId },
      order: { dayNumber: 'ASC', orderIndex: 'ASC' },
    });
  }

  async create(routeId: string, dto: CreateRouteStopDto, user: AuthenticatedUser): Promise<RouteStop> {
    const route = await this.routesService.findOwned(routeId, user);
    this.assertDayInRange(dto.dayNumber, route.days);

    const orderIndex = dto.orderIndex ?? (await this.nextOrderIndex(routeId, dto.dayNumber));

    await this.shiftOrderIndexes(routeId, dto.dayNumber, orderIndex);

    return this.routeStopsRepository.save(
      this.routeStopsRepository.create({
        routeId,
        dayNumber: dto.dayNumber,
        orderIndex,
        title: dto.title,
        description: dto.description ?? null,
        type: StopType.AI_SUGGESTION,
        latitude: dto.latitude ?? null,
        longitude: dto.longitude ?? null,
        address: dto.address ?? null,
        startTime: dto.startTime ?? null,
        durationMinutes: dto.durationMinutes ?? 60,
        estimatedCost: dto.estimatedCost ?? null,
        categoryLabel: dto.categoryLabel ?? null,
        isIncluded: true,
      }),
    );
  }

  async addProduct(routeId: string, dto: AddProductStopDto, user: AuthenticatedUser): Promise<RouteStop> {
    const route = await this.routesService.findOwned(routeId, user);
    this.assertDayInRange(dto.dayNumber, route.days);

    const product = await this.productsService.findById(dto.productId);

    if (!product.isActive) {
      throw new BadRequestException('Bu ürün şu anda satışta değil');
    }

    const alreadyAdded = await this.routeStopsRepository.existsBy({ routeId, productId: product.id });

    if (alreadyAdded) {
      throw new BadRequestException('Bu aktivite rotanıza zaten eklenmiş');
    }

    const orderIndex = dto.orderIndex ?? (await this.nextOrderIndex(routeId, dto.dayNumber));

    await this.shiftOrderIndexes(routeId, dto.dayNumber, orderIndex);

    return this.routeStopsRepository.save(
      this.routeStopsRepository.create({
        routeId,
        dayNumber: dto.dayNumber,
        orderIndex,
        title: product.name,
        description: product.description,
        type: StopType.VIOFUN_PRODUCT,
        productId: product.id,
        latitude: product.latitude,
        longitude: product.longitude,
        address: product.address,
        startTime: dto.startTime ?? null,
        durationMinutes: product.durationMinutes,
        estimatedCost: product.currency === route.currency ? product.price : null,
        categoryLabel: product.category?.name ?? null,
        bookingUrl: product.bookingUrl,
        isIncluded: true,
      }),
    );
  }

  async update(
    routeId: string,
    stopId: string,
    dto: UpdateRouteStopDto,
    user: AuthenticatedUser,
  ): Promise<RouteStop> {
    const route = await this.routesService.findOwned(routeId, user);
    const stop = await this.findStop(routeId, stopId);

    if (dto.dayNumber !== undefined) {
      this.assertDayInRange(dto.dayNumber, route.days);
      stop.dayNumber = dto.dayNumber;
    }

    if (dto.orderIndex !== undefined) stop.orderIndex = dto.orderIndex;
    if (dto.title !== undefined) stop.title = dto.title;
    if (dto.description !== undefined) stop.description = dto.description;
    if (dto.latitude !== undefined) stop.latitude = dto.latitude;
    if (dto.longitude !== undefined) stop.longitude = dto.longitude;
    if (dto.address !== undefined) stop.address = dto.address;
    if (dto.startTime !== undefined) stop.startTime = dto.startTime;
    if (dto.durationMinutes !== undefined) stop.durationMinutes = dto.durationMinutes;
    if (dto.estimatedCost !== undefined) stop.estimatedCost = dto.estimatedCost;
    if (dto.categoryLabel !== undefined) stop.categoryLabel = dto.categoryLabel;
    if (dto.isIncluded !== undefined) stop.isIncluded = dto.isIncluded;

    return this.routeStopsRepository.save(stop);
  }

  async setInclusion(
    routeId: string,
    stopId: string,
    isIncluded: boolean,
    user: AuthenticatedUser,
  ): Promise<RouteStop> {
    await this.routesService.findOwned(routeId, user);
    const stop = await this.findStop(routeId, stopId);

    stop.isIncluded = isIncluded;

    return this.routeStopsRepository.save(stop);
  }

  async reorder(routeId: string, dto: ReorderStopsDto, user: AuthenticatedUser): Promise<RouteStop[]> {
    const route = await this.routesService.findOwned(routeId, user);
    const ids = dto.stops.map((stop) => stop.id);
    const existing = await this.routeStopsRepository.findBy({ routeId, id: In(ids) });

    if (existing.length !== ids.length) {
      throw new BadRequestException('Bazı duraklar bu rotaya ait değil');
    }

    dto.stops.forEach((item) => this.assertDayInRange(item.dayNumber, route.days));

    await this.routeStopsRepository.manager.transaction(async (manager) => {
      await Promise.all(
        dto.stops.map((item) =>
          manager.update(RouteStop, { id: item.id, routeId }, {
            dayNumber: item.dayNumber,
            orderIndex: item.orderIndex,
          }),
        ),
      );
    });

    return this.routeStopsRepository.find({
      where: { routeId },
      order: { dayNumber: 'ASC', orderIndex: 'ASC' },
    });
  }

  async remove(routeId: string, stopId: string, user: AuthenticatedUser): Promise<void> {
    await this.routesService.findOwned(routeId, user);
    const result = await this.routeStopsRepository.delete({ id: stopId, routeId });

    if (!result.affected) {
      throw new NotFoundException('Durak bulunamadı');
    }
  }

  private async findStop(routeId: string, stopId: string): Promise<RouteStop> {
    const stop = await this.routeStopsRepository.findOneBy({ id: stopId, routeId });

    if (!stop) {
      throw new NotFoundException('Durak bulunamadı');
    }

    return stop;
  }

  private assertDayInRange(dayNumber: number, days: number): void {
    if (dayNumber < 1 || dayNumber > days) {
      throw new BadRequestException(`Gün numarası 1 ile ${days} arasında olmalıdır`);
    }
  }

  private async nextOrderIndex(routeId: string, dayNumber: number): Promise<number> {
    const count = await this.routeStopsRepository.countBy({ routeId, dayNumber });
    return count;
  }

  private async shiftOrderIndexes(routeId: string, dayNumber: number, fromIndex: number): Promise<void> {
    await this.routeStopsRepository
      .createQueryBuilder()
      .update(RouteStop)
      .set({ orderIndex: () => '"order_index" + 1' })
      .where('route_id = :routeId', { routeId })
      .andWhere('day_number = :dayNumber', { dayNumber })
      .andWhere('order_index >= :fromIndex', { fromIndex })
      .execute();
  }
}
