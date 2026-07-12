# Bank Customer Churn Analytics & Customer Retention Intelligence Platform

## 0. PROJECT CONTEXT

You are building a **Bank Customer Churn Analytics & Customer Retention Intelligence Platform** — a full-stack, data-driven web application, not a slide deck or a static notebook.

**Purpose**: Analyze bank customer data to explain *why customers leave*, surface *which customers matter most*, and recommend *retention strategies* — not just predict churn.

**Target users**: Bank managers, relationship teams, marketing, product managers, risk teams, executive leadership. Assume a **non-technical, executive-level audience** will be looking at this UI, so it needs to look like something a Chief Retention Officer would present in a board meeting — not a data-science demo.

**Core business questions the product must answer:**
- Why are customers leaving?
- Which customers are most valuable?
- Which segments should the bank focus on?
- Which products increase loyalty?
- What retention strategies will reduce churn?

**Tech stack**:
- **Data cleaning / feature engineering**: Python, Pandas, NumPy
- **Statistics**: SciPy, statsmodels
- **ML (optional, interpretability-first)**: scikit-learn (Logistic Regression, Decision Tree, Random Forest), SHAP for explainability
- **Database**: PostgreSQL
- **Backend API**: Python, FastAPI
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + a small custom design-token layer
- **Charts**: Recharts (primary), D3 only if Recharts genuinely can't do it
- **Auth (optional, later phase)**: simple JWT-based login, role-gated (Executive / Analyst / Manager)
- **Version control**: Git, with a conventional commit per phase

**Dataset**: The dataset is synthetic and modeled to have plausible correlations (e.g., low product count + low tenure + high complaints -> higher churn probability).

---
## Development Instructions
See individual folders for setup:
- `/frontend`: React + Vite frontend
- `/backend`: FastAPI backend
- `/data`: Datasets
- `/notebooks`: Exploratory analysis
