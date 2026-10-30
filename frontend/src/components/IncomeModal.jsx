import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import ErrorMessage from './ErrorMessage';
import { FiDollarSign, FiTag, FiCalendar, FiRepeat, FiFileText } from 'react-icons/fi';

const CATEGORIES = ['Salary', 'Freelance', 'Investments', 'Dividends', 'Rental', 'Business', 'Other'];
const FREQUENCIES = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'ONE_TIME', label: 'One-Time' },
  { value: 'ANNUALLY', label: 'Annually' },
  { value: 'WEEKLY', label: 'Weekly' },
];

const IncomeModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const isEditing = !!initialData;

  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Salary');
  const [frequency, setFrequency] = useState('MONTHLY');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setSource(initialData.source || '');
      setAmount(initialData.amount !== undefined ? String(initialData.amount) : '');
      setCategory(initialData.category || 'Salary');
      setFrequency(initialData.frequency || 'MONTHLY');
      setDate(
        initialData.date
          ? new Date(initialData.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setNotes(initialData.notes || '');
    } else {
      setSource('');
      setAmount('');
      setCategory('Salary');
      setFrequency('MONTHLY');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be a positive number greater than ₹0.00');
      return;
    }

    if (!source.trim()) {
      setError('Income source is required');
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit({
        source: source.trim(),
        amount: parsedAmount,
        category,
        frequency,
        date,
        notes: notes.trim() || null,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save income record');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Income Record' : 'Add New Income'}
      maxWidth="max-w-lg"
    >
      {error && <ErrorMessage title="Form Validation Error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Income Source"
          id="income-source"
          placeholder="e.g. Primary Salary, Client Project"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Amount (₹)"
            id="income-amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            icon={FiDollarSign}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Category *</label>
            <div className="relative">
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
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Frequency *</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {FREQUENCIES.map((freq) => (
                <option key={freq.value} value={freq.value}>
                  {freq.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Received Date"
            id="income-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            icon={FiCalendar}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300">Notes (Optional)</label>
          <textarea
            rows={3}
            placeholder="Add optional notes or descriptions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Add Income'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default IncomeModal;
