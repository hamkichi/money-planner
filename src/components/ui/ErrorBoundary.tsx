import React, { Component, ErrorInfo, ReactNode } from 'react'
import GlassCard from './GlassCard'
import Button from './Button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
          <GlassCard className="max-w-lg mx-auto text-center">
            <div className="text-6xl mb-4">😵</div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              エラーが発生しました
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              申し訳ございません。予期しないエラーが発生しました。
              ページを再読み込みするか、しばらく時間をおいてから再度お試しください。
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 mb-2">
                  エラー詳細 (開発者向け)
                </summary>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-sm font-mono text-red-700 dark:text-red-300 overflow-auto">
                  <div className="mb-2">
                    <strong>エラー:</strong> {this.state.error.message}
                  </div>
                  <div>
                    <strong>スタック:</strong>
                    <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                  </div>
                </div>
              </details>
            )}

            <div className="flex gap-4">
              <Button variant="secondary" onClick={this.handleReset} className="flex-1">
                再試行
              </Button>
              <Button variant="primary" onClick={this.handleReload} className="flex-1">
                ページ再読み込み
              </Button>
            </div>
          </GlassCard>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary