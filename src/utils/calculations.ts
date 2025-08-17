import { 
  CalculationParams, 
  CompoundInterestResult, 
  LoanCalculationResult 
} from '../types/financial'

/**
 * 複利計算（元利合計）
 * @param principal 元本
 * @param rate 年利（小数点表記: 0.02 = 2%）
 * @param periods 期間（年）
 */
export const compoundInterest = (
  principal: number, 
  rate: number, 
  periods: number
): number => {
  return principal * Math.pow(1 + rate, periods)
}

/**
 * 月次積立の将来価値計算（年金現価）
 * @param payment 月次積立額
 * @param rate 月利（年利 / 12）
 * @param periods 期間（月数）
 */
export const futureValueAnnuity = (
  payment: number, 
  rate: number, 
  periods: number
): number => {
  if (rate === 0) {
    return payment * periods
  }
  return payment * ((Math.pow(1 + rate, periods) - 1) / rate)
}

/**
 * 現在価値計算
 * @param futureValue 将来価値
 * @param rate 年利（小数点表記）
 * @param periods 期間（年）
 */
export const presentValue = (
  futureValue: number, 
  rate: number, 
  periods: number
): number => {
  return futureValue / Math.pow(1 + rate, periods)
}

/**
 * ローンの月次返済額計算
 * @param principal 借入額
 * @param rate 年利（小数点表記）
 * @param years 返済期間（年）
 */
export const calculateMonthlyPayment = (
  principal: number, 
  rate: number, 
  years: number
): number => {
  const monthlyRate = rate / 12
  const totalPayments = years * 12
  
  if (rate === 0) {
    return principal / totalPayments
  }
  
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
         (Math.pow(1 + monthlyRate, totalPayments) - 1)
}

/**
 * 詳細な複利計算（月次の詳細付き）
 */
export const calculateCompoundInterest = (
  params: CalculationParams
): CompoundInterestResult => {
  const { principal, rate, periods } = params
  const monthlyRate = rate / 12
  const totalMonths = Math.floor(periods * 12)
  
  const monthlyBreakdown = []
  let currentBalance = principal
  let totalInterest = 0
  
  for (let month = 1; month <= totalMonths; month++) {
    const interestEarned = currentBalance * monthlyRate
    currentBalance += interestEarned
    totalInterest += interestEarned
    
    monthlyBreakdown.push({
      month,
      principal,
      interest: Number(interestEarned.toFixed(2)),
      balance: Number(currentBalance.toFixed(2))
    })
  }
  
  return {
    futureValue: Number(currentBalance.toFixed(2)),
    totalInterest: Number(totalInterest.toFixed(2)),
    monthlyBreakdown
  }
}

/**
 * ローンの詳細計算（返済スケジュール付き）
 */
export const calculateLoanDetails = (
  principal: number,
  rate: number,
  years: number
): LoanCalculationResult => {
  const monthlyPayment = calculateMonthlyPayment(principal, rate, years)
  const monthlyRate = rate / 12
  const totalPayments = years * 12
  
  const paymentSchedule = []
  let remainingBalance = principal
  let totalInterest = 0
  
  for (let month = 1; month <= totalPayments; month++) {
    const interestPayment = remainingBalance * monthlyRate
    const principalPayment = monthlyPayment - interestPayment
    remainingBalance -= principalPayment
    totalInterest += interestPayment
    
    paymentSchedule.push({
      month,
      payment: Number(monthlyPayment.toFixed(2)),
      principal: Number(principalPayment.toFixed(2)),
      interest: Number(interestPayment.toFixed(2)),
      remainingBalance: Number(Math.max(0, remainingBalance).toFixed(2))
    })
  }
  
  return {
    monthlyPayment: Number(monthlyPayment.toFixed(2)),
    totalPayment: Number((monthlyPayment * totalPayments).toFixed(2)),
    totalInterest: Number(totalInterest.toFixed(2)),
    paymentSchedule
  }
}

/**
 * 目標達成に必要な月次積立額計算
 * @param targetAmount 目標金額
 * @param currentAmount 現在の金額
 * @param rate 年利（小数点表記）
 * @param years 期間（年）
 */
export const calculateRequiredMonthlyPayment = (
  targetAmount: number,
  currentAmount: number,
  rate: number,
  years: number
): number => {
  const futureValueOfCurrent = compoundInterest(currentAmount, rate, years)
  const requiredFromSavings = targetAmount - futureValueOfCurrent
  
  if (requiredFromSavings <= 0) {
    return 0
  }
  
  const monthlyRate = rate / 12
  const totalMonths = years * 12
  
  if (rate === 0) {
    return requiredFromSavings / totalMonths
  }
  
  return requiredFromSavings * monthlyRate / (Math.pow(1 + monthlyRate, totalMonths) - 1)
}

/**
 * 目標達成予想日計算
 * @param targetAmount 目標金額
 * @param currentAmount 現在の金額
 * @param monthlyPayment 月次積立額
 * @param rate 年利（小数点表記）
 */
export const calculateTargetDate = (
  targetAmount: number,
  currentAmount: number,
  monthlyPayment: number,
  rate: number
): Date => {
  if (currentAmount >= targetAmount) {
    return new Date()
  }
  
  const monthlyRate = rate / 12
  let balance = currentAmount
  let months = 0
  
  while (balance < targetAmount && months < 1200) { // 最大100年
    balance = balance * (1 + monthlyRate) + monthlyPayment
    months++
  }
  
  const targetDate = new Date()
  targetDate.setMonth(targetDate.getMonth() + months)
  return targetDate
}

/**
 * 投資リスクを考慮したシミュレーション
 * @param principal 元本
 * @param monthlyPayment 月次積立
 * @param expectedReturn 期待リターン（年利）
 * @param volatility 変動率（標準偏差）
 * @param years 期間（年）
 */
export const simulateInvestmentScenarios = (
  principal: number,
  monthlyPayment: number,
  expectedReturn: number,
  volatility: number,
  years: number
) => {
  // 楽観的シナリオ（期待リターン + 1標準偏差）
  const optimisticReturn = expectedReturn + volatility
  const optimisticValue = compoundInterest(principal, optimisticReturn, years) +
    futureValueAnnuity(monthlyPayment, optimisticReturn / 12, years * 12)
  
  // 悲観的シナリオ（期待リターン - 1標準偏差）
  const pessimisticReturn = Math.max(0, expectedReturn - volatility)
  const pessimisticValue = compoundInterest(principal, pessimisticReturn, years) +
    futureValueAnnuity(monthlyPayment, pessimisticReturn / 12, years * 12)
  
  // 期待値シナリオ
  const expectedValue = compoundInterest(principal, expectedReturn, years) +
    futureValueAnnuity(monthlyPayment, expectedReturn / 12, years * 12)
  
  return {
    optimistic: Number(optimisticValue.toFixed(2)),
    expected: Number(expectedValue.toFixed(2)),
    pessimistic: Number(pessimisticValue.toFixed(2))
  }
}

/**
 * インフレ率を考慮した実質価値計算
 * @param nominalValue 名目価値
 * @param inflationRate インフレ率（年利）
 * @param years 期間（年）
 */
export const calculateRealValue = (
  nominalValue: number,
  inflationRate: number,
  years: number
): number => {
  return nominalValue / Math.pow(1 + inflationRate, years)
}