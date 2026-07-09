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
  templates = [],
}) {
  const [open, setOpen] = useState(false);
  const [expandedContactIdx, setExpandedContactIdx] = useState(null);
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

  // Mảng templates chuẩn
  const activeTemplates = templates.length > 0
    ? templates
    : (messageTemplate ? [{ label: "Gửi tin nhắn", content: messageTemplate }] : []);

  // Tạo URL Zalo
  const buildZaloUrl = (phone, text) => {
    const normalized = normalizePhone(phone);
    if (!normalized) return "#";
    const encoded = encodeURIComponent(text);
    return `https://zalo.me/${normalized}?text=${encoded}`;
  };

  // Copy nội dung vào bộ đệm và đóng popup
  const handleLinkClick = async (text) => {
    setOpen(false);
    if (text) {
      try {
        await navigator.clipboard.writeText(text);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    }
  };

  // Xây dựng danh sách liên hệ
  const contacts = [];

  if (studentPhone && studentPhone !== "—") {
    contacts.push({
      label: `Học sinh: ${studentName}`,
      phone: studentPhone,
      icon: User,
      color: "text-ps-blue",
      type: "student",
      receiverName: studentName,
    });
  }

  parents.forEach((p, idx) => {
    if (p.phone) {
      contacts.push({
        label: `Phụ huynh: ${p.fullName || `#${idx + 1}`}`,
        phone: p.phone,
        icon: Phone,
        color: "text-emerald-400",
        type: "parent",
        receiverName: p.fullName || "",
      });
    }
  });

  if (emergencyContact?.phone) {
    contacts.push({
      label: `Khẩn cấp: ${emergencyContact.name || "N/A"} (${emergencyContact.relation || ""})`,
      phone: emergencyContact.phone,
      icon: FirstAid,
      color: "text-amber-400",
      type: "emergency",
      receiverName: emergencyContact.name || "",
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

  // Xử lý thay thế tên người nhận và học sinh vào tin nhắn
  const formatMessage = (templateText, contact) => {
    if (!templateText) return "";
    let receiverStr = "bạn";
    let studentRef = "học sinh";

    if (contact.type === "student") {
      receiverStr = `bạn ${contact.receiverName}`;
      studentRef = "bạn";
    } else if (contact.type === "parent") {
      receiverStr = contact.receiverName ? `phụ huynh ${contact.receiverName}` : "phụ huynh";
      studentRef = "cháu";
    } else if (contact.type === "emergency") {
      receiverStr = contact.receiverName ? `anh/chị ${contact.receiverName}` : "anh/chị";
      studentRef = "cháu";
    }

    let text = templateText;

    // Thay thế linh hoạt lời chào
    text = text.replace(/Chào bạn,/i, `Chào ${receiverStr},`);

    // Xử lý danh xưng học sinh tùy theo người nhận
    if (contact.type !== "student") {
      // Gửi cho phụ huynh: "học sinh Nguyễn Văn A" -> "cháu Nguyễn Văn A"
      if (studentName) {
        text = text.replace(new RegExp(`học sinh ${studentName}`, "i"), `cháu ${studentName}`);
      }
      text = text.replace(/học sinh/i, studentRef);
    } else {
      // Gửi cho học sinh: "học sinh Nguyễn Văn A" -> "bạn"
      if (studentName) {
        text = text.replace(new RegExp(`cho học sinh ${studentName}`, "i"), "cho bạn");
        text = text.replace(new RegExp(`học sinh ${studentName}`, "i"), "bạn");
      }
    }

    return text;
  };

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
        <div className="absolute right-0 mt-2 w-72 bg-surface-dark-card border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1">
          <div className="px-3 py-2 bg-surface-dark-elevated border-b border-gray-700">
            <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">
              Chọn người nhận Zalo
            </p>
          </div>
          <div className="py-1">
            {contacts.map((c, i) => {
              const Icon = c.icon;
              const isExpanded = expandedContactIdx === i;

              if (activeTemplates.length <= 1) {
                const rawText = activeTemplates[0]?.content || "";
                const formattedText = formatMessage(rawText, c);
                return (
                  <a
                    key={i}
                    href={buildZaloUrl(c.phone, formattedText)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleLinkClick(formattedText)}
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
              }

              return (
                <div key={i}>
                  <button
                    onClick={() => setExpandedContactIdx(isExpanded ? null : i)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800/60 transition-colors group text-left"
                  >
                    <div className={`w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center ${c.color} group-hover:scale-110 transition-transform`}>
                      <Icon size={16} weight="fill" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 truncate">{c.label}</p>
                      <p className="text-xs text-gray-500 font-mono">{c.phone}</p>
                    </div>
                    <CaretDown size={14} className={`text-gray-500 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </button>
                  
                  {isExpanded && (
                    <div className="bg-surface-dark-elevated py-1 border-y border-gray-800/50">
                      {activeTemplates.map((t, tIdx) => {
                        const formattedText = formatMessage(t.content, c);
                        return (
                          <a
                            key={tIdx}
                            href={buildZaloUrl(c.phone, formattedText)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleLinkClick(formattedText)}
                            className="block px-4 py-2 pl-14 text-sm text-gray-300 hover:bg-gray-800/60 hover:text-white transition-colors"
                          >
                            <span className="text-ps-blue mr-2">•</span> {t.label}
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
