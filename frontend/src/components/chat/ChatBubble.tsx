import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

interface ChatBubbleProps {
  role: 'user' | 'assistant'
  children: ReactNode
  className?: string
}

export const ChatBubble = ({ role, children, className }: ChatBubbleProps) => {
  const isUser = role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className={cn('flex gap-2.5', isUser ? 'justify-end' : 'justify-start', className)}
    >
      {!isUser && (
        <span className="gradient-brand mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl text-white shadow-glow">
          <Sparkles className="size-4" />
        </span>
      )}

      <div
        className={cn(
          'max-w-[85ch] min-w-0 rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'gradient-brand rounded-br-md text-white shadow-glow'
            : 'surface rounded-bl-md text-ink-800',
        )}
      >
        {children}
      </div>
    </motion.div>
  )
}

/** Cevap beklenirken gösterilen üç nokta animasyonu. */
export const ChatTyping = () => (
  <ChatBubble role="assistant">
    <span className="flex items-center gap-1.5 py-0.5" role="status" aria-label="Yanıt hazırlanıyor">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-2 rounded-full bg-brand-400"
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.16, ease: 'easeInOut' }}
        />
      ))}
    </span>
  </ChatBubble>
)
