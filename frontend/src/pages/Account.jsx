import { useState, useEffect } from "react";
import {
  UserPlus,
  IdentificationCard,
  EnvelopeSimple,
  Phone,
  Lock,
  Tag,
  Users,
  MagnifyingGlass,
  PencilSimple,
} from "@phosphor-icons/react";
import api from "../api";

export default function Account() {
  const [activeTab, setActiveTab] = useState("list"); // 'list' | 'create'
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [filterRole, setFilterRole] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "student",
    status: "active",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data } = await api.get("/admin/users?limit=20");
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Lỗi khi tải danh sách người dùng",
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === "list") {
      fetchUsers();
    }
  }, [activeTab]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (user) => {
    if (user.role === "admin") return;
    setEditingId(user._id);
    setFormData({
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      role: user.role || "student",
      status: user.status || "active",
    });
    setError("");
    setSuccess("");
    setActiveTab("edit");
  };

  // Removed handleCreateNew since we don't create new accounts here anymore.

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.put(`/admin/users/${editingId}`, formData);
      setSuccess(`Cập nhật thành công!`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Đã có lỗi xảy ra khi cập nhật tài khoản",
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = filterRole === "all" || u.role === filterRole;
    if (!searchQuery.trim()) return matchesRole;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (u.fullName || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.phone || "").toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto text-white">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1
            className="text-4xl mb-2 text-black"
            style={{ fontWeight: 300, letterSpacing: "0.1px" }}
          >
            Quản lý Người dùng
          </h1>
          <p className="text-gray-400">
            Xem và chỉnh sửa tài khoản người dùng.
          </p>
        </div>

        {/* Tabs */}
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
          {activeTab === "edit" && (
            <button
              className="px-6 py-2 text-sm transition-all duration-200 cursor-default"
              style={{
                borderRadius: "9999px",
                backgroundColor: "#0070d1",
                color: "#ffffff",
                fontWeight: 500,
              }}
            >
              Chỉnh sửa
            </button>
          )}
        </div>
      </div>

      {activeTab === "list" && (
        <div className="bg-[#121314] rounded-[8px] border border-gray-800 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-2">
              <Users size={24} className="text-ps-blue" />
              <h2 className="text-xl" style={{ fontWeight: 300 }}>
                Danh sách ({filteredUsers.length})
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <MagnifyingGlass size={16} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên, email, SĐT..."
                  className="h-9 pl-9 pr-3 bg-black border border-gray-800 text-white rounded-[4px] text-sm focus:outline-none focus:border-ps-blue transition-colors w-[260px] placeholder:text-gray-600"
                />
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-black border border-gray-800 text-white rounded-[4px] px-3 py-1.5 text-sm focus:outline-none focus:border-ps-blue"
              >
                <option value="all">Tất cả</option>
                <option value="admin">Quản trị viên</option>
                <option value="teacher">Giáo viên</option>
                <option value="student">Học sinh</option>
                <option value="parent">Phụ huynh</option>
              </select>
            </div>
          </div>

          {loadingUsers ? (
            <div className="text-center py-10 text-gray-500">
              Đang tải danh sách...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400">
                    <th className="pb-3 font-medium">Họ tên</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">SĐT</th>
                    <th className="pb-3 font-medium">Vai trò</th>
                    <th className="pb-3 font-medium">Trạng thái</th>
                    <th className="pb-3 font-medium text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="py-8 text-center text-gray-500"
                      >
                        Không có người dùng nào.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="border-b border-gray-800/50 hover:bg-gray-800/20"
                      >
                        <td className="py-4 text-white font-medium">
                          {user.fullName}
                        </td>
                        <td className="py-4 text-gray-300">{user.email}</td>
                        <td className="py-4 text-gray-400">
                          {user.phone || "-"}
                        </td>
                        <td className="py-4">
                          <span
                            className={`px-2 py-1 rounded-[4px] text-xs font-medium ${
                              user.role === "admin"
                                ? "bg-red-900/30 text-red-400"
                                : user.role === "teacher"
                                  ? "bg-purple-900/30 text-purple-400"
                                  : user.role === "student"
                                    ? "bg-blue-900/30 text-blue-400"
                                    : "bg-emerald-900/30 text-emerald-400"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4">
                          <span
                            className={`px-2 py-1 rounded-[4px] text-xs font-medium ${
                              user.status === "active"
                                ? "bg-[#00a854]/10 text-[#00a854]"
                                : "bg-gray-800 text-gray-400"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          {user.role !== "admin" && (
                            <button
                              onClick={() => handleEdit(user)}
                              className="p-2 bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors inline-flex"
                              title="Sửa thông tin"
                            >
                              <PencilSimple size={16} />
                            </button>
                          )}
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

      {activeTab === "edit" && (
        <div className="bg-[#121314] rounded-[8px] border border-gray-800 p-8 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
            <div className="w-10 h-10 rounded-full bg-ps-blue/20 flex items-center justify-center">
              <PencilSimple size={24} weight="fill" className="text-ps-blue" />
            </div>
            <h2 className="text-2xl text-white" style={{ fontWeight: 300 }}>
              Chỉnh Sửa Thông Tin
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Họ và tên
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <IdentificationCard size={20} />
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder="Nhập họ và tên..."
                  className="w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-[4px] text-white placeholder:text-gray-600 focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Địa chỉ Email
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
                  disabled={true}
                  placeholder="example@email.com"
                  className="w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-[4px] text-white placeholder:text-gray-600 opacity-50 cursor-not-allowed"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Không thể sửa email sau khi tạo.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Mật khẩu mới (Tùy chọn)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Lock size={20} />
                </div>
                <input
                  type="text"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu mới..."
                  className="w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-[4px] text-white placeholder:text-gray-600 focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Để trống nếu không muốn thay đổi mật khẩu.
              </p>
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
                    placeholder="0123 456 789"
                    className="w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-[4px] text-white placeholder:text-gray-600 focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Vai trò
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <Tag size={20} />
                  </div>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-[4px] text-white focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors appearance-none"
                  >
                    <option value="student">Học sinh</option>
                    <option value="parent">Phụ huynh</option>
                    <option value="teacher">Giáo viên</option>
                    <option value="admin">Quản trị viên</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Trạng thái
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
                    <option value="active">Hoạt động (Active)</option>
                    <option value="inactive">Đã khóa (Inactive)</option>
                  </select>
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
                    <PencilSimple size={20} weight="bold" />
                    Cập nhật
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
