import { Goal } from '../types/financial'

/**
 * オブジェクトの日付文字列をDateオブジェクトに変換
 */
export const ensureGoalDates = (goal: any): Goal => {
  return {
    ...goal,
    deadline: goal.deadline instanceof Date ? goal.deadline : new Date(goal.deadline),
    createdAt: goal.createdAt instanceof Date ? goal.createdAt : new Date(goal.createdAt),
    updatedAt: goal.updatedAt instanceof Date ? goal.updatedAt : new Date(goal.updatedAt)
  }
}

/**
 * 目標配列の日付データを確実にDateオブジェクトに変換
 */
export const ensureGoalArrayDates = (goals: any[]): Goal[] => {
  return goals.map(ensureGoalDates)
}

/**
 * 安全な日付変換（エラーハンドリング付き）
 */
export const safeParseDate = (dateValue: any, fallback?: Date): Date => {
  try {
    if (dateValue instanceof Date) {
      return dateValue
    }
    if (typeof dateValue === 'string' || typeof dateValue === 'number') {
      const parsed = new Date(dateValue)
      if (isNaN(parsed.getTime())) {
        throw new Error('Invalid date')
      }
      return parsed
    }
    return fallback || new Date()
  } catch (error) {
    console.warn('Failed to parse date:', dateValue, error)
    return fallback || new Date()
  }
}

/**
 * ローカルストレージから安全にGoalデータを取得
 */
export const safeGetGoalsFromStorage = (storageKey: string): Goal[] => {
  try {
    const stored = localStorage.getItem(storageKey)
    if (!stored) return []
    
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    
    return parsed.map(goal => ({
      ...goal,
      deadline: safeParseDate(goal.deadline),
      createdAt: safeParseDate(goal.createdAt),
      updatedAt: safeParseDate(goal.updatedAt)
    }))
  } catch (error) {
    console.error('Error loading goals from storage:', error)
    return []
  }
}