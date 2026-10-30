import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import ErrorMessage from './ErrorMessage';
import { FiDollarSign, FiCalendar, FiFlag, FiTag, FiCheckCircle } from 'react-icons/fi';

const CATEGORIES = [
  { value: 'SAVINGS', label: 'Savings Reserve' },
  { value: 'INVESTMENT', label: 'Investment Portfolio' },
  { value: 'PURCHASE', label: 'Asset / Purchase' },
  { value: 'RETIREMENT', label: 'Retirement' },
  { value: 'OTHER', label: 'Other Goal' },
];

const PRIORITIES = [
  { value: 'HIGH', label: 'High Priority' },
  { value: 'MEDIUM', label: 'Medium Priority' },
  { value: 'LOW', label: 'Low Priority' },
];

const STATUSES = [
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'ACHIEVED', label: 'Achieved' },
  { value: 'PAUSED', label: 'Paused' },
];

const GoalModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const isEditing = !!initialData;

  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [targetDate, setTargetDate] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [category, setCategory] = useState('SAVINGS');
  const [status, setStatus] = useState('IN_PROGRESS');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setTargetAmount(
        initialData.targetAmount !== undefined ? String(initialData.targetAmount) : ''
      );
      setCurrentAmount(
        initialData.currentAmount !== undefined ? String(initialData.currentAmount) : '0'
      );
      setTargetDate(
        initialData.targetDate
          ? new Date(initialData.targetDate).toISOString().split('T')[0]
          : ''
      );
      setPriority(initialData.priority || 'MEDIUM');
      setCategory(initialData.category || 'SAVINGS');
      setStatus(initialData.status || 'IN_PROGRESS');
    } else {
      // Default target date 6 months from now
      const d = new Date();
      d.setMonth(d.getMonth() + 6);
      setTitle('');
      setTargetAmount('');
      setCurrentAmount('0');
      setTargetDate(d.toISOString().split('T')[0]);
      setPriority('MEDIUM');
      setCategory('SAVINGS');
      setStatus('IN_PROGRESS');
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const parsedTarget = parseFloat(targetAmount);
    const parsedCurrent = parseFloat(currentAmount || '0');

    if (!title.trim()) {
      setError('Goal title is required');
      return;
    }

    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      setError('Target amount must be a positive number greater than ₹0.00');
      return;
    }

    if (isNaN(parsedCurrent) || parsedCurrent < 0) {
      setError('Current saved amount cannot be negative');
      return;
    }

    if (!targetDate) {
      setError('Target deadline date is required');
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit({
        title: title.trim(),
        targetAmount: parsedTarget,
        currentAmount: parsedCurrent,
        targetDate,
        priority,
        category,
        status,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save financial goal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Financial Goal' : 'Create New Financial Goal'}
      maxWidth="max-w-lg"
    >
      {error && <ErrorMessage title="Form Error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Goal Title"
          id="goal-title"
          placeholder="e.g. Emergency Fund, House Down Payment, Vacation"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Target Goal Amount (₹)"
            id="goal-target"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="e.g. 10000.00"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            icon={FiDollarSign}
            required
          />

          <Input
            label="Currently Saved (₹)"
            id="goal-current"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
            icon={FiDollarSign}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Target Deadline Date"
            id="goal-target-date"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            icon={FiCalendar}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Priority Level *</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Create Goal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GoalModal;
