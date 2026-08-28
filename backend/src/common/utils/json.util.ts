export const extractJsonObject = (raw: string): unknown => {
  const withoutFences = raw
    .replace(/```(?:json)?/gi, '')
    .replace(/```/g, '')
    .trim();

  const start = withoutFences.indexOf('{');
  const end = withoutFences.lastIndexOf('}');

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Yanıt içinde geçerli bir JSON nesnesi bulunamadı');
  }

  return JSON.parse(withoutFences.slice(start, end + 1));
};
