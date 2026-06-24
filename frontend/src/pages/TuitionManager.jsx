import { useState, useEffect } from "react";
import {
  Money,
  MagnifyingGlass,
  Receipt,
  X,
  CurrencyCircleDollar,
  CheckCircle,
  WarningCircle,
  Clock,
} from "@phosphor-icons/react";
import api from "../api";

const statusConfig = {
  paid: {
    label: "Đã đóng đủ",
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/30",
    icon: CheckCircle,
  },
  partial: {
    label: "Còn nợ",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/30",
    icon: Clock,
  },
  unpaid: {
    label: "Chưa đóng",
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/30",
    icon: WarningCircle,
  },
};

export default function TuitionManager() {
  const [tuitionList, setTuitionList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [payForm, setPayForm] = useState({
    amount: "",
    method: "cash",
    notes: "",
    receiptNumber: "",
  });
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Payment history modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyItem, setHistoryItem] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchTuitionList();
  }, []);

  const fetchTuitionList = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/tuition/admin");
      setTuitionList(data.tuitionList);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi tải dữ liệu học phí");
    } finally {
      setLoading(false);
    }
  };

  const openPayModal = (item) => {
    setSelectedItem(item);
    setPayForm({
      amount: item.remaining > 0 ? String(item.remaining) : "",
      method: "cash",
      notes: "",
      receiptNumber: "",
    });
    setError("");
    setSuccess("");
    setShowPayModal(true);
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setPaying(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/tuition/admin/pay", {
        studentId: selectedItem.student._id,
        classId: selectedItem.class._id,
        amount: Number(payForm.amount),
        method: payForm.method,
        notes: payForm.notes,
        receiptNumber: payForm.receiptNumber,
      });
      setSuccess("Ghi nhận thanh toán thành công!");
      setShowPayModal(false);
      fetchTuitionList();
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi ghi nhận thanh toán");
    } finally {
      setPaying(false);
    }
  };

  const openHistoryModal = async (item) => {
    setHistoryItem(item);
    setShowHistoryModal(true);
    setLoadingHistory(true);
    try {
      const { data } = await api.get(
        `/tuition/admin/history/${item.student._id}/${item.class._id}`
      );
      setPaymentHistory(data.payments);
    } catch (err) {
      console.error("Failed to load history:", err);
      setPaymentHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const filteredList = tuitionList.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.student.fullName || "").toLowerCase().includes(q) ||
      (item.student.studentCode || "").toLowerCase().includes(q) ||
      (item.class.classCode || "").toLowerCase().includes(q) ||
      (item.class.courseName || "").toLowerCase().includes(q)
    );
  });

  const formatCurrency = (n) =>
    n != null ? n.toLocaleString("vi-VN") + " đ" : "—";

  // Summary stats
  const totalFee = tuitionList.reduce((s, i) => s + i.tuitionFee, 0);
  const totalPaid = tuitionList.reduce((s, i) => s + i.totalPaid, 0);
  const totalRemaining = tuitionList.reduce(
    (s, i) => s + Math.max(0, i.remaining),
    0
  );

  return (
    <div className="p-8 max-w-7xl mx-auto text-white">
      <div className="mb-8">
        <h1
          className="text-4xl mb-2 text-white"
          style={{ fontWeight: 300, letterSpacing: "0.1px" }}
        >
          Quản lý Học phí
        </h1>
        <p className="text-gray-400">
          Quản lý tình trạng đóng học phí của tất cả học sinh.
        </p>
      </div>

      {/* Success / Error */}
      {success && (
        <div className="bg-green-900/50 border border-green-500 text-green-200 p-4 rounded-lg mb-6">
          {success}
        </div>
      )}
      {error && !showPayModal && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#121314] rounded-[8px] border border-gray-800 p-6">
          <p className="text-gray-400 text-sm mb-1">Tổng học phí</p>
          <p
            className="text-2xl text-white"
            style={{ fontWeight: 300 }}
          >
            {formatCurrency(totalFee)}
          </p>
        </div>
        <div className="bg-[#121314] rounded-[8px] border border-gray-800 p-6">
          <p className="text-gray-400 text-sm mb-1">Đã thu</p>
          <p
            className="text-2xl text-green-400"
            style={{ fontWeight: 300 }}
          >
            {formatCurrency(totalPaid)}
          </p>
        </div>
        <div className="bg-[#121314] rounded-[8px] border border-gray-800 p-6">
          <p className="text-gray-400 text-sm mb-1">Còn nợ</p>
          <p
            className="text-2xl text-red-400"
            style={{ fontWeight: 300 }}
          >
            {formatCurrency(totalRemaining)}
          </p>
        </div>
      </div>

      {/* Tuition Table */}
      <div className="bg-[#121314] rounded-[8px] border border-gray-800 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-6">
          <div className="flex items-center gap-2">
            <Money size={24} className="text-ps-blue" />
            <h2 className="text-xl" style={{ fontWeight: 300 }}>
              Danh sách Học phí
            </h2>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              <MagnifyingGlass size={16} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, mã HS, mã lớp..."
              className="h-9 pl-9 pr-3 bg-black border border-gray-800 text-white rounded-[4px] text-sm focus:outline-none focus:border-ps-blue transition-colors w-[280px] placeholder:text-gray-600"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Đang tải...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 uppercase text-xs">
                  <th className="pb-3 font-medium">Mã HS</th>
                  <th className="pb-3 font-medium">Họ tên</th>
                  <th className="pb-3 font-medium">Lớp</th>
                  <th className="pb-3 font-medium">Khóa học</th>
                  <th className="pb-3 font-medium text-right">Học phí</th>
                  <th className="pb-3 font-medium text-right">Đã đóng</th>
                  <th className="pb-3 font-medium text-right">Còn nợ</th>
                  <th className="pb-3 font-medium text-center">Trạng thái</th>
                  <th className="pb-3 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="py-8 text-center text-gray-500"
                    >
                      Không có dữ liệu học phí.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item) => {
                    const sc = statusConfig[item.status];
                    const StatusIcon = sc.icon;
                    return (
                      <tr
                        key={item.enrollmentId}
                        className="border-b border-gray-800/50 hover:bg-gray-800/20"
                      >
                        <td className="py-4 text-white font-medium">
                          {item.student.studentCode}
                        </td>
                        <td className="py-4 text-gray-300">
                          {item.student.fullName}
                        </td>
                        <td className="py-4 text-gray-300">
                          {item.class.classCode}
                        </td>
                        <td className="py-4 text-gray-400">
                          {item.class.courseName}
                        </td>
                        <td className="py-4 text-right text-white">
                          {formatCurrency(item.tuitionFee)}
                        </td>
                        <td className="py-4 text-right text-green-400">
                          {formatCurrency(item.totalPaid)}
                        </td>
                        <td className="py-4 text-right text-red-400">
                          {formatCurrency(
                            Math.max(0, item.remaining)
                          )}
                        </td>
                        <td className="py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${sc.bg} ${sc.color} ${sc.border} border`}
                          >
                            <StatusIcon size={12} weight="fill" />
                            {sc.label}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openHistoryModal(item)}
                              className="p-2 bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                              title="Xem lịch sử"
                            >
                              <Receipt size={16} />
                            </button>
                            {item.remaining > 0 && (
                              <button
                                onClick={() => openPayModal(item)}
                                className="px-3 py-1.5 bg-ps-blue text-white text-xs rounded hover:bg-ps-blue/80 transition-colors inline-flex items-center gap-1"
                              >
                                <CurrencyCircleDollar
                                  size={14}
                                  weight="bold"
                                />
                                Thu tiền
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pay Modal */}
      {showPayModal && selectedItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1a1b1c] border border-gray-700 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">Thu học phí</h3>
              <button
                onClick={() => setShowPayModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-800/50 rounded-lg text-sm space-y-1">
              <p>
                <span className="text-gray-400">Học sinh:</span>{" "}
                <span className="text-white">
                  {selectedItem.student.fullName} (
                  {selectedItem.student.studentCode})
                </span>
              </p>
              <p>
                <span className="text-gray-400">Lớp:</span>{" "}
                <span className="text-white">
                  {selectedItem.class.classCode} —{" "}
                  {selectedItem.class.courseName}
                </span>
              </p>
              <p>
                <span className="text-gray-400">Còn nợ:</span>{" "}
                <span className="text-red-400">
                  {formatCurrency(Math.max(0, selectedItem.remaining))}
                </span>
              </p>
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handlePay} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Số tiền (VND)
                </label>
                <input
                  type="number"
                  value={payForm.amount}
                  onChange={(e) =>
                    setPayForm({ ...payForm, amount: e.target.value })
                  }
                  required
                  min="1"
                  className="w-full h-12 px-4 bg-black border border-gray-800 rounded-[4px] text-white focus:outline-none focus:border-ps-blue transition-colors"
                  placeholder="Nhập số tiền"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Phương thức
                </label>
                <select
                  value={payForm.method}
                  onChange={(e) =>
                    setPayForm({ ...payForm, method: e.target.value })
                  }
                  className="w-full h-12 px-4 bg-black border border-gray-800 rounded-[4px] text-white focus:outline-none focus:border-ps-blue transition-colors appearance-none"
                >
                  <option value="cash">Tiền mặt</option>
                  <option value="transfer">Chuyển khoản</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Số biên lai (tuỳ chọn)
                </label>
                <input
                  type="text"
                  value={payForm.receiptNumber}
                  onChange={(e) =>
                    setPayForm({
                      ...payForm,
                      receiptNumber: e.target.value,
                    })
                  }
                  className="w-full h-12 px-4 bg-black border border-gray-800 rounded-[4px] text-white focus:outline-none focus:border-ps-blue transition-colors"
                  placeholder="VD: BL-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Ghi chú (tuỳ chọn)
                </label>
                <textarea
                  value={payForm.notes}
                  onChange={(e) =>
                    setPayForm({ ...payForm, notes: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-black border border-gray-800 rounded-[4px] text-white focus:outline-none focus:border-ps-blue transition-colors resize-none"
                  rows={2}
                  placeholder="Ghi chú thêm..."
                />
              </div>
              <button
                type="submit"
                disabled={paying}
                className="w-full h-12 bg-ps-blue text-white rounded-[4px] font-medium hover:bg-ps-blue/80 transition-colors disabled:opacity-50"
              >
                {paying ? "Đang xử lý..." : "Xác nhận thu tiền"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && historyItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1a1b1c] border border-gray-700 rounded-lg p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">Lịch sử thanh toán</h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-800/50 rounded-lg text-sm space-y-1">
              <p>
                <span className="text-gray-400">Học sinh:</span>{" "}
                <span className="text-white">
                  {historyItem.student.fullName} (
                  {historyItem.student.studentCode})
                </span>
              </p>
              <p>
                <span className="text-gray-400">Lớp:</span>{" "}
                <span className="text-white">
                  {historyItem.class.classCode} —{" "}
                  {historyItem.class.courseName}
                </span>
              </p>
            </div>

            {loadingHistory ? (
              <div className="text-center py-6 text-gray-500">Đang tải...</div>
            ) : paymentHistory.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                Chưa có lần thanh toán nào.
              </div>
            ) : (
              <div className="space-y-3">
                {paymentHistory.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-3 border-b border-gray-800/50"
                  >
                    <div>
                      <p className="text-white font-medium text-sm">
                        {formatCurrency(p.amount)}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {p.method === "cash" ? "Tiền mặt" : "Chuyển khoản"}
                        {p.receiptNumber && ` • ${p.receiptNumber}`}
                      </p>
                      {p.notes && (
                        <p className="text-gray-600 text-xs mt-0.5">
                          {p.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-xs">
                        {new Date(p.paymentDate).toLocaleDateString("vi-VN")}
                      </p>
                      {p.recordedBy?.fullName && (
                        <p className="text-gray-600 text-xs">
                          Bởi: {p.recordedBy.fullName}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
