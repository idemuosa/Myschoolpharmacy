import api from './api';
import { db, addToSyncQueue } from './db';

const expenseService = {
  getExpenses: async (config = {}) => {
    try {
      const response = await api.get('expenses/', config);
      const expenses = response.data.results || response.data;
      if (Array.isArray(expenses)) {
        await db.expenses.bulkPut(expenses);
      }
      return { data: expenses };
    } catch (error) {
      console.error("Network failed, fetching from local DB", error);
      try {
        const localExpenses = await db.expenses.toArray();
        return { data: localExpenses };
      } catch (dbError) {
        throw dbError;
      }
    }
  },

  addExpense: async (expenseData) => {
    try {
      const response = await api.post('expenses/', expenseData);
      await db.expenses.add(response.data);
      return response;
    } catch (error) {
      console.error("Online expense addition failed, fallback to offline", error);
      const id = await db.expenses.add(expenseData);
      const offlineExpense = { ...expenseData, id, date: new Date().toISOString() };
      await addToSyncQueue('CREATE', 'expenses', offlineExpense);
      return { data: offlineExpense, status: 201 };
    }
  },

  deleteExpense: async (id) => {
    try {
      await api.delete(`expenses/${id}/`);
      await db.expenses.delete(id);
    } catch (error) {
      console.error("Online delete failed, queueing", error);
      await addToSyncQueue('DELETE', 'expenses', { id });
      await db.expenses.delete(id);
    }
    return { status: 204 };
  },

  getFinancialSummary: async () => {
    try {
      return await api.get('expenses/financial-summary/');
    } catch (error) {
      console.error("Financial summary offline, calculating from local data");
      try {
        const expenses = await db.expenses.toArray();
        const sales = await db.sales.toArray();
        const smSales = await db.supermarketSales.toArray();

        const totalExpenses = expenses.reduce((acc, e) => acc + parseFloat(e.amount || 0), 0);
        const revenue = [...sales, ...smSales].reduce((acc, s) => acc + parseFloat(s.total_amount || 0), 0);

        return {
          data: {
            total_revenue: revenue,
            total_expenses: totalExpenses,
            net_profit: revenue - totalExpenses,
            balance: revenue - totalExpenses
          }
        };
      } catch (dbError) {
        return { data: { total_revenue: 0, total_expenses: 0, net_profit: 0, balance: 0 } };
      }
    }
  }
};

export default expenseService;
