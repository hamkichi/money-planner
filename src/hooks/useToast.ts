import { useState, useCallback } from 'react'
import { ToastMessage } from '../types/ui'

export const useToast = () => {
  const [messages, setMessages] = useState<ToastMessage[]>([])

  const addToast = useCallback((
    message: string, 
    type: ToastMessage['type'] = 'info', 
    duration?: number
  ) => {
    const id = crypto.randomUUID()
    const newMessage: ToastMessage = {
      id,
      message,
      type,
      duration
    }

    setMessages(prev => [...prev, newMessage])
    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setMessages([])
  }, [])

  const success = useCallback((message: string, duration?: number) => {
    return addToast(message, 'success', duration)
  }, [addToast])

  const error = useCallback((message: string, duration?: number) => {
    return addToast(message, 'error', duration)
  }, [addToast])

  const warning = useCallback((message: string, duration?: number) => {
    return addToast(message, 'warning', duration)
  }, [addToast])

  const info = useCallback((message: string, duration?: number) => {
    return addToast(message, 'info', duration)
  }, [addToast])

  return {
    messages,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info
  }
}