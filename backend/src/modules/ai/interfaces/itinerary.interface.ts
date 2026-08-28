export interface GeneratedStop {
  title: string;
  description: string;
  category: string;
  startTime: string;
  durationMinutes: number;
  estimatedCost: number;
  latitude: number;
  longitude: number;
  address?: string;
}

export interface GeneratedDay {
  day: number;
  theme: string;
  stops: GeneratedStop[];
}

export interface GeneratedItinerary {
  title: string;
  summary: string;
  estimatedTotalCost: number;
  days: GeneratedDay[];
}

export interface ItineraryRequest {
  city: string;
  days: number;
  budget: number;
  currency: string;
  travelers: number;
  interests: string[];
  transportMode: string;
  pace: string;
  startDate?: string;
  notes?: string;
}

export interface ItineraryResult {
  itinerary: GeneratedItinerary;
  model: string;
  generationMs: number;
}
