import { useMemo } from 'react'
import {
  calculateTargetDate,
  calculateRequiredMonthlyPayment,
  simulateInvestmentScenarios,
  futureValueAnnuity,
  compoundInterest
} from '../utils/calculations'
import { Goal, SavingsPlan, InvestmentPlan, FinancialProjection } from '../types/financial'

export interface CalculationResult {
  targetDate: Date
  requiredMonthlyPayment: number
  totalSavingsNeeded: number
  monthlyProgress: Array<{
    month: number
    savingsBalance: number
    investmentValue: number
    totalProgress: number
    progressPercentage: number
  }>
  scenarios: {
    optimistic: number
    expected: number
    pessimistic: number
  }
}

export function useFinancialCalculator(
  goal: Goal,
  savingsPlans: SavingsPlan[],
  investmentPlans: InvestmentPlan[]
): CalculationResult {
  const calculation = useMemo(() => {
    const activeSavingsPlans = savingsPlans.filter(plan => 
      plan.goalId === goal.id && plan.isActive
    )
    const activeInvestmentPlans = investmentPlans.filter(plan => 
      plan.goalId === goal.id && plan.isActive
    )

    const totalMonthlySavings = activeSavingsPlans.reduce(
      (sum, plan) => sum + plan.monthlyAmount, 0
    )
    const totalMonthlyInvestment = activeInvestmentPlans.reduce(
      (sum, plan) => sum + plan.monthlyAmount, 0
    )

    const averageSavingsRate = activeSavingsPlans.length > 0
      ? activeSavingsPlans.reduce((sum, plan) => sum + plan.interestRate, 0) / activeSavingsPlans.length
      : 0.002 // Default savings rate

    const averageInvestmentReturn = activeInvestmentPlans.length > 0
      ? activeInvestmentPlans.reduce((sum, plan) => sum + plan.expectedReturn, 0) / activeInvestmentPlans.length
      : 0.05 // Default investment return

    // Calculate target date with current plans
    const targetDate = calculateTargetDate(
      goal.targetAmount,
      goal.currentAmount,
      totalMonthlySavings + totalMonthlyInvestment,
      (averageSavingsRate + averageInvestmentReturn) / 2
    )

    // Calculate required monthly payment if no plans exist
    const yearsToTarget = (goal.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    const requiredMonthlyPayment = calculateRequiredMonthlyPayment(
      goal.targetAmount,
      goal.currentAmount,
      averageInvestmentReturn,
      yearsToTarget
    )

    // Generate monthly progress projection
    const monthlyProgress = []
    const totalMonths = Math.min(
      Math.ceil((targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30)),
      yearsToTarget * 12
    )

    let currentSavings = goal.currentAmount
    let currentInvestment = 0

    for (let month = 1; month <= totalMonths; month++) {
      // Savings growth
      currentSavings = currentSavings * (1 + averageSavingsRate / 12) + totalMonthlySavings

      // Investment growth
      currentInvestment = currentInvestment * (1 + averageInvestmentReturn / 12) + totalMonthlyInvestment

      const totalProgress = currentSavings + currentInvestment
      const progressPercentage = (totalProgress / goal.targetAmount) * 100

      monthlyProgress.push({
        month,
        savingsBalance: Math.round(currentSavings),
        investmentValue: Math.round(currentInvestment),
        totalProgress: Math.round(totalProgress),
        progressPercentage: Math.round(progressPercentage * 100) / 100
      })

      // Stop when goal is reached
      if (totalProgress >= goal.targetAmount) {
        break
      }
    }

    // Investment scenarios with volatility
    const scenarios = simulateInvestmentScenarios(
      goal.currentAmount,
      totalMonthlyInvestment,
      averageInvestmentReturn,
      0.15, // 15% volatility
      yearsToTarget
    )

    return {
      targetDate,
      requiredMonthlyPayment: Math.round(requiredMonthlyPayment),
      totalSavingsNeeded: goal.targetAmount - goal.currentAmount,
      monthlyProgress,
      scenarios
    }
  }, [goal, savingsPlans, investmentPlans])

  return calculation
}

// Hook for portfolio optimization
export function usePortfolioOptimization(
  targetAmount: number,
  timeHorizon: number, // years
  riskTolerance: 'low' | 'medium' | 'high'
) {
  return useMemo(() => {
    const allocations = {
      low: { stocks: 20, bonds: 60, cash: 20 },
      medium: { stocks: 50, bonds: 30, cash: 20 },
      high: { stocks: 70, bonds: 20, cash: 10 }
    }

    const expectedReturns = {
      low: 0.03,
      medium: 0.05,
      high: 0.08
    }

    const allocation = allocations[riskTolerance]
    const expectedReturn = expectedReturns[riskTolerance]

    // Adjust allocation based on time horizon
    const adjustedAllocation = { ...allocation }
    if (timeHorizon > 10) {
      // Longer time horizon allows for more aggressive allocation
      adjustedAllocation.stocks = Math.min(adjustedAllocation.stocks + 10, 80)
      adjustedAllocation.bonds = Math.max(adjustedAllocation.bonds - 5, 10)
      adjustedAllocation.cash = Math.max(adjustedAllocation.cash - 5, 10)
    } else if (timeHorizon < 3) {
      // Shorter time horizon requires more conservative allocation
      adjustedAllocation.stocks = Math.max(adjustedAllocation.stocks - 10, 10)
      adjustedAllocation.bonds = Math.min(adjustedAllocation.bonds + 5, 70)
      adjustedAllocation.cash = Math.min(adjustedAllocation.cash + 5, 30)
    }

    return {
      allocation: adjustedAllocation,
      expectedReturn,
      riskLevel: riskTolerance,
      timeHorizon
    }
  }, [targetAmount, timeHorizon, riskTolerance])
}

// Hook for loan optimization
export function useLoanOptimization(
  targetAmount: number,
  availableDownPayment: number,
  annualIncome: number
) {
  return useMemo(() => {
    const maxLoanAmount = targetAmount - availableDownPayment
    const maxMonthlyPayment = annualIncome * 0.25 / 12 // 25% of annual income

    // Different loan scenarios
    const scenarios = [
      {
        name: '短期ローン (5年)',
        years: 5,
        rate: 0.025,
        amount: maxLoanAmount
      },
      {
        name: '中期ローン (10年)',
        years: 10,
        rate: 0.03,
        amount: maxLoanAmount
      },
      {
        name: '長期ローン (20年)',
        years: 20,
        rate: 0.035,
        amount: maxLoanAmount
      }
    ]

    const recommendations = scenarios.map(scenario => {
      const monthlyRate = scenario.rate / 12
      const totalPayments = scenario.years * 12
      
      const monthlyPayment = scenario.amount * 
        (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
        (Math.pow(1 + monthlyRate, totalPayments) - 1)

      const totalInterest = (monthlyPayment * totalPayments) - scenario.amount
      const affordability = monthlyPayment <= maxMonthlyPayment

      return {
        ...scenario,
        monthlyPayment: Math.round(monthlyPayment),
        totalInterest: Math.round(totalInterest),
        totalPayment: Math.round(monthlyPayment * totalPayments),
        affordability,
        paymentToIncomeRatio: (monthlyPayment * 12) / annualIncome
      }
    })

    return {
      maxLoanAmount,
      maxMonthlyPayment: Math.round(maxMonthlyPayment),
      recommendations: recommendations.filter(rec => rec.affordability),
      allScenarios: recommendations
    }
  }, [targetAmount, availableDownPayment, annualIncome])
}