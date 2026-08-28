import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BottomNav } from './BottomNav'
import { Header } from './Header'

export const AppLayout = () => {
  const location = useLocation()

  return (
    <div className="flex min-h-dvh flex-col bg-ink-50">
      <Header />
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 pb-24 md:pb-12"
      >
        <Outlet />
      </motion.main>
      <BottomNav />
    </div>
  )
}
