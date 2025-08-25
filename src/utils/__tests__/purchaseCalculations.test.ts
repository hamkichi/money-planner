import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const source = readFileSync(join(__dirname, '../purchaseCalculations.ts'), 'utf8')
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } })
const module: { exports: any } = { exports: {} }
const wrapper = new Function('module', 'exports', outputText)
wrapper(module, module.exports)
const { calculateROI, calculateMonthlyLoanPayment } = module.exports as {
  calculateROI: (initialInvestment: number, finalAssets: number, totalCost: number) => number
  calculateMonthlyLoanPayment: (principal: number, annualRate: number, months: number) => number
}

test('calculateMonthlyLoanPayment returns principal divided by months when interest is 0%', () => {
  const payment = calculateMonthlyLoanPayment(1200, 0, 12)
  assert.equal(payment, 100)
})

test('calculateMonthlyLoanPayment calculates correct payment with positive interest', () => {
  const payment = calculateMonthlyLoanPayment(1000, 0.12, 12)
  assert.ok(Math.abs(payment - 88.84878867834166) < 1e-6)
})

test('calculateROI returns 0 when final assets equal total cost', () => {
  const roi = calculateROI(1000, 1000, 1000)
  assert.equal(roi, 0)
})

test('calculateROI returns positive percentage when final assets exceed cost', () => {
  const roi = calculateROI(1000, 1100, 1000)
  assert.equal(roi, 10)
})
