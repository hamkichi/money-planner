import { 
  InvestmentSimulation, 
  MonthlyInvestmentProjection, 
  InvestmentScenarios,
  InvestmentScenario,
  RiskProfile
} from '../types/financial'

/**
 * 積立投資で目標達成までの期間を計算
 * @param currentAmount 現在の金額
 * @param targetAmount 目標金額
 * @param monthlyInvestment 月次投資額
 * @param annualReturn 年利（小数点表記: 0.05 = 5%）
 */
export const calculateInvestmentPeriod = (
  currentAmount: number,
  targetAmount: number,
  monthlyInvestment: number,
  annualReturn: number
): number => {
  if (currentAmount >= targetAmount) return 0
  if (monthlyInvestment <= 0) return Infinity

  const monthlyReturn = annualReturn / 12
  const remainingAmount = targetAmount - currentAmount
  
  if (monthlyReturn === 0) {
    // 利回りが0の場合、単純計算
    return Math.ceil(remainingAmount / monthlyInvestment)
  }

  // 積立投資の将来価値計算（複利効果込み）
  // FV = PMT × (((1 + r)^n - 1) / r) + PV × (1 + r)^n
  // 目標: FV = targetAmount
  // 解く: n (期間)
  
  let months = 0
  let currentValue = currentAmount
  
  while (currentValue < targetAmount && months < 1200) { // 最大100年
    currentValue = currentValue * (1 + monthlyReturn) + monthlyInvestment
    months++
  }
  
  return months
}

/**
 * 投資シミュレーション全体を計算
 */
export const calculateInvestmentSimulation = (
  goalId: string,
  currentAmount: number,
  targetAmount: number,
  monthlyInvestment: number,
  annualReturn: number
): InvestmentSimulation => {
  const monthlyReturn = annualReturn / 12
  const projectedMonths = calculateInvestmentPeriod(
    currentAmount,
    targetAmount,
    monthlyInvestment,
    annualReturn
  )
  
  // 月次推移計算
  const monthlyProjections: MonthlyInvestmentProjection[] = []
  let cumulativeInvestment = 0
  let cumulativeReturns = 0
  let totalValue = currentAmount
  
  for (let month = 1; month <= Math.min(projectedMonths, 600); month++) {
    const monthlyReturn_amount = totalValue * monthlyReturn
    totalValue = totalValue * (1 + monthlyReturn) + monthlyInvestment
    
    cumulativeInvestment += monthlyInvestment
    cumulativeReturns += monthlyReturn_amount
    
    const progress = Math.min((totalValue / targetAmount) * 100, 100)
    
    monthlyProjections.push({
      month,
      monthlyInvestment,
      cumulativeInvestment: Math.round(cumulativeInvestment),
      monthlyReturn: Math.round(monthlyReturn_amount),
      cumulativeReturns: Math.round(cumulativeReturns),
      totalValue: Math.round(totalValue),
      progress: Math.round(progress * 100) / 100
    })
    
    if (totalValue >= targetAmount) break
  }
  
  // シナリオ分析
  const scenarios = calculateInvestmentScenarios(
    currentAmount,
    targetAmount,
    monthlyInvestment,
    annualReturn
  )
  
  const projectedCompletionDate = new Date()
  projectedCompletionDate.setMonth(projectedCompletionDate.getMonth() + projectedMonths)
  
  const totalInvested = projectedMonths * monthlyInvestment
  const finalValue = monthlyProjections[monthlyProjections.length - 1]?.totalValue || totalValue
  const totalReturns = finalValue - currentAmount - totalInvested
  
  return {
    goalId,
    currentAmount,
    targetAmount,
    monthlyInvestment,
    annualReturn,
    projectedMonths,
    projectedCompletionDate,
    totalInvested: Math.round(totalInvested),
    totalReturns: Math.round(totalReturns),
    monthlyProjections,
    scenarios
  }
}

/**
 * リスク別シナリオ分析
 */
export const calculateInvestmentScenarios = (
  currentAmount: number,
  targetAmount: number,
  monthlyInvestment: number,
  expectedReturn: number
): InvestmentScenarios => {
  // シナリオの設定（標準偏差を考慮）
  const volatility = 0.15 // 15%のボラティリティを仮定
  
  const conservativeReturn = Math.max(0.01, expectedReturn - volatility) // 最低1%
  const optimisticReturn = expectedReturn + volatility
  
  const conservative = {
    annualReturn: conservativeReturn,
    projectedMonths: calculateInvestmentPeriod(currentAmount, targetAmount, monthlyInvestment, conservativeReturn),
    totalValue: 0,
    totalReturns: 0
  }
  
  const expected = {
    annualReturn: expectedReturn,
    projectedMonths: calculateInvestmentPeriod(currentAmount, targetAmount, monthlyInvestment, expectedReturn),
    totalValue: 0,
    totalReturns: 0
  }
  
  const optimistic = {
    annualReturn: optimisticReturn,
    projectedMonths: calculateInvestmentPeriod(currentAmount, targetAmount, monthlyInvestment, optimisticReturn),
    totalValue: 0,
    totalReturns: 0
  }
  
  // 各シナリオの最終価値を計算
  const scenarios = [conservative, expected, optimistic]
  scenarios.forEach(scenario => {
    if (scenario.projectedMonths < 1200) {
      const monthlyReturn = scenario.annualReturn / 12
      let value = currentAmount
      
      for (let i = 0; i < scenario.projectedMonths; i++) {
        value = value * (1 + monthlyReturn) + monthlyInvestment
      }
      
      scenario.totalValue = Math.round(value)
      scenario.totalReturns = Math.round(value - currentAmount - (monthlyInvestment * scenario.projectedMonths))
    } else {
      scenario.totalValue = targetAmount
      scenario.totalReturns = 0
    }
  })
  
  return { conservative, expected, optimistic }
}

/**
 * 目標達成に必要な月次投資額を計算
 */
export const calculateRequiredMonthlyInvestment = (
  currentAmount: number,
  targetAmount: number,
  years: number,
  annualReturn: number
): number => {
  if (years <= 0) return 0
  
  const monthlyReturn = annualReturn / 12
  const totalMonths = years * 12
  
  // 現在の金額の将来価値
  const futureValueOfCurrent = currentAmount * Math.pow(1 + monthlyReturn, totalMonths)
  
  // 積立で補う必要のある金額
  const requiredFromInvestment = targetAmount - futureValueOfCurrent
  
  if (requiredFromInvestment <= 0) return 0
  
  if (monthlyReturn === 0) {
    return requiredFromInvestment / totalMonths
  }
  
  // 年金現価の逆算
  return requiredFromInvestment * monthlyReturn / (Math.pow(1 + monthlyReturn, totalMonths) - 1)
}

/**
 * 投資額と期間から最終価値を計算
 */
export const calculateFutureValue = (
  currentAmount: number,
  monthlyInvestment: number,
  annualReturn: number,
  years: number
): number => {
  const monthlyReturn = annualReturn / 12
  const totalMonths = years * 12
  
  // 現在の金額の将来価値
  const futureValueOfCurrent = currentAmount * Math.pow(1 + monthlyReturn, totalMonths)
  
  // 積立投資の将来価値
  let futureValueOfInvestments = 0
  if (monthlyReturn === 0) {
    futureValueOfInvestments = monthlyInvestment * totalMonths
  } else {
    futureValueOfInvestments = monthlyInvestment * (Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn
  }
  
  return futureValueOfCurrent + futureValueOfInvestments
}

/**
 * リスクプロファイルの定義
 */
export const RISK_PROFILES: RiskProfile[] = [
  {
    level: 'conservative',
    expectedReturn: 0.03,
    volatility: 0.05,
    description: '安定志向 - 債券中心のポートフォリオ'
  },
  {
    level: 'moderate',
    expectedReturn: 0.06,
    volatility: 0.12,
    description: 'バランス型 - 株式と債券のバランス'
  },
  {
    level: 'aggressive',
    expectedReturn: 0.10,
    volatility: 0.20,
    description: '成長志向 - 株式中心のポートフォリオ'
  }
]

/**
 * ポートフォリオ配分から期待リターンを計算
 */
export const calculatePortfolioReturn = (
  stocks: number,
  bonds: number,
  cash: number,
  others: number
): number => {
  // 各資産クラスの期待リターン（年率）
  const stockReturn = 0.08  // 8%
  const bondReturn = 0.03   // 3%
  const cashReturn = 0.001  // 0.1%
  const otherReturn = 0.05  // 5%
  
  return (
    (stocks / 100) * stockReturn +
    (bonds / 100) * bondReturn +
    (cash / 100) * cashReturn +
    (others / 100) * otherReturn
  )
}