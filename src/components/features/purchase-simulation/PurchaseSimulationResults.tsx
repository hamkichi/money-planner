import React, { useState, useMemo } from 'react'
import { PurchaseSimulation } from '../../../types/financial'
import { formatCurrency } from '../../../utils/formatters'
import GlassCard from '../../ui/GlassCard'
import Button from '../../ui/Button'
import { 
  AssetComparisonChart, 
  CashflowChart, 
  ROIComparisonChart, 
  LoanScheduleChart,
  ROIOptimizationChart 
} from '../../ui/Charts'

interface PurchaseSimulationResultsProps {
  simulation: PurchaseSimulation
  roiOptimization?: {
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
  } | null
}

const PurchaseSimulationResults: React.FC<PurchaseSimulationResultsProps> = ({ simulation, roiOptimization }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'lump-sum' | 'loan' | 'comparison' | 'charts'>('summary')
  
  // グラフ用データの計算
  const chartData = useMemo(() => {
    // 資産推移比較データ
    const assetComparisonData = simulation.lumpSumScenario.opportunity.monthlyProjections.map((lumpSum, index) => {
      const loan = simulation.loanScenario.opportunity.monthlyProjections[index]
      return {
        month: lumpSum.month,
        lumpSumAssets: lumpSum.investmentValue,
        loanAssets: loan ? loan.investmentValue : 0,
        loanBalance: loan?.loanBalance || 0
      }
    })

    // キャッシュフロー比較データ
    const cashflowData = simulation.loanScenario.opportunity.monthlyProjections.slice(0, 24).map(item => ({
      month: item.month,
      loanPayment: item.loanPayment || 0,
      investmentContribution: item.investmentContribution,
      netCashflow: item.investmentContribution - (item.loanPayment || 0)
    }))

    // ROI比較データ
    const lumpSumROI = ((simulation.lumpSumScenario.finalAssets - simulation.lumpSumScenario.totalCost) / simulation.lumpSumScenario.totalCost) * 100
    const loanROI = ((simulation.loanScenario.finalAssets - simulation.loanScenario.totalCost) / simulation.loanScenario.totalCost) * 100
    
    const roiComparisonData = [
      {
        scenario: '一括払い',
        totalCost: simulation.lumpSumScenario.totalCost,
        finalAssets: simulation.lumpSumScenario.finalAssets,
        roi: lumpSumROI
      },
      {
        scenario: 'ローン払い',
        totalCost: simulation.loanScenario.totalCost,
        finalAssets: simulation.loanScenario.finalAssets,
        roi: loanROI
      }
    ]

    // ローン返済スケジュールデータ
    const loanScheduleData = simulation.loanScenario.opportunity.monthlyProjections
      .filter(item => item.loanBalance && item.loanBalance > 0)
      .map(item => {
        const totalPayment = item.loanPayment || 0
        const interestPayment = (item.loanBalance || 0) * (simulation.loanScenario.interestRate / 12)
        const principalPayment = totalPayment - interestPayment
        
        return {
          month: item.month,
          principal: principalPayment,
          interest: interestPayment,
          balance: item.loanBalance || 0
        }
      })

    return {
      assetComparison: assetComparisonData,
      cashflow: cashflowData,
      roiComparison: roiComparisonData,
      loanSchedule: loanScheduleData
    }
  }, [simulation])

  const tabs = [
    { id: 'summary', label: '総合評価', icon: '📊' },
    { id: 'lump-sum', label: '一括払い', icon: '💰' },
    { id: 'loan', label: 'ローン払い', icon: '🏦' },
    { id: 'comparison', label: '詳細比較', icon: '⚖️' },
    { id: 'charts', label: 'グラフ比較', icon: '📈' }
  ]

  const renderSummaryTab = () => (
    <div className="space-y-6">
      {/* 推奨結果 */}
      <GlassCard variant={simulation.recommendation === 'lump_sum' ? 'primary' : 'secondary'}>
        <div className="text-center">
          <div className="text-4xl mb-4">
            {simulation.recommendation === 'lump_sum' ? '💰' : '🏦'}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            推奨: {simulation.recommendation === 'lump_sum' ? '一括払い' : 'ローン分割払い'}
          </h3>
          <p className="text-white opacity-90 mb-4">
            {simulation.recommendation === 'lump_sum' 
              ? 'ローン利息を避け、余剰資金を投資に回すことで資産を最大化'
              : '手元資金を投資に活用し、ローン支払いを並行して資産を増加'
            }
          </p>
          <div className="text-lg font-semibold text-white">
            差額: {formatCurrency(simulation.totalDifference)}
          </div>
        </div>
      </GlassCard>

      {/* 比較サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <span className="text-2xl mr-2">💰</span>
            一括払いシナリオ
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">初期支払額</span>
              <span className="font-semibold">{formatCurrency(simulation.lumpSumScenario.initialPayment)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">残存貯金</span>
              <span className="font-semibold">{formatCurrency(simulation.lumpSumScenario.remainingSavings)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">最終資産額</span>
              <span className="font-semibold text-blue-600">{formatCurrency(simulation.lumpSumScenario.finalAssets)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600 dark:text-gray-400">総コスト</span>
              <span className="font-semibold">{formatCurrency(simulation.lumpSumScenario.totalCost)}</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <span className="text-2xl mr-2">🏦</span>
            ローンシナリオ
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">頭金</span>
              <span className="font-semibold">{formatCurrency(simulation.loanScenario.downPayment)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">月次支払額</span>
              <span className="font-semibold">{formatCurrency(simulation.loanScenario.monthlyPayment)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">最終資産額</span>
              <span className="font-semibold text-green-600">{formatCurrency(simulation.loanScenario.finalAssets)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600 dark:text-gray-400">総コスト</span>
              <span className="font-semibold">{formatCurrency(simulation.loanScenario.totalCost)}</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* キーメトリクス */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="text-center">
          <div className="text-2xl mb-2">📈</div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">投資リターン差</p>
          <p className="text-lg font-bold text-purple-600">
            {formatCurrency(Math.abs(simulation.loanScenario.opportunity.investmentReturns - simulation.lumpSumScenario.opportunity.investmentReturns))}
          </p>
        </GlassCard>

        <GlassCard className="text-center">
          <div className="text-2xl mb-2">💸</div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ローン利息</p>
          <p className="text-lg font-bold text-red-600">
            {formatCurrency(simulation.loanScenario.totalInterest)}
          </p>
        </GlassCard>

        <GlassCard className="text-center">
          <div className="text-2xl mb-2">⏱️</div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ローン期間</p>
          <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
            {Math.round(simulation.loanScenario.loanTermMonths / 12)}年
          </p>
        </GlassCard>

        <GlassCard className="text-center">
          <div className="text-2xl mb-2">🎯</div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ROI差異</p>
          <p className="text-lg font-bold text-orange-600">
            {((simulation.loanScenario.finalAssets / simulation.lumpSumScenario.finalAssets - 1) * 100).toFixed(1)}%
          </p>
        </GlassCard>
      </div>
    </div>
  )

  const renderLumpSumTab = () => (
    <div className="space-y-6">
      <GlassCard variant="primary">
        <h3 className="text-xl font-bold text-white mb-4">一括払いシナリオ詳細</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
          <div>
            <h4 className="font-semibold mb-3">支払い詳細</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>商品価格</span>
                <span>{formatCurrency(simulation.productPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>一括支払額</span>
                <span>{formatCurrency(simulation.lumpSumScenario.initialPayment)}</span>
              </div>
              <div className="flex justify-between">
                <span>購入後残金</span>
                <span>{formatCurrency(simulation.lumpSumScenario.remainingSavings)}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">投資成果</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>月次投資額</span>
                <span>{formatCurrency(simulation.lumpSumScenario.monthlyInvestment)}</span>
              </div>
              <div className="flex justify-between">
                <span>投資元本合計</span>
                <span>{formatCurrency(simulation.lumpSumScenario.opportunity.totalInvested)}</span>
              </div>
              <div className="flex justify-between">
                <span>投資リターン</span>
                <span>{formatCurrency(simulation.lumpSumScenario.opportunity.investmentReturns)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-white/30 pt-2">
                <span>最終資産額</span>
                <span>{formatCurrency(simulation.lumpSumScenario.finalAssets)}</span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* 月次推移グラフ */}
      <GlassCard>
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">資産推移（一括払い）</h4>
        <AssetComparisonChart 
          data={chartData.assetComparison.map(item => ({
            month: item.month,
            lumpSumAssets: item.lumpSumAssets,
            loanAssets: 0, // 一括払いタブでは一括払いのみ表示
            loanBalance: 0
          }))} 
        />
      </GlassCard>
    </div>
  )

  const renderLoanTab = () => (
    <div className="space-y-6">
      <GlassCard variant="secondary">
        <h3 className="text-xl font-bold text-white mb-4">ローンシナリオ詳細</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
          <div>
            <h4 className="font-semibold mb-3">ローン詳細</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>商品価格</span>
                <span>{formatCurrency(simulation.productPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>頭金</span>
                <span>{formatCurrency(simulation.loanScenario.downPayment)}</span>
              </div>
              <div className="flex justify-between">
                <span>借入額</span>
                <span>{formatCurrency(simulation.loanScenario.loanAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>金利</span>
                <span>{(simulation.loanScenario.interestRate * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span>月次支払額</span>
                <span>{formatCurrency(simulation.loanScenario.monthlyPayment)}</span>
              </div>
              <div className="flex justify-between">
                <span>総利息</span>
                <span>{formatCurrency(simulation.loanScenario.totalInterest)}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">投資成果</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>頭金後残金</span>
                <span>{formatCurrency(simulation.loanScenario.remainingSavings)}</span>
              </div>
              <div className="flex justify-between">
                <span>月次投資額</span>
                <span>{formatCurrency(simulation.loanScenario.monthlyInvestment)}</span>
              </div>
              <div className="flex justify-between">
                <span>投資元本合計</span>
                <span>{formatCurrency(simulation.loanScenario.opportunity.totalInvested)}</span>
              </div>
              <div className="flex justify-between">
                <span>投資リターン</span>
                <span>{formatCurrency(simulation.loanScenario.opportunity.investmentReturns)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-white/30 pt-2">
                <span>最終資産額</span>
                <span>{formatCurrency(simulation.loanScenario.finalAssets)}</span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* ローン返済スケジュール */}
      <GlassCard>
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">月次キャッシュフロー</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2">月</th>
                <th className="text-right py-2">ローン残高</th>
                <th className="text-right py-2">月次支払</th>
                <th className="text-right py-2">投資額</th>
                <th className="text-right py-2">投資残高</th>
                <th className="text-right py-2">純資産</th>
              </tr>
            </thead>
            <tbody>
              {simulation.loanScenario.opportunity.monthlyProjections.slice(0, 12).map((projection) => (
                <tr key={projection.month} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-2">{projection.month}</td>
                  <td className="text-right py-2">
                    {projection.loanBalance ? formatCurrency(projection.loanBalance) : '-'}
                  </td>
                  <td className="text-right py-2">
                    {projection.loanPayment ? formatCurrency(projection.loanPayment) : '-'}
                  </td>
                  <td className="text-right py-2">
                    {formatCurrency(projection.investmentContribution)}
                  </td>
                  <td className="text-right py-2">
                    {formatCurrency(projection.investmentValue)}
                  </td>
                  <td className="text-right py-2 font-semibold">
                    {formatCurrency(projection.netWorth)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {simulation.loanScenario.opportunity.monthlyProjections.length > 12 && (
          <p className="text-sm text-gray-500 mt-2 text-center">
            最初の12ヶ月分を表示（全{simulation.loanScenario.opportunity.monthlyProjections.length}ヶ月）
          </p>
        )}
      </GlassCard>
    </div>
  )

  const renderComparisonTab = () => (
    <div className="space-y-6">
      {/* 総合比較 */}
      <GlassCard>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">詳細比較分析</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4">項目</th>
                <th className="text-center py-3 px-4">一括払い</th>
                <th className="text-center py-3 px-4">ローン払い</th>
                <th className="text-center py-3 px-4">差額</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 px-4 font-medium">初期支払額</td>
                <td className="text-center py-3 px-4">{formatCurrency(simulation.lumpSumScenario.initialPayment)}</td>
                <td className="text-center py-3 px-4">{formatCurrency(simulation.loanScenario.downPayment)}</td>
                <td className="text-center py-3 px-4">{formatCurrency(simulation.lumpSumScenario.initialPayment - simulation.loanScenario.downPayment)}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 px-4 font-medium">月次支払額</td>
                <td className="text-center py-3 px-4">-</td>
                <td className="text-center py-3 px-4">{formatCurrency(simulation.loanScenario.monthlyPayment)}</td>
                <td className="text-center py-3 px-4">-</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 px-4 font-medium">総支払額</td>
                <td className="text-center py-3 px-4">{formatCurrency(simulation.lumpSumScenario.totalCost)}</td>
                <td className="text-center py-3 px-4">{formatCurrency(simulation.loanScenario.totalCost)}</td>
                <td className="text-center py-3 px-4">{formatCurrency(simulation.loanScenario.totalCost - simulation.lumpSumScenario.totalCost)}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 px-4 font-medium">投資元本</td>
                <td className="text-center py-3 px-4">{formatCurrency(simulation.lumpSumScenario.opportunity.totalInvested)}</td>
                <td className="text-center py-3 px-4">{formatCurrency(simulation.loanScenario.opportunity.totalInvested)}</td>
                <td className="text-center py-3 px-4">{formatCurrency(simulation.loanScenario.opportunity.totalInvested - simulation.lumpSumScenario.opportunity.totalInvested)}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 px-4 font-medium">投資リターン</td>
                <td className="text-center py-3 px-4">{formatCurrency(simulation.lumpSumScenario.opportunity.investmentReturns)}</td>
                <td className="text-center py-3 px-4">{formatCurrency(simulation.loanScenario.opportunity.investmentReturns)}</td>
                <td className="text-center py-3 px-4">{formatCurrency(simulation.loanScenario.opportunity.investmentReturns - simulation.lumpSumScenario.opportunity.investmentReturns)}</td>
              </tr>
              <tr className="border-b-2 border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
                <td className="py-3 px-4 font-bold">最終資産額</td>
                <td className="text-center py-3 px-4 font-bold">{formatCurrency(simulation.lumpSumScenario.finalAssets)}</td>
                <td className="text-center py-3 px-4 font-bold">{formatCurrency(simulation.loanScenario.finalAssets)}</td>
                <td className="text-center py-3 px-4 font-bold text-green-600">{formatCurrency(simulation.loanScenario.finalAssets - simulation.lumpSumScenario.finalAssets)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* リスク分析 */}
      <GlassCard>
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">リスク分析</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-gray-800 dark:text-white mb-3">一括払いのリスク</h5>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• 流動性リスク: 現金が大幅に減少</li>
              <li>• 機会損失: 他の投資機会を逃す可能性</li>
              <li>• 急な出費に対応困難</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-gray-800 dark:text-white mb-3">ローン払いのリスク</h5>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• 金利リスク: 変動金利の場合の負担増</li>
              <li>• 債務負担: 長期間の返済義務</li>
              <li>• 投資リスク: 期待リターンが得られない可能性</li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </div>
  )

  const renderChartsTab = () => (
    <div className="space-y-8">
      {/* 資産推移比較グラフ */}
      <GlassCard>
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          <span className="text-2xl mr-2">📈</span>
          資産推移比較
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          一括払いとローン払いの資産推移を比較表示
        </p>
        <AssetComparisonChart data={chartData.assetComparison} />
      </GlassCard>

      {/* ROI比較グラフ */}
      <GlassCard>
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          <span className="text-2xl mr-2">📊</span>
          ROI比較
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          投資収益率の比較
        </p>
        <ROIComparisonChart data={chartData.roiComparison} />
      </GlassCard>

      {/* キャッシュフロー分析 */}
      <GlassCard>
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          <span className="text-2xl mr-2">💸</span>
          月次キャッシュフロー（最初の2年間）
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          ローン支払い、投資額、純キャッシュフローの推移
        </p>
        <CashflowChart data={chartData.cashflow} />
      </GlassCard>

      {/* ローン返済スケジュール */}
      {chartData.loanSchedule.length > 0 && (
        <GlassCard>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <span className="text-2xl mr-2">🏦</span>
            ローン返済スケジュール
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            元本・利息の内訳とローン残高の推移
          </p>
          <LoanScheduleChart data={chartData.loanSchedule} />
        </GlassCard>
      )}

      {/* ROI最適化分析 */}
      {roiOptimization && (
        <GlassCard>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <span className="text-2xl mr-2">🎯</span>
            ROI最適化分析
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            頭金比率とROIの関係、最適点の可視化
          </p>
          <ROIOptimizationChart 
            data={roiOptimization.roiAnalysis} 
            optimalDownPayment={roiOptimization.optimalDownPayment}
          />
          
          <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center mb-2">
              <span className="text-purple-600 font-semibold">🎯 最適化結果</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">最適頭金比率</p>
                <p className="font-bold text-purple-600">{roiOptimization.optimalDownPayment}%</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">最大ROI</p>
                <p className="font-bold text-purple-600">{roiOptimization.maxROI.toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">分析パターン数</p>
                <p className="font-bold text-purple-600">
                  {roiOptimization.roiAnalysis.filter(a => a.feasible).length}パターン
                </p>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* グラフの解釈ガイド */}
      <GlassCard>
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          📋 グラフの見方
        </h4>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <strong className="text-blue-600">資産推移比較:</strong> 
            青線（一括払い）と緑線（ローン払い）で長期的な資産の成長を比較。
            赤のエリアはローン残高を表示。
          </div>
          <div>
            <strong className="text-purple-600">ROI比較:</strong> 
            投資収益率を比較。高い方が効率的な資産運用を示す。
          </div>
          <div>
            <strong className="text-green-600">キャッシュフロー:</strong> 
            月次の支出と投資のバランスを確認。純キャッシュフローがマイナスの期間は
            ローン支払いが投資額を上回っている状態。
          </div>
          <div>
            <strong className="text-red-600">返済スケジュール:</strong> 
            ローンの元本（緑）と利息（赤）の割合変化。
            時間が経つにつれて元本の割合が増加する。
          </div>
        </div>
      </GlassCard>
    </div>
  )

  return (
    <GlassCard>
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4">
          購入シミュレーション結果
        </h2>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
          {simulation.productName}の購入方法別比較分析
        </p>
      </div>

      {/* タブナビゲーション */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex items-center px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200
              ${activeTab === tab.id
                ? 'bg-blue-500 text-white border-b-2 border-blue-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400'
              }
            `}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* タブコンテンツ */}
      <div className="min-h-[400px]">
        {activeTab === 'summary' && renderSummaryTab()}
        {activeTab === 'lump-sum' && renderLumpSumTab()}
        {activeTab === 'loan' && renderLoanTab()}
        {activeTab === 'comparison' && renderComparisonTab()}
        {activeTab === 'charts' && renderChartsTab()}
      </div>
    </GlassCard>
  )
}

export default PurchaseSimulationResults