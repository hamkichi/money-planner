import React from 'react'

export interface ProgressBarProps {
  current: number
  target: number
  label?: string
  showPercentage?: boolean
  className?: string
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  target,
  label,
  showPercentage = true,
  className = '',
}) => {
  const percentage = Math.min((current / target) * 100, 100)
  const isComplete = current >= target

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
          {showPercentage && (
            <span className="text-gray-500 dark:text-gray-400">
              {percentage.toFixed(1)}%
            </span>
          )}
        </div>
      )}
      
      <div className="glass-progress-bg">
        <div
          className={`
            glass-progress-fill transition-all duration-500 ease-out
            ${isComplete ? 'animate-pulse-gentle' : ''}
          `.trim()}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>¥{current.toLocaleString()}</span>
        <span>¥{target.toLocaleString()}</span>
      </div>
    </div>
  )
}

export default ProgressBar