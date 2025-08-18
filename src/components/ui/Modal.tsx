import React from 'react'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
  closeOnOverlayClick?: boolean // 外側クリックで閉じるかどうか
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = '',
  closeOnOverlayClick = true, // デフォルトは従来通り
}) => {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl'
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-overlay"
      onClick={closeOnOverlayClick ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div 
        className={`
          glass-modal w-full ${sizeClasses[size]} 
          max-h-[90vh] flex flex-col relative
          animate-scale-in ${className}
        `.trim()}
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        {/* 閉じるボタン - 常に表示 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 dark:bg-black/20 dark:hover:bg-black/30 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition-all duration-200 backdrop-blur-sm"
          aria-label="モーダルを閉じる"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {title && (
          <div className="flex items-center justify-between p-6 pr-16 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <h2 
              id="modal-title"
              className="text-xl font-semibold text-gray-800 dark:text-white"
            >
              {title}
            </h2>
          </div>
        )}
        
        <div className={`
          text-gray-700 dark:text-gray-300 flex-1 overflow-y-auto
          glass-modal-content
          ${title ? 'p-6' : 'p-6'} ${title ? 'pr-16' : 'pr-16'}
        `.trim()}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal