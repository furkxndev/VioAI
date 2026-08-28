/** Serbest metinli sorudan çıkarılan yapılandırılmış arama kısıtları. */
export interface ChatFilters {
  /** Şehir adı. Sorudan çıkarılamazsa null — bu durumda kullanıcıya geri sorulur. */
  city: string | null;
  /**
   * Kullanıcı yağmur/kar gibi bir hava belirttiyse veya kapalı mekân istediyse true.
   * Havayı Open-Meteo'dan öğrendiğimizde de bu alan doldurulur.
   */
  requiresIndoor: boolean;
  /** Gruptaki en küçük çocuğun yaşı. Çocuk yoksa null. */
  childAge: number | null;
  travelers: number | null;
  budget: number | null;
  currency: string | null;
  /** Serbest ilgi ifadeleri ("el işi", "sakin bir gün") — anlamsal sıralamada kullanılır. */
  interests: string[];
  /** ISO tarih (YYYY-MM-DD). "yarın" gibi ifadeler burada çözülür. */
  date: string | null;
  /** Kullanıcının cümlesinde geçen hava ifadesi; yoksa null. */
  statedWeather: string | null;
}

export interface ChatUnderstanding {
  filters: ChatFilters;
  /** Model soruyu bir aktivite arama isteği olarak anlamadıysa false. */
  isActivitySearch: boolean;
  /** Soruyu tek cümlede özetleyen, cevap üretiminde kullanılan yeniden ifade. */
  restated: string;
}
