/**
 * Unit Test Runner for Central Financial Calculation Engine
 */
const assert = require('assert');

// Pure calculation functions for deterministic unit testing
const calculateSavingsRate = (totalIncome, totalExpenses) => {
  if (totalIncome <= 0) return 0;
  const netSavings = totalIncome - totalExpenses;
  return Math.round(((netSavings / totalIncome) * 100) * 10) / 10;
};

const calculateDebtToIncomeRatio = (totalIncome, totalMonthlyEMI) => {
  if (totalIncome <= 0) return 0;
  return Math.round(((totalMonthlyEMI / totalIncome) * 100) * 10) / 10;
};

const calculateBudgetUtilization = (totalBudgeted, totalCategorySpent) => {
  if (totalBudgeted <= 0) return 0;
  return Math.round(((totalCategorySpent / totalBudgeted) * 100) * 10) / 10;
};

const calculateAvailableMoney = (totalIncome, totalExpenses, recurringExpenses, totalMonthlyEMI) => {
  return Math.max(0, totalIncome - totalExpenses - recurringExpenses - totalMonthlyEMI);
};

const calculateRequiredMonthlySavings = (targetAmount, currentAmount, remainingMonths, isAchieved) => {
  const remaining = Math.max(0, targetAmount - currentAmount);
  if (isAchieved || remaining <= 0) return 0;
  if (remainingMonths <= 0) return remaining;
  return Math.round((remaining / remainingMonths) * 100) / 100;
};

const runTests = () => {
  console.log('🧪 Starting Unit Tests for Financial Calculation Engine...\n');

  try {
    // Test 1: Zero Income Edge Case
    assert.strictEqual(calculateSavingsRate(0, 500), 0, 'Savings rate with zero income should be 0%');
    assert.strictEqual(calculateDebtToIncomeRatio(0, 200), 0, 'Debt to income ratio with zero income should be 0%');
    console.log('✅ Test 1 Passed: Zero income edge cases handled without division-by-zero.');

    // Test 2: Normal Savings Rate
    assert.strictEqual(calculateSavingsRate(10000, 2500), 75.0, 'Savings rate should be 75%');
    console.log('✅ Test 2 Passed: Normal positive savings rate calculated correctly (75.0%).');

    // Test 3: Negative Cash Flow
    assert.strictEqual(calculateSavingsRate(2000, 3000), -50.0, 'Negative savings rate calculated');
    assert.strictEqual(calculateAvailableMoney(2000, 3000, 500, 200), 0, 'Available money capped at 0 on negative cash flow');
    console.log('✅ Test 3 Passed: Negative cash flow & available money floor (0) handled.');

    // Test 4: Zero Budget Edge Case
    assert.strictEqual(calculateBudgetUtilization(0, 150), 0, 'Budget utilization with 0 budget should be 0%');
    assert.strictEqual(calculateBudgetUtilization(500, 250), 50.0, 'Budget utilization 50%');
    console.log('✅ Test 4 Passed: Zero budget and normal budget utilization calculated.');

    // Test 5: Goal Required Monthly Savings
    assert.strictEqual(calculateRequiredMonthlySavings(12000, 3000, 12, false), 750, 'Goal monthly savings $750/mo');
    assert.strictEqual(calculateRequiredMonthlySavings(5000, 5000, 6, true), 0, 'Completed goal required monthly is $0');
    console.log('✅ Test 5 Passed: Goal required monthly savings and completed goal zeroing verified.');

    console.log('\n🎉 ALL 5 CENTRAL FINANCIAL ENGINE UNIT TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Unit Test Failed:', err.message);
    process.exit(1);
  }
};

runTests();
