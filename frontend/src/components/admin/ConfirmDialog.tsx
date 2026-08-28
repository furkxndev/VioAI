import { Button, Modal } from '@/components/ui'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  isLoading?: boolean
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Sil',
  isLoading = false,
}: ConfirmDialogProps) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    size="sm"
    title={title}
    footer={
      <div className="flex gap-3">
        <Button variant="outline" fullWidth onClick={onClose}>
          Vazgeç
        </Button>
        <Button variant="danger" fullWidth isLoading={isLoading} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    }
  >
    <p className="text-sm text-ink-600">{message}</p>
  </Modal>
)
