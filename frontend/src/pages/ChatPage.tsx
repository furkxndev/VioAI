import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp, MessageCircleQuestion, Sparkles } from 'lucide-react'
import { PageContainer, PageHeader } from '@/components/layout'
import { ChatBubble, ChatSuggestionCard, ChatTyping, ChatUnderstoodChips } from '@/components/chat'
import { Button, Textarea } from '@/components/ui'
import { useChatAsk } from '@/hooks/use-chat'
import type { ChatAnswer } from '@/types'

/** Kullanıcıya fikir vermek için hazır sorular. */
const ORNEK_SORULAR = [
  'Yarın hava yağmurlu, 3 yaşındaki çocuğumla Antalya’da nereye gidebilirim?',
  'İstanbul’da el işi yapabileceğim bir yer arıyorum',
  'Bu cumartesi İzmir’de tarihle ilgili ne gezebilirim?',
  'Antalya’da adrenalin dolu bir şey istiyorum',
]

interface UserMessage {
  kind: 'user'
  id: string
  text: string
}

interface AssistantMessage {
  kind: 'assistant'
  id: string
  answer: ChatAnswer
}

interface ErrorMessage {
  kind: 'error'
  id: string
  text: string
}

type Message = UserMessage | AssistantMessage | ErrorMessage

const yeniId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`

export const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const { mutateAsync, isPending } = useChatAsk()
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Yeni mesaj geldiğinde sohbetin sonuna kaydır.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isPending])

  const gonder = async (text: string): Promise<void> => {
    const temiz = text.trim()
    if (!temiz || isPending) return

    setMessages((onceki) => [...onceki, { kind: 'user', id: yeniId(), text: temiz }])
    setInput('')

    // Son sorunun şehrini bir sonraki soruya taşı: "peki ya çocukla?" gibi
    // devam sorularında kullanıcı şehri tekrar yazmak zorunda kalmasın.
    const sonSehir = [...messages]
      .reverse()
      .find((m): m is AssistantMessage => m.kind === 'assistant')?.answer.filters.city

    try {
      const answer = await mutateAsync({ message: temiz, ...(sonSehir ? { city: sonSehir } : {}) })
      setMessages((onceki) => [...onceki, { kind: 'assistant', id: yeniId(), answer }])
    } catch {
      setMessages((onceki) => [
        ...onceki,
        {
          kind: 'error',
          id: yeniId(),
          text: 'Şu anda cevap üretemedim. Birazdan tekrar dener misiniz?',
        },
      ])
    }
  }

  const onSubmit = (event: FormEvent): void => {
    event.preventDefault()
    void gonder(input)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
    // Enter gönderir, Shift+Enter satır atlar.
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void gonder(input)
    }
  }

  const bosDurum = messages.length === 0

  return (
    <PageContainer size="narrow" className="flex min-h-[calc(100vh-9rem)] flex-col">
      <PageHeader
        eyebrow="Yapay zekâ"
        title="Ne yapmak istediğinizi yazın"
        description="Şehri, havayı, kiminle gittiğinizi ya da ilgi alanınızı gündelik dille anlatın; size uygun Viofun aktivitelerini bulayım."
      />

      <div className="flex-1 space-y-4">
        {bosDurum && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="surface p-5"
          >
            <p className="flex items-center gap-2 text-sm font-semibold text-ink-800">
              <MessageCircleQuestion className="size-4 text-brand-500" />
              Şöyle sorabilirsiniz
            </p>
            <div className="mt-3 grid gap-2">
              {ORNEK_SORULAR.map((soru) => (
                <button
                  key={soru}
                  type="button"
                  onClick={() => void gonder(soru)}
                  className="rounded-xl border border-ink-200/80 bg-ink-50/60 px-3.5 py-2.5 text-left text-sm text-ink-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-ink-900"
                >
                  {soru}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((message) => {
            if (message.kind === 'user') {
              return (
                <ChatBubble key={message.id} role="user">
                  {message.text}
                </ChatBubble>
              )
            }

            if (message.kind === 'error') {
              return (
                <ChatBubble key={message.id} role="assistant" className="[&_*]:text-red-700">
                  {message.text}
                </ChatBubble>
              )
            }

            const { answer } = message

            return (
              <div key={message.id} className="space-y-3">
                <ChatBubble role="assistant">
                  <ChatUnderstoodChips filters={answer.filters} weather={answer.weather} />
                  <div className="space-y-2 whitespace-pre-wrap">{answer.answer}</div>
                </ChatBubble>

                {answer.suggestions.length > 0 && (
                  <div className="ml-10.5 space-y-2">
                    {answer.suggestions.map((suggestion, index) => (
                      <ChatSuggestionCard
                        key={suggestion.id}
                        suggestion={suggestion}
                        index={index}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </AnimatePresence>

        {isPending && <ChatTyping />}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={onSubmit}
        className="sticky bottom-20 z-20 mt-5 md:bottom-4"
        aria-label="Soru gönder"
      >
        <div className="surface flex items-end gap-2 p-2 shadow-lift">
          <Textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Örn. yarın yağmurlu, çocuğumla İzmir’de nereye gidebilirim?"
            className="max-h-40 min-h-11 flex-1 resize-none border-0 bg-transparent px-2 py-2.5 focus:ring-0"
            disabled={isPending}
          />
          <Button
            type="submit"
            size="icon"
            isLoading={isPending}
            disabled={!input.trim() || isPending}
            aria-label="Gönder"
          >
            {!isPending && <ArrowUp className="size-4" />}
          </Button>
        </div>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[11px] text-ink-400">
          <Sparkles className="size-3" />
          Öneriler yalnızca Viofun kataloğundaki aktivitelerden seçilir.
        </p>
      </form>
    </PageContainer>
  )
}
