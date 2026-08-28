import { Injectable } from '@nestjs/common';
import { centroid } from '../../common/utils';
import { ProductsService } from '../products/products.service';
import { AiStatusDto, ProductSuggestionDto, SuggestProductsDto } from './dto';
import { EmbeddingService } from './embedding.service';
import type {
  GeneratedItinerary,
  ItineraryRequest,
  ItineraryResult,
} from './interfaces/itinerary.interface';
import { ItineraryGeneratorService } from './itinerary-generator.service';
import {
  MatchContext,
  ProductMatch,
  ProductMatcherService,
} from './product-matcher.service';
import { OpenRouterService } from './openrouter.service';

const SUGGESTION_MIN_SCORE = 20;

@Injectable()
export class AiService {
  constructor(
    private readonly openRouterService: OpenRouterService,
    private readonly itineraryGenerator: ItineraryGeneratorService,
    private readonly productMatcher: ProductMatcherService,
    private readonly productsService: ProductsService,
    private readonly embeddingService: EmbeddingService,
  ) {}

  getStatus(): AiStatusDto {
    return {
      configured: this.openRouterService.isConfigured,
      model: this.openRouterService.model,
      provider: 'openrouter',
      embeddingModel: this.embeddingService.model,
      semanticMatching: this.embeddingService.isAvailable,
      embeddingLoaded: this.embeddingService.isLoaded,
    };
  }

  generateItinerary(request: ItineraryRequest): Promise<ItineraryResult> {
    return this.itineraryGenerator.generate(request);
  }

  async matchProducts(
    itinerary: GeneratedItinerary,
    city: string,
    context: MatchContext,
  ): Promise<ProductMatch[]> {
    const candidates = await this.productsService.findAiCandidates({ city });
    const interestEmbedding = await this.embedInterests(context.interests);

    return this.productMatcher.match(itinerary, candidates, {
      ...context,
      interestEmbedding,
    });
  }

  /**
   * Kullanıcının ilgi alanlarını tek bir vektöre çevirir. Gömme kapalıysa veya
   * model yüklenemediyse null döner; eşleştirme kelime örtüşmesiyle devam eder.
   */
  private embedInterests(interests: string[]): Promise<number[] | null> {
    if (interests.length === 0) {
      return Promise.resolve(null);
    }

    return this.embeddingService.embedOne(interests.join(', '));
  }

  async suggestProducts(
    dto: SuggestProductsDto,
  ): Promise<ProductSuggestionDto[]> {
    const travelers = dto.travelers ?? 1;
    const candidates = await this.productsService.findAiCandidates({
      city: dto.city,
    });

    if (candidates.length === 0) {
      return [];
    }

    const center =
      dto.latitude !== undefined && dto.longitude !== undefined
        ? { latitude: dto.latitude, longitude: dto.longitude }
        : centroid(
            candidates.map((product) => ({
              latitude: product.latitude,
              longitude: product.longitude,
            })),
          );

    if (!center) {
      return [];
    }

    const interests = dto.interests ?? [];
    const pseudoItinerary: GeneratedItinerary = {
      title: dto.city,
      summary: '',
      estimatedTotalCost: 0,
      days: [
        {
          day: 1,
          theme: interests.join(', '),
          stops: [
            {
              title: `${dto.city} merkezi`,
              description: '',
              category: interests[0] ?? 'genel',
              startTime: '10:00',
              durationMinutes: 60,
              estimatedCost: 0,
              latitude: center.latitude,
              longitude: center.longitude,
            },
          ],
        },
      ],
    };

    const interestEmbedding = await this.embedInterests(interests);
    const matches = this.productMatcher.match(
      pseudoItinerary,
      candidates,
      {
        interests,
        budget: dto.budget ?? 0,
        currency: dto.currency ?? 'TRY',
        travelers,
        spentEstimate: 0,
        interestEmbedding,
      },
      {
        minScore: SUGGESTION_MIN_SCORE,
        maxMatches: dto.limit ?? 6,
        enforceDiversity: false,
      },
    );

    return matches.map((match) => ({
      product: match.product,
      score: match.score,
      reason: match.reason,
      distanceKm: match.distanceKm,
    }));
  }
}
