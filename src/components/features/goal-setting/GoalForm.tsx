import React, { useState } from 'react'
import { Goal, GoalCategory } from '../../../types/financial'
import { GOAL_CATEGORIES, PRIORITIES } from '../../../data/constants'
import { validateAmount, validateFutureDate, validateRequired } from '../../../utils/validators'
import { formatCurrency } from '../../../utils/formatters'
import { useToast } from '../../../hooks/useToast'
import GlassCard from '../../ui/GlassCard'
import Button from '../../ui/Button'
import Input from '../../ui/Input'

interface GoalFormProps {
  goal?: Goal
  onSubmit: (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

const GoalForm: React.FC<GoalFormProps> = ({ goal, onSubmit, onCancel }) => {
  const { success, error } = useToast()
  
  const [formData, setFormData] = useState({
    title: goal?.title || '',
    targetAmount: goal?.targetAmount?.toString() || '',
    currentAmount: goal?.currentAmount?.toString() || '',
    deadline: goal?.deadline ? goal.deadline.toISOString().split('T')[0] : '',
    category: goal?.category || 'other' as GoalCategory,
    priority: goal?.priority || 'medium' as const
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    // Title validation
    const titleError = validateRequired(formData.title)
    if (titleError) newErrors.title = titleError

    // Target amount validation
    const targetAmountError = validateAmount(formData.targetAmount)
    if (targetAmountError) newErrors.targetAmount = targetAmountError

    // Current amount validation
    const currentAmountError = validateAmount(formData.currentAmount)
    if (currentAmountError) newErrors.currentAmount = currentAmountError

    // Deadline validation
    const deadlineError = validateFutureDate(formData.deadline)
    if (deadlineError) newErrors.deadline = deadlineError

    // Additional validations
    const targetAmount = parseFloat(formData.targetAmount)
    const currentAmount = parseFloat(formData.currentAmount)

    if (!isNaN(targetAmount) && !isNaN(currentAmount) && targetAmount <= currentAmount) {
      newErrors.targetAmount = '目標金額は現在の金額より大きく設定してください'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit({
        title: formData.title,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount),
        deadline: new Date(formData.deadline),
        category: formData.category,
        priority: formData.priority
      })
      
      success(goal ? '目標が更新されました' : '目標が作成されました')
    } catch (err) {
      console.error('Failed to save goal:', err)
      error('目標の保存に失敗しました。もう一度お試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  const targetAmount = parseFloat(formData.targetAmount) || 0
  const currentAmount = parseFloat(formData.currentAmount) || 0
  const remainingAmount = targetAmount - currentAmount

  return (
    <GlassCard className="max-w-2xl mx-auto w-full">
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        <div className="text-center mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {goal ? '目標を編集' : '新しい目標を作成'}
          </h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
            達成したい目標の詳細を入力してください
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="md:col-span-2">
            <Input
              label="目標名"
              placeholder="例：マイホーム購入"
              value={formData.title}
              onChange={(value) => handleInputChange('title', value)}
              error={errors.title}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              カテゴリ <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="glass-input w-full"
            >
              {GOAL_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.icon} {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              優先度 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className="glass-input w-full"
            >
              {PRIORITIES.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Input
              label="目標金額"
              type="number"
              placeholder="5000000"
              value={formData.targetAmount}
              onChange={(value) => handleInputChange('targetAmount', value)}
              error={errors.targetAmount}
              prefix="¥"
              required
            />
          </div>

          <div>
            <Input
              label="現在の金額"
              type="number"
              placeholder="500000"
              value={formData.currentAmount}
              onChange={(value) => handleInputChange('currentAmount', value)}
              error={errors.currentAmount}
              prefix="¥"
              required
            />
          </div>

          <div className="md:col-span-2">
            <Input
              label="達成予定日"
              type="date"
              value={formData.deadline}
              onChange={(value) => handleInputChange('deadline', value)}
              error={errors.deadline}
              required
            />
          </div>
        </div>

        {targetAmount > 0 && currentAmount >= 0 && (
          <GlassCard variant="secondary" className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              目標サマリー
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">目標金額</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(targetAmount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">現在の金額</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(currentAmount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">必要金額</p>
                <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  {formatCurrency(remainingAmount)}
                </p>
              </div>
            </div>
          </GlassCard>
        )}

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 md:pt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="flex-1 order-2 sm:order-1"
            size="md"
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            className="flex-1 order-1 sm:order-2"
            size="md"
          >
            {goal ? '更新' : '作成'}
          </Button>
        </div>
      </form>
    </GlassCard>
  )
}

export default GoalForm