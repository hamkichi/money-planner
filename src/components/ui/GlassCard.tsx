import React from 'react'

export interface GlassCardProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'accent' | 'default'
  blur?: 'light' | 'medium' | 'heavy'
  className?: string
  onClick?: () => void
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  blur = 'medium',
  className = '',
  onClick,
}) => {
  const variantClasses = {
    primary: 'glass-primary',
    secondary: 'glass-secondary', 
    accent: 'glass-accent',
    default: 'glass-effect'
  }

  const blurClasses = {
    light: 'blur-light',
    medium: 'blur-medium',
    heavy: 'blur-heavy'
  }

  const baseClasses = `
    glass-card
    ${variantClasses[variant]}
    ${blurClasses[blur]}
    ${onClick ? 'cursor-pointer hover-lift' : ''}
    ${className}
  `.trim()

  return (
    <div className={baseClasses} onClick={onClick}>
      {children}
    </div>
  )
}

export default GlassCard