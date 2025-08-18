import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts'

// カスタムツールチップ
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-800 dark:text-white">{`月: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.name}: ¥${entry.value?.toLocaleString()}`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// 資産推移グラフ（一括払い vs ローン払い）
interface AssetComparisonChartProps {
  data: Array<{
    month: number
    lumpSumAssets: number
    loanAssets: number
    loanBalance?: number
  }>
}

export const AssetComparisonChart: React.FC<AssetComparisonChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis 
          dataKey="month" 
          stroke="#6B7280"
          tick={{ fontSize: 12 }}
          label={{ value: '経過月数', position: 'insideBottom', offset: -5 }}
        />
        <YAxis 
          stroke="#6B7280"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `¥${(value / 1000000).toFixed(1)}M`}
          label={{ value: '資産額', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        
        {/* ローン残高をエリアで表示 */}
        <Area
          type="monotone"
          dataKey="loanBalance"
          stackId="1"
          stroke="#EF4444"
          fill="#EF4444"
          fillOpacity={0.1}
          name="ローン残高"
        />
        
        {/* 一括払い資産推移 */}
        <Line
          type="monotone"
          dataKey="lumpSumAssets"
          stroke="#3B82F6"
          strokeWidth={3}
          dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
          name="一括払い資産"
        />
        
        {/* ローン払い資産推移 */}
        <Line
          type="monotone"
          dataKey="loanAssets"
          stroke="#10B981"
          strokeWidth={3}
          dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
          name="ローン払い資産"
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

// 月次キャッシュフローグラフ
interface CashflowChartProps {
  data: Array<{
    month: number
    loanPayment?: number
    investmentContribution: number
    netCashflow: number
  }>
}

export const CashflowChart: React.FC<CashflowChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis 
          dataKey="month" 
          stroke="#6B7280"
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          stroke="#6B7280"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        
        <Bar dataKey="loanPayment" fill="#EF4444" name="ローン支払" />
        <Bar dataKey="investmentContribution" fill="#10B981" name="投資額" />
        <Bar dataKey="netCashflow" fill="#3B82F6" name="純キャッシュフロー" />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ポートフォリオ構成円グラフ
interface PortfolioChartProps {
  data: Array<{
    name: string
    value: number
    color: string
  }>
}

export const PortfolioChart: React.FC<PortfolioChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: any, name) => [`¥${value.toLocaleString()}`, name]}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

// ROI比較バーチャート
interface ROIComparisonChartProps {
  data: Array<{
    scenario: string
    totalCost: number
    finalAssets: number
    roi: number
  }>
}

export const ROIComparisonChart: React.FC<ROIComparisonChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis 
          dataKey="scenario" 
          stroke="#6B7280"
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          stroke="#6B7280"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `${value.toFixed(1)}%`}
        />
        <Tooltip 
          content={({ active, payload, label }: any) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload
              return (
                <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{label}</p>
                  <p className="text-sm text-blue-600">ROI: {data.roi.toFixed(1)}%</p>
                  <p className="text-sm text-gray-600">総コスト: ¥{data.totalCost.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">最終資産: ¥{data.finalAssets.toLocaleString()}</p>
                </div>
              )
            }
            return null
          }}
        />
        <Legend />
        
        <Bar dataKey="roi" fill="#8B5CF6" name="ROI %" />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ローン返済スケジュールグラフ
interface LoanScheduleChartProps {
  data: Array<{
    month: number
    principal: number
    interest: number
    balance: number
  }>
}

export const LoanScheduleChart: React.FC<LoanScheduleChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis 
          dataKey="month" 
          stroke="#6B7280"
          tick={{ fontSize: 12 }}
          label={{ value: '経過月数', position: 'insideBottom', offset: -5 }}
        />
        <YAxis 
          stroke="#6B7280"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        
        {/* 元本と利息のスタックバー */}
        <Bar dataKey="principal" stackId="payment" fill="#10B981" name="元本返済" />
        <Bar dataKey="interest" stackId="payment" fill="#EF4444" name="利息支払" />
        
        {/* ローン残高の線グラフ */}
        <Line
          type="monotone"
          dataKey="balance"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={false}
          name="ローン残高"
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

// 頭金比率別ROI分析グラフ
interface ROIOptimizationChartProps {
  data: Array<{
    downPayment: number
    roi: number
    finalAssets: number
    totalCost: number
    monthlyPayment: number
    feasible: boolean
  }>
  optimalDownPayment: number
}

export const ROIOptimizationChart: React.FC<ROIOptimizationChartProps> = ({ 
  data, 
  optimalDownPayment 
}) => {
  // 実行可能なデータのみフィルタ
  const feasibleData = data.filter(item => item.feasible && item.roi > -Infinity)
  
  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={feasibleData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis 
          dataKey="downPayment" 
          stroke="#6B7280"
          tick={{ fontSize: 12 }}
          label={{ value: '頭金比率 (%)', position: 'insideBottom', offset: -5 }}
        />
        <YAxis 
          yAxisId="roi"
          stroke="#6B7280"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `${value.toFixed(1)}%`}
          label={{ value: 'ROI (%)', angle: -90, position: 'insideLeft' }}
        />
        <YAxis 
          yAxisId="payment"
          orientation="right"
          stroke="#6B7280"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
          label={{ value: '月次支払額', angle: 90, position: 'insideRight' }}
        />
        <Tooltip 
          content={({ active, payload, label }: any) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload
              return (
                <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    頭金比率: {label}%
                  </p>
                  <p className="text-sm text-purple-600">ROI: {data.roi.toFixed(2)}%</p>
                  <p className="text-sm text-blue-600">月次支払: ¥{data.monthlyPayment.toLocaleString()}</p>
                  <p className="text-sm text-green-600">最終資産: ¥{data.finalAssets.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">総コスト: ¥{data.totalCost.toLocaleString()}</p>
                </div>
              )
            }
            return null
          }}
        />
        <Legend />
        
        {/* ROI曲線 */}
        <Line
          yAxisId="roi"
          type="monotone"
          dataKey="roi"
          stroke="#8B5CF6"
          strokeWidth={3}
          dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 3 }}
          name="ROI (%)"
        />
        
        {/* 月次支払額のエリアチャート */}
        <Area
          yAxisId="payment"
          type="monotone"
          dataKey="monthlyPayment"
          stroke="#3B82F6"
          fill="#3B82F6"
          fillOpacity={0.1}
          name="月次支払額"
        />
        
        {/* 最適点をマーク */}
        <Line
          yAxisId="roi"
          type="monotone"
          dataKey={(data: any) => data.downPayment === optimalDownPayment ? data.roi : null}
          stroke="#EF4444"
          strokeWidth={0}
          dot={{ fill: '#EF4444', strokeWidth: 3, r: 8 }}
          name="最適点"
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}