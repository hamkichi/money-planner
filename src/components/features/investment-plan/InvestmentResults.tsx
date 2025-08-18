import React, { useState } from 'react'
import { InvestmentSimulation } from '../../../types/financial'
import { formatCurrency, formatDate, formatDuration } from '../../../utils/formatters'
import GlassCard from '../../ui/GlassCard'
import Button from '../../ui/Button'
import ProgressBar from '../../ui/ProgressBar'

interface InvestmentResultsProps {
  simulation: InvestmentSimulation
  goalTitle: string
}

const InvestmentResults: React.FC<InvestmentResultsProps> = ({ simulation, goalTitle }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'projection' | 'scenarios'>('summary')

  const projectionDataLimit = Math.min(simulation.monthlyProjections.length, 120) // 最大10年分表示

  return (
    <div className="space-y-6">
      {/* タブナビゲーション */}
      <GlassCard>
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={activeTab === 'summary' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('summary')}
          >
            📊 概要
          </Button>
          <Button
            variant={activeTab === 'projection' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('projection')}
          >
            📈 推移
          </Button>
          <Button
            variant={activeTab === 'scenarios' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('scenarios')}
          >
            🎯 シナリオ
          </Button>
        </div>

        {/* 概要タブ */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                投資計画結果
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                目標「{goalTitle}」
              </p>
            </div>

            {/* メインKPI */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <GlassCard variant="primary" className="text-center text-white">
                <div className="text-3xl mb-2">🎯</div>
                <p className="text-sm opacity-80">達成予定期間</p>
                <p className="text-2xl font-bold">
                  {formatDuration(simulation.projectedMonths)}
                </p>
                <p className="text-xs opacity-60">
                  {formatDate(simulation.projectedCompletionDate)}
                </p>
              </GlassCard>

              <GlassCard variant="secondary" className="text-center text-white">
                <div className="text-3xl mb-2">💰</div>
                <p className="text-sm opacity-80">月次投資額</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(simulation.monthlyInvestment)}
                </p>
                <p className="text-xs opacity-60">
                  総投資額: {formatCurrency(simulation.totalInvested)}
                </p>
              </GlassCard>

              <GlassCard variant="accent" className="text-center text-white">
                <div className="text-3xl mb-2">📈</div>
                <p className="text-sm opacity-80">期待リターン</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(simulation.totalReturns)}
                </p>
                <p className="text-xs opacity-60">
                  年利: {(simulation.annualReturn * 100).toFixed(1)}%
                </p>
              </GlassCard>

              <GlassCard className="text-center">
                <div className="text-3xl mb-2">🎉</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">最終金額</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(simulation.currentAmount + simulation.totalInvested + simulation.totalReturns)}
                </p>
                <p className="text-xs text-gray-500">
                  ROI: {((simulation.totalReturns / simulation.totalInvested) * 100).toFixed(1)}%
                </p>
              </GlassCard>
            </div>

            {/* 進捗バー */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                目標達成への道のり
              </h4>
              
              <ProgressBar
                current={simulation.currentAmount}
                target={simulation.targetAmount}
                label="現在の進捗"
                showPercentage={true}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400">開始金額</p>
                  <p className="font-semibold text-blue-600 dark:text-blue-400">
                    {formatCurrency(simulation.currentAmount)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400">追加投資</p>
                  <p className="font-semibold text-green-600 dark:text-green-400">
                    +{formatCurrency(simulation.totalInvested)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400">運用益</p>
                  <p className="font-semibold text-purple-600 dark:text-purple-400">
                    +{formatCurrency(simulation.totalReturns)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 推移タブ */}
        {activeTab === 'projection' && (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
              月次推移予測（最初の{Math.min(120, simulation.monthlyProjections.length)}ヶ月）
            </h4>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-2">月</th>
                    <th className="text-right py-2 px-2">投資額</th>
                    <th className="text-right py-2 px-2">累計投資</th>
                    <th className="text-right py-2 px-2">運用益</th>
                    <th className="text-right py-2 px-2">総額</th>
                    <th className="text-right py-2 px-2">進捗</th>
                  </tr>
                </thead>
                <tbody>
                  {simulation.monthlyProjections.slice(0, projectionDataLimit).map((month, index) => (
                    <tr 
                      key={month.month} 
                      className={`border-b border-gray-100 dark:border-gray-800 ${
                        index % 12 === 11 ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <td className="py-1 px-2 font-medium">
                        {month.month}
                        {index % 12 === 11 && (
                          <span className="text-xs text-blue-600 dark:text-blue-400 ml-1">
                            ({Math.floor(month.month / 12)}年)
                          </span>
                        )}
                      </td>
                      <td className="text-right py-1 px-2">
                        ¥{month.monthlyInvestment.toLocaleString()}
                      </td>
                      <td className="text-right py-1 px-2">
                        ¥{month.cumulativeInvestment.toLocaleString()}
                      </td>
                      <td className="text-right py-1 px-2 text-green-600 dark:text-green-400">
                        ¥{month.cumulativeReturns.toLocaleString()}
                      </td>
                      <td className="text-right py-1 px-2 font-semibold">
                        ¥{month.totalValue.toLocaleString()}
                      </td>
                      <td className="text-right py-1 px-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          month.progress >= 100 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : month.progress >= 75
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                        }`}>
                          {month.progress.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {simulation.monthlyProjections.length > projectionDataLimit && (
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                残り{simulation.monthlyProjections.length - projectionDataLimit}ヶ月のデータがあります
              </p>
            )}
          </div>
        )}

        {/* シナリオタブ */}
        {activeTab === 'scenarios' && (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
              リスクシナリオ分析
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 保守的シナリオ */}
              <GlassCard className="text-center">
                <div className="text-3xl mb-2">🛡️</div>
                <h5 className="font-semibold text-gray-800 dark:text-white mb-2">
                  保守的シナリオ
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  年利 {(simulation.scenarios.conservative.annualReturn * 100).toFixed(1)}%
                </p>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">達成期間</p>
                    <p className="font-semibold">
                      {simulation.scenarios.conservative.projectedMonths >= 1200 
                        ? '100年以上' 
                        : formatDuration(simulation.scenarios.conservative.projectedMonths)
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">最終金額</p>
                    <p className="font-semibold text-orange-600 dark:text-orange-400">
                      {formatCurrency(simulation.scenarios.conservative.totalValue)}
                    </p>
                  </div>
                </div>
              </GlassCard>

              {/* 期待シナリオ */}
              <GlassCard variant="primary" className="text-center text-white">
                <div className="text-3xl mb-2">🎯</div>
                <h5 className="font-semibold mb-2">
                  期待シナリオ
                </h5>
                <p className="text-sm opacity-80 mb-3">
                  年利 {(simulation.scenarios.expected.annualReturn * 100).toFixed(1)}%
                </p>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="opacity-80">達成期間</p>
                    <p className="font-semibold">
                      {formatDuration(simulation.scenarios.expected.projectedMonths)}
                    </p>
                  </div>
                  <div>
                    <p className="opacity-80">最終金額</p>
                    <p className="font-semibold">
                      {formatCurrency(simulation.scenarios.expected.totalValue)}
                    </p>
                  </div>
                </div>
              </GlassCard>

              {/* 楽観的シナリオ */}
              <GlassCard className="text-center">
                <div className="text-3xl mb-2">🚀</div>
                <h5 className="font-semibold text-gray-800 dark:text-white mb-2">
                  楽観的シナリオ
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  年利 {(simulation.scenarios.optimistic.annualReturn * 100).toFixed(1)}%
                </p>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">達成期間</p>
                    <p className="font-semibold">
                      {formatDuration(simulation.scenarios.optimistic.projectedMonths)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">最終金額</p>
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(simulation.scenarios.optimistic.totalValue)}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>

            <GlassCard variant="secondary">
              <h5 className="font-semibold text-white mb-3">
                ⚠️ 投資リスクについて
              </h5>
              <ul className="text-sm text-white opacity-90 space-y-1 list-disc list-inside">
                <li>投資にはリスクが伴い、元本割れの可能性があります</li>
                <li>過去の実績は将来の運用成果を保証するものではありません</li>
                <li>市場環境により実際の結果は大きく異なる場合があります</li>
                <li>投資前に十分な情報収集と検討を行ってください</li>
              </ul>
            </GlassCard>
          </div>
        )}
      </GlassCard>
    </div>
  )
}

export default InvestmentResults