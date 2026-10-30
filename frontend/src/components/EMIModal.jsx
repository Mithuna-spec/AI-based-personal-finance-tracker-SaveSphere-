import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import ErrorMessage from './ErrorMessage';
import { FiDollarSign, FiCalendar, FiCreditCard, FiPercent, FiBriefcase } from 'react-icons/fi';

const getDefaultDates = () => {
  const start = new Date();
  const end = new Date();
  end.setFullYear(end.getFullYear() + 3);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
};

const EMIModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const isEditing = !!initialData;
  const defaultDates = getDefaultDates();

  const [loanName, setLoanName] = useState('');
  const [lender, setLender] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [remainingAmount, setRemainingAmount] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [startDate, setStartDate] = useState(defaultDates.startDate);
  const [endDate, setEndDate] = useState(defaultDates.endDate);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setLoanName(initialData.loanName || '');
      setLender(initialData.lender || '');
      setTotalAmount(
        initialData.totalAmount !== undefined ? String(initialData.totalAmount) : ''
      );
      setRemainingAmount(
        initialData.remainingAmount !== undefined ? String(initialData.remainingAmount) : ''
      );
      setMonthlyAmount(
        initialData.monthlyAmount !== undefined ? String(initialData.monthlyAmount) : ''
      );
      setInterestRate(
        initialData.interestRate !== undefined && initialData.interestRate !== null
          ? String(initialData.interestRate)
          : ''
      );
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
      setLoanName('');
      setLender('');
      setTotalAmount('');
      setRemainingAmount('');
      setMonthlyAmount('');
      setInterestRate('');
      setStartDate(d.startDate);
      setEndDate(d.endDate);
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const parsedTotal = parseFloat(totalAmount);
    const parsedRemaining = parseFloat(remainingAmount);
    const parsedMonthly = parseFloat(monthlyAmount);
    const parsedRate = interestRate ? parseFloat(interestRate) : null;

    if (!loanName.trim()) {
      setError('Loan name is required');
      return;
    }

    if (isNaN(parsedTotal) || parsedTotal <= 0) {
      setError('Total loan amount must be a positive number greater than ₹0.00');
      return;
    }

    if (isNaN(parsedRemaining) || parsedRemaining < 0) {
      setError('Remaining debt balance cannot be negative');
      return;
    }

    if (isNaN(parsedMonthly) || parsedMonthly <= 0) {
      setError('Monthly EMI amount must be a positive number greater than ₹0.00');
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      setError('Loan completion end date must be strictly after the start date');
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit({
        loanName: loanName.trim(),
        lender: lender.trim() || null,
        totalAmount: parsedTotal,
        remainingAmount: parsedRemaining,
        monthlyAmount: parsedMonthly,
        interestRate: parsedRate,
        startDate,
        endDate,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save loan / EMI record');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Loan / EMI Commitment' : 'Add New Loan / EMI Commitment'}
      maxWidth="max-w-lg"
    >
      {error && <ErrorMessage title="Validation Error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Loan Name"
            id="loan-name"
            placeholder="e.g. Car Loan, Home Mortgage, Education Loan"
            value={loanName}
            onChange={(e) => setLoanName(e.target.value)}
            icon={FiCreditCard}
            required
          />

          <Input
            label="Lender / Institution (Optional)"
            id="lender-name"
            placeholder="e.g. Chase, HDFC, Wells Fargo"
            value={lender}
            onChange={(e) => setLender(e.target.value)}
            icon={FiBriefcase}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Total Loan Principal (₹)"
            id="total-amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="e.g. 25000.00"
            value={totalAmount}
            onChange={(e) => {
              setTotalAmount(e.target.value);
              if (!isEditing && (!remainingAmount || remainingAmount === totalAmount)) {
                setRemainingAmount(e.target.value);
              }
            }}
            icon={FiDollarSign}
            required
          />

          <Input
            label="Remaining Balance (₹)"
            id="remaining-amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 18000.00"
            value={remainingAmount}
            onChange={(e) => setRemainingAmount(e.target.value)}
            icon={FiDollarSign}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Monthly EMI Amount (₹)"
            id="monthly-amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="e.g. 450.00"
            value={monthlyAmount}
            onChange={(e) => setMonthlyAmount(e.target.value)}
            icon={FiDollarSign}
            required
          />

          <Input
            label="Interest Rate (% p.a. Optional)"
            id="interest-rate"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 6.5"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            icon={FiPercent}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            id="emi-start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            icon={FiCalendar}
            required
          />

          <Input
            label="Loan Completion Date"
            id="emi-end-date"
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
            {isEditing ? 'Save Changes' : 'Add Loan / EMI'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EMIModal;
