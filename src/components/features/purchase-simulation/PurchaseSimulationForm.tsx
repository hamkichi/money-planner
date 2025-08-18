import React, { useState, useEffect } from 'react'
import { Goal, PurchaseSimulation } from '../../../types/financial'
import { PURCHASE_OPTIONS, LOAN_PRODUCTS, ANALYSIS_PERIODS } from '../../../data/constants'
import { calculatePurchaseSimulation, suggestOptimalLoanTerms, findOptimalDownPaymentForROI } from '../../../utils/purchaseCalculations'
import { validateAmount } from '../../../utils/validators'
import { useToast } from '../../../hooks/useToast'
import GlassCard from '../../ui/GlassCard'
import Button from '../../ui/Button'
import Input from '../../ui/Input'
import PurchaseSimulationResults from './PurchaseSimulationResults'

interface PurchaseSimulationFormProps {
  goal: Goal
  onClose: () => void
}

const PurchaseSimulationForm: React.FC<PurchaseSimulationFormProps> = ({ goal, onClose }) => {
  const { success, error } = useToast()
  
  const [formData, setFormData] = useState(() => {
    // 現在の貯金額に基づいて推奨頭金比率を計算（上限は100%）
    const affordableDownPayment = goal.currentAmount >= goal.targetAmount ? 
      Math.min(100, Math.floor((goal.currentAmount / goal.targetAmount) * 100)) : 20
    
    return {
      productName: goal.title,
      productPrice: goal.targetAmount.toString(),
      currentSavings: goal.currentAmount.toString(),
      purchaseType: 'car',
      loanType: 'auto',
      downPaymentPercentage: affordableDownPayment.toString(),
      loanInterestRate: '3.5',
      loanTermMonths: '60',
      investmentReturn: '5.0',
      analysisYears: '5',
      monthlyInvestmentCapacity: '50000'
    }
  })
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [simulation, setSimulation] = useState<PurchaseSimulation | null>(null)
  const [showOptimalSuggestion, setShowOptimalSuggestion] = useState(false)
  const [roiOptimization, setRoiOptimization] = useState<{
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
  } | null>(null)

  // 購入タイプが変更されたときにローンタイプを自動調整
  useEffect(() => {
    const loanProduct = LOAN_PRODUCTS.find(product => 
      product.type === formData.purchaseType || 
      (formData.purchaseType === 'car' && product.type === 'auto') ||
      (formData.purchaseType === 'house' && product.type === 'mortgage') ||
      (formData.purchaseType === 'appliance' && product.type === 'appliance')
    )
    
    if (loanProduct) {
      setFormData(prev => ({
        ...prev,
        loanType: loanProduct.type,
        downPaymentPercentage: loanProduct.defaultDownPayment.toString(),
        loanInterestRate: (loanProduct.interestRates[1] * 100).toFixed(1),
        loanTermMonths: Math.min(60, loanProduct.maxTermMonths).toString()
      }))
    }
  }, [formData.purchaseType])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleOptimalSuggestion = () => {
    const productPrice = parseFloat(formData.productPrice)
    const monthlyCapacity = parseFloat(formData.monthlyInvestmentCapacity)
    const loanProduct = LOAN_PRODUCTS.find(p => p.type === formData.loanType)
    
    if (productPrice > 0 && monthlyCapacity > 0 && loanProduct) {
      const suggestion = suggestOptimalLoanTerms(
        productPrice,
        monthlyCapacity,
        loanProduct.interestRates
      )
      
      setFormData(prev => ({
        ...prev,
        downPaymentPercentage: suggestion.downPaymentPercentage.toString(),
        loanInterestRate: (suggestion.interestRate * 100).toFixed(1),
        loanTermMonths: suggestion.termMonths.toString()
      }))
      
      setShowOptimalSuggestion(true)
      success(`最適なローン条件を提案しました（月次支払額: ¥${suggestion.monthlyPayment.toLocaleString()}）`)
    }
  }

  const handleROIOptimization = () => {
    const productPrice = parseFloat(formData.productPrice)
    const currentSavings = parseFloat(formData.currentSavings)
    const loanInterestRate = parseFloat(formData.loanInterestRate) / 100
    const loanTermMonths = parseInt(formData.loanTermMonths)
    const investmentReturn = parseFloat(formData.investmentReturn) / 100
    const analysisYears = parseFloat(formData.analysisYears)
    const monthlyCapacity = parseFloat(formData.monthlyInvestmentCapacity)

    if (productPrice > 0 && currentSavings > 0 && monthlyCapacity > 0) {
      try {
        const maxDownPayment = Math.min(100, Math.floor((currentSavings / productPrice) * 100))
        
        const optimization = findOptimalDownPaymentForROI(
          productPrice,
          currentSavings,
          loanInterestRate,
          loanTermMonths,
          investmentReturn,
          analysisYears,
          monthlyCapacity,
          0,
          maxDownPayment
        )
        
        setRoiOptimization(optimization)
        setFormData(prev => ({
          ...prev,
          downPaymentPercentage: optimization.optimalDownPayment.toString()
        }))
        
        success(`ROI最大化: 最適頭金比率は${optimization.optimalDownPayment}%です（ROI: ${optimization.maxROI.toFixed(2)}%）`)
      } catch (error) {
        console.error('ROI最適化エラー:', error)
        error('ROI最適化の計算でエラーが発生しました')
      }
    }
  }

  const runSimulation = () => {
    console.log('購入シミュレーション開始:', formData)
    const newErrors: { [key: string]: string } = {}

    // バリデーション
    const productPrice = parseFloat(formData.productPrice)
    const currentSavings = parseFloat(formData.currentSavings)
    const downPaymentPercentage = parseFloat(formData.downPaymentPercentage)
    const loanInterestRate = parseFloat(formData.loanInterestRate) / 100
    const loanTermMonths = parseInt(formData.loanTermMonths)
    const investmentReturn = parseFloat(formData.investmentReturn) / 100
    const analysisYears = parseFloat(formData.analysisYears)
    const monthlyCapacity = parseFloat(formData.monthlyInvestmentCapacity)

    // 必須項目のチェック
    if (!formData.productPrice || isNaN(productPrice) || productPrice <= 0) {
      newErrors.productPrice = '有効な商品価格を入力してください'
    }
    
    if (!formData.currentSavings || isNaN(currentSavings) || currentSavings < 0) {
      newErrors.currentSavings = '有効な現在の貯金額を入力してください'
    }
    
    // 頭金比率の基本チェック
    if (downPaymentPercentage < 0 || downPaymentPercentage > 100) {
      newErrors.downPaymentPercentage = '頭金比率は0-100%の範囲で入力してください'
    }
    
    // 頭金不足の警告（エラーではなく警告として表示）
    const requiredDownPayment = productPrice * (downPaymentPercentage / 100)
    if (currentSavings < requiredDownPayment && !newErrors.downPaymentPercentage) {
      const maxAffordablePercentage = Math.floor((currentSavings / productPrice) * 100)
      // 警告メッセージとして設定（エラーではないので続行可能）
      console.warn(`頭金不足: 現在の貯金額では頭金${downPaymentPercentage}%に不足。推奨: ${maxAffordablePercentage}%以下`)
    }
    
    if (loanInterestRate < 0 || loanInterestRate > 0.5) {
      newErrors.loanInterestRate = 'ローン金利は0-50%の範囲で入力してください'
    }
    
    if (loanTermMonths < 6 || loanTermMonths > 480) {
      newErrors.loanTermMonths = 'ローン期間は6-480ヶ月の範囲で入力してください'
    }
    
    if (investmentReturn < -0.5 || investmentReturn > 0.5) {
      newErrors.investmentReturn = '投資リターンは-50%-50%の範囲で入力してください'
    }
    
    if (analysisYears < 1 || analysisYears > 30) {
      newErrors.analysisYears = '分析期間は1-30年の範囲で入力してください'
    }
    
    if (monthlyCapacity < 0) {
      newErrors.monthlyInvestmentCapacity = '月次投資可能額は0以上で入力してください'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      console.log('シミュレーション計算開始...')
      const sim = calculatePurchaseSimulation(
        goal.id,
        formData.productName,
        productPrice,
        currentSavings,
        {
          downPaymentPercentage,
          interestRate: loanInterestRate,
          termMonths: loanTermMonths
        },
        investmentReturn,
        analysisYears,
        monthlyCapacity
      )
      
      console.log('シミュレーション結果:', sim)
      setSimulation(sim)
      
      const recommendationText = sim.recommendation === 'lump_sum' 
        ? '一括払いが有利です' 
        : 'ローン分割払いが有利です'
      
      success(`購入シミュレーションが完了しました（推奨: ${recommendationText}）`)
    } catch (err) {
      console.error('シミュレーションエラー:', err)
      error('シミュレーション計算でエラーが発生しました: ' + (err as Error).message)
    }
  }

  const selectedLoanProduct = LOAN_PRODUCTS.find(p => p.type === formData.loanType)

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-6 -mx-6 -mt-6 mb-6">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-2">
            購入シミュレーター
          </h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
            一括払い vs ローン分割払いの比較分析
          </p>
        </div>
      </div>

      <GlassCard>
        {/* セクション1: 商品情報 */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
              1
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              商品情報
            </h3>
          </div>
          
          <div className="space-y-6">
            {/* 商品タイプ選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                商品タイプ
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {PURCHASE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleInputChange('purchaseType', option.id)}
                    className={`
                      p-3 rounded-lg border text-left transition-all duration-200
                      ${formData.purchaseType === option.id
                        ? 'glass-primary text-white'
                        : 'glass-effect text-gray-700 dark:text-gray-300 hover:glass-secondary'
                      }
                    `}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">{option.icon}</div>
                      <div className="font-medium text-xs">{option.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="商品名"
                  type="text"
                  placeholder="例: 新車購入"
                  value={formData.productName}
                  onChange={(value) => handleInputChange('productName', value)}
                  required
                />
              </div>
              <div>
                <Input
                  label="商品価格"
                  type="number"
                  placeholder="3000000"
                  value={formData.productPrice}
                  onChange={(value) => handleInputChange('productPrice', value)}
                  error={errors.productPrice}
                  prefix="¥"
                  required
                />
              </div>
            </div>

            <div>
              <Input
                label="現在の貯金額"
                type="number"
                placeholder="1500000"
                value={formData.currentSavings}
                onChange={(value) => handleInputChange('currentSavings', value)}
                error={errors.currentSavings}
                prefix="¥"
                required
              />
              {goal.currentAmount >= goal.targetAmount && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  ✅ 目標達成済み！購入に十分な資金があります
                </p>
              )}
            </div>
          </div>
        </div>

        {/* セクション2: ローン条件 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                ローン条件
              </h3>
            </div>
            <div className="flex gap-2">
              <Button
                variant="accent"
                size="sm"
                onClick={handleOptimalSuggestion}
              >
                最適条件を提案
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleROIOptimization}
              >
                🎯 ROI最大化
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {/* ローンタイプ選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                ローンタイプ
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {LOAN_PRODUCTS.map((product) => (
                  <button
                    key={product.type}
                    onClick={() => handleInputChange('loanType', product.type)}
                    className={`
                      p-3 rounded-lg border text-left transition-all duration-200
                      ${formData.loanType === product.type
                        ? 'glass-primary text-white'
                        : 'glass-effect text-gray-700 dark:text-gray-300 hover:glass-secondary'
                      }
                    `}
                  >
                    <div className="text-center">
                      <div className="text-xl mb-1">{product.icon}</div>
                      <div className="font-medium text-xs">{product.name}</div>
                      <div className="text-xs opacity-75">
                        {(product.interestRates[1] * 100).toFixed(1)}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  label="頭金比率"
                  type="number"
                  placeholder="20"
                  value={formData.downPaymentPercentage}
                  onChange={(value) => handleInputChange('downPaymentPercentage', value)}
                  error={errors.downPaymentPercentage}
                  suffix="%"
                  required
                />
                {(() => {
                  const downPayment = parseFloat(formData.downPaymentPercentage) || 0
                  const productPrice = parseFloat(formData.productPrice) || 0
                  const currentSavings = parseFloat(formData.currentSavings) || 0
                  const requiredAmount = productPrice * (downPayment / 100)
                  
                  if (productPrice > 0 && downPayment > 0) {
                    if (currentSavings >= requiredAmount) {
                      return (
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                          ✅ 頭金: ¥{Math.round(requiredAmount).toLocaleString()}（支払い可能）
                        </p>
                      )
                    } else {
                      return (
                        <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                          ⚠️ 頭金: ¥{Math.round(requiredAmount).toLocaleString()}（不足: ¥{Math.round(requiredAmount - currentSavings).toLocaleString()}）
                        </p>
                      )
                    }
                  }
                  return null
                })()}
              </div>
              <div>
                <Input
                  label="ローン金利"
                  type="number"
                  placeholder="3.5"
                  value={formData.loanInterestRate}
                  onChange={(value) => handleInputChange('loanInterestRate', value)}
                  error={errors.loanInterestRate}
                  suffix="%"
                  required
                />
              </div>
              <div>
                <Input
                  label="ローン期間"
                  type="number"
                  placeholder="60"
                  value={formData.loanTermMonths}
                  onChange={(value) => handleInputChange('loanTermMonths', value)}
                  error={errors.loanTermMonths}
                  suffix="ヶ月"
                  required
                />
              </div>
            </div>

            {selectedLoanProduct && (
              <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="font-medium mb-1">参考金利範囲: {(selectedLoanProduct.interestRates[0] * 100).toFixed(1)}% - {(selectedLoanProduct.interestRates[2] * 100).toFixed(1)}%</p>
                <p>最大期間: {selectedLoanProduct.maxTermMonths}ヶ月 / 推奨頭金: {selectedLoanProduct.defaultDownPayment}%</p>
              </div>
            )}
          </div>
        </div>

        {/* セクション3: 投資・分析条件 */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
              3
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              投資・分析条件
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                label="期待投資リターン"
                type="number"
                placeholder="5.0"
                value={formData.investmentReturn}
                onChange={(value) => handleInputChange('investmentReturn', value)}
                error={errors.investmentReturn}
                suffix="%"
                required
              />
            </div>
            <div>
              <Input
                label="分析期間"
                type="number"
                placeholder="5"
                value={formData.analysisYears}
                onChange={(value) => handleInputChange('analysisYears', value)}
                error={errors.analysisYears}
                suffix="年"
                required
              />
            </div>
            <div>
              <Input
                label="月次投資可能額"
                type="number"
                placeholder="50000"
                value={formData.monthlyInvestmentCapacity}
                onChange={(value) => handleInputChange('monthlyInvestmentCapacity', value)}
                error={errors.monthlyInvestmentCapacity}
                prefix="¥"
                required
              />
            </div>
          </div>
        </div>

        {/* ROI最適化結果 */}
        {roiOptimization && (
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                🎯
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                ROI最適化結果
              </h3>
            </div>
            
            <GlassCard variant="primary">
              <div className="text-white">
                <h4 className="font-semibold mb-3">最適化サマリー</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="opacity-80">最適頭金比率</p>
                    <p className="font-bold text-lg">{roiOptimization.optimalDownPayment}%</p>
                  </div>
                  <div>
                    <p className="opacity-80">最大ROI</p>
                    <p className="font-bold text-lg">{roiOptimization.maxROI.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="opacity-80">分析対象</p>
                    <p className="font-bold text-lg">{roiOptimization.roiAnalysis.filter(a => a.feasible).length}パターン</p>
                  </div>
                </div>
                
                <div className="mt-4 text-xs opacity-80">
                  💡 この比率で最も効率的な資産運用が可能です。現在の条件に自動的に反映されました。
                </div>
              </div>
            </GlassCard>
          </div>
        )}

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

      {/* 購入シミュレーション結果 */}
      {simulation && (
        <PurchaseSimulationResults 
          simulation={simulation}
        />
      )}
    </div>
  )
}

export default PurchaseSimulationForm