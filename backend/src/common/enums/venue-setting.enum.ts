/** Aktivitenin kapalı/açık alan durumu. Yağmurlu gün sorgularında filtre olarak kullanılır. */
export enum VenueSetting {
  /** Tamamen kapalı: müze, atölye, akvaryum. Yağmurda sorunsuz. */
  INDOOR = 'indoor',
  /** Tamamen açık: ören yeri, tekne turu, yamaç paraşütü. Yağmurda uygun değil. */
  OUTDOOR = 'outdoor',
  /** Karma: tema parkı, bazı şehir turları. Yağmurda kısmen uygun. */
  MIXED = 'mixed',
}

/** Bir alan bilgisinin nereden geldiği — veriye ne kadar güvenilebileceğini belirtir. */
export enum AttributeSource {
  /** Ürün açıklamasında açıkça yazıyor ("10 yaş ve üzeri katılımcılar"). */
  EXPLICIT = 'explicit',
  /** Açıklamadan/kategoriden çıkarıldı (kaya tırmanışı → küçük çocuğa uygun değil). */
  INFERRED = 'inferred',
  /** Belirlenemedi. Yaşa duyarlı sorgularda bu ürünler güvenli listeye alınmaz. */
  UNKNOWN = 'unknown',
}
