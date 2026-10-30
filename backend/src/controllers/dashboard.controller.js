import * as dashboardService from '../services/dashboard.service.js';

export async function getDashboard(req, res, next) {
  try {
    const data = await dashboardService.getDashboardMetrics(req.user);
    return res.json(data);
  } catch (err) {
    next(err);
  }
}
