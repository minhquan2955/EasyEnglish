import { useState, useEffect, useMemo } from "react";
import {
  EnvelopeSimple,
  MagnifyingGlass,
  Clock,
  CheckCircle,
  XCircle,
  PhoneCall,
  WarningCircle,
  CalendarBlank,
  Note,
} from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function RegistrationManagement() {
  const { user } = useAuth();

  // States
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, pending, contacted, completed, rejected
  const [updatingId, setUpdatingId] = useState(null);

  // Fetch all registrations
  const fetchRegistrations = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/registrations");
      setRegistrations(data || []);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Lỗi kết nối khi tải danh sách đăng ký",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchRegistrations();
    }
  }, [user]);

  // Update registration status
  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    setError("");
    try {
      await api.put(`/registrations/${id}`, { status: newStatus });
      setSuccess("Cập nhật trạng thái thành công!");
      setRegistrations((prev) =>
        prev.map((reg) =>
          reg._id === id ? { ...reg, status: newStatus } : reg,
        ),
      );
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Lỗi kết nối khi cập nhật trạng thái",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // Compute stats from all registrations
  const stats = useMemo(() => {
    const total = registrations.length;
    const pending = registrations.filter((r) => r.status === "pending").length;
    const contacted = registrations.filter(
      (r) => r.status === "contacted",
    ).length;
    const completed = registrations.filter(
      (r) => r.status === "completed",
    ).length;
    const rejected = registrations.filter(
      (r) => r.status === "rejected",
    ).length;
    return { total, pending, contacted, completed, rejected };
  }, [registrations]);

  // Filter & Search logic
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      // 1. Filter by status tab
      const matchesStatus =
        statusFilter === "all" || reg.status === statusFilter;

      // 2. Filter by search keyword
      const search = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !search ||
        (reg.parentName && reg.parentName.toLowerCase().includes(search)) ||
        (reg.childName && reg.childName.toLowerCase().includes(search)) ||
        (reg.phone && reg.phone.includes(search)) ||
        (reg.email && reg.email.toLowerCase().includes(search)) ||
        (reg.notes && reg.notes.toLowerCase().includes(search));

      return matchesStatus && matchesSearch;
    });
  }, [registrations, statusFilter, searchTerm]);

  // Guard for role
  if (user?.role !== "admin") {
    return (
      <div className="p-8 text-center text-gray-400">
        Bạn không có quyền truy cập trang này. Chỉ Admin mới có thể quản lý các
        đăng ký tư vấn.
      </div>
    );
  }

  // Get status color helper
  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return {
          text: "Chờ liên hệ",
          class: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
        };
      case "contacted":
        return {
          text: "Đã liên hệ",
          class: "bg-sky-500/10 text-sky-500 border border-sky-500/20",
        };
      case "completed":
        return {
          text: "Hoàn thành",
          class:
            "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
        };
      case "rejected":
        return {
          text: "Từ chối",
          class: "bg-rose-500/10 text-rose-500 border border-rose-500/20",
        };
      default:
        return {
          text: status,
          class: "bg-gray-500/10 text-gray-500 border border-gray-500/20",
        };
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl text-black tracking-tight font-light">
          Quản lý Đăng ký
        </h1>
        <p className="text-gray-400 mt-1">
          Quản lý danh sách các yêu cầu đăng ký tư vấn học từ trang chủ của hệ
          thống.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total */}
        <div className="bg-surface-dark-card border border-gray-800 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              Tổng số
            </p>
            <h3 className="text-2xl text-white mt-1 font-semibold">
              {stats.total}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-ps-blue/10 text-ps-blue flex items-center justify-center">
            <EnvelopeSimple size={20} weight="fill" />
          </div>
        </div>

        {/* Pending */}
        <div className="bg-surface-dark-card border border-gray-800 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              Chờ liên hệ
            </p>
            <h3 className="text-2xl text-amber-500 mt-1 font-semibold">
              {stats.pending}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Clock size={20} weight="fill" />
          </div>
        </div>

        {/* Contacted */}
        <div className="bg-surface-dark-card border border-gray-800 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              Đã liên hệ
            </p>
            <h3 className="text-2xl text-sky-500 mt-1 font-semibold">
              {stats.contacted}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center">
            <PhoneCall size={20} weight="fill" />
          </div>
        </div>

        {/* Completed */}
        <div className="bg-surface-dark-card border border-gray-800 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              Hoàn thành
            </p>
            <h3 className="text-2xl text-emerald-500 mt-1 font-semibold">
              {stats.completed}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle size={20} weight="fill" />
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-surface-dark-card border border-gray-800 rounded-lg p-4 flex items-center justify-between col-span-2 md:col-span-1">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              Từ chối
            </p>
            <h3 className="text-2xl text-rose-500 mt-1 font-semibold">
              {stats.rejected}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <XCircle size={20} weight="fill" />
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-red-600/10 border border-red-600/20 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
          <WarningCircle size={20} />
          <p className="text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle size={20} />
          <p className="text-sm">{success}</p>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-dark-card border border-gray-800 p-4 rounded-lg">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Tìm theo tên PH, tên học sinh, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-black border border-gray-800 rounded-md text-white focus:outline-none focus:border-ps-blue transition-colors text-sm"
          />
        </div>

        {/* Status Tab Filters */}
        <div className="flex flex-wrap gap-1.5 bg-black/40 p-1 rounded-md border border-gray-800/40">
          {[
            { id: "all", label: "Tất cả" },
            { id: "pending", label: "Chờ liên hệ" },
            { id: "contacted", label: "Đã liên hệ" },
            { id: "completed", label: "Hoàn thành" },
            { id: "rejected", label: "Từ chối" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2 rounded-sm text-xs font-medium transition-all ${
                statusFilter === tab.id
                  ? "bg-ps-blue text-white shadow-md"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/40"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 bg-surface-dark-card border border-gray-800 rounded-lg">
          Đang tải danh sách đăng ký tư vấn...
        </div>
      ) : (
        <div className="bg-surface-dark-card rounded-lg border border-gray-800 overflow-hidden shadow-lg">
          <div className="p-4 bg-surface-dark-elevated border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-white font-medium text-sm">
              Kết quả hiển thị:{" "}
              <span className="text-ps-blue font-bold">
                {filteredRegistrations.length}
              </span>{" "}
              đăng ký
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap md:whitespace-normal">
              <thead className="bg-surface-dark-elevated text-gray-400 border-b border-gray-800 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium w-12 text-center">
                    STT
                  </th>
                  <th className="px-6 py-4 font-medium min-w-[150px]">
                    Phụ huynh
                  </th>
                  <th className="px-6 py-4 font-medium min-w-[120px]">
                    Liên hệ
                  </th>
                  <th className="px-6 py-4 font-medium min-w-[150px]">
                    Học viên (Tuổi)
                  </th>
                  <th className="px-6 py-4 font-medium max-w-[250px] whitespace-normal">
                    Ghi chú yêu cầu
                  </th>
                  <th className="px-6 py-4 font-medium min-w-[120px]">
                    Ngày gửi
                  </th>
                  <th className="px-6 py-4 font-medium min-w-[120px]">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 font-medium min-w-[140px] text-right">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-6 py-16 text-center text-gray-500"
                    >
                      Không tìm thấy biểu mẫu đăng ký nào khớp với tiêu chí tìm
                      kiếm.
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((reg, idx) => {
                    const statusInfo = getStatusStyle(reg.status);
                    return (
                      <tr
                        key={reg._id}
                        className="hover:bg-gray-800/20 transition-colors"
                      >
                        <td className="px-6 py-4 text-center text-gray-500 font-medium text-xs">
                          {idx + 1}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white font-medium">
                            {reg.parentName}
                          </p>
                        </td>
                        <td className="px-6 py-4 space-y-1">
                          <p className="text-ps-blue font-mono text-xs flex items-center gap-1">
                            <PhoneCall size={12} /> {reg.phone}
                          </p>
                          {reg.email && (
                            <p className="text-gray-400 text-xs font-mono">
                              {reg.email}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white">{reg.childName}</p>
                          {reg.childAge && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {reg.childAge} tuổi
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 max-w-[250px] whitespace-normal text-xs text-gray-400">
                          {reg.notes ? (
                            <div className="flex items-start gap-1">
                              <Note
                                size={14}
                                className="text-gray-500 mt-0.5 shrink-0"
                              />
                              <span>{reg.notes}</span>
                            </div>
                          ) : (
                            <span className="text-gray-600 italic">
                              Không có ghi chú
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <CalendarBlank
                              size={14}
                              className="text-gray-500"
                            />
                            {new Date(reg.createdAt).toLocaleDateString(
                              "vi-VN",
                              {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block ${statusInfo.class}`}
                          >
                            {statusInfo.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <select
                            value={reg.status}
                            disabled={updatingId === reg._id}
                            onChange={(e) =>
                              handleStatusChange(reg._id, e.target.value)
                            }
                            className="bg-black border border-gray-800 text-xs rounded-md h-9 px-2 focus:outline-none focus:border-ps-blue text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:border-gray-700"
                          >
                            <option value="pending">Chờ liên hệ</option>
                            <option value="contacted">Đã liên hệ</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="rejected">Từ chối</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
