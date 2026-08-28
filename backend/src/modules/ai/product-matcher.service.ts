import { Injectable } from '@nestjs/common';
import { haversineDistanceKm, slugify } from '../../common/utils';
import type { Product } from '../products/entities/product.entity';
import type { GeneratedItinerary, GeneratedStop } from './interfaces/itinerary.interface';

export interface MatchContext {
  interests: string[];
  budget: number;
  currency: string;
  travelers: number;
  spentEstimate: number;
}

export interface ProductMatch {
  product: Product;
  score: number;
  reason: string;
  dayNumber: number;
  anchorIndex: number;
  anchorTitle: string;
  distanceKm: number;
}

interface ScoredCandidate extends ProductMatch {
  categoryId: string;
}

const WEIGHTS = {
  proximity: 35,
  interest: 25,
  theme: 20,
  budget: 15,
  quality: 5,
} as const;

const MAX_DISTANCE_KM = 15;
const IDEAL_DISTANCE_KM = 1;
const DEFAULT_MIN_SCORE = 40;
const DEFAULT_MAX_MATCHES = 2;

export interface MatchOptions {
  minScore?: number;
  maxMatches?: number;
  enforceDiversity?: boolean;
}

@Injectable()
export class ProductMatcherService {
  match(
    itinerary: GeneratedItinerary,
    candidates: Product[],
    context: MatchContext,
    options: MatchOptions = {},
  ): ProductMatch[] {
    if (candidates.length === 0) {
      return [];
    }

    const minScore = options.minScore ?? DEFAULT_MIN_SCORE;
    const maxMatches = options.maxMatches ?? DEFAULT_MAX_MATCHES;
    const enforceDiversity = options.enforceDiversity ?? true;

    const interestTokens = this.tokenize(context.interests);
    const themeTokens = this.tokenize(
      itinerary.days.flatMap((day) => [day.theme, ...day.stops.map((stop) => stop.category)]),
    );
    const remainingBudget = Math.max(context.budget - context.spentEstimate, 0);

    const scored = candidates
      .map((product) => this.score(product, itinerary, { interestTokens, themeTokens, remainingBudget, context }))
      .filter((candidate): candidate is ScoredCandidate => candidate !== null && candidate.score >= minScore)
      .sort((a, b) => b.score - a.score);

    return this.pickDiverse(scored, maxMatches, enforceDiversity);
  }

  private score(
    product: Product,
    itinerary: GeneratedItinerary,
    params: {
      interestTokens: Set<string>;
      themeTokens: Set<string>;
      remainingBudget: number;
      context: MatchContext;
    },
  ): ScoredCandidate | null {
    const anchor = this.findAnchor(product, itinerary);

    if (!anchor || anchor.distanceKm > MAX_DISTANCE_KM) {
      return null;
    }

    const comparableBudget = product.currency === params.context.currency;
    const totalPrice = product.price * params.context.travelers;

    if (comparableBudget && params.remainingBudget > 0 && totalPrice > params.remainingBudget) {
      return null;
    }

    const productTokens = this.tokenize([product.name, product.category?.name ?? '', ...product.tags]);

    const proximityRatio = this.clamp01(
      (MAX_DISTANCE_KM - Math.max(anchor.distanceKm - IDEAL_DISTANCE_KM, 0)) / MAX_DISTANCE_KM,
    );
    const interestRatio = this.overlapRatio(productTokens, params.interestTokens);
    const themeRatio = this.overlapRatio(productTokens, params.themeTokens);
    const qualityRatio =
      this.clamp01(product.rating / 5) * 0.6 + this.clamp01(product.popularityScore / 100) * 0.4;
    const budgetRatio =
      params.remainingBudget <= 0 ? 0 : this.clamp01(1 - totalPrice / params.remainingBudget);

    // Ürünün para birimi rotanınkinden farklıysa bütçe sinyali karşılaştırılamaz;
    // ağırlığı toplamdan düşerek diğer sinyalleri orantılı olarak yeniden ölçekleriz.
    const components = [
      { weight: WEIGHTS.proximity, ratio: proximityRatio },
      { weight: WEIGHTS.interest, ratio: interestRatio },
      { weight: WEIGHTS.theme, ratio: themeRatio },
      { weight: WEIGHTS.quality, ratio: qualityRatio },
      ...(comparableBudget ? [{ weight: WEIGHTS.budget, ratio: budgetRatio }] : []),
    ];

    const totalWeight = components.reduce((sum, c) => sum + c.weight, 0);
    const weighted = components.reduce((sum, c) => sum + c.weight * c.ratio, 0);
    const score = Math.round((weighted / totalWeight) * 100 * 100) / 100;

    const interestScore = WEIGHTS.interest * interestRatio;
    const themeScore = WEIGHTS.theme * themeRatio;
    const budgetScore = comparableBudget ? WEIGHTS.budget * budgetRatio : 0;

    return {
      product,
      categoryId: product.categoryId,
      score,
      distanceKm: Math.round(anchor.distanceKm * 100) / 100,
      dayNumber: anchor.dayNumber,
      anchorIndex: anchor.stopIndex,
      anchorTitle: anchor.stop.title,
      reason: this.buildReason(product, anchor, {
        interestScore,
        themeScore,
        budgetScore,
        interests: params.context.interests,
      }),
    };
  }

  private findAnchor(
    product: Product,
    itinerary: GeneratedItinerary,
  ): { dayNumber: number; stopIndex: number; stop: GeneratedStop; distanceKm: number } | null {
    let best: { dayNumber: number; stopIndex: number; stop: GeneratedStop; distanceKm: number } | null = null;

    itinerary.days.forEach((day) => {
      day.stops.forEach((stop, stopIndex) => {
        const distanceKm = haversineDistanceKm(
          { latitude: product.latitude, longitude: product.longitude },
          { latitude: stop.latitude, longitude: stop.longitude },
        );

        if (!best || distanceKm < best.distanceKm) {
          best = { dayNumber: day.day, stopIndex, stop, distanceKm };
        }
      });
    });

    return best;
  }

  private pickDiverse(
    scored: ScoredCandidate[],
    maxMatches: number,
    enforceDiversity: boolean,
  ): ProductMatch[] {
    if (!enforceDiversity) {
      return scored.slice(0, maxMatches).map(({ categoryId: _categoryId, ...match }) => match);
    }

    const picked: ScoredCandidate[] = [];
    const usedCategories = new Set<string>();
    const usedDays = new Set<number>();

    for (const candidate of scored) {
      if (picked.length >= maxMatches) break;
      if (usedCategories.has(candidate.categoryId)) continue;
      if (usedDays.has(candidate.dayNumber) && picked.length > 0) continue;

      picked.push(candidate);
      usedCategories.add(candidate.categoryId);
      usedDays.add(candidate.dayNumber);
    }

    for (const candidate of scored) {
      if (picked.length >= maxMatches) break;
      if (picked.some((item) => item.product.id === candidate.product.id)) continue;
      if (usedCategories.has(candidate.categoryId)) continue;

      picked.push(candidate);
      usedCategories.add(candidate.categoryId);
    }

    return picked.map(({ categoryId: _categoryId, ...match }) => match);
  }

  private buildReason(
    product: Product,
    anchor: { stop: GeneratedStop; distanceKm: number; dayNumber: number },
    signals: { interestScore: number; themeScore: number; budgetScore: number; interests: string[] },
  ): string {
    const parts = [
      `${anchor.dayNumber}. gündeki "${anchor.stop.title}" durağına ${anchor.distanceKm.toFixed(1)} km mesafede`,
    ];

    if (signals.interestScore > 0 && signals.interests.length > 0) {
      const productTokens = this.tokenize([product.name, product.category?.name ?? '', ...product.tags]);
      const matched = signals.interests.filter((interest) =>
        slugify(interest)
          .split('-')
          .some((token) => token.length > 2 && productTokens.has(token)),
      );
      parts.push(
        matched.length > 0
          ? `${matched.join(', ')} ilgi alanınızla örtüşüyor`
          : 'ilgi alanlarınızla uyumlu',
      );
    }

    if (signals.themeScore > 0) {
      parts.push('rotanın temasıyla uyumlu');
    }

    if (signals.budgetScore > 0) {
      parts.push('bütçenize uygun');
    }

    return `${parts.join(', ')}.`;
  }

  private tokenize(values: string[]): Set<string> {
    const tokens = new Set<string>();

    values
      .filter(Boolean)
      .flatMap((value) => slugify(value).split('-'))
      .filter((token) => token.length > 2)
      .forEach((token) => tokens.add(token));

    return tokens;
  }

  private overlapRatio(source: Set<string>, target: Set<string>): number {
    if (target.size === 0 || source.size === 0) {
      return 0;
    }

    let matches = 0;
    target.forEach((token) => {
      if (source.has(token)) matches += 1;
    });

    return this.clamp01(matches / Math.min(target.size, 4));
  }

  private clamp01(value: number): number {
    if (!Number.isFinite(value)) return 0;
    return Math.min(Math.max(value, 0), 1);
  }
}
