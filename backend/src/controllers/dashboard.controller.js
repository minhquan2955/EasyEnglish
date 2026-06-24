import User from "../models/User.js";
import Payment from "../models/Payment.js";

/**
 * @desc    Get dashboard statistics including user counts, registration chart data, and revenue data
 * @route   GET /api/admin/dashboard-stats
 * @access  Private (Admin only)
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const { period = "month" } = req.query; // 'week', 'month', 'year'

    // 1. Get totals
    const [totalStudents, totalTeachers, totalParents] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "teacher" }),
      User.countDocuments({ role: "parent" }),
    ]);

    // 2. Build aggregation for chart data
    const now = new Date();
    let startDate;
    let groupFormat;

    if (period === "week") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 6); // Last 7 days
      startDate.setHours(0, 0, 0, 0);
      groupFormat = "%Y-%m-%d"; // Format YYYY-MM-DD
    } else if (period === "month") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 29); // Last 30 days
      startDate.setHours(0, 0, 0, 0);
      groupFormat = "%Y-%m-%d";
    } else if (period === "year") {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 11); // Last 12 months
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      groupFormat = "%Y-%m"; // Format YYYY-MM
    } else {
      res.status(400);
      throw new Error("Invalid period specified. Use 'week', 'month', or 'year'.");
    }

    // User registration chart data
    const chartDataRaw = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Revenue chart data
    const revenueDataRaw = await Payment.aggregate([
      {
        $match: {
          paymentDate: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: "$paymentDate" } },
          totalRevenue: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Total revenue (all time)
    const totalRevenueResult = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    // Fill in missing dates with 0
    const chartData = [];
    const revenueChartData = [];

    if (period === "year") {
      for (let i = 0; i < 12; i++) {
        const d = new Date(startDate);
        d.setMonth(startDate.getMonth() + i);
        const monthStr = d.toISOString().slice(0, 7); // YYYY-MM
        const found = chartDataRaw.find((item) => item._id === monthStr);
        const revFound = revenueDataRaw.find((item) => item._id === monthStr);
        chartData.push({
          date: monthStr,
          registrations: found ? found.count : 0,
        });
        revenueChartData.push({
          date: monthStr,
          revenue: revFound ? revFound.totalRevenue : 0,
          transactions: revFound ? revFound.count : 0,
        });
      }
    } else {
      const days = period === "week" ? 7 : 30;
      for (let i = 0; i < days; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        const dayStr = d.toISOString().slice(0, 10); // YYYY-MM-DD
        const found = chartDataRaw.find((item) => item._id === dayStr);
        const revFound = revenueDataRaw.find((item) => item._id === dayStr);
        chartData.push({
          date: dayStr,
          registrations: found ? found.count : 0,
        });
        revenueChartData.push({
          date: dayStr,
          revenue: revFound ? revFound.totalRevenue : 0,
          transactions: revFound ? revFound.count : 0,
        });
      }
    }

    res.status(200).json({
      totals: {
        students: totalStudents,
        teachers: totalTeachers,
        parents: totalParents,
        totalRevenue,
      },
      chartData,
      revenueChartData,
    });
  } catch (error) {
    next(error);
  }
};

