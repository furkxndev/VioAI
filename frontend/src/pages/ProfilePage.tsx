import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { KeyRound, LogOut, Save, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { PageContainer, PageHeader } from '@/components/layout'
import { Avatar, Badge, Button, Card, CardBody, CardHeader, Chip, Field, Input, Select } from '@/components/ui'
import { ErrorState, Skeleton } from '@/components/ui'
import { useAuth } from '@/hooks/use-auth'
import { useChangePassword, useProfile, useUpdateProfile } from '@/hooks/use-profile'
import { getApiErrorMessage } from '@/lib/api-client'
import { formatDateTime } from '@/utils/format'
import { interestOptions, userRoleLabels } from '@/utils/labels'

const profileSchema = z.object({
  fullName: z.string().min(2, 'Ad soyad en az 2 karakter olmalı').max(120),
  email: z.string().email('Geçerli bir e-posta giriniz'),
  homeCity: z.string().max(120).optional(),
  currency: z.string().length(3),
  interests: z.array(z.string()),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Mevcut şifre gerekli'),
    newPassword: z.string().min(8, 'Yeni şifre en az 8 karakter olmalı').max(72),
    newPasswordConfirm: z.string(),
  })
  .refine((values) => values.newPassword === values.newPasswordConfirm, {
    path: ['newPasswordConfirm'],
    message: 'Şifreler eşleşmiyor',
  })

type ProfileValues = z.infer<typeof profileSchema>
type PasswordValues = z.infer<typeof passwordSchema>

export const ProfilePage = () => {
  const navigate = useNavigate()
  const { logout, isAdmin, setUser } = useAuth()
  const { data: profile, isPending, isError, error, refetch } = useProfile()
  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: '', email: '', homeCity: '', currency: 'TRY', interests: [] },
  })

  const passwordForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) })

  useEffect(() => {
    if (!profile) return

    profileForm.reset({
      fullName: profile.fullName,
      email: profile.email,
      homeCity: profile.preferences.homeCity ?? '',
      currency: profile.preferences.currency ?? 'TRY',
      interests: profile.preferences.interests ?? [],
    })
  }, [profile, profileForm])

  const onSubmitProfile = profileForm.handleSubmit(async (values) => {
    try {
      const updated = await updateProfile.mutateAsync({
        fullName: values.fullName,
        email: values.email,
        preferences: {
          homeCity: values.homeCity || undefined,
          currency: values.currency,
          interests: values.interests,
        },
      })
      setUser({
        id: updated.id,
        email: updated.email,
        fullName: updated.fullName,
        role: updated.role,
        avatarUrl: updated.avatarUrl,
      })
      toast.success('Profiliniz güncellendi')
    } catch (submitError) {
      toast.error(getApiErrorMessage(submitError, 'Profil güncellenemedi'))
    }
  })

  const onSubmitPassword = passwordForm.handleSubmit(async (values) => {
    try {
      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      passwordForm.reset()
      toast.success('Şifreniz güncellendi')
    } catch (submitError) {
      toast.error(getApiErrorMessage(submitError, 'Şifre güncellenemedi'))
    }
  })

  const handleLogout = async () => {
    await logout()
    navigate('/giris')
  }

  if (isPending) {
    return (
      <PageContainer size="narrow">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="mt-4 h-72 w-full" />
      </PageContainer>
    )
  }

  if (isError || !profile) {
    return (
      <PageContainer size="narrow">
        <ErrorState error={error} onRetry={() => void refetch()} />
      </PageContainer>
    )
  }

  return (
    <PageContainer size="narrow">
      <PageHeader title="Profil" description="Hesap bilgilerinizi ve seyahat tercihlerinizi yönetin." />

      <Card className="mb-5">
        <CardBody className="flex items-center gap-4">
          <Avatar name={profile.fullName} src={profile.avatarUrl} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-lg font-extrabold text-ink-900">{profile.fullName}</p>
            <p className="truncate text-sm text-ink-500">{profile.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge tone={isAdmin ? 'brand' : 'neutral'}>{userRoleLabels[profile.role]}</Badge>
              <span className="text-xs text-ink-400">
                Son giriş: {formatDateTime(profile.lastLoginAt)}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      {isAdmin && (
        <Card className="mb-5">
          <CardBody className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-ink-900">Yönetim paneli</p>
              <p className="text-sm text-ink-500">Ürünleri, kategorileri ve kullanıcıları yönetin.</p>
            </div>
            <Button
              variant="outline"
              leftIcon={<ShieldCheck className="size-4" />}
              onClick={() => navigate('/admin')}
            >
              Aç
            </Button>
          </CardBody>
        </Card>
      )}

      <Card className="mb-5">
        <CardHeader title="Hesap bilgileri" description="Ad, e-posta ve seyahat tercihleri" />
        <CardBody>
          <form onSubmit={onSubmitProfile} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Ad soyad"
                htmlFor="fullName"
                error={profileForm.formState.errors.fullName?.message}
              >
                <Input id="fullName" {...profileForm.register('fullName')} />
              </Field>

              <Field label="E-posta" htmlFor="email" error={profileForm.formState.errors.email?.message}>
                <Input id="email" type="email" {...profileForm.register('email')} />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
              <Field label="Yaşadığınız şehir" htmlFor="homeCity">
                <Input id="homeCity" placeholder="İstanbul" {...profileForm.register('homeCity')} />
              </Field>

              <Field label="Para birimi" htmlFor="currency">
                <Select id="currency" {...profileForm.register('currency')}>
                  <option value="TRY">TRY</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </Select>
              </Field>
            </div>

            <Controller
              control={profileForm.control}
              name="interests"
              render={({ field }) => (
                <Field label="İlgi alanları" hint="Rota önerilerini kişiselleştirir">
                  <div className="flex flex-wrap gap-2">
                    {interestOptions.map((interest) => {
                      const selected = field.value.includes(interest)

                      return (
                        <Chip
                          key={interest}
                          selected={selected}
                          onClick={() =>
                            field.onChange(
                              selected
                                ? field.value.filter((item) => item !== interest)
                                : [...field.value, interest],
                            )
                          }
                        >
                          {interest}
                        </Chip>
                      )
                    })}
                  </div>
                </Field>
              )}
            />

            <Button
              type="submit"
              isLoading={updateProfile.isPending}
              leftIcon={<Save className="size-4" />}
            >
              Kaydet
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card className="mb-5">
        <CardHeader title="Şifre değiştir" description="Güçlü ve benzersiz bir şifre kullanın" />
        <CardBody>
          <form onSubmit={onSubmitPassword} className="space-y-4" noValidate>
            <Field
              label="Mevcut şifre"
              htmlFor="currentPassword"
              error={passwordForm.formState.errors.currentPassword?.message}
            >
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                {...passwordForm.register('currentPassword')}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Yeni şifre"
                htmlFor="newPassword"
                error={passwordForm.formState.errors.newPassword?.message}
              >
                <Input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  {...passwordForm.register('newPassword')}
                />
              </Field>

              <Field
                label="Yeni şifre tekrar"
                htmlFor="newPasswordConfirm"
                error={passwordForm.formState.errors.newPasswordConfirm?.message}
              >
                <Input
                  id="newPasswordConfirm"
                  type="password"
                  autoComplete="new-password"
                  {...passwordForm.register('newPasswordConfirm')}
                />
              </Field>
            </div>

            <Button
              type="submit"
              variant="secondary"
              isLoading={changePassword.isPending}
              leftIcon={<KeyRound className="size-4" />}
            >
              Şifreyi güncelle
            </Button>
          </form>
        </CardBody>
      </Card>

      <Button variant="outline" fullWidth leftIcon={<LogOut className="size-4" />} onClick={handleLogout}>
        Çıkış yap
      </Button>
    </PageContainer>
  )
}
