import { ValidationRule, FormErrors } from '../types/ui'

/**
 * 必須入力のバリデーション
 */
export const validateRequired = (value: any): string | null => {
  if (value === null || value === undefined || value === '') {
    return 'この項目は必須です'
  }
  return null
}

/**
 * 数値の最小値バリデーション
 */
export const validateMin = (value: number, min: number): string | null => {
  if (value < min) {
    return `${min}以上の値を入力してください`
  }
  return null
}

/**
 * 数値の最大値バリデーション
 */
export const validateMax = (value: number, max: number): string | null => {
  if (value > max) {
    return `${max}以下の値を入力してください`
  }
  return null
}

/**
 * 金額のバリデーション
 */
export const validateAmount = (amount: string | number): string | null => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(numAmount)) {
    return '有効な金額を入力してください'
  }
  
  if (numAmount < 0) {
    return '金額は0以上で入力してください'
  }
  
  if (numAmount > 999999999999) { // 99兆円まで
    return '金額が大きすぎます'
  }
  
  return null
}

/**
 * パーセンテージのバリデーション
 */
export const validatePercentage = (
  percentage: string | number, 
  min = 0, 
  max = 100
): string | null => {
  const numPercentage = typeof percentage === 'string' ? parseFloat(percentage) : percentage
  
  if (isNaN(numPercentage)) {
    return '有効なパーセンテージを入力してください'
  }
  
  if (numPercentage < min) {
    return `${min}%以上で入力してください`
  }
  
  if (numPercentage > max) {
    return `${max}%以下で入力してください`
  }
  
  return null
}

/**
 * 日付のバリデーション
 */
export const validateDate = (
  date: string | Date, 
  minDate?: Date, 
  maxDate?: Date
): string | null => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) {
    return '有効な日付を入力してください'
  }
  
  if (minDate && dateObj < minDate) {
    return `${minDate.toLocaleDateString('ja-JP')}以降の日付を入力してください`
  }
  
  if (maxDate && dateObj > maxDate) {
    return `${maxDate.toLocaleDateString('ja-JP')}以前の日付を入力してください`
  }
  
  return null
}

/**
 * 未来の日付のバリデーション
 */
export const validateFutureDate = (date: string | Date): string | null => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (dateObj <= today) {
    return '未来の日付を入力してください'
  }
  
  return null
}

/**
 * メールアドレスのバリデーション
 */
export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailRegex.test(email)) {
    return '有効なメールアドレスを入力してください'
  }
  
  return null
}

/**
 * 電話番号のバリデーション（日本の形式）
 */
export const validatePhoneNumber = (phone: string): string | null => {
  const phoneRegex = /^0\d{1,4}-\d{1,4}-\d{4}$|^0\d{9,10}$/
  
  if (!phoneRegex.test(phone)) {
    return '有効な電話番号を入力してください（例：090-1234-5678）'
  }
  
  return null
}

/**
 * ポートフォリオ配分のバリデーション
 */
export const validatePortfolioAllocation = (allocation: {
  stocks: number
  bonds: number
  cash: number
  others: number
}): string | null => {
  const total = allocation.stocks + allocation.bonds + allocation.cash + allocation.others
  
  if (Math.abs(total - 100) > 0.01) { // 小数点以下の誤差を考慮
    return 'ポートフォリオの合計は100%である必要があります'
  }
  
  return null
}

/**
 * フォームの包括的バリデーション
 */
export const validateForm = (
  formData: { [key: string]: any }, 
  rules: { [key: string]: ValidationRule[] }
): FormErrors => {
  const errors: FormErrors = {}
  
  Object.keys(rules).forEach(fieldName => {
    const fieldRules = rules[fieldName]
    const fieldValue = formData[fieldName]
    const fieldErrors: string[] = []
    
    fieldRules.forEach(rule => {
      let error: string | null = null
      
      switch (rule.type) {
        case 'required':
          error = validateRequired(fieldValue)
          break
        case 'min':
          if (typeof fieldValue === 'number') {
            error = validateMin(fieldValue, rule.value)
          }
          break
        case 'max':
          if (typeof fieldValue === 'number') {
            error = validateMax(fieldValue, rule.value)
          }
          break
        case 'pattern':
          if (typeof fieldValue === 'string') {
            const regex = new RegExp(rule.value)
            if (!regex.test(fieldValue)) {
              error = rule.message
            }
          }
          break
        case 'custom':
          if (rule.validator) {
            if (!rule.validator(fieldValue)) {
              error = rule.message
            }
          }
          break
      }
      
      if (error) {
        fieldErrors.push(error)
      }
    })
    
    if (fieldErrors.length > 0) {
      errors[fieldName] = fieldErrors
    }
  })
  
  return errors
}

/**
 * 金融計画の妥当性チェック
 */
export const validateFinancialPlan = (
  targetAmount: number,
  currentAmount: number,
  monthlyAmount: number,
  years: number
): string[] => {
  const errors: string[] = []
  
  if (targetAmount <= currentAmount) {
    errors.push('目標金額は現在の金額より大きい必要があります')
  }
  
  if (monthlyAmount <= 0) {
    errors.push('月次積立額は0より大きい必要があります')
  }
  
  if (years <= 0) {
    errors.push('期間は0より大きい必要があります')
  }
  
  if (years > 50) {
    errors.push('期間は50年以下で設定してください')
  }
  
  // 積立額が目標に対して現実的かチェック
  const requiredAmount = targetAmount - currentAmount
  const totalSavings = monthlyAmount * 12 * years
  
  if (totalSavings < requiredAmount * 0.5) {
    errors.push('現在の積立額では目標達成が困難です。積立額を増やすか期間を延ばしてください')
  }
  
  return errors
}

/**
 * 年利の妥当性チェック
 */
export const validateInterestRate = (rate: number, type: 'savings' | 'investment' | 'loan'): string | null => {
  switch (type) {
    case 'savings':
      if (rate < 0) return '金利は0%以上で入力してください'
      if (rate > 0.1) return '貯金の金利は10%以下で入力してください'
      break
    case 'investment':
      if (rate < -0.5) return '投資リターンは-50%以上で入力してください'
      if (rate > 0.5) return '投資リターンは50%以下で入力してください'
      break
    case 'loan':
      if (rate < 0) return 'ローン金利は0%以上で入力してください'
      if (rate > 0.2) return 'ローン金利は20%以下で入力してください'
      break
  }
  
  return null
}