import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Lock, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { Button, Field, Input } from '@/components/ui'
import { Logo } from '@/components/layout'
import { useAuth } from '@/hooks/use-auth'
import { getApiErrorMessage } from '@/lib/api-client'

const schema = z.object({
  email: z.string().min(1, 'E-posta gerekli').email('Geçerli bir e-posta giriniz'),
  password: z.string().min(1, 'Şifre gerekli'),
})

type FormValues = z.infer<typeof schema>

export const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)

  const redirectedFrom = (location.state as { from?: string } | null)?.from

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values)
      toast.success('Hoş geldiniz!')
      navigate(redirectedFrom ?? '/', { replace: true })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Giriş yapılamadı'))
    }
  })

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
      <div className="mb-8 text-center">
        <Logo className="justify-center" />
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-ink-900">Tekrar hoş geldiniz</h1>
        <p className="mt-1.5 text-sm text-ink-500">Rotalarınıza kaldığınız yerden devam edin.</p>
      </div>

      {redirectedFrom && (
        <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700">
          <Lock className="mt-0.5 size-4 shrink-0" />
          <p>
            Bu sayfa yalnızca üyelere açık. Giriş yaptıktan sonra kaldığınız yerden devam edeceksiniz.
          </p>
        </div>
      )}

      <form onSubmit={onSubmit} className="surface space-y-4 p-6" noValidate>
        <Field label="E-posta" htmlFor="email" error={errors.email?.message} required>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="ornek@viofun.com"
            hasError={Boolean(errors.email)}
            {...register('email')}
          />
        </Field>

        <Field label="Şifre" htmlFor="password" error={errors.password?.message} required>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            hasError={Boolean(errors.password)}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                className="rounded-lg p-2 text-ink-400 transition-colors hover:text-ink-700"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
            {...register('password')}
          />
        </Field>

        <Button type="submit" fullWidth isLoading={isSubmitting} leftIcon={<LogIn className="size-4" />}>
          Giriş yap
        </Button>

        <p className="text-center text-sm text-ink-500">
          Hesabınız yok mu?{' '}
          <Link to="/kayit" className="font-semibold text-brand-600 hover:underline">
            Ücretsiz oluşturun
          </Link>
        </p>
      </form>

      <Link to="/" className="mt-6 text-center text-sm font-medium text-ink-400 hover:text-ink-700">
        Ana sayfaya dön
      </Link>
    </div>
  )
}
