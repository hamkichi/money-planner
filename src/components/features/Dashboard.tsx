import React, { useState, useEffect } from 'react'
import { Goal } from '../../types/financial'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useToast } from '../../hooks/useToast'
import { STORAGE_KEYS } from '../../data/constants'
import { validateStorageData, clearAllStorageData } from '../../utils/storage'
import { safeGetGoalsFromStorage } from '../../utils/dataTransformers'
import GoalList from './goal-setting/GoalList'
import GoalForm from './goal-setting/GoalForm'
import InvestmentPlanForm from './investment-plan/InvestmentPlanForm'
import Modal from '../ui/Modal'
import GlassCard from '../ui/GlassCard'
import { formatCurrency } from '../../utils/formatters'

const Dashboard: React.FC = () => {
  // より安全な初期化を試行
  const [goals, setGoals] = useState<Goal[]>(() => {
    try {
      return safeGetGoalsFromStorage(STORAGE_KEYS.goals)
    } catch (error) {
      console.error('Error initializing goals:', error)
      return []
    }
  })
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>()
  const [showInvestmentPlan, setShowInvestmentPlan] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | undefined>()
  const { success, error, info } = useToast()

  // ゴールの変更をローカルストレージに保存
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(goals))
    } catch (err) {
      console.error('Error saving goals to storage:', err)
    }
  }, [goals])

  // データの整合性をチェックし、問題がある場合はクリア
  useEffect(() => {
    if (!validateStorageData()) {
      console.warn('Invalid storage data detected, clearing storage...')
      clearAllStorageData()
      error('データに問題があったため、リセットしました')
      setGoals([])
    }
  }, [])

  // 開発環境でのデバッグ機能
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // グローバルにデバッグ関数を追加
      (window as any).clearStorage = clearAllStorageData
      console.log('Debug: clearStorage() function available in console')
    }
  }, [])

  const handleCreateGoal = () => {
    setEditingGoal(undefined)
    setShowGoalForm(true)
  }

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal)
    setShowGoalForm(true)
  }

  const handleSaveGoal = (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date()
    
    if (editingGoal) {
      // Update existing goal
      setGoals(prev => prev.map(goal => 
        goal.id === editingGoal.id 
          ? { 
              ...goalData, 
              id: editingGoal.id, 
              createdAt: editingGoal.createdAt,
              updatedAt: now 
            }
          : goal
      ))
    } else {
      // Create new goal
      const newGoal: Goal = {
        ...goalData,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now
      }
      setGoals(prev => [...prev, newGoal])
    }
    
    setShowGoalForm(false)
    setEditingGoal(undefined)
  }

  const handleDeleteGoal = (goalId: string) => {
    if (confirm('この目標を削除してもよろしいですか？')) {
      try {
        const goalToDelete = goals.find(goal => goal.id === goalId)
        setGoals(prev => prev.filter(goal => goal.id !== goalId))
        success(`目標「${goalToDelete?.title}」が削除されました`)
      } catch (err) {
        error('目標の削除に失敗しました')
      }
    }
  }

  const handleCreatePlan = (goal: Goal) => {
    setSelectedGoal(goal)
    setShowInvestmentPlan(true)
  }

  const handleCloseForm = () => {
    setShowGoalForm(false)
    setEditingGoal(undefined)
  }

  const handleCloseInvestmentPlan = () => {
    setShowInvestmentPlan(false)
    setSelectedGoal(undefined)
  }

  // Calculate dashboard statistics
  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const totalRemainingAmount = totalTargetAmount - totalCurrentAmount
  const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0

  const activeGoals = goals.filter(goal => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100
    return progress < 100 && goal.deadline >= new Date()
  })

  const completedGoals = goals.filter(goal => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100
    return progress >= 100
  })

  const overdueGoals = goals.filter(goal => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100
    return progress < 100 && goal.deadline < new Date()
  })

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
          Money Planner
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          あなたの夢を実現するための資金計画ツール
        </p>
      </div>

      {/* Overview Cards */}
      {goals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard className="text-center">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">総目標金額</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(totalTargetAmount)}
            </p>
          </GlassCard>

          <GlassCard className="text-center">
            <div className="text-3xl mb-2">📈</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">現在の合計金額</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalCurrentAmount)}
            </p>
          </GlassCard>

          <GlassCard className="text-center">
            <div className="text-3xl mb-2">🎯</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">残り必要金額</p>
            <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
              {formatCurrency(totalRemainingAmount)}
            </p>
          </GlassCard>

          <GlassCard className="text-center">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">全体進捗率</p>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {overallProgress.toFixed(1)}%
            </p>
          </GlassCard>
        </div>
      )}

      {/* Quick Stats */}
      {goals.length > 0 && (
        <GlassCard>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            目標ステータス
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {activeGoals.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">進行中の目標</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {completedGoals.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">達成済み目標</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {overdueGoals.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">期限超過目標</p>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Goals Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            あなたの目標
          </h2>
        </div>

        <GoalList
          goals={goals}
          onEdit={handleEditGoal}
          onDelete={handleDeleteGoal}
          onCreatePlan={handleCreatePlan}
          onCreateNew={handleCreateGoal}
        />
      </div>

      {/* Goal Form Modal */}
      <Modal
        isOpen={showGoalForm}
        onClose={handleCloseForm}
        size="lg"
      >
        <GoalForm
          goal={editingGoal}
          onSubmit={handleSaveGoal}
          onCancel={handleCloseForm}
        />
      </Modal>

      {/* Investment Plan Modal */}
      <Modal
        isOpen={showInvestmentPlan}
        onClose={handleCloseInvestmentPlan}
        size="2xl"
        closeOnOverlayClick={false}
      >
        {selectedGoal && (
          <InvestmentPlanForm
            goal={selectedGoal}
            onClose={handleCloseInvestmentPlan}
          />
        )}
      </Modal>
    </div>
  )
}

export default Dashboard