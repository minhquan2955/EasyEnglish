import React, { useState, useEffect } from "react";
import {
  Users,
  ChalkboardTeacher,
  UsersThree,
} from "@phosphor-icons/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const [period, setPeriod] = useState("month");
  const [stats, setStats] = useState({
    totals: { students: 0, teachers: 0, parents: 0 },
    chartData: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `/api/admin/dashboard-stats?period=${period}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard stats");
        }

        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [period]);

  const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div
      className="p-6 flex items-center justify-between"
      style={{
        backgroundColor: "#121314", // surface-dark-elevated
        borderRadius: "8px",
      }}
    >
      <div>
        <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
        <h3
          className="text-4xl text-white"
          style={{ fontWeight: 300, letterSpacing: "0.1px" }}
        >
          {value}
        </h3>
      </div>
      <div className={`p-4 rounded-full ${colorClass}`}>
        <Icon size={32} weight="duotone" className="text-white" />
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto text-white">
      <div className="mb-8">
        <h1
          className="text-4xl mb-2 text-white"
          style={{ fontWeight: 300, letterSpacing: "0.1px" }}
        >
          Dashboard
        </h1>
        <p className="text-gray-400">
          Tổng quan số liệu người dùng và đăng ký hệ thống.
        </p>
      </div>

      {/* Error / Loading states */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg mb-8">
          {error}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard
          title="Tổng Học Sinh"
          value={loading ? "..." : stats.totals.students}
          icon={Users}
          colorClass="bg-[#0070d1]"
        />
        <StatCard
          title="Tổng Giáo Viên"
          value={loading ? "..." : stats.totals.teachers}
          icon={ChalkboardTeacher}
          colorClass="bg-purple-600"
        />
        <StatCard
          title="Tổng Phụ Huynh"
          value={loading ? "..." : stats.totals.parents}
          icon={UsersThree}
          colorClass="bg-emerald-600"
        />
      </div>

      {/* Chart Section */}
      <div
        className="p-8"
        style={{
          backgroundColor: "#121314", // surface-dark-elevated
          borderRadius: "8px",
        }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2
            className="text-2xl text-white"
            style={{ fontWeight: 300, letterSpacing: "0.1px" }}
          >
            Đăng ký mới
          </h2>

          {/* Button Group (PlayStation Style) */}
          <div className="flex bg-black p-1 rounded-full border border-gray-800">
            {["week", "month", "year"].map((p) => {
              const isActive = period === p;
              const label =
                p === "week" ? "Tuần" : p === "month" ? "Tháng" : "Năm";
              return (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className="px-6 py-2 text-sm transition-all duration-200"
                  style={{
                    borderRadius: "9999px",
                    backgroundColor: isActive ? "#0070d1" : "transparent",
                    color: isActive ? "#ffffff" : "#a1a1aa", // text-gray-400
                    fontWeight: isActive ? 500 : 400,
                  }}
                  onMouseOver={(e) => {
                    if (!isActive) e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseOut={(e) => {
                    if (!isActive) e.currentTarget.style.color = "#a1a1aa";
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chart */}
        <div className="h-[400px] w-full">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center text-gray-500">
              Đang tải dữ liệu...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats.chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRegs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0070d1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0070d1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#3f3f46"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="#a1a1aa"
                  tick={{ fill: "#a1a1aa", fontSize: 12 }}
                  tickMargin={12}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#a1a1aa"
                  tick={{ fill: "#a1a1aa", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#121314",
                    border: "1px solid #3f3f46",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  itemStyle={{ color: "#0070d1" }}
                />
                <Area
                  type="monotone"
                  dataKey="registrations"
                  name="Đăng ký"
                  stroke="#0070d1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRegs)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
