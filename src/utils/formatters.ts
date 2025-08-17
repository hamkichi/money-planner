/**
 * 数値を日本円形式でフォーマット
 * @param amount 金額
 * @param showCurrency 通貨記号を表示するか
 */
export const formatCurrency = (amount: number, showCurrency = true): string => {
  const formatted = new Intl.NumberFormat('ja-JP').format(Math.round(amount))
  return showCurrency ? `¥${formatted}` : formatted
}

/**
 * 数値を短縮形式でフォーマット（万、億など）
 * @param amount 金額
 */
export const formatCurrencyShort = (amount: number): string => {
  if (amount >= 100000000) { // 1億以上
    return `¥${(amount / 100000000).toFixed(1)}億`
  } else if (amount >= 10000) { // 1万以上
    return `¥${(amount / 10000).toFixed(1)}万`
  } else {
    return formatCurrency(amount)
  }
}

/**
 * パーセンテージをフォーマット
 * @param value 小数点表記の値（0.05 = 5%）
 * @param decimals 小数点以下の桁数
 */
export const formatPercentage = (value: number, decimals = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * 日付をフォーマット
 * @param date 日付
 * @param format フォーマット形式
 */
export const formatDate = (
  date: Date | string, 
  format: 'short' | 'long' | 'relative' = 'short'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    case 'long':
      return dateObj.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      })
    case 'relative':
      return formatRelativeDate(dateObj)
    default:
      return dateObj.toLocaleDateString('ja-JP')
  }
}

/**
 * 相対的な日付をフォーマット
 * @param date 日付
 */
export const formatRelativeDate = (date: Date): string => {
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return '今日'
  } else if (diffDays === 1) {
    return '明日'
  } else if (diffDays === -1) {
    return '昨日'
  } else if (diffDays > 0 && diffDays <= 30) {
    return `${diffDays}日後`
  } else if (diffDays < 0 && diffDays >= -30) {
    return `${Math.abs(diffDays)}日前`
  } else if (diffDays > 30) {
    const months = Math.floor(diffDays / 30)
    if (months === 1) {
      return '1ヶ月後'
    } else if (months <= 12) {
      return `${months}ヶ月後`
    } else {
      const years = Math.floor(months / 12)
      return `${years}年後`
    }
  } else {
    const months = Math.floor(Math.abs(diffDays) / 30)
    if (months === 1) {
      return '1ヶ月前'
    } else if (months <= 12) {
      return `${months}ヶ月前`
    } else {
      const years = Math.floor(months / 12)
      return `${years}年前`
    }
  }
}

/**
 * 期間をフォーマット
 * @param months 月数
 */
export const formatDuration = (months: number): string => {
  if (months < 12) {
    return `${months}ヶ月`
  } else {
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    
    if (remainingMonths === 0) {
      return `${years}年`
    } else {
      return `${years}年${remainingMonths}ヶ月`
    }
  }
}

/**
 * 大きな数値を読みやすい形式にフォーマット
 * @param num 数値
 */
export const formatLargeNumber = (num: number): string => {
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B`
  } else if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  } else {
    return num.toString()
  }
}

/**
 * 目標カテゴリの日本語ラベルを取得
 * @param category カテゴリ
 */
export const getGoalCategoryLabel = (category: string): string => {
  const labels: { [key: string]: string } = {
    house: '住宅購入',
    car: '車購入',
    education: '教育資金',
    travel: '旅行',
    retirement: '老後資金',
    emergency: '緊急時資金',
    other: 'その他'
  }
  return labels[category] || category
}

/**
 * リスクレベルの日本語ラベルを取得
 * @param level リスクレベル
 */
export const getRiskLevelLabel = (level: string): string => {
  const labels: { [key: string]: string } = {
    low: '低リスク',
    medium: '中リスク',
    high: '高リスク'
  }
  return labels[level] || level
}

/**
 * 優先度の日本語ラベルを取得
 * @param priority 優先度
 */
export const getPriorityLabel = (priority: string): string => {
  const labels: { [key: string]: string } = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return labels[priority] || priority
}

/**
 * 数値を小数点以下指定桁数でフォーマット
 * @param num 数値
 * @param decimals 小数点以下の桁数
 */
export const formatDecimal = (num: number, decimals = 2): string => {
  return num.toFixed(decimals)
}

/**
 * ファイルサイズをフォーマット
 * @param bytes バイト数
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}