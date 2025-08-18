import React, { useState, useEffect } from 'react'
import { Goal, InvestmentSimulation } from '../../../types/financial'
import { RISK_LEVELS, PORTFOLIO_PRESETS } from '../../../data/constants'
import { calculateInvestmentSimulation, calculateRequiredMonthlyInvestment, calculateInvestmentPeriod } from '../../../utils/investmentCalculations'
import { validateAmount, validatePercentage } from '../../../utils/validators'
import { useToast } from '../../../hooks/useToast'
import GlassCard from '../../ui/GlassCard'
import Button from '../../ui/Button'
import Input from '../../ui/Input'
import InvestmentResults from './InvestmentResults'

interface InvestmentPlanFormProps {
  goal: Goal
  onClose: () => void
}

const InvestmentPlanForm: React.FC<InvestmentPlanFormProps> = ({ goal, onClose }) => {
  const { success, error } = useToast()
  
  const [formData, setFormData] = useState({
    monthlyInvestment: '',
    annualReturn: '5.0',
    riskLevel: 'medium' as const,
    targetYears: ''
  })
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [simulation, setSimulation] = useState<InvestmentSimulation | null>(null)
  const [calculationMode, setCalculationMode] = useState<'amount' | 'period'>('period')

  // 目標達成期限から年数を自動計算
  useEffect(() => {
    const now = new Date()
    const deadlineYears = (goal.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    setFormData(prev => ({
      ...prev,
      targetYears: Math.max(0.1, deadlineYears).toFixed(1)
    }))
  }, [goal.deadline])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleRiskLevelChange = (riskLevel: 'low' | 'medium' | 'high') => {
    const preset = PORTFOLIO_PRESETS.find(p => p.riskLevel === riskLevel)
    if (preset) {
      setFormData(prev => ({
        ...prev,
        riskLevel,
        annualReturn: (preset.expectedReturn * 100).toFixed(1)
      }))
    }
  }

  const calculateSuggestion = () => {
    const years = parseFloat(formData.targetYears)
    const annualReturn = parseFloat(formData.annualReturn) / 100
    
    if (years > 0 && annualReturn >= 0) {
      const required = calculateRequiredMonthlyInvestment(
        goal.currentAmount,
        goal.targetAmount,
        years,
        annualReturn
      )
      
      setFormData(prev => ({
        ...prev,
        monthlyInvestment: Math.ceil(required).toString()
      }))
    }
  }

  const calculatePeriod = () => {
    const monthlyAmount = parseFloat(formData.monthlyInvestment)
    const annualReturn = parseFloat(formData.annualReturn) / 100
    
    if (monthlyAmount > 0 && annualReturn >= 0) {
      const months = calculateInvestmentPeriod(
        goal.currentAmount,
        goal.targetAmount,
        monthlyAmount,
        annualReturn
      )
      
      const years = months / 12
      setFormData(prev => ({
        ...prev,
        targetYears: years.toFixed(1)
      }))
      
      if (months < 1200) {
        success(`目標達成まで約${years.toFixed(1)}年（${months}ヶ月）です`)
      } else {
        error('現在の設定では目標達成が困難です。投資額を増やしてください。')
      }
    }
  }

  const runSimulation = () => {
    console.log('シミュレーション開始:', formData)
    const newErrors: { [key: string]: string } = {}

    // バリデーション
    const monthlyAmount = parseFloat(formData.monthlyInvestment)
    const annualReturn = parseFloat(formData.annualReturn)
    
    console.log('解析された値:', { monthlyAmount, annualReturn })
    
    if (!formData.monthlyInvestment || isNaN(monthlyAmount) || monthlyAmount <= 0) {
      newErrors.monthlyInvestment = '有効な月次投資額を入力してください'
    }
    
    const returnError = validatePercentage(annualReturn, -50, 50)
    if (returnError) {
      newErrors.annualReturn = returnError
    }

    console.log('バリデーションエラー:', newErrors)

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      console.log('シミュレーション計算開始...')
      const sim = calculateInvestmentSimulation(
        goal.id,
        goal.currentAmount,
        goal.targetAmount,
        monthlyAmount,
        annualReturn / 100
      )
      
      console.log('シミュレーション結果:', sim)
      setSimulation(sim)
      
      if (sim.projectedMonths >= 1200) {
        error('現在の設定では目標達成が非常に困難です。投資額を増やすか期間を延ばしてください。')
      } else {
        success('投資シミュレーションが完了しました')
      }
    } catch (err) {
      console.error('シミュレーションエラー:', err)
      error('シミュレーション計算でエラーが発生しました: ' + (err as Error).message)
    }
  }

  const remainingAmount = goal.targetAmount - goal.currentAmount

  return (
    <div className="space-y-6">
      {/* ヘッダー - 固定されているような見た目に */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-6 -mx-6 -mt-6 mb-6">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-2">
            投資計画シミュレーター
          </h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
            目標「{goal.title}」の投資プランを作成
          </p>
        </div>
      </div>

      <GlassCard>

        {/* セクション1: 目標概要 */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
              1
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              目標概要
            </h3>
          </div>
          <GlassCard variant="secondary">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-white opacity-80">目標金額</p>
                <p className="font-semibold text-white text-lg">
                  ¥{goal.targetAmount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-white opacity-80">現在の金額</p>
                <p className="font-semibold text-white text-lg">
                  ¥{goal.currentAmount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-white opacity-80">必要金額</p>
                <p className="font-semibold text-white text-lg">
                  ¥{remainingAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* セクション2: 計算設定 */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
              2
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              計算設定
            </h3>
          </div>
          
          {/* 計算モード切り替え */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              計算モード
            </label>
            <div className="flex gap-2">
              <Button
                variant={calculationMode === 'period' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setCalculationMode('period')}
              >
                期間を計算
              </Button>
              <Button
                variant={calculationMode === 'amount' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setCalculationMode('amount')}
              >
                必要額を計算
              </Button>
            </div>
          </div>
        </div>

        {/* セクション3: 投資設定 */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
              3
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              投資設定
            </h3>
          </div>

          <div className="space-y-6">
            {/* リスクレベル選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                リスクレベル
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {RISK_LEVELS.map((risk) => (
                  <button
                    key={risk.value}
                    onClick={() => handleRiskLevelChange(risk.value as any)}
                    className={`
                      p-3 rounded-lg border text-left transition-all duration-200
                      ${formData.riskLevel === risk.value
                        ? 'glass-primary text-white'
                        : 'glass-effect text-gray-700 dark:text-gray-300 hover:glass-secondary'
                      }
                    `}
                  >
                    <div className="font-medium text-sm">{risk.label}</div>
                    <div className="text-xs opacity-75">{risk.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Input
                  label="月次投資額"
                  type="number"
                  placeholder="50000"
                  value={formData.monthlyInvestment}
                  onChange={(value) => handleInputChange('monthlyInvestment', value)}
                  error={errors.monthlyInvestment}
                  prefix="¥"
                  required
                />
              </div>

              <div>
                <Input
                  label="期待年利"
                  type="number"
                  placeholder="5.0"
                  value={formData.annualReturn}
                  onChange={(value) => handleInputChange('annualReturn', value)}
                  error={errors.annualReturn}
                  suffix="%"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* セクション4: 計算実行 */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
              4
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              計算実行
            </h3>
          </div>

          {calculationMode === 'period' && (
            <div className="space-y-4">
              <Input
                label="目標達成期間（計算結果）"
                type="number"
                placeholder="計算結果が表示されます"
                value={formData.targetYears}
                onChange={(value) => handleInputChange('targetYears', value)}
                suffix="年"
                disabled
              />
              <Button
                variant="accent"
                size="sm"
                onClick={calculatePeriod}
                className="w-full"
              >
                達成期間を計算
              </Button>
            </div>
          )}

          {calculationMode === 'amount' && (
            <div className="space-y-4">
              <Input
                label="投資期間"
                type="number"
                placeholder="10"
                value={formData.targetYears}
                onChange={(value) => handleInputChange('targetYears', value)}
                suffix="年"
              />
              <Button
                variant="accent"
                size="sm"
                onClick={calculateSuggestion}
                className="w-full"
              >
                必要投資額を計算
              </Button>
            </div>
          )}
        </div>

        {/* アクションボタン */}
        <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm -mx-6 -mb-6 px-6 pb-6">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            キャンセル
          </Button>
          <Button
            variant="primary"
            onClick={runSimulation}
            className="flex-1"
          >
            シミュレーション実行
          </Button>
        </div>
      </GlassCard>

      {/* 投資シミュレーション結果 */}
      {simulation && (
        <InvestmentResults 
          simulation={simulation} 
          goalTitle={goal.title}
        />
      )}
    </div>
  )
}

export default InvestmentPlanForm