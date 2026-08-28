import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Button, Field, Input } from '@/components/ui'
import { Logo } from '@/components/layout'
import { useAuth } from '@/hooks/use-auth'
import { getApiErrorMessage } from '@/lib/api-client'

const schema = z
  .object({
    fullName: z.string().min(2, 'Ad soyad en az 2 karakter olmalı').max(120),
    email: z.string().min(1, 'E-posta gerekli').email('Geçerli bir e-posta giriniz'),
    password: z.string().min(8, 'Şifre en az 8 karakter olmalı').max(72),
    passwordConfirm: z.string(),
  })
  .refine((values) => values.password === values.passwordConfirm, {
    path: ['passwordConfirm'],
    message: 'Şifreler eşleşmiyor',
  })

type FormValues = z.infer<typeof schema>

export const RegisterPage = () => {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = handleSubmit(async ({ fullName, email, password }) => {
    try {
      await registerUser({ fullName, email, password })
      toast.success('Hesabınız oluşturuldu, iyi yolculuklar!')
      navigate('/rota-olustur', { replace: true })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Kayıt oluşturulamadı'))
    }
  })

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
      <div className="mb-8 text-center">
        <Logo className="justify-center" />
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-ink-900">VioAI'a katılın</h1>
        <p className="mt-1.5 text-sm text-ink-500">
          Yapay zekâ ile saniyeler içinde kişiselleştirilmiş rotalar oluşturun.
        </p>
      </div>

      <form onSubmit={onSubmit} className="surface space-y-4 p-6" noValidate>
        <Field label="Ad soyad" htmlFor="fullName" error={errors.fullName?.message} required>
          <Input
            id="fullName"
            autoComplete="name"
            placeholder="Ada Yılmaz"
            hasError={Boolean(errors.fullName)}
            {...register('fullName')}
          />
        </Field>

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

        <Field
          label="Şifre"
          htmlFor="password"
          error={errors.password?.message}
          hint="En az 8 karakter"
          required
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            hasError={Boolean(errors.password)}
            {...register('password')}
          />
        </Field>

        <Field label="Şifre tekrar" htmlFor="passwordConfirm" error={errors.passwordConfirm?.message} required>
          <Input
            id="passwordConfirm"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            hasError={Boolean(errors.passwordConfirm)}
            {...register('passwordConfirm')}
          />
        </Field>

        <Button type="submit" fullWidth isLoading={isSubmitting} leftIcon={<UserPlus className="size-4" />}>
          Hesap oluştur
        </Button>

        <p className="text-center text-sm text-ink-500">
          Zaten hesabınız var mı?{' '}
          <Link to="/giris" className="font-semibold text-brand-600 hover:underline">
            Giriş yapın
          </Link>
        </p>
      </form>

      <Link to="/" className="mt-6 text-center text-sm font-medium text-ink-400 hover:text-ink-700">
        Ana sayfaya dön
      </Link>
    </div>
  )
}
