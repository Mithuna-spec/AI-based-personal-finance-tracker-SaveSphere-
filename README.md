<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=30&pause=1000&color=36BCF7&center=true&vCenter=true&width=800&lines=SaveSphere;AI-Driven+Personal+Finance+Management;Smart+Money+Allocation+%26+Goal+Planner" alt="SaveSphere Animated Heading" />

<p>
  <strong>Take Control of Your Money. Plan Your Goals. Build Your Future.</strong>
</p>

<p>
  An intelligent personal finance management platform that transforms financial data into meaningful insights and actionable recommendations.
</p>

<p>
  <img src="https://img.shields.io/badge/React-2026-blue?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Node.js-Backend-green?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/Express.js-Framework-black?style=for-the-badge&logo=express" />
  <img src="https://img.shields.io/badge/MySQL-Database-blue?style=for-the-badge&logo=mysql" />
  <img src="https://img.shields.io/badge/AI-Powered-purple?style=for-the-badge" />
</p>

</div>

---

## 📌 Overview

**SaveSphere** is an AI-driven personal finance management and goal-planning application designed to help individuals understand, organize, and optimize their financial activities.

Unlike traditional expense trackers that primarily record transactions, SaveSphere focuses on understanding a user's overall financial situation, including income, expenses, budgets, savings, loans, emergency funds, and financial goals.

Its intelligent financial analysis and goal-aware money allocation engine evaluate available funds, financial commitments, and savings priorities to provide personalized recommendations.

The main objective is to help users answer:

> **"I have this much money. How should I manage and allocate it while achieving my financial goals?"**

---

## ✨ Key Features

### 💰 Personal Finance Management

* Track multiple sources of income.
* Record and categorize daily expenses.
* Monitor monthly budgets and spending limits.
* Maintain a centralized financial dashboard.

### 🎯 Financial Goal Planner

* Create and manage multiple financial goals.
* Set target amounts and deadlines.
* Calculate remaining savings requirements.
* Monitor goal progress and feasibility.
* Prioritize goals based on urgency and importance.

### 🏦 EMI & Loan Management

* Maintain loan and EMI information.
* Track monthly financial obligations.
* Include EMI commitments in available-money calculations.

### 🛡️ Emergency Fund Planner

* Calculate recommended emergency fund targets.
* Monitor current emergency savings.
* Identify emergency fund shortages.
* Track financial safety progress.

### 🧠 AI-Powered Financial Intelligence

* Analyze personal spending patterns.
* Identify unusual spending behavior.
* Detect budget pressure and overspending.
* Generate personalized financial insights.
* Provide intelligent financial recommendations.
* Answer financial questions using the user's financial context.

### 📊 Financial Analytics

* Visualize income and expense trends.
* Analyze category-wise spending.
* Monitor budget utilization.
* Track savings and financial goal progress.
* Understand monthly financial performance.

### ⚡ Intelligent Money Allocation

* Evaluate available money after financial commitments.
* Prioritize emergency savings and financial goals.
* Calculate suitable allocation amounts.
* Ensure total allocations do not exceed available funds.

---

## 🚀 What Makes SaveSphere Different?

Traditional expense trackers mainly focus on recording financial transactions.

SaveSphere goes further by connecting spending behavior with financial goals.

| Traditional Expense Trackers   | SaveSphere                           |
| ------------------------------ | ------------------------------------ |
| Record income and expenses     | Complete financial overview          |
| Basic expense categorization   | Financial behavior analysis          |
| Manual savings tracking        | Goal-aware savings planning          |
| Basic budget monitoring        | Budget utilization and risk insights |
| Limited financial guidance     | Personalized AI recommendations      |
| No unified allocation strategy | Intelligent money allocation         |

**Core Innovation:** Goal-aware financial intelligence that evaluates a user's complete financial situation and recommends how available money should be distributed across financial priorities.

---

## 🏗️ System Architecture

SaveSphere follows a three-tier architecture enhanced with an AI-powered financial intelligence component.

```text
                 ┌───────────────────────┐
                 │         USER          │
                 └───────────┬───────────┘
                             │
                             ▼
              ┌────────────────────────────┐
              │     PRESENTATION LAYER     │
              │                            │
              │ React.js + Vite            │
              │ Tailwind CSS               │
              │ Dashboard & Analytics      │
              └─────────────┬──────────────┘
                            │
                         REST APIs
                            │
                            ▼
              ┌────────────────────────────┐
              │     APPLICATION LAYER      │
              │                            │
              │ Node.js + Express.js       │
              │ JWT Authentication         │
              │ Financial Calculation      │
              │ Money Allocation Engine    │
              │ Recommendation Services   │
              └──────────┬─────────┬───────┘
                         │         │
                         ▼         ▼
              ┌────────────────┐ ┌────────────────┐
              │   DATA LAYER   │ │    AI LAYER    │
              │                │ │                │
              │ Prisma ORM     │ │ Groq API       │
              │ MySQL Database │ │ AI Insights    │
              │ Financial Data │ │ Recommendations│
              └────────────────┘ └────────────────┘
```

*The AI service operates through the backend and uses verified financial calculations as its source of numerical information.*

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* React Router DOM
* Axios
* Recharts
* React Icons

### Backend

* Node.js
* Express.js
* JavaScript
* REST API
* JWT Authentication
* bcrypt

### Database & ORM

* MySQL
* Prisma ORM

### Artificial Intelligence

* Groq API (configured AI provider)
* AI-powered financial analysis
* Personalized recommendation engine
* Deterministic financial calculation engine

### Development Tools

* Visual Studio Code
* Git & GitHub
* Postman
* Antigravity

---

## 🧮 Core Financial Intelligence

SaveSphere uses deterministic financial calculations to maintain numerical accuracy.

**Available Money**

```text
Available Money =
Total Income - Total Expenses - EMI Obligations
```

**Goal Savings Requirement**

```text
Remaining Amount =
Target Amount - Current Savings
```

```text
Required Monthly Savings =
Remaining Amount / Remaining Months
```

**Budget Utilization**

```text
Budget Utilization (%) =
(Actual Spending / Budget Amount) × 100
```

**Emergency Fund Target**

```text
Emergency Fund Target =
Essential Monthly Expenses × Target Months
```

The AI layer interprets these calculated results to generate useful insights without replacing the financial calculation engine.

---

## 📂 Project Modules

| Module          | Description                                 |
| --------------- | ------------------------------------------- |
| Authentication  | User registration, login, and secure access |
| Dashboard       | Centralized financial overview              |
| Income          | Income tracking and management              |
| Expenses        | Expense tracking and categorization         |
| Budgets         | Budget creation and monitoring              |
| Goals           | Financial goal planning                     |
| EMI & Loans     | Loan and installment management             |
| Emergency Fund  | Emergency savings planning                  |
| Analytics       | Financial reports and visualizations        |
| AI Tracker      | Spending analysis and behavioral insights   |
| Recommendations | Personalized financial guidance             |
| Profile         | User account management                     |

---

## ⚙️ Installation & Setup

Follow these steps to run SaveSphere locally.

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
```

```bash
cd YOUR_REPOSITORY
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
PORT=5000
DATABASE_URL="mysql://USERNAME:PASSWORD@localhost:3306/savesphere"

JWT_SECRET=your_secure_jwt_secret

AI_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=your_supported_groq_model
```

Configure your MySQL database and environment variables.

Run Prisma migrations if the database has not already been migrated:

```bash
npx prisma migrate dev
```

Generate Prisma Client:

```bash
npx prisma generate
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create the frontend environment file if your project requires one:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

### 4. Access the Application

```text
Frontend: http://localhost:5173

Backend:  http://localhost:5000

Health API: http://localhost:5000/api/health
```

*Adjust directory names, API routes, environment variables, and ports according to your actual project configuration.*

---

## 🔐 Security

* JWT-based user authentication.
* Password hashing using bcrypt.
* Protected backend API endpoints.
* User-specific financial data access.
* Environment variables for sensitive credentials.
* Server-side financial calculations and validation.
* AI API keys restricted to the backend.

**Never commit your `.env` file or expose API keys in the frontend.**

---

## 🔮 Future Enhancements

* Secure bank account integration and automated transaction imports.
* Mobile application for Android and iOS.
* Advanced financial forecasting.
* Smart financial notifications and spending alerts.
* Improved personalized financial planning.
* Enhanced financial reports and export functionality.

---

## 🎯 Project Objective

SaveSphere aims to make personal financial management more intelligent, accessible, and goal-oriented.

By combining financial tracking, deterministic calculations, intelligent money allocation, and AI-powered recommendations, it helps users move beyond simply tracking money toward making better financial decisions.

<div align="center">

### 💙 Manage Smart. Save Better. Achieve More.

**SaveSphere — Your Money, Your Goals, Your Future.**

<img src="https://capsule-render.vercel.app/api?type=waving&color=36BCF7&height=120&section=footer" width="100%" />

</div>
