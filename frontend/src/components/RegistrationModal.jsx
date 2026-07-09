import { useState } from "react";
import { X, CheckCircle } from "@phosphor-icons/react";

export default function RegistrationModal({
  isOpen,
  onClose,
}) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    parentName: "",
    phone: "",
    email: "",
    childName: "",
    childAge: "",
    notes: "",
  });

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
    // Reset state after a short delay so the closing animation (if any) looks smooth
    setTimeout(() => {
      setIsSuccess(false);
      setError("");
      setFormData({
        parentName: "",
        phone: "",
        email: "",
        childName: "",
        childAge: "",
        notes: "",
      });
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parentName: formData.parentName,
          phone: formData.phone,
          email: formData.email,
          childName: formData.childName,
          childAge: formData.childAge ? Number(formData.childAge) : undefined,
          notes: formData.notes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsSuccess(true);
      } else {
        setError(data.message || "Đăng ký không thành công. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối hệ thống. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-canvas-dark/80 backdrop-blur-sm transition-opacity">
      <div className="bg-canvas-light text-ink w-full max-w-[600px] rounded-md shadow-2xl overflow-hidden relative animate-[slideUp_0.3s_ease-out]">
        {/* Header */}
        <div className="p-6 border-b border-hairline-light flex justify-between items-center">
          <h2 className="text-[22px] font-display font-light">
            Đăng ký tư vấn
          </h2>
          <button
            onClick={handleClose}
            className="text-body-light hover:text-ink transition-colors p-2 rounded-full hover:bg-surface-soft"
          >
            <X size={24} />
          </button>
        </div>

        {isSuccess ? (
          /* Success View */
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <CheckCircle
              size={80}
              weight="light"
              className="text-ps-blue mb-6"
            />
            <h3 className="text-[24px] font-display font-light mb-4">
              Đăng ký thành công!
            </h3>
            <p className="text-[16px] text-body-light mb-8 max-w-sm">
              Cảm ơn bạn đã quan tâm đến EasyEnglish. Đội ngũ tuyển sinh của
              chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất!
            </p>
            <button
              onClick={handleClose}
              className="bg-ps-blue hover:bg-ps-blue-pressed text-on-dark px-10 py-3 rounded-full font-bold text-[14px] transition-colors"
            >
              Đóng
            </button>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-5 bg-red-600/10 border border-red-600/20 text-red-600 px-4 py-3 rounded-sm text-sm">
                {error}
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-5 mb-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="parentName" className="text-[14px] font-bold">
                  Họ và tên phụ huynh *
                </label>
                <input
                  type="text"
                  id="parentName"
                  name="parentName"
                  required
                  value={formData.parentName}
                  onChange={handleChange}
                  className="w-full h-12 px-4 bg-canvas-light text-ink border border-ash-light rounded-sm focus:outline-none focus:border-ps-blue focus:border-2 transition-all text-[16px]"
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="phone" className="text-[14px] font-bold">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full h-12 px-4 bg-canvas-light text-ink border border-ash-light rounded-sm focus:outline-none focus:border-ps-blue focus:border-2 transition-all text-[16px]"
                  placeholder="Ví dụ: 0912345678"
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label htmlFor="email" className="text-[14px] font-bold">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full h-12 px-4 bg-canvas-light text-ink border border-ash-light rounded-sm focus:outline-none focus:border-ps-blue focus:border-2 transition-all text-[16px]"
                  placeholder="Email liên hệ (không bắt buộc)"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="childName" className="text-[14px] font-bold">
                  Họ và tên học viên *
                </label>
                <input
                  type="text"
                  id="childName"
                  name="childName"
                  required
                  value={formData.childName}
                  onChange={handleChange}
                  className="w-full h-12 px-4 bg-canvas-light text-ink border border-ash-light rounded-sm focus:outline-none focus:border-ps-blue focus:border-2 transition-all text-[16px]"
                  placeholder="Nhập tên bé"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="childAge" className="text-[14px] font-bold">
                  Tuổi học viên
                </label>
                <input
                  type="number"
                  id="childAge"
                  name="childAge"
                  min="3"
                  max="18"
                  value={formData.childAge}
                  onChange={handleChange}
                  className="w-full h-12 px-4 bg-canvas-light text-ink border border-ash-light rounded-sm focus:outline-none focus:border-ps-blue focus:border-2 transition-all text-[16px]"
                  placeholder="Ví dụ: 7"
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label htmlFor="notes" className="text-[14px] font-bold">
                  Ghi chú thêm
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full p-4 bg-canvas-light text-ink border border-ash-light rounded-sm focus:outline-none focus:border-ps-blue focus:border-2 transition-all text-[16px] resize-none"
                  placeholder="Ví dụ: Muốn học IELTS, lịch T2-T4-T6"
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-hairline-light">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="bg-transparent border border-ash-light hover:border-ink text-ink px-7 py-3 rounded-full font-bold text-[14px] transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-ps-blue hover:bg-ps-blue-pressed text-on-dark px-7 py-3 rounded-full font-bold text-[14px] transition-colors disabled:opacity-50"
              >
                {loading ? "Đang gửi..." : "Gửi thông tin"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
