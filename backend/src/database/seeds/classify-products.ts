/**
 * Ürünleri kapalı/açık alan ve en düşük yaş açısından sınıflandırır.
 *
 *   bun run classify          → yalnızca sınıflandırılmamış ürünleri işler
 *   bun run classify --force  → hepsini yeniden sınıflandırır
 *
 * Kategori varsayılanı taban alınır, LLM ürünün adı ve açıklaması üzerinden düzeltir.
 * Model emin olamazsa kategori varsayılanına düşülür ve kaynak "inferred" işaretlenir.
 * OPENROUTER_API_KEY gerektirir; tek seferlik çalıştırılır.
 */
import { IsNull } from 'typeorm';
import { AttributeSource, VenueSetting } from '../../common/enums';
import { extractJsonObject } from '../../common/utils';
import { Product } from '../../modules/products/entities/product.entity';
import dataSource from '../data-source';

const BATCH = 6;

/**
 * Açıklamada yaş/çocuk geçen cümleleri ayrıca çıkarır.
 * Bu bilgi genelde açıklamanın sonlarında olduğu için, metni kırpmak
 * yaş sınırlarının tamamen kaçırılmasına yol açıyordu.
 */
const yasCumleleri = (aciklama: string): string[] =>
  aciklama
    .split(/(?<=[.!?\n])\s+/)
    .filter((c) => /\d+\s*ya[şs]|ya[şs] (alt|üst|ve)|çocuk/i.test(c))
    .map((c) => c.replace(/\s+/g, ' ').trim())
    .filter((c) => c.length > 10)
    .slice(0, 6);

/** Kategori bazlı taban değerler. LLM'in kararı bunları geçersiz kılabilir. */
const CATEGORY_DEFAULTS: Record<string, VenueSetting> = {
  Müzeler: VenueSetting.INDOOR,
  'Etnografya & Arkeoloji': VenueSetting.INDOOR,
  'Kültür & Sanat': VenueSetting.INDOOR,
  'Spa & Masaj': VenueSetting.INDOOR,
  Konser: VenueSetting.INDOOR,
  'Alternatif Müzik': VenueSetting.INDOOR,
  'Akvaryum & Hayvanat Bahçeleri': VenueSetting.MIXED,
  'Antik Kentler & Ören Yerleri': VenueSetting.OUTDOOR,
  'Tekne Turları': VenueSetting.OUTDOOR,
  'Yamaç Paraşütü': VenueSetting.OUTDOOR,
  'Safari & Off-Road': VenueSetting.OUTDOOR,
  'Doğa Yürüyüşü & Keşif': VenueSetting.OUTDOOR,
  'Su Parkları': VenueSetting.OUTDOOR,
  'Su Maceraları': VenueSetting.OUTDOOR,
  'Zipline & Tırmanış': VenueSetting.OUTDOOR,
  Macera: VenueSetting.OUTDOOR,
};

const SYSTEM_PROMPT = `Sen bir turizm aktivitesi sınıflandırıcısısın. Sana aktivite listesi verilecek;
her biri için mekân türünü ve katılabilecek en düşük yaşı belirleyeceksin.

Kurallar:
- venueSetting: "indoor" (tamamen kapalı), "outdoor" (tamamen açık), "mixed" (ikisi de).
  Yağmurlu bir günde gidilebiliyorsa indoor'dur. Müze, atölye, akvaryum indoor;
  ören yeri, tekne turu, safari outdoor; tema parkı genelde mixed.
- minAge: katılım için gereken en düşük yaş (sayı). Sınır yoksa 0 yaz.
- source: Yaş sınırı AÇIKLAMADA açıkça yazıyorsa "explicit".
  Açıkça yazmıyor ama aktivitenin doğasından çıkarıyorsan "inferred".
  Hiçbir şekilde karar veremiyorsan "unknown".
- evidence: Kararını dayandırdığın açıklama parçası veya kısa gerekçe (en fazla 200 karakter).
- minAge 0 SADECE gerçekten her yaştan çocuğun katılabileceği aktiviteler içindir:
  müze, akvaryum, hayvanat bahçesi, tema parkı, şehir turu, sergi gibi.
- Aşağıdaki durumlarda açıklamada yaş yazmasa bile gerçekçi bir sınır ver ve
  "inferred" işaretle. Bunları asla minAge 0 yapma:
  * Fiziksel risk: tırmanış, paraşüt, rafting, safari, ATV, atış, dalış, binicilik.
  * El becerisi gerektiren atölyeler: cam, vitray, mozaik, seramik, çömlek, ebru,
    resim, parfüm, mum, takı. Kırılabilir malzeme, sıcak yüzey, kesici alet veya
    kimyasal içerdiği için küçük çocuklara uygun değildir; genelde 7-12 yaş alt sınırı olur.
  * Yetişkine yönelik deneyimler: kahve falı, şarap tadımı, gece etkinlikleri.
- Aynı türden bir aktivitenin bazı kayıtlarında yaş yazıp bazılarında yazmaması,
  yazmayanın çocuklara uygun olduğu anlamına gelmez. Aktivitenin doğasına bak.
- Her aktivitede "yasIpuclari" alanı, açıklamadan çıkarılmış yaş/çocuk ile ilgili
  cümleleri içerir. Bu alanda net bir sınır varsa ("10 yaş ve üzeri", "12 yaş altı
  çocuklar ebeveyn gözetiminde") onu kullan ve source'u "explicit" yap.
- Yanıtın SADECE geçerli bir JSON nesnesi olsun.

JSON şeması:
{ "results": [ { "id": string, "venueSetting": string, "minAge": number, "source": string, "evidence": string } ] }`;

interface LlmResult {
  id: string;
  venueSetting?: string;
  minAge?: number;
  source?: string;
  evidence?: string;
}

const toVenue = (value: unknown, fallback: VenueSetting | null): VenueSetting | null => {
  const deger = String(value).toLowerCase();
  return Object.values(VenueSetting).includes(deger as VenueSetting)
    ? (deger as VenueSetting)
    : fallback;
};

const toSource = (value: unknown): AttributeSource => {
  const deger = String(value).toLowerCase();
  return Object.values(AttributeSource).includes(deger as AttributeSource)
    ? (deger as AttributeSource)
    : AttributeSource.UNKNOWN;
};

const chat = async (mesaj: string): Promise<string> => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY tanımlı değil');

  const response = await fetch(
    `${process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1'}/chat/completions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.OPENROUTER_REFERER ?? 'http://localhost:5173',
        'X-Title': process.env.OPENROUTER_TITLE ?? 'VioAI',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL ?? 'anthropic/claude-sonnet-4.5',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: mesaj },
        ],
        temperature: 0.1,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      }),
    },
  );

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
    error?: { message?: string };
  };

  if (!response.ok || !payload.choices?.[0]?.message?.content) {
    throw new Error(`OpenRouter hatası: ${payload.error?.message ?? response.status}`);
  }

  return payload.choices[0].message.content;
};

const run = async (): Promise<void> => {
  const force = process.argv.includes('--force');
  const ds = await dataSource.initialize();
  const repository = ds.getRepository(Product);

  try {
    const products = await repository.find({
      where: force ? {} : { venueSetting: IsNull() },
      relations: { category: true },
      order: { createdAt: 'ASC' },
    });

    if (products.length === 0) {
      console.log('Sınıflandırılacak ürün yok.');
      return;
    }

    console.log(`${products.length} ürün sınıflandırılacak (${BATCH}'lık gruplar).`);
    const sayac = { explicit: 0, inferred: 0, unknown: 0 };

    for (let i = 0; i < products.length; i += BATCH) {
      const dilim = products.slice(i, i + BATCH);
      const istek = dilim.map((p) => {
        const aciklama = (p.description ?? '').replace(/\s+/g, ' ');
        return {
          id: p.id,
          ad: p.name,
          kategori: p.category?.name ?? '',
          etiketler: p.tags,
          aciklama: aciklama.slice(0, 2500),
          // Yaş bilgisi açıklamanın sonlarında saklı kalmasın diye ayrıca öne çıkarılır.
          yasIpuclari: yasCumleleri(p.description ?? ''),
        };
      });

      let sonuclar: LlmResult[] = [];
      try {
        const ham = await chat(JSON.stringify(istek, null, 1));
        const cozulen = extractJsonObject(ham) as { results?: LlmResult[] };
        sonuclar = Array.isArray(cozulen.results) ? cozulen.results : [];
      } catch (error) {
        console.warn(
          `\n  ! ${i / BATCH + 1}. grup başarısız, kategori varsayılanına düşülüyor: ` +
            `${error instanceof Error ? error.message : String(error)}`,
        );
      }

      const idIle = new Map(sonuclar.map((r) => [r.id, r]));

      await Promise.all(
        dilim.map((product) => {
          const varsayilan = CATEGORY_DEFAULTS[product.category?.name ?? ''] ?? null;
          const sonuc = idIle.get(product.id);
          const venue = toVenue(sonuc?.venueSetting, varsayilan);
          const source = sonuc ? toSource(sonuc.source) : AttributeSource.INFERRED;
          const minAge =
            typeof sonuc?.minAge === 'number' && Number.isFinite(sonuc.minAge)
              ? Math.max(0, Math.min(Math.round(sonuc.minAge), 99))
              : null;

          sayac[source] += 1;

          return repository.update(product.id, {
            venueSetting: venue,
            minAge,
            attributeSource: source,
            attributeEvidence: (sonuc?.evidence ?? '').slice(0, 400) || null,
          });
        }),
      );

      process.stdout.write(
        `\r- ${Math.min(i + BATCH, products.length)}/${products.length} ürün sınıflandırıldı`,
      );
    }

    console.log(
      `\n- tamamlandı. kaynak dağılımı: açık ${sayac.explicit}, çıkarım ${sayac.inferred}, bilinmiyor ${sayac.unknown}`,
    );
  } finally {
    await ds.destroy();
  }
};

run().catch((error) => {
  console.error('Sınıflandırma başarısız:', error);
  process.exit(1);
});
