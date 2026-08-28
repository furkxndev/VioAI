import { useMemo, useState } from 'react'
import { Search, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout'
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Input,
  Pagination,
  Select,
  SkeletonList,
  Switch,
} from '@/components/ui'
import { ConfirmDialog } from '@/components/admin'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useDeleteUser, useUpdateUser, useUsers } from '@/hooks/use-admin'
import { useAuth } from '@/hooks/use-auth'
import { getApiErrorMessage } from '@/lib/api-client'
import { formatDateTime } from '@/utils/format'
import { userRoleLabels } from '@/utils/labels'
import { UserRole, type User, type UserQuery } from '@/types'

export const AdminUsersPage = () => {
  const { user: currentUser } = useAuth()
  const [query, setQuery] = useState<UserQuery>({ page: 1, limit: 15 })
  const [deletingUser, setDeletingUser] = useState<User | null>(null)

  const debouncedSearch = useDebouncedValue(query.search ?? '', 400)
  const effectiveQuery = useMemo<UserQuery>(
    () => ({ ...query, search: debouncedSearch || undefined }),
    [query, debouncedSearch],
  )

  const { data, isPending, isError, error, refetch } = useUsers(effectiveQuery)
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()

  const handleRoleChange = async (user: User, role: UserRole) => {
    try {
      await updateUser.mutateAsync({ id: user.id, payload: { role } })
      toast.success('Kullanıcı rolü güncellendi')
    } catch (mutationError) {
      toast.error(getApiErrorMessage(mutationError, 'Rol güncellenemedi'))
    }
  }

  const handleActiveChange = async (user: User, isActive: boolean) => {
    try {
      await updateUser.mutateAsync({ id: user.id, payload: { isActive } })
    } catch (mutationError) {
      toast.error(getApiErrorMessage(mutationError, 'Durum güncellenemedi'))
    }
  }

  const handleDelete = async () => {
    if (!deletingUser) return

    try {
      await deleteUser.mutateAsync(deletingUser.id)
      toast.success('Kullanıcı silindi')
      setDeletingUser(null)
    } catch (mutationError) {
      toast.error(getApiErrorMessage(mutationError, 'Kullanıcı silinemedi'))
    }
  }

  return (
    <>
      <PageHeader eyebrow="Yönetim" title="Kullanıcılar" description="Hesapları, rolleri ve erişimi yönetin." />

      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_180px]">
        <Input
          value={query.search ?? ''}
          onChange={(event) => setQuery((current) => ({ ...current, search: event.target.value, page: 1 }))}
          placeholder="İsim veya e-posta ara…"
          leftIcon={<Search className="size-4" />}
          aria-label="Kullanıcı ara"
        />
        <Select
          value={query.role ?? ''}
          onChange={(event) =>
            setQuery((current) => ({
              ...current,
              role: (event.target.value || undefined) as UserRole | undefined,
              page: 1,
            }))
          }
          aria-label="Rol filtresi"
        >
          <option value="">Tüm roller</option>
          <option value={UserRole.USER}>Kullanıcı</option>
          <option value={UserRole.ADMIN}>Yönetici</option>
        </Select>
      </div>

      {isPending && <SkeletonList count={5} />}
      {isError && <ErrorState error={error} onRetry={() => void refetch()} />}

      {data && data.items.length === 0 && (
        <EmptyState icon={<Users className="size-6" />} title="Kullanıcı bulunamadı" />
      )}

      {data && data.items.length > 0 && (
        <>
          <div className="surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-ink-100 bg-ink-50/60 text-left text-xs font-bold tracking-wide text-ink-500 uppercase">
                    <th className="px-4 py-3">Kullanıcı</th>
                    <th className="px-4 py-3">Rol</th>
                    <th className="px-4 py-3">Aktif</th>
                    <th className="px-4 py-3">Son giriş</th>
                    <th className="px-4 py-3 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((user) => {
                    const isSelf = user.id === currentUser?.id

                    return (
                      <tr key={user.id} className="border-b border-ink-100 last:border-0 hover:bg-ink-50/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={user.fullName} src={user.avatarUrl} size="sm" />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-ink-900">{user.fullName}</p>
                              <p className="truncate text-xs text-ink-400">{user.email}</p>
                            </div>
                            {isSelf && <Badge tone="brand">Siz</Badge>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Select
                            value={user.role}
                            disabled={isSelf || updateUser.isPending}
                            onChange={(event) => handleRoleChange(user, event.target.value as UserRole)}
                            aria-label={`${user.fullName} rolü`}
                            className="h-9 w-32"
                          >
                            <option value={UserRole.USER}>{userRoleLabels[UserRole.USER]}</option>
                            <option value={UserRole.ADMIN}>{userRoleLabels[UserRole.ADMIN]}</option>
                          </Select>
                        </td>
                        <td className="px-4 py-3">
                          <Switch
                            checked={user.isActive}
                            disabled={isSelf || updateUser.isPending}
                            onChange={(checked) => handleActiveChange(user, checked)}
                            label="Aktif"
                          />
                        </td>
                        <td className="px-4 py-3 text-ink-500">{formatDateTime(user.lastLoginAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Sil"
                              disabled={isSelf}
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => setDeletingUser(user)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            className="mt-6"
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            onPageChange={(page) => setQuery((current) => ({ ...current, page }))}
          />
        </>
      )}

      <ConfirmDialog
        isOpen={Boolean(deletingUser)}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDelete}
        isLoading={deleteUser.isPending}
        title="Kullanıcıyı sil"
        message={`${deletingUser?.fullName ?? ''} ve oluşturduğu tüm rotalar silinecek.`}
      />
    </>
  )
}
