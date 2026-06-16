import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeSlash,
  EnvelopeSimple,
  Lock,
  CircleNotch,
} from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/profile", { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Client-side validation
  const validateForm = () => {
    if (!email.trim()) {
      setError("Vui lòng nhập email");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Email không hợp lệ");
      return false;
    }
    if (!password) {
      setError("Vui lòng nhập mật khẩu");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });

      // Save auth data
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          _id: data._id,
          email: data.email,
          fullName: data.fullName,
          role: data.role,
          phone: data.phone,
        }),
      );

      // Dispatch custom event for AuthContext to pick up
      window.dispatchEvent(new Event("auth-change"));

      // Redirect to profile page after successful login
      navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-canvas-light">
      <div className="w-full max-w-[420px]">
        {/* Form Card */}
        <div className="bg-surface-card rounded-[8px] border border-hairline-light p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6">
              <span className="font-display font-light text-[28px] tracking-[0.1px] text-ink leading-[1.25]">
                EasyEnglish
              </span>
            </Link>
            <h1 className="font-display font-light text-[28px] tracking-[0.1px] text-ink leading-[1.25]">
              Đăng nhập My EasyEnglish
            </h1>
            <p className="mt-3 text-[16px] text-body-light leading-[1.5]">
              Nhập thông tin tài khoản để tiếp tục
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-start gap-2 px-4 py-3 rounded-[4px] bg-[#c81b3a]/10">
              <span className="text-[14px] text-[#c81b3a] leading-[1.5]">
                {error}
              </span>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6"
            id="login-form"
          >
            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="login-email"
                className="text-[14px] font-medium text-ink tracking-[0.324px]"
              >
                Email
              </label>
              <div className="relative">
                <EnvelopeSimple
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-ash-light pointer-events-none"
                />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full h-[48px] pl-11 pr-4 bg-canvas-light text-ink text-[18px] leading-[1.5] tracking-[0.1px] rounded-[4px] border border-ash-light outline-none transition-[border-color] duration-200 placeholder:text-ash-light focus:border-2 focus:border-ps-blue focus:pl-[calc(2.75rem-1px)] focus:pr-[calc(1rem-1px)]"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="login-password"
                className="text-[14px] font-medium text-ink tracking-[0.324px]"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <Lock
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-ash-light pointer-events-none"
                />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                  className="w-full h-[48px] pl-11 pr-12 bg-canvas-light text-ink text-[18px] leading-[1.5] tracking-[0.1px] rounded-[4px] border border-ash-light outline-none transition-[border-color] duration-200 placeholder:text-ash-light focus:border-2 focus:border-ps-blue focus:pl-[calc(2.75rem-1px)] focus:pr-[calc(3rem-1px)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ash-light hover:text-ink transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full h-[48px] flex items-center justify-center gap-2 bg-ps-blue text-on-dark text-[18px] font-bold leading-[1.25] tracking-[0.45px] rounded-full transition-colors hover:bg-ps-blue-pressed active:bg-ps-blue-active disabled:bg-surface-soft disabled:text-ash-light disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <CircleNotch size={20} className="animate-spin" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-[14px] text-body-light leading-[1.5]">
          Tài khoản được cung cấp bởi quản trị viên EasyEnglish.
          <br />
          <Link to="/" className="text-[#0064b7] hover:underline">
            Quay về trang chủ
          </Link>
        </p>
      </div>
    </div>
  );
}
