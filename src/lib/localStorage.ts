import { Contract, Revenue, Expense } from '@/types';

const KEYS = {
  CONTRACTS: 'imobiliaria_contracts',
  REVENUES: 'imobiliaria_revenues',
  EXPENSES: 'imobiliaria_expenses',
};

export const storage = {
  contracts: {
    get: (): Contract[] => {
      const data = localStorage.getItem(KEYS.CONTRACTS);
      return data ? JSON.parse(data) : [];
    },
    set: (contracts: Contract[]) => {
      localStorage.setItem(KEYS.CONTRACTS, JSON.stringify(contracts));
    },
  },
  revenues: {
    get: (): Revenue[] => {
      const data = localStorage.getItem(KEYS.REVENUES);
      return data ? JSON.parse(data) : [];
    },
    set: (revenues: Revenue[]) => {
      localStorage.setItem(KEYS.REVENUES, JSON.stringify(revenues));
    },
  },
  expenses: {
    get: (): Expense[] => {
      const data = localStorage.getItem(KEYS.EXPENSES);
      return data ? JSON.parse(data) : [];
    },
    set: (expenses: Expense[]) => {
      localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
    },
  },
};
