import { useState, useEffect } from "react";
import {
  Money,
  CheckCircle,
  WarningCircle,
  Clock,
  CaretDown,
  CaretUp,
} from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";
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

export default function MyTuition() {
  const { user } = useAuth();
  const [tuitionData, setTuitionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedIdx, setExpandedIdx] = useState(null);

  useEffect(() => {
    const fetchTuition = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/tuition/my-payments");
        setTuitionData(data.tuitionData);
      } catch (err) {
        setError(
          err.response?.data?.message || "Lỗi khi tải thông tin học phí",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchTuition();
  }, []);

  const formatCurrency = (n) =>
    n != null ? n.toLocaleString("vi-VN") + " đ" : "—";

  const isParent = user?.role === "parent";

  // Group by student name for parent view
  const groupedByStudent = {};
  tuitionData.forEach((item) => {
    const key = item.studentCode || item.studentName;
    if (!groupedByStudent[key]) {
      groupedByStudent[key] = {
        studentName: item.studentName,
        studentCode: item.studentCode,
        items: [],
      };
    }
    groupedByStudent[key].items.push(item);
  });

  const groups = isParent
    ? Object.values(groupedByStudent)
    : [{ studentName: user?.fullName, studentCode: "", items: tuitionData }];

  return (
    <div className="p-8 max-w-5xl mx-auto text-white">
      <div className="mb-8">
        <h1
          className="text-4xl mb-2 text-white"
          style={{ fontWeight: 300, letterSpacing: "0.1px" }}
        >
          {isParent ? "Học phí của con" : "Học phí của tôi"}
        </h1>
        <p className="text-gray-400">
          {isParent
            ? "Xem tình trạng đóng học phí của tất cả con bạn."
            : "Xem tình trạng đóng học phí và lịch sử thanh toán."}
        </p>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Đang tải...</div>
      ) : tuitionData.length === 0 ? (
        <div className="bg-surface-dark-elevated rounded-lg border border-gray-800 p-8 text-center text-gray-500">
          <Money size={48} className="mx-auto mb-4 text-gray-600" />
          Chưa có thông tin học phí.
        </div>
      ) : (
        groups.map((group, gIdx) => (
          <div key={gIdx} className="mb-8">
            {isParent && (
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl text-black" style={{ fontWeight: 300 }}>
                  {group.studentName}
                </h2>
                {group.studentCode && (
                  <span className="text-gray-500 text-sm">
                    ({group.studentCode})
                  </span>
                )}
              </div>
            )}

            <div className="space-y-4">
              {group.items.map((item, idx) => {
                const globalIdx = `${gIdx}-${idx}`;
                const isExpanded = expandedIdx === globalIdx;
                const sc = statusConfig[item.status];
                const StatusIcon = sc.icon;

                return (
                  <div
                    key={globalIdx}
                    className="bg-surface-dark-elevated rounded-lg border border-gray-800 overflow-hidden"
                  >
                    {/* Card Header */}
                    <div className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div>
                          <h3 className="text-white font-medium">
                            {item.courseName}
                          </h3>
                          <p className="text-gray-500 text-sm">
                            Lớp: {item.classCode}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs ${sc.bg} ${sc.color} ${sc.border} border self-start`}
                        >
                          <StatusIcon size={14} weight="fill" />
                          {sc.label}
                        </span>
                      </div>

                      {/* Fee breakdown */}
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Học phí</p>
                          <p className="text-white font-medium">
                            {formatCurrency(item.tuitionFee)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Đã đóng</p>
                          <p className="text-green-400 font-medium">
                            {formatCurrency(item.totalPaid)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Còn lại</p>
                          <p
                            className={`font-medium ${item.remaining > 0 ? "text-red-400" : "text-green-400"}`}
                          >
                            {formatCurrency(Math.max(0, item.remaining))}
                          </p>
                        </div>
                      </div>

                      {/* Expand toggle */}
                      {item.history && item.history.length > 0 && (
                        <button
                          onClick={() =>
                            setExpandedIdx(isExpanded ? null : globalIdx)
                          }
                          className="mt-4 text-ps-blue text-sm inline-flex items-center gap-1 hover:underline"
                        >
                          {isExpanded ? (
                            <>
                              <CaretUp size={14} /> Ẩn lịch sử
                            </>
                          ) : (
                            <>
                              <CaretDown size={14} /> Xem lịch sử (
                              {item.history.length} lần)
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Payment History */}
                    {isExpanded && item.history && (
                      <div className="border-t border-gray-800 bg-black/30 p-5">
                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">
                          Lịch sử thanh toán
                        </p>
                        <div className="space-y-3">
                          {item.history.map((h, hIdx) => (
                            <div
                              key={hIdx}
                              className="flex items-center justify-between text-sm"
                            >
                              <div>
                                <p className="text-white">
                                  {formatCurrency(h.amount)}
                                </p>
                                <p className="text-gray-600 text-xs">
                                  {h.method === "cash"
                                    ? "Tiền mặt"
                                    : "Chuyển khoản"}
                                  {h.receiptNumber &&
                                    ` • BL: ${h.receiptNumber}`}
                                </p>
                              </div>
                              <p className="text-gray-500 text-xs">
                                {new Date(h.paymentDate).toLocaleDateString(
                                  "vi-VN",
                                )}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
