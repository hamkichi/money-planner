import React, { useState } from 'react'
import { Goal } from '../../../types/financial'
import { GOAL_CATEGORIES, PRIORITIES } from '../../../data/constants'
import GoalCard from './GoalCard'
import Button from '../../ui/Button'
import GlassCard from '../../ui/GlassCard'

interface GoalListProps {
  goals: Goal[]
  onEdit: (goal: Goal) => void
  onDelete: (goalId: string) => void
  onCreatePlan: (goal: Goal) => void
  onCreateNew: () => void
}

type SortBy = 'deadline' | 'priority' | 'progress' | 'amount'
type FilterBy = 'all' | 'active' | 'completed' | 'overdue'

const GoalList: React.FC<GoalListProps> = ({
  goals,
  onEdit,
  onDelete,
  onCreatePlan,
  onCreateNew
}) => {
  const [sortBy, setSortBy] = useState<SortBy>('deadline')
  const [filterBy, setFilterBy] = useState<FilterBy>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredAndSortedGoals = React.useMemo(() => {
    let filtered = [...goals]

    // Apply filters
    if (filterBy !== 'all') {
      const now = new Date()
      filtered = filtered.filter(goal => {
        const progress = (goal.currentAmount / goal.targetAmount) * 100
        const isOverdue = goal.deadline < now
        
        switch (filterBy) {
          case 'active':
            return progress < 100 && !isOverdue
          case 'completed':
            return progress >= 100
          case 'overdue':
            return isOverdue && progress < 100
          default:
            return true
        }
      })
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(goal => goal.category === selectedCategory)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          return a.deadline.getTime() - b.deadline.getTime()
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case 'progress':
          const progressA = (a.currentAmount / a.targetAmount) * 100
          const progressB = (b.currentAmount / b.targetAmount) * 100
          return progressB - progressA
        case 'amount':
          return b.targetAmount - a.targetAmount
        default:
          return 0
      }
    })

    return filtered
  }, [goals, sortBy, filterBy, selectedCategory])

  if (goals.length === 0) {
    return (
      <GlassCard className="text-center py-12">
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          目標がまだありません
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          最初の目標を作成して、資金計画を始めましょう
        </p>
        <Button variant="primary" onClick={onCreateNew}>
          目標を作成
        </Button>
      </GlassCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters and Sorting */}
      <GlassCard>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                フィルター
              </label>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as FilterBy)}
                className="glass-input text-sm"
              >
                <option value="all">すべて</option>
                <option value="active">進行中</option>
                <option value="completed">達成済み</option>
                <option value="overdue">期限超過</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                カテゴリ
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="glass-input text-sm"
              >
                <option value="all">すべてのカテゴリ</option>
                {GOAL_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                並び順
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="glass-input text-sm"
              >
                <option value="deadline">期限順</option>
                <option value="priority">優先度順</option>
                <option value="progress">進捗順</option>
                <option value="amount">金額順</option>
              </select>
            </div>
          </div>

          <Button variant="primary" onClick={onCreateNew}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新しい目標
          </Button>
        </div>
      </GlassCard>

      {/* Goals Summary */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          目標サマリー ({filteredAndSortedGoals.length}件)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {goals.filter(goal => (goal.currentAmount / goal.targetAmount) < 1).length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">進行中</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {goals.filter(goal => (goal.currentAmount / goal.targetAmount) >= 1).length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">達成済み</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {goals.filter(goal => goal.deadline < new Date() && (goal.currentAmount / goal.targetAmount) < 1).length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">期限超過</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {goals.filter(goal => goal.priority === 'high').length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">高優先度</p>
          </div>
        </div>
      </GlassCard>

      {/* Goals Grid */}
      {filteredAndSortedGoals.length === 0 ? (
        <GlassCard className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">
            指定した条件に一致する目標がありません
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedGoals.map((goal, index) => (
            <div key={goal.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <GoalCard
                goal={goal}
                onEdit={onEdit}
                onDelete={onDelete}
                onCreatePlan={onCreatePlan}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default GoalList