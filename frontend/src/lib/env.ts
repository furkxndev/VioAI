const requireEnv = (key: string, fallback?: string): string => {
  const value = import.meta.env[key as keyof ImportMetaEnv] as string | undefined

  if (!value) {
    if (fallback !== undefined) return fallback
    throw new Error(`Eksik ortam değişkeni: ${key}`)
  }

  return value
}

export const env = {
  apiBaseUrl: requireEnv('VITE_API_BASE_URL', 'http://localhost:3000/api/v1'),
  appName: requireEnv('VITE_APP_NAME', 'VioAI'),
} as const
