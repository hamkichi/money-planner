import React from 'react'
import Header from './components/layout/Header'
import Dashboard from './components/features/Dashboard'
import ErrorBoundary from './components/ui/ErrorBoundary'
import { ToastContainer } from './components/ui/Toast'
import { useToast } from './hooks/useToast'

function App() {
  const { messages, removeToast } = useToast()

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Dashboard />
        </main>
        <ToastContainer messages={messages} onRemove={removeToast} />
      </div>
    </ErrorBoundary>
  )
}

export default App