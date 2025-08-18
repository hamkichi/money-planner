import { 
  PurchaseSimulation, 
  LumpSumScenario, 
  LoanScenario, 
  OpportunityAnalysis,
  MonthlyOpportunityProjection 
} from '../types/financial'

/**
 * ローンの月次支払額を計算
 * @param principal 元本
 * @param annualRate 年利
 * @param months 期間（月）
 */
export const calculateMonthlyLoanPayment = (
  principal: number,
  annualRate: number,
  months: number
): number => {
  if (annualRate === 0) {
    return principal / months
  }
  
  const monthlyRate = annualRate / 12
  const factor = Math.pow(1 + monthlyRate, months)
  return principal * (monthlyRate * factor) / (factor - 1)
}

/**
 * 機会費用分析を計算
 * @param initialAmount 初期投資額
 * @param monthlyInvestment 月次投資額
 * @param annualReturn 年利
 * @param months 期間（月）
 */
export const calculateOpportunityAnalysis = (
  initialAmount: number,
  monthlyInvestment: number,
  annualReturn: number,
  months: number
): OpportunityAnalysis => {
  const monthlyReturn = annualReturn / 12
  const monthlyProjections: MonthlyOpportunityProjection[] = []
  
  let totalInvested = initialAmount
  let investmentValue = initialAmount
  let cumulativeMonthlyInvestment = 0
  
  for (let month = 1; month <= months; month++) {
    // 投資額の成長
    investmentValue = investmentValue * (1 + monthlyReturn) + monthlyInvestment
    cumulativeMonthlyInvestment += monthlyInvestment
    totalInvested = initialAmount + cumulativeMonthlyInvestment
    
    monthlyProjections.push({
      month,
      investmentContribution: monthlyInvestment,
      investmentValue: Math.round(investmentValue),
      netWorth: Math.round(investmentValue)
    })
  }
  
  const finalValue = Math.round(investmentValue)
  const investmentReturns = finalValue - totalInvested
  
  return {
    totalInvested: Math.round(totalInvested),
    investmentReturns: Math.round(investmentReturns),
    finalValue,
    monthlyProjections
  }
}

/**
 * 一括払いシナリオを計算
 * @param productPrice 商品価格
 * @param currentSavings 現在の貯金額
 * @param investmentReturn 投資リターン（年利）
 * @param projectedYears 分析期間（年）
 * @param monthlyInvestment 月次投資可能額
 */
export const calculateLumpSumScenario = (
  productPrice: number,
  currentSavings: number,
  investmentReturn: number,
  projectedYears: number,
  monthlyInvestment: number
): LumpSumScenario => {
  const remainingSavings = Math.max(0, currentSavings - productPrice)
  const months = Math.round(projectedYears * 12)
  
  const opportunity = calculateOpportunityAnalysis(
    remainingSavings,
    monthlyInvestment,
    investmentReturn,
    months
  )
  
  return {
    paymentMethod: 'lump_sum',
    initialPayment: productPrice,
    remainingSavings,
    investmentReturn,
    projectedYears,
    monthlyInvestment,
    finalAssets: opportunity.finalValue,
    totalCost: productPrice,
    opportunity
  }
}

/**
 * ローンシナリオを計算
 * @param productPrice 商品価格
 * @param currentSavings 現在の貯金額
 * @param downPaymentPercentage 頭金比率
 * @param loanInterestRate ローン金利（年利）
 * @param loanTermMonths ローン期間（月）
 * @param investmentReturn 投資リターン（年利）
 * @param projectedYears 分析期間（年）
 * @param additionalMonthlyInvestment 追加月次投資可能額
 */
export const calculateLoanScenario = (
  productPrice: number,
  currentSavings: number,
  downPaymentPercentage: number,
  loanInterestRate: number,
  loanTermMonths: number,
  investmentReturn: number,
  projectedYears: number,
  additionalMonthlyInvestment: number
): LoanScenario => {
  const downPayment = productPrice * (downPaymentPercentage / 100)
  const loanAmount = productPrice - downPayment
  const monthlyPayment = calculateMonthlyLoanPayment(loanAmount, loanInterestRate, loanTermMonths)
  const totalInterest = (monthlyPayment * loanTermMonths) - loanAmount
  const totalCost = productPrice + totalInterest
  
  const remainingSavings = Math.max(0, currentSavings - downPayment)
  const months = Math.round(projectedYears * 12)
  
  // ローン支払い分を引いた投資額を計算
  const netMonthlyInvestment = Math.max(0, additionalMonthlyInvestment - monthlyPayment)
  
  const opportunity = calculateOpportunityAnalysis(
    remainingSavings,
    netMonthlyInvestment,
    investmentReturn,
    months
  )
  
  // ローン残高を考慮した月次推移
  const enhancedProjections: MonthlyOpportunityProjection[] = []
  let loanBalance = loanAmount
  
  for (let month = 1; month <= months; month++) {
    const originalProjection = opportunity.monthlyProjections[month - 1]
    
    if (month <= loanTermMonths) {
      // 元本返済分を計算
      const interestPayment = loanBalance * (loanInterestRate / 12)
      const principalPayment = monthlyPayment - interestPayment
      loanBalance = Math.max(0, loanBalance - principalPayment)
    }
    
    enhancedProjections.push({
      ...originalProjection,
      loanBalance: month <= loanTermMonths ? Math.round(loanBalance) : 0,
      loanPayment: month <= loanTermMonths ? Math.round(monthlyPayment) : 0,
      netWorth: Math.round(originalProjection.investmentValue - (month <= loanTermMonths ? loanBalance : 0))
    })
  }
  
  return {
    paymentMethod: 'loan',
    downPayment: Math.round(downPayment),
    loanAmount: Math.round(loanAmount),
    interestRate: loanInterestRate,
    loanTermMonths,
    monthlyPayment: Math.round(monthlyPayment),
    totalInterest: Math.round(totalInterest),
    totalCost: Math.round(totalCost),
    remainingSavings: Math.round(remainingSavings),
    investmentReturn,
    monthlyInvestment: netMonthlyInvestment,
    finalAssets: opportunity.finalValue,
    opportunity: {
      ...opportunity,
      monthlyProjections: enhancedProjections
    }
  }
}

/**
 * 購入シミュレーション全体を計算
 */
export const calculatePurchaseSimulation = (
  goalId: string,
  productName: string,
  productPrice: number,
  currentSavings: number,
  loanTerms: {
    downPaymentPercentage: number
    interestRate: number
    termMonths: number
  },
  investmentReturn: number,
  projectedYears: number,
  monthlyInvestmentCapacity: number
): PurchaseSimulation => {
  
  const lumpSumScenario = calculateLumpSumScenario(
    productPrice,
    currentSavings,
    investmentReturn,
    projectedYears,
    monthlyInvestmentCapacity
  )
  
  const loanScenario = calculateLoanScenario(
    productPrice,
    currentSavings,
    loanTerms.downPaymentPercentage,
    loanTerms.interestRate,
    loanTerms.termMonths,
    investmentReturn,
    projectedYears,
    monthlyInvestmentCapacity
  )
  
  // どちらが有利かを判定
  const lumpSumNetWorth = lumpSumScenario.finalAssets
  const loanNetWorth = loanScenario.finalAssets - (loanScenario.totalCost - productPrice)
  
  const totalDifference = lumpSumNetWorth - loanNetWorth
  const recommendation: 'lump_sum' | 'loan' = totalDifference > 0 ? 'lump_sum' : 'loan'
  
  return {
    goalId,
    productName,
    productPrice,
    currentSavings,
    lumpSumScenario,
    loanScenario,
    recommendation,
    totalDifference: Math.round(Math.abs(totalDifference))
  }
}

/**
 * ローン支払い可能性をチェック
 */
export const checkLoanAffordability = (
  monthlyIncome: number,
  monthlyExpenses: number,
  monthlyLoanPayment: number,
  safetyMarginPercentage: number = 20
): { affordable: boolean; reason?: string } => {
  const availableIncome = monthlyIncome - monthlyExpenses
  const safetyMargin = availableIncome * (safetyMarginPercentage / 100)
  const maxAffordablePayment = availableIncome - safetyMargin
  
  if (monthlyLoanPayment > maxAffordablePayment) {
    return {
      affordable: false,
      reason: `月次支払額が収支に対して高すぎます（利用可能額: ¥${Math.round(maxAffordablePayment).toLocaleString()}）`
    }
  }
  
  return { affordable: true }
}

/**
 * ROIを計算
 */
export const calculateROI = (
  initialInvestment: number,
  finalAssets: number,
  totalCost: number
): number => {
  if (totalCost <= 0) return 0
  return ((finalAssets - totalCost) / totalCost) * 100
}

/**
 * 特定の頭金比率でのROIを計算
 */
export const calculateROIForDownPayment = (
  productPrice: number,
  currentSavings: number,
  downPaymentPercentage: number,
  loanInterestRate: number,
  loanTermMonths: number,
  investmentReturn: number,
  projectedYears: number,
  monthlyInvestmentCapacity: number
): { roi: number; scenario: any } => {
  try {
    const loanScenario = calculateLoanScenario(
      productPrice,
      currentSavings,
      downPaymentPercentage,
      loanInterestRate,
      loanTermMonths,
      investmentReturn,
      projectedYears,
      monthlyInvestmentCapacity
    )
    
    const roi = calculateROI(
      currentSavings,
      loanScenario.finalAssets,
      loanScenario.totalCost
    )
    
    return { roi, scenario: loanScenario }
  } catch (error) {
    return { roi: -Infinity, scenario: null }
  }
}

/**
 * ROI最大化のための最適頭金比率を求める
 */
export const findOptimalDownPaymentForROI = (
  productPrice: number,
  currentSavings: number,
  loanInterestRate: number,
  loanTermMonths: number,
  investmentReturn: number,
  projectedYears: number,
  monthlyInvestmentCapacity: number,
  minDownPayment: number = 0,
  maxDownPayment: number = 100
): {
  optimalDownPayment: number
  maxROI: number
  roiAnalysis: Array<{
    downPayment: number
    roi: number
    finalAssets: number
    totalCost: number
    monthlyPayment: number
    feasible: boolean
  }>
} => {
  const roiAnalysis: Array<{
    downPayment: number
    roi: number
    finalAssets: number
    totalCost: number
    monthlyPayment: number
    feasible: boolean
  }> = []
  
  let maxROI = -Infinity
  let optimalDownPayment = minDownPayment
  
  // 1%刻みで頭金比率を変えてROIを計算
  for (let dp = minDownPayment; dp <= maxDownPayment; dp += 1) {
    // 頭金が現在の貯金額を超える場合はスキップ
    const requiredDownPayment = productPrice * (dp / 100)
    const feasible = requiredDownPayment <= currentSavings
    
    if (feasible) {
      const { roi, scenario } = calculateROIForDownPayment(
        productPrice,
        currentSavings,
        dp,
        loanInterestRate,
        loanTermMonths,
        investmentReturn,
        projectedYears,
        monthlyInvestmentCapacity
      )
      
      roiAnalysis.push({
        downPayment: dp,
        roi,
        finalAssets: scenario?.finalAssets || 0,
        totalCost: scenario?.totalCost || 0,
        monthlyPayment: scenario?.monthlyPayment || 0,
        feasible: true
      })
      
      if (roi > maxROI) {
        maxROI = roi
        optimalDownPayment = dp
      }
    } else {
      roiAnalysis.push({
        downPayment: dp,
        roi: -Infinity,
        finalAssets: 0,
        totalCost: 0,
        monthlyPayment: 0,
        feasible: false
      })
    }
  }
  
  return {
    optimalDownPayment,
    maxROI,
    roiAnalysis
  }
}

/**
 * 最適なローン条件を提案
 */
export const suggestOptimalLoanTerms = (
  productPrice: number,
  monthlyBudget: number,
  availableRates: number[]
): { 
  interestRate: number
  termMonths: number
  downPaymentPercentage: number
  monthlyPayment: number
} => {
  const bestRate = Math.min(...availableRates)
  let optimalTerm = 12
  
  // 月次予算内で支払える最短期間を見つける
  for (let months = 12; months <= 360; months += 12) {
    const payment = calculateMonthlyLoanPayment(productPrice * 0.8, bestRate, months)
    if (payment <= monthlyBudget * 0.8) { // 安全マージンを考慮
      optimalTerm = months
      break
    }
  }
  
  const downPaymentPercentage = 20 // デフォルト20%
  const loanAmount = productPrice * (1 - downPaymentPercentage / 100)
  const monthlyPayment = calculateMonthlyLoanPayment(loanAmount, bestRate, optimalTerm)
  
  return {
    interestRate: bestRate,
    termMonths: optimalTerm,
    downPaymentPercentage,
    monthlyPayment: Math.round(monthlyPayment)
  }
}