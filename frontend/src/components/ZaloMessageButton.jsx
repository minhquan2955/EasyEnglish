import { useState, useRef, useEffect } from "react";
import { ChatCircleDots, CaretDown, Phone, User, FirstAid } from "@phosphor-icons/react";

/**
 * ZaloMessageButton – Nút nhắn Zalo dùng chung
 *
 * Props:
 *   studentName  – Tên học sinh
 *   studentPhone – SĐT học sinh (từ User)
 *   parents      – [{ fullName, phone }]  (từ parentIds)
 *   emergencyContact – { name, phone, relation }
 *   messageTemplate  – Nội dung tin nhắn soạn sẵn
 */
export default function ZaloMessageButton({
  studentName = "",
  studentPhone = "",
  parents = [],
  emergencyContact = null,
  messageTemplate = "",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Chuẩn hoá SĐT Việt Nam → dạng quốc tế 84xxx (bỏ số 0 đầu)
  const normalizePhone = (phone) => {
    if (!phone) return "";
    const cleaned = phone.replace(/[\s\-().]/g, "");
    if (cleaned.startsWith("+84")) return cleaned.slice(1); // bỏ dấu +
    if (cleaned.startsWith("84")) return cleaned;
    if (cleaned.startsWith("0")) return "84" + cleaned.slice(1);
    return cleaned;
  };

  // Tạo URL Zalo
  const buildZaloUrl = (phone) => {
    const normalized = normalizePhone(phone);
    if (!normalized) return "#";
    const encoded = encodeURIComponent(messageTemplate);
    return `https://zalo.me/${normalized}?text=${encoded}`;
  };

  // Xây dựng danh sách liên hệ
  const contacts = [];

  if (studentPhone && studentPhone !== "—") {
    contacts.push({
      label: `Học sinh: ${studentName}`,
      phone: studentPhone,
      icon: User,
      color: "text-ps-blue",
    });
  }

  parents.forEach((p, idx) => {
    if (p.phone) {
      contacts.push({
        label: `Phụ huynh: ${p.fullName || `#${idx + 1}`}`,
        phone: p.phone,
        icon: Phone,
        color: "text-emerald-400",
      });
    }
  });

  if (emergencyContact?.phone) {
    contacts.push({
      label: `Khẩn cấp: ${emergencyContact.name || "N/A"} (${emergencyContact.relation || ""})`,
      phone: emergencyContact.phone,
      icon: FirstAid,
      color: "text-amber-400",
    });
  }

  if (contacts.length === 0) {
    return (
      <button
        disabled
        className="p-2 bg-gray-800 text-gray-600 rounded transition-colors cursor-not-allowed"
        title="Không có SĐT để nhắn Zalo"
      >
        <ChatCircleDots size={16} />
      </button>
    );
  }

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2 bg-[#0068ff]/10 text-[#0068ff] hover:bg-[#0068ff]/20 rounded transition-colors inline-flex items-center gap-1"
        title="Nhắn tin Zalo"
      >
        <ChatCircleDots size={16} weight="fill" />
        <CaretDown size={10} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-[#1a1b1e] border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1">
          <div className="px-3 py-2 bg-[#121314] border-b border-gray-700">
            <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">
              Chọn người nhận Zalo
            </p>
          </div>
          <div className="py-1">
            {contacts.map((c, i) => {
              const Icon = c.icon;
              return (
                <a
                  key={i}
                  href={buildZaloUrl(c.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800/60 transition-colors group"
                >
                  <div className={`w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center ${c.color} group-hover:scale-110 transition-transform`}>
                    <Icon size={16} weight="fill" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 truncate">{c.label}</p>
                    <p className="text-xs text-gray-500 font-mono">{c.phone}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-600 group-hover:text-[#0068ff] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
