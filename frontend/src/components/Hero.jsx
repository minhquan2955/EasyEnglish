import { useState } from "react";
import { Link } from "react-router-dom";
import RegistrationModal from "./RegistrationModal";

export default function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="bg-canvas-light text-ink w-full py-24">
      <div className="w-full max-w-[1280px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left Content */}
          <div className="w-full lg:w-5/12">
            <h1 className="display-xl mb-6">Khai mở tiềm năng Tiếng Anh.</h1>

            <p className="text-[18px] text-body-light mb-10 leading-relaxed max-w-130">
              Môi trường học tập tiêu chuẩn quốc tế giúp học viên tự tin giao
              tiếp, phát triển tư duy toàn diện và sẵn sàng chinh phục mọi thử
              thách trong tương lai.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-ps-blue hover:bg-ps-blue-pressed text-on-dark px-7 py-3 rounded-full font-bold text-[18px] transition-colors inline-block"
              >
                Đăng ký tư vấn
              </button>

              <Link
                to="/about"
                className="bg-transparent border border-ash-light hover:border-ink text-ink px-7 py-3 rounded-full font-bold text-[18px] transition-colors inline-block"
              >
                Tìm hiểu thêm
              </Link>
            </div>
          </div>

          {/* Right Visual */}
          <div className="w-full lg:w-7/12">
            {/* Crisp, flat image without decorative shadows per PlayStation spec */}
            <div className="w-full aspect-video bg-surface-soft overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop"
                alt="Students learning"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      <RegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}
