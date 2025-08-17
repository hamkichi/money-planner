import { STORAGE_KEYS } from '../data/constants'

/**
 * ローカルストレージのデータをクリア（開発・デバッグ用）
 */
export const clearAllStorageData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key)
  })
  console.log('All storage data cleared')
}

/**
 * 古いフォーマットのデータを新しいフォーマットに移行
 */
export const migrateStorageData = () => {
  try {
    const goalsData = localStorage.getItem(STORAGE_KEYS.goals)
    if (goalsData) {
      const goals = JSON.parse(goalsData)
      
      // Date文字列をDateオブジェクトに変換
      const migratedGoals = goals.map((goal: any) => ({
        ...goal,
        deadline: new Date(goal.deadline),
        createdAt: new Date(goal.createdAt),
        updatedAt: new Date(goal.updatedAt)
      }))
      
      localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(migratedGoals))
      console.log('Storage data migrated successfully')
    }
  } catch (error) {
    console.error('Error migrating storage data:', error)
  }
}

/**
 * データの整合性をチェック
 */
export const validateStorageData = () => {
  try {
    const goalsData = localStorage.getItem(STORAGE_KEYS.goals)
    if (goalsData) {
      const goals = JSON.parse(goalsData)
      
      const isValid = goals.every((goal: any) => {
        return (
          goal.id &&
          goal.title &&
          typeof goal.targetAmount === 'number' &&
          typeof goal.currentAmount === 'number' &&
          goal.deadline &&
          goal.category &&
          goal.priority
        )
      })
      
      if (!isValid) {
        console.warn('Invalid goal data detected in storage')
        return false
      }
    }
    
    return true
  } catch (error) {
    console.error('Error validating storage data:', error)
    return false
  }
}