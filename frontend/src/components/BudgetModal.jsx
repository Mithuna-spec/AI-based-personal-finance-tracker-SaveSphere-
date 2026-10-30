import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import ErrorMessage from './ErrorMessage';
import { FiDollarSign, FiCalendar, FiPieChart } from 'react-icons/fi';

const CATEGORIES = [
  'Food & Dining',
  'Housing',
  'Transportation',
  'Utilities',
  'Entertainment',
  'Shopping',
  'Healthcare',
  'Subscriptions',
  'Other',
];

const PERIODS = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'YEARLY', label: 'Yearly' },
];

const getDefaultDates = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
};

const BudgetModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const isEditing = !!initialData;
  const defaultDates = getDefaultDates();

  const [category, setCategory] = useState('Food & Dining');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState('MONTHLY');
  const [startDate, setStartDate] = useState(defaultDates.startDate);
  const [endDate, setEndDate] = useState(defaultDates.endDate);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category || 'Food & Dining');
      setAmount(initialData.amount !== undefined ? String(initialData.amount) : '');
      setPeriod(initialData.period || 'MONTHLY');
      setStartDate(
        initialData.startDate
          ? new Date(initialData.startDate).toISOString().split('T')[0]
          : defaultDates.startDate
      );
      setEndDate(
        initialData.endDate
          ? new Date(initialData.endDate).toISOString().split('T')[0]
          : defaultDates.endDate
      );
    } else {
      const d = getDefaultDates();
      setCategory('Food & Dining');
      setAmount('');
      setPeriod('MONTHLY');
      setStartDate(d.startDate);
      setEndDate(d.endDate);
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Budget amount must be a positive number greater than ₹0.00');
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      setError('End date must be strictly after the start date');
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit({
        category,
        amount: parsedAmount,
        period,
        startDate,
        endDate,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save budget');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Category Budget' : 'Create New Category Budget'}
      maxWidth="max-w-lg"
    >
      {error && <ErrorMessage title="Validation Error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Period *</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {PERIODS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label="Budget Limit Amount (₹)"
          id="budget-amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="e.g. 500.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          icon={FiDollarSign}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            id="budget-start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            icon={FiCalendar}
            required
          />

          <Input
            label="End Date"
            id="budget-end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            icon={FiCalendar}
            required
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Create Budget'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BudgetModal;
