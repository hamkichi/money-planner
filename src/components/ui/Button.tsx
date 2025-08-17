import React from 'react'

export interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'accent'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
}) => {
  const variantClasses = {
    primary: 'glass-button-primary',
    secondary: 'glass-button-secondary',
    accent: 'glass-button-accent'
  }

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  const baseClasses = `
    glass-button
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
    ${loading ? 'pointer-events-none' : ''}
    ${className}
  `.trim()

  return (
    <button
      type={type}
      className={baseClasses}
      onClick={onClick}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-label={loading ? '読み込み中' : undefined}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" 
            role="status"
            aria-hidden="true"
          />
          <span>読み込み中...</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}

export default Button