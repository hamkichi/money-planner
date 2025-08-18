export interface Goal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  deadline: Date
  category: GoalCategory
  priority: 'high' | 'medium' | 'low'
  createdAt: Date
  updatedAt: Date
}

export type GoalCategory = 
  | 'house'      // 住宅購入
  | 'car'        // 車購入
  | 'education'  // 教育資金
  | 'travel'     // 旅行
  | 'retirement' // 老後資金
  | 'emergency'  // 緊急時資金
  | 'other'      // その他

export interface SavingsPlan {
  id: string
  goalId: string
  monthlyAmount: number
  interestRate: number // 年利（小数点表記: 0.02 = 2%）
  compoundingFrequency: 'monthly' | 'quarterly' | 'annually'
  startDate: Date
  isActive: boolean
}

export interface InvestmentPlan {
  id: string
  goalId: string
  monthlyAmount: number
  expectedReturn: number // 年利（小数点表記）
  riskLevel: 'low' | 'medium' | 'high'
  portfolioAllocation: PortfolioAllocation
  startDate: Date
  isActive: boolean
}

export interface PortfolioAllocation {
  stocks: number    // 株式 (%)
  bonds: number     // 債券 (%)
  cash: number      // 現金 (%)
  others: number    // その他 (%)
}

export interface LoanPlan {
  id: string
  goalId: string
  loanAmount: number
  interestRate: number // 年利（小数点表記）
  termYears: number
  monthlyPayment: number
  startDate: Date
  isActive: boolean
}

export interface FinancialProjection {
  goalId: string
  projectedCompletionDate: Date
  totalSavings: number
  totalInvestmentReturns: number
  totalLoanAmount: number
  monthlyProgress: MonthlyProgress[]
  riskAnalysis: RiskAnalysis
}

export interface MonthlyProgress {
  date: Date
  savingsBalance: number
  investmentValue: number
  loanRemaining: number
  totalProgress: number
  progressPercentage: number
}

export interface RiskAnalysis {
  worstCase: FinancialScenario
  bestCase: FinancialScenario
  mostLikely: FinancialScenario
}

export interface FinancialScenario {
  completionDate: Date
  totalAmount: number
  confidenceLevel: number // 確率 (%)
}

export interface CalculationParams {
  principal: number
  rate: number
  periods: number
  payment?: number
}

export interface CompoundInterestResult {
  futureValue: number
  totalInterest: number
  monthlyBreakdown: {
    month: number
    principal: number
    interest: number
    balance: number
  }[]
}

export interface LoanCalculationResult {
  monthlyPayment: number
  totalPayment: number
  totalInterest: number
  paymentSchedule: {
    month: number
    payment: number
    principal: number
    interest: number
    remainingBalance: number
  }[]
}

// 投資シミュレーション関連の型定義
export interface InvestmentSimulation {
  goalId: string
  currentAmount: number
  targetAmount: number
  monthlyInvestment: number
  annualReturn: number
  projectedMonths: number
  projectedCompletionDate: Date
  totalInvested: number
  totalReturns: number
  monthlyProjections: MonthlyInvestmentProjection[]
  scenarios: InvestmentScenarios
}

export interface MonthlyInvestmentProjection {
  month: number
  monthlyInvestment: number
  cumulativeInvestment: number
  monthlyReturn: number
  cumulativeReturns: number
  totalValue: number
  progress: number
}

export interface InvestmentScenarios {
  conservative: InvestmentScenario
  expected: InvestmentScenario
  optimistic: InvestmentScenario
}

export interface InvestmentScenario {
  annualReturn: number
  projectedMonths: number
  totalValue: number
  totalReturns: number
}

// 投資商品とリスクレベル
export type InvestmentProduct = 
  | 'stocks'      // 株式
  | 'bonds'       // 債券
  | 'mutual-funds' // 投資信託
  | 'etf'         // ETF
  | 'reit'        // REIT
  | 'crypto'      // 暗号資産
  | 'commodities' // コモディティ

export interface RiskProfile {
  level: 'conservative' | 'moderate' | 'aggressive'
  expectedReturn: number
  volatility: number
  description: string
}