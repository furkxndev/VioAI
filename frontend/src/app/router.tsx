import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AdminLayout, AppLayout } from '@/components/layout'
import { ProtectedRoute } from '@/components/common'
import { FullPageSpinner } from '@/components/ui'
import {
  ActivitiesPage,
  ActivityDetailPage,
  GenerateRoutePage,
  HomePage,
  LoginPage,
  MyRoutesPage,
  NotFoundPage,
  ProfilePage,
  RegisterPage,
  RouteDetailPage,
} from '@/pages'

const AdminDashboardPage = lazy(() =>
  import('@/pages/admin').then((module) => ({ default: module.AdminDashboardPage })),
)
const AdminProductsPage = lazy(() =>
  import('@/pages/admin').then((module) => ({ default: module.AdminProductsPage })),
)
const AdminCategoriesPage = lazy(() =>
  import('@/pages/admin').then((module) => ({ default: module.AdminCategoriesPage })),
)
const AdminUsersPage = lazy(() =>
  import('@/pages/admin').then((module) => ({ default: module.AdminUsersPage })),
)
const AdminApiKeysPage = lazy(() =>
  import('@/pages/admin').then((module) => ({ default: module.AdminApiKeysPage })),
)

export const AppRouter = () => (
  <Routes>
    <Route path="/giris" element={<LoginPage />} />
    <Route path="/kayit" element={<RegisterPage />} />

    <Route element={<AppLayout />}>
      <Route index element={<HomePage />} />
      <Route path="aktiviteler" element={<ActivitiesPage />} />
      <Route path="aktiviteler/:id" element={<ActivityDetailPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="rota-olustur" element={<GenerateRoutePage />} />
        <Route path="rotalarim" element={<MyRoutesPage />} />
        <Route path="rotalarim/:id" element={<RouteDetailPage />} />
        <Route path="profil" element={<ProfilePage />} />
      </Route>

      <Route element={<ProtectedRoute requireAdmin />}>
        <Route
          path="admin"
          element={
            <Suspense fallback={<FullPageSpinner />}>
              <AdminLayout />
            </Suspense>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="urunler" element={<AdminProductsPage />} />
          <Route path="kategoriler" element={<AdminCategoriesPage />} />
          <Route path="kullanicilar" element={<AdminUsersPage />} />
          <Route path="api-anahtarlari" element={<AdminApiKeysPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
)
