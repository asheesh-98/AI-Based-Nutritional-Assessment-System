import api from './api';

export const mealService = {
  async getWeeklyMealPlan(dietType = 'vegetarian') {
    const { data } = await api.get(`/meal-plan/weekly?preference=${dietType}`);
    return data;
  },

  async getMealPlanHistory() {
    const { data } = await api.get('/meal-plan/history');
    return data;
  },

  async regeneratePlan(dietType) {
    const { data } = await api.post('/meal-plan/regenerate', { diet_preference: dietType, daily_calorie_target: 2000 });
    return data;
  },
};

export default mealService;
