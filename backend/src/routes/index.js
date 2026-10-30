const express = require('express');
const router = express.Router();
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const incomeRoutes = require('./incomeRoutes');
const expenseRoutes = require('./expenseRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const budgetRoutes = require('./budgetRoutes');
const goalRoutes = require('./goalRoutes');
const emiRoutes = require('./emiRoutes');
const emergencyFundRoutes = require('./emergencyFundRoutes');
const financialAnalysisRoutes = require('./financialAnalysisRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const recommendationRoutes = require('./recommendationRoutes');
const aiTrackerRoutes = require('./aiTrackerRoutes');

// Health Check Route
router.use('/health', healthRoutes);

// Authentication Routes
router.use('/auth', authRoutes);

// Income Management Routes
router.use('/incomes', incomeRoutes);

// Expense Management Routes
router.use('/expenses', expenseRoutes);

// Dashboard Summary Routes
router.use('/dashboard', dashboardRoutes);

// Budget Management Routes
router.use('/budgets', budgetRoutes);

// Financial Goal Planner Routes
router.use('/goals', goalRoutes);

// EMI & Loan Management Routes
router.use('/emis', emiRoutes);

// Emergency Fund Planner Routes
router.use('/emergency-fund', emergencyFundRoutes);

// Central Financial Calculation Engine Routes
router.use('/financial-analysis', financialAnalysisRoutes);

// Real Aggregated Financial Analytics Routes
router.use('/analytics', analyticsRoutes);

// Smart Money Allocation Engine Routes
router.use('/recommendations', recommendationRoutes);

// AI-Based Financial Tracker Routes
router.use('/ai-tracker', aiTrackerRoutes);

module.exports = router;
