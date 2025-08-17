import React, { useEffect, useState } from 'react'
import { ToastMessage } from '../../types/ui'

interface ToastProps {
  message: ToastMessage
  onRemove: (id: string) => void
}

const Toast: React.FC<ToastProps> = ({ message, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onRemove(message.id), 300) // Wait for fade out animation
    }, message.duration || 5000)

    return () => clearTimeout(timer)
  }, [message, onRemove])

  const getToastStyles = () => {
    const baseStyles = 'glass-effect px-4 py-3 rounded-lg shadow-lg max-w-sm w-full transition-all duration-300 transform'
    
    const typeStyles = {
      success: 'border-l-4 border-green-500 bg-green-50/80 dark:bg-green-900/20',
      error: 'border-l-4 border-red-500 bg-red-50/80 dark:bg-red-900/20',
      warning: 'border-l-4 border-yellow-500 bg-yellow-50/80 dark:bg-yellow-900/20',
      info: 'border-l-4 border-blue-500 bg-blue-50/80 dark:bg-blue-900/20'
    }

    const visibilityStyles = isVisible 
      ? 'translate-x-0 opacity-100' 
      : 'translate-x-full opacity-0'

    return `${baseStyles} ${typeStyles[message.type]} ${visibilityStyles}`
  }

  const getIcon = () => {
    const icons = {
      success: '✅',
      error: '❌', 
      warning: '⚠️',
      info: 'ℹ️'
    }
    return icons[message.type]
  }

  const getTextColor = () => {
    const colors = {
      success: 'text-green-800 dark:text-green-200',
      error: 'text-red-800 dark:text-red-200',
      warning: 'text-yellow-800 dark:text-yellow-200',
      info: 'text-blue-800 dark:text-blue-200'
    }
    return colors[message.type]
  }

  return (
    <div 
      className={getToastStyles()}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center space-x-3">
        <span className="text-lg" aria-hidden="true">
          {getIcon()}
        </span>
        <p className={`flex-1 text-sm font-medium ${getTextColor()}`}>
          {message.message}
        </p>
        <button
          onClick={() => onRemove(message.id)}
          className={`text-lg hover:opacity-70 transition-opacity ${getTextColor()}`}
          aria-label="通知を閉じる"
        >
          ×
        </button>
      </div>
    </div>
  )
}

interface ToastContainerProps {
  messages: ToastMessage[]
  onRemove: (id: string) => void
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ messages, onRemove }) => {
  return (
    <div 
      className="fixed top-4 right-4 z-50 space-y-2"
      aria-live="polite"
      aria-label="通知"
    >
      {messages.map((message) => (
        <Toast key={message.id} message={message} onRemove={onRemove} />
      ))}
    </div>
  )
}

export default Toast