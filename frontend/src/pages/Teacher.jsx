import { useState, useEffect } from "react";
import {
  ChalkboardTeacher,
  Plus,
  IdentificationBadge,
  EnvelopeSimple,
  Phone,
  LockKey,
  PencilSimple,
  Tag,
  Money,
  Clock,
} from "@phosphor-icons/react";
import api from "../api";

export default function Teacher() {
  const [activeTab, setActiveTab] = useState("list"); // 'list' | 'create'
  const [teachers, setTeachers] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    employeeCode: "",
    specializations: "", // Will split by comma
    weeklySessionLimit: "",
    salaryType: "hourly",
    salaryAmount: "",
    status: "active",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchTeachers = async () => {
    setLoadingList(true);
    try {
      const { data } = await api.get("/admin/teachers");
      setTeachers(data.teachers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (activeTab === "list") fetchTeachers();
  }, [activeTab]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (teacher) => {
    setEditingId(teacher._id);
    setFormData({
      fullName: teacher.userId?.fullName || "",
      email: teacher.userId?.email || "",
      phone: teacher.userId?.phone || "",
      password: "",
      employeeCode: teacher.employeeCode || "",
      specializations: teacher.specializations
        ? teacher.specializations.join(", ")
        : "",
      weeklySessionLimit: teacher.weeklySessionLimit || "",
      salaryType: teacher.salary?.type || "hourly",
      salaryAmount: teacher.salary?.amount || "",
      status: teacher.status || "active",
    });
    setError("");
    setSuccess("");
    setActiveTab("create");
  };

  const handleCreateNew = () => {
    setEditingId(null);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      employeeCode: "",
      specializations: "",
      weeklySessionLimit: "",
      salaryType: "hourly",
      salaryAmount: "",
      status: "active",
    });
    setError("");
    setSuccess("");
    setActiveTab("create");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        employeeCode: formData.employeeCode,
        specializations: formData.specializations
          ? formData.specializations
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s)
          : [],
        weeklySessionLimit: formData.weeklySessionLimit
          ? Number(formData.weeklySessionLimit)
          : undefined,
        salary: {
          type: formData.salaryType,
          amount: formData.salaryAmount ? Number(formData.salaryAmount) : 0,
        },
      };

      if (!editingId && formData.password) {
        payload.password = formData.password;
      }
      if (editingId) {
        payload.status = formData.status;
      }

      const endpoint = editingId
        ? `/admin/teachers/${editingId}`
        : "/admin/teachers";
      editingId
        ? await api.put(endpoint, payload)
        : await api.post(endpoint, payload);

      setSuccess(
        editingId
          ? `Cập nhật giáo viên thành công!`
          : `Tạo giáo viên thành công!`,
      );

      if (!editingId) {
        handleCreateNew(); // Reset form
        setSuccess(`Tạo giáo viên thành công!`); // Restore success message after reset
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto text-white">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1
            className="text-4xl mb-2 text-white"
            style={{ fontWeight: 300, letterSpacing: "0.1px" }}
          >
            Quản lý Giáo viên
          </h1>
          <p className="text-gray-400">
            Xem danh sách giáo viên và hồ sơ công tác.
          </p>
        </div>

        <div className="flex bg-black p-1 rounded-full border border-gray-800">
          <button
            onClick={() => {
              setActiveTab("list");
              setEditingId(null);
            }}
            className="px-6 py-2 text-sm transition-all duration-200"
            style={{
              borderRadius: "9999px",
              backgroundColor: activeTab === "list" ? "#0070d1" : "transparent",
              color: activeTab === "list" ? "#ffffff" : "#a1a1aa",
              fontWeight: activeTab === "list" ? 500 : 400,
            }}
          >
            Danh sách
          </button>
          <button
            onClick={handleCreateNew}
            className="px-6 py-2 text-sm transition-all duration-200"
            style={{
              borderRadius: "9999px",
              backgroundColor:
                activeTab === "create" ? "#0070d1" : "transparent",
              color: activeTab === "create" ? "#ffffff" : "#a1a1aa",
              fontWeight: activeTab === "create" ? 500 : 400,
            }}
          >
            {editingId ? "Chỉnh sửa" : "Tạo mới"}
          </button>
        </div>
      </div>

      {activeTab === "list" && (
        <div className="bg-[#121314] rounded-[8px] border border-gray-800 p-6">
          <div className="flex items-center gap-2 mb-6">
            <ChalkboardTeacher size={24} className="text-ps-blue" />
            <h2 className="text-xl" style={{ fontWeight: 300 }}>
              Danh sách Giáo viên
            </h2>
          </div>

          {loadingList ? (
            <div className="text-center py-10 text-gray-500">
              Đang tải danh sách...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400">
                    <th className="pb-3 font-medium">Mã GV</th>
                    <th className="pb-3 font-medium">Họ và tên</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Chuyên môn</th>
                    <th className="pb-3 font-medium">Trạng thái</th>
                    <th className="pb-3 font-medium text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="py-8 text-center text-gray-500"
                      >
                        Chưa có giáo viên nào.
                      </td>
                    </tr>
                  ) : (
                    teachers.map((tc) => (
                      <tr
                        key={tc._id}
                        className="border-b border-gray-800/50 hover:bg-gray-800/20"
                      >
                        <td className="py-4 text-white font-medium">
                          {tc.employeeCode}
                        </td>
                        <td className="py-4 text-gray-300">
                          {tc.userId?.fullName || "-"}
                        </td>
                        <td className="py-4 text-gray-400">
                          {tc.userId?.email || "-"}
                        </td>
                        <td className="py-4 text-gray-400">
                          {tc.specializations?.join(", ") || "-"}
                        </td>
                        <td className="py-4">
                          <span
                            className={`px-2 py-1 rounded-[4px] text-xs font-medium ${
                              tc.status === "active"
                                ? "bg-[#00a854]/10 text-[#00a854]"
                                : tc.status === "on_leave"
                                  ? "bg-yellow-500/10 text-yellow-500"
                                  : "bg-[#c81b3a]/10 text-[#c81b3a]"
                            }`}
                          >
                            {tc.status === "active"
                              ? "Đang dạy"
                              : tc.status === "on_leave"
                                ? "Nghỉ phép"
                                : "Đã nghỉ"}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleEdit(tc)}
                            className="p-2 bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors inline-flex"
                            title="Sửa thông tin"
                          >
                            <PencilSimple size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "create" && (
        <div className="bg-[#121314] rounded-[8px] border border-gray-800 p-8 max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
            <div className="w-10 h-10 rounded-full bg-ps-blue/20 flex items-center justify-center">
              {editingId ? (
                <PencilSimple
                  size={24}
                  weight="fill"
                  className="text-ps-blue"
                />
              ) : (
                <Plus size={24} weight="bold" className="text-ps-blue" />
              )}
            </div>
            <h2 className="text-2xl text-white" style={{ fontWeight: 300 }}>
              {editingId ? "Chỉnh Sửa Giáo Viên" : "Tạo Hồ Sơ Giáo Viên"}
            </h2>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-[#c81b3a]/10 border border-[#c81b3a]/20 text-[#c81b3a] rounded-[4px] text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-[#00a854]/10 border border-[#00a854]/20 text-[#00a854] rounded-[4px] text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Thông tin tài khoản (User) */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b border-gray-800 pb-2">
                Thông tin tài khoản
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Họ và tên
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      <IdentificationBadge size={20} />
                    </div>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-[4px] text-white placeholder:text-gray-600 focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
                      placeholder="VD: Trần Thị B"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      <EnvelopeSimple size={20} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={!!editingId}
                      className={`w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-[4px] text-white placeholder:text-gray-600 focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors ${editingId ? "opacity-50 cursor-not-allowed" : ""}`}
                      placeholder="VD: tranthib@email.com"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      <Phone size={20} />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-[4px] text-white placeholder:text-gray-600 focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
                      placeholder="VD: 0912345678"
                    />
                  </div>
                </div>

                {!editingId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                        <LockKey size={20} />
                      </div>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-[4px] text-white placeholder:text-gray-600 focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
                        placeholder="Nhập mật khẩu (từ 6 ký tự)"
                      />
                    </div>
                  </div>
                )}

                {editingId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Trạng thái công tác
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                        <Tag size={20} />
                      </div>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-[4px] text-white focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors appearance-none"
                      >
                        <option value="active">Đang dạy (Active)</option>
                        <option value="on_leave">Nghỉ phép (On Leave)</option>
                        <option value="inactive">Đã nghỉ (Inactive)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Thông tin Hồ sơ Giáo viên (Teacher) */}
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-medium border-b border-gray-800 pb-2">
                Hồ sơ giáo viên
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Mã Giáo viên
                  </label>
                  <input
                    type="text"
                    name="employeeCode"
                    value={formData.employeeCode}
                    onChange={handleChange}
                    required
                    className="w-full h-12 px-4 bg-black border border-gray-800 rounded-[4px] text-white placeholder:text-gray-600 focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
                    placeholder="VD: GV2024-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Chuyên môn (Cách nhau bằng dấu phẩy)
                  </label>
                  <input
                    type="text"
                    name="specializations"
                    value={formData.specializations}
                    onChange={handleChange}
                    className="w-full h-12 px-4 bg-black border border-gray-800 rounded-[4px] text-white placeholder:text-gray-600 focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
                    placeholder="VD: IELTS, Tiếng Anh giao tiếp"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Giới hạn tiết học (Tuần)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      <Clock size={20} />
                    </div>
                    <input
                      type="number"
                      name="weeklySessionLimit"
                      value={formData.weeklySessionLimit}
                      onChange={handleChange}
                      className="w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-[4px] text-white placeholder:text-gray-600 focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
                      placeholder="VD: 20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Loại lương
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      <Money size={20} />
                    </div>
                    <select
                      name="salaryType"
                      value={formData.salaryType}
                      onChange={handleChange}
                      className="w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-[4px] text-white focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors appearance-none"
                    >
                      <option value="hourly">Theo giờ (Hourly)</option>
                      <option value="fixed">Cố định (Fixed)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Mức lương (VNĐ)
                  </label>
                  <input
                    type="number"
                    min={50000}
                    name="salaryAmount"
                    value={formData.salaryAmount}
                    onChange={handleChange}
                    className="w-full h-12 px-4 bg-black border border-gray-800 rounded-[4px] text-white placeholder:text-gray-600 focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
                    placeholder="VD: 300000"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-ps-blue text-white rounded-full font-bold text-[16px] hover:bg-[#0064b7] active:bg-[#004d8d] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? (
                  "Đang xử lý..."
                ) : (
                  <>
                    {editingId ? (
                      <PencilSimple size={20} weight="bold" />
                    ) : (
                      <Plus size={20} weight="bold" />
                    )}
                    {editingId ? "Cập nhật Giáo viên" : "Tạo Hồ sơ Giáo viên"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
