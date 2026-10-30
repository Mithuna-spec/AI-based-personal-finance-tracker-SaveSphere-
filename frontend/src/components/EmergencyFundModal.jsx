import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import ErrorMessage from './ErrorMessage';
import { FiDollarSign, FiShield, FiCalendar } from 'react-icons/fi';

const TARGET_MONTHS_OPTIONS = [
  { value: 3, label: '3 Months (Basic Buffer)' },
  { value: 6, label: '6 Months (Recommended Safety Net)' },
  { value: 9, label: '9 Months (Extended Protection)' },
  { value: 12, label: '12 Months (Full Year Security)' },
  { value: 18, label: '18 Months (High Stability)' },
  { value: 24, label: '24 Months (Maximum Security)' },
];

const EmergencyFundModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [essentialMonthlyExpenses, setEssentialMonthlyExpenses] = useState('');
  const [targetMonths, setTargetMonths] = useState(6);
  const [currentAmount, setCurrentAmount] = useState('0');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setEssentialMonthlyExpenses(
        initialData.essentialMonthlyExpenses !== undefined
          ? String(initialData.essentialMonthlyExpenses)
          : ''
      );
      setTargetMonths(initialData.targetMonths || 6);
      setCurrentAmount(
        initialData.currentAmount !== undefined ? String(initialData.currentAmount) : '0'
      );
    } else {
      setEssentialMonthlyExpenses('');
      setTargetMonths(6);
      setCurrentAmount('0');
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const parsedExpenses = parseFloat(essentialMonthlyExpenses);
    const parsedMonths = parseInt(targetMonths, 10);
    const parsedCurrent = parseFloat(currentAmount || '0');

    if (isNaN(parsedExpenses) || parsedExpenses <= 0) {
      setError('Essential monthly expenses must be a positive number greater than ₹0.00');
      return;
    }

    if (isNaN(parsedCurrent) || parsedCurrent < 0) {
      setError('Current emergency savings cannot be negative');
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit({
        essentialMonthlyExpenses: parsedExpenses,
        targetMonths: parsedMonths,
        currentAmount: parsedCurrent,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save emergency fund configuration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configure Emergency Reserve Cushion"
      maxWidth="max-w-lg"
    >
      {error && <ErrorMessage title="Validation Error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Essential Monthly Living Expenses (₹)"
          id="essential-expenses"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="e.g. 2500.00"
          value={essentialMonthlyExpenses}
          onChange={(e) => setEssentialMonthlyExpenses(e.target.value)}
          icon={FiDollarSign}
          helperText="Housing, groceries, essential bills & EMIs required to survive monthly."
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Target Coverage Period *</label>
            <select
              value={targetMonths}
              onChange={(e) => setTargetMonths(parseInt(e.target.value, 10))}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {TARGET_MONTHS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Current Emergency Savings (₹)"
            id="current-savings"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
            icon={FiShield}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Save Configuration
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EmergencyFundModal;
