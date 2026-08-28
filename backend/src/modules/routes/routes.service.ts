import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResponseDto } from '../../common/dto';
import { RouteStatus, StopType, TravelPace, UserRole } from '../../common/enums';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-request.interface';
import { centroid } from '../../common/utils';
import { AiService } from '../ai/ai.service';
import type { GeneratedItinerary } from '../ai/interfaces/itinerary.interface';
import type { ProductMatch } from '../ai/product-matcher.service';
import { RouteStop } from '../route-stops/entities/route-stop.entity';
import { GenerateRouteDto, QueryRoutesDto, UpdateRouteDto } from './dto';
import { Route } from './entities/route.entity';

const TRANSIT_BUFFER_MINUTES = 15;

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route)
    private readonly routesRepository: Repository<Route>,
    private readonly aiService: AiService,
  ) {}

  async generate(dto: GenerateRouteDto, userId: string | null): Promise<Route> {
    const currency = dto.currency ?? 'TRY';
    const interests = dto.interests ?? [];
    const pace = dto.pace ?? TravelPace.BALANCED;

    const { itinerary, model, generationMs } = await this.aiService.generateItinerary({
      city: dto.city,
      days: dto.days,
      budget: dto.budget,
      currency,
      travelers: dto.travelers,
      interests,
      transportMode: dto.transportMode,
      pace,
      startDate: dto.startDate,
      notes: dto.notes,
    });

    const matches = await this.aiService.matchProducts(itinerary, dto.city, {
      interests,
      budget: dto.budget,
      currency,
      travelers: dto.travelers,
      spentEstimate: itinerary.estimatedTotalCost,
    });

    const stops = this.buildStops(itinerary, matches, currency);
    const center = centroid(
      stops
        .filter((stop) => stop.latitude !== null && stop.longitude !== null)
        .map((stop) => ({ latitude: stop.latitude as number, longitude: stop.longitude as number })),
    );

    const productCost = matches
      .filter((match) => match.product.currency === currency)
      .reduce((total, match) => total + match.product.price * dto.travelers, 0);

    const route = this.routesRepository.create({
      userId,
      title: itinerary.title,
      summary: itinerary.summary,
      city: dto.city,
      startDate: dto.startDate ?? null,
      days: dto.days,
      budget: dto.budget,
      currency,
      travelers: dto.travelers,
      interests,
      transportMode: dto.transportMode,
      pace,
      status: RouteStatus.READY,
      estimatedCost: itinerary.estimatedTotalCost + productCost,
      centerLatitude: center?.latitude ?? null,
      centerLongitude: center?.longitude ?? null,
      aiModel: model,
      generationMs,
      stops,
    });

    const saved = await this.routesRepository.save(route);

    return this.findById(saved.id);
  }

  async findAllForUser(userId: string, query: QueryRoutesDto): Promise<PaginatedResponseDto<Route>> {
    const builder = this.routesRepository
      .createQueryBuilder('route')
      .where('route.userId = :userId', { userId })
      .orderBy('route.createdAt', 'DESC');

    if (query.city) {
      builder.andWhere('route.city ILIKE :city', { city: query.city });
    }

    if (query.status) {
      builder.andWhere('route.status = :status', { status: query.status });
    }

    const [items, total] = await builder.skip(query.skip).take(query.limit).getManyAndCount();

    return new PaginatedResponseDto(items, total, query.page, query.limit);
  }

  async findAll(query: QueryRoutesDto): Promise<PaginatedResponseDto<Route>> {
    const builder = this.routesRepository.createQueryBuilder('route').orderBy('route.createdAt', 'DESC');

    if (query.city) {
      builder.andWhere('route.city ILIKE :city', { city: query.city });
    }

    if (query.status) {
      builder.andWhere('route.status = :status', { status: query.status });
    }

    const [items, total] = await builder.skip(query.skip).take(query.limit).getManyAndCount();

    return new PaginatedResponseDto(items, total, query.page, query.limit);
  }

  async findById(id: string): Promise<Route> {
    const route = await this.routesRepository.findOne({
      where: { id },
      relations: { stops: true },
      order: { stops: { dayNumber: 'ASC', orderIndex: 'ASC' } },
    });

    if (!route) {
      throw new NotFoundException('Rota bulunamadı');
    }

    return route;
  }

  async findOwned(id: string, user: AuthenticatedUser): Promise<Route> {
    const route = await this.findById(id);
    this.assertAccess(route, user);
    return route;
  }

  assertAccess(route: Route, user: AuthenticatedUser): void {
    if (user.role !== UserRole.ADMIN && route.userId !== user.id) {
      throw new ForbiddenException('Bu rotaya erişim yetkiniz yok');
    }
  }

  async update(id: string, dto: UpdateRouteDto, user: AuthenticatedUser): Promise<Route> {
    const route = await this.findOwned(id, user);

    if (dto.title !== undefined) route.title = dto.title;
    if (dto.summary !== undefined) route.summary = dto.summary;
    if (dto.status !== undefined) route.status = dto.status;

    await this.routesRepository.save(route);

    return this.findById(id);
  }

  async remove(id: string, user: AuthenticatedUser): Promise<void> {
    const route = await this.findOwned(id, user);
    await this.routesRepository.delete(route.id);
  }

  countAll(): Promise<number> {
    return this.routesRepository.count();
  }

  private buildStops(
    itinerary: GeneratedItinerary,
    matches: ProductMatch[],
    currency: string,
  ): RouteStop[] {
    const stopsByDay = new Map<number, RouteStop[]>();

    itinerary.days.forEach((day) => {
      const dayStops = day.stops.map((stop) =>
        Object.assign(new RouteStop(), {
          dayNumber: day.day,
          orderIndex: 0,
          title: stop.title,
          description: stop.description,
          type: StopType.AI_SUGGESTION,
          productId: null,
          latitude: stop.latitude,
          longitude: stop.longitude,
          address: stop.address ?? null,
          startTime: stop.startTime,
          durationMinutes: stop.durationMinutes,
          estimatedCost: stop.estimatedCost,
          categoryLabel: stop.category,
          isIncluded: true,
          matchScore: null,
          matchReason: null,
          bookingUrl: null,
        } satisfies Partial<RouteStop>),
      );

      stopsByDay.set(day.day, dayStops);
    });

    matches.forEach((match) => {
      const dayStops = stopsByDay.get(match.dayNumber);

      if (!dayStops) {
        return;
      }

      const anchor = dayStops[match.anchorIndex];
      const productStop = Object.assign(new RouteStop(), {
        dayNumber: match.dayNumber,
        orderIndex: 0,
        title: match.product.name,
        description: match.product.description,
        type: StopType.VIOFUN_PRODUCT,
        productId: match.product.id,
        latitude: match.product.latitude,
        longitude: match.product.longitude,
        address: match.product.address,
        startTime: anchor ? this.addMinutes(anchor.startTime, anchor.durationMinutes + TRANSIT_BUFFER_MINUTES) : null,
        durationMinutes: match.product.durationMinutes,
        estimatedCost: match.product.currency === currency ? match.product.price : null,
        categoryLabel: match.product.category?.name ?? null,
        isIncluded: true,
        matchScore: match.score,
        matchReason: match.reason,
        bookingUrl: match.product.bookingUrl,
      } satisfies Partial<RouteStop>);

      dayStops.splice(match.anchorIndex + 1, 0, productStop);
    });

    return [...stopsByDay.entries()]
      .sort(([a], [b]) => a - b)
      .flatMap(([, dayStops]) =>
        dayStops.map((stop, index) => {
          stop.orderIndex = index;
          return stop;
        }),
      );
  }

  private addMinutes(time: string | null, minutes: number): string | null {
    if (!time || !/^\d{2}:\d{2}$/.test(time)) {
      return null;
    }

    const [hours, mins] = time.split(':').map(Number);
    const total = (hours * 60 + mins + minutes) % (24 * 60);

    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  }
}
