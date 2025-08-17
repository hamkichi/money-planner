import React from 'react'
import { Goal } from '../../../types/financial'
import { formatCurrency, formatDate, getGoalCategoryLabel, getPriorityLabel } from '../../../utils/formatters'
import { GOAL_CATEGORIES, PRIORITIES } from '../../../data/constants'
import GlassCard from '../../ui/GlassCard'
import ProgressBar from '../../ui/ProgressBar'
import Button from '../../ui/Button'

interface GoalCardProps {
  goal: Goal
  onEdit: (goal: Goal) => void
  onDelete: (goalId: string) => void
  onCreatePlan: (goal: Goal) => void
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit, onDelete, onCreatePlan }) => {
  const progress = (goal.currentAmount / goal.targetAmount) * 100
  const remainingAmount = goal.targetAmount - goal.currentAmount
  const remainingDays = Math.ceil((goal.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  
  const categoryInfo = GOAL_CATEGORIES.find(cat => cat.value === goal.category)
  const priorityInfo = PRIORITIES.find(pri => pri.value === goal.priority)
  
  const getStatusColor = () => {
    if (progress >= 100) return 'text-green-600 dark:text-green-400'
    if (remainingDays < 30) return 'text-red-600 dark:text-red-400'
    if (remainingDays < 90) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-blue-600 dark:text-blue-400'
  }

  const getStatusText = () => {
    if (progress >= 100) return '達成済み'
    if (remainingDays < 0) return '期限超過'
    if (remainingDays < 30) return '期限迫る'
    return '進行中'
  }

  return (
    <GlassCard className="hover-lift transition-glass">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{categoryInfo?.icon}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {goal.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getGoalCategoryLabel(goal.category)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${priorityInfo?.color === 'red' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : ''}
            ${priorityInfo?.color === 'yellow' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' : ''}
            ${priorityInfo?.color === 'green' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : ''}
          `}>
            {getPriorityLabel(goal.priority)}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()} bg-current bg-opacity-10`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <ProgressBar
          current={goal.currentAmount}
          target={goal.targetAmount}
          label="進捗状況"
          showPercentage={true}
        />

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">目標金額</p>
            <p className="font-semibold text-gray-800 dark:text-white">
              {formatCurrency(goal.targetAmount)}
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">残り金額</p>
            <p className="font-semibold text-gray-800 dark:text-white">
              {formatCurrency(remainingAmount)}
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">達成予定日</p>
            <p className="font-semibold text-gray-800 dark:text-white">
              {formatDate(goal.deadline)}
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">残り日数</p>
            <p className={`font-semibold ${getStatusColor()}`}>
              {remainingDays < 0 ? '期限超過' : `${remainingDays}日`}
            </p>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            size="sm"
            variant="primary"
            onClick={() => onCreatePlan(goal)}
            className="flex-1"
          >
            計画作成
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onEdit(goal)}
            className="flex-1"
          >
            編集
          </Button>
          <button
            onClick={() => onDelete(goal.id)}
            className="px-3 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            title="削除"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </GlassCard>
  )
}

export default GoalCard