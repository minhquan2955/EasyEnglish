import { ArrowRight } from "@phosphor-icons/react";
import mainnews from "../assets/mainnews.png";
import sidenews1 from "../assets/sidenews1.png";
import sidenews2 from "../assets/sidenews2.png";
import sidenews3 from "../assets/sidenews3.png";
const FEATURED_NEWS = {
  id: 1,
  title:
    'Triển lãm "trao lời tri ân - chạm ngàn kết nối": chúc mừng top 72 tác phẩm xuất sắc nhất!',
  summary:
    'Hãy cùng ngắm nhìn Top 72 tác phẩm ấn tượng nhất của triển lãm "Trao lời tri ân - Chạm ngàn kết nối"!',
  date: "Oct 26, 2026",
  image: mainnews,
};

const SIDEBAR_NEWS = [
  {
    id: 2,
    title: "Tailored Summer 2026: Khi con cất Lời, Thế giới lắng nghe",
    date: "Apr 26, 2026",
    image: sidenews1,
  },
  {
    id: 3,
    title:
      'Trực tiếp khởi động hành trình "Khi con cất lời thế giới lắng nghe"',
    date: "Nov 01, 2026",
    image: sidenews2,
  },
  {
    id: 4,
    title: "Khởi động hành trình mới cho lứa tuổi thiếu niên",
    date: "Aug 17, 2026",
    image: sidenews3,
  },
];

const GRID_NEWS = [
  {
    id: 5,
    title:
      'Triển lãm "trao lời tri ân - chạm ngàn kết nối": chúc mừng top 72 tác phẩm xuất sắc nhất!',
    summary:
      'Hãy cùng ngắm nhìn Top 72 tác phẩm ấn tượng nhất của triển lãm "Trao lời tri ân - Chạm ngàn kết nối"!',
    date: "Oct 26, 2026",
    image: mainnews,
  },
  {
    id: 6,
    title: "Tailored Summer 2026: Khi con cất Lời, Thế giới lắng nghe",
    summary:
      'Apollo thân mời bố mẹ tham dự "Ngày hội Summer 2026" diễn ra vào 21-22/3/2026 tại Apollo English trên cả nước!',
    date: "Apr 26, 2026",
    image: sidenews1,
  },
  {
    id: 7,
    title:
      'Trực tiếp khởi động hành trình "Khi con cất lời thế giới lắng nghe"',
    summary:
      "Nhằm tiếp sức cho hành trình trở thành người đồng hành lý tưởng của con trong mùa hè bước ngoặt này, Apollo thân mời gia đình cùng đón...",
    date: "Nov 01, 2026",
    image: sidenews2,
  },
  {
    id: 8,
    title: "Khởi động hành trình mới cho lứa tuổi thiếu niên",
    summary:
      'Hành trình Anh ngữ "Đo ni đóng giày" đã bắt đầu! Mời bố mẹ cùng khám phá ứng dụng My Apollo World và đồng hành cùng con dễ dàng...',
    date: "Aug 17, 2026",
    image: sidenews3,
  },
];

export default function NewsAndEvents() {
  return (
    <main className="min-h-screen bg-canvas-light text-ink pt-24 pb-24">
      <div className="w-full max-w-[1280px] mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="display-xl text-ps-blue font-bold">Tin mới nhất</h1>
        </div>

        {/* Top Featured Section */}
        <div className="flex flex-col lg:flex-row gap-8 mb-24">
          {/* Left: Main Featured */}
          <div className="w-full lg:w-2/3 group cursor-pointer">
            <div className="w-full aspect-[16/9] bg-surface-soft rounded-xl overflow-hidden mb-6 relative">
              <img
                src={FEATURED_NEWS.image}
                alt={FEATURED_NEWS.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <h2 className="text-[28px] font-bold text-ink mb-4 group-hover:text-ps-blue transition-colors leading-tight">
              {FEATURED_NEWS.title}
            </h2>
            <p className="text-[18px] text-body-light mb-8 line-clamp-2">
              {FEATURED_NEWS.summary}
            </p>
            <div className="mt-4">
              <span className="text-[14px] text-body-light opacity-60 uppercase tracking-widest font-bold">
                {FEATURED_NEWS.date}
              </span>
            </div>
          </div>

          {/* Right: Sidebar List */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            {SIDEBAR_NEWS.map((news) => (
              <div key={news.id} className="flex gap-4 group cursor-pointer">
                <div className="w-[140px] shrink-0 aspect-[4/3] bg-surface-soft rounded-lg overflow-hidden relative">
                  <img
                    src={news.image}
                    alt={news.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-[12px] text-body-light opacity-60 uppercase tracking-widest font-bold mb-2">
                    {news.date}
                  </span>
                  <h3 className="text-[16px] font-bold text-ink group-hover:text-ps-blue transition-colors line-clamp-3 leading-snug">
                    {news.title}
                  </h3>
                </div>
              </div>
            ))}
            <div className="mt-auto pt-4 flex justify-center lg:justify-start">
              <button
                onClick={() =>
                  document
                    .getElementById("grid-section")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="border border-ps-blue text-ps-blue hover:bg-ps-blue hover:text-canvas-light px-8 py-2.5 rounded-full font-bold text-[14px] transition-colors uppercase tracking-wider text-center w-full lg:w-auto"
              >
                Xem thêm tin khác
              </button>
            </div>
          </div>
        </div>

        {/* Decorative Divider */}
        <div className="w-full flex justify-center mb-16 opacity-30">
          <div className="h-px bg-ash-dark w-1/3"></div>
        </div>

        {/* Grid Section */}
        <div
          id="grid-section"
          className="grid md:grid-cols-2 gap-x-8 gap-y-12 mb-16 scroll-mt-24"
        >
          {GRID_NEWS.map((news) => (
            <div
              key={news.id}
              className="group cursor-pointer flex flex-col h-full"
            >
              <div className="w-full aspect-[16/9] bg-surface-soft rounded-xl overflow-hidden mb-6 relative">
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <h3 className="text-[22px] font-bold text-ink mb-3 group-hover:text-ps-blue transition-colors leading-snug">
                {news.title}
              </h3>
              <p className="text-[16px] text-body-light mb-6 line-clamp-3 flex-grow">
                {news.summary}
              </p>
              <div className="flex justify-between items-center mt-auto border-t border-ash-light pt-4">
                <span className="text-[14px] text-body-light opacity-60 uppercase tracking-widest font-bold">
                  {news.date}
                </span>
                <button className="border border-ps-blue text-ps-blue hover:bg-ps-blue hover:text-canvas-light px-6 py-2 rounded-full font-bold text-[14px] transition-colors uppercase tracking-wider flex items-center gap-2">
                  Đọc tiếp
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="flex justify-center mt-12">
          <button className="bg-ps-blue text-canvas-light hover:bg-ps-blue-pressed px-12 py-4 rounded-full font-bold text-[16px] transition-colors uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            Xem thêm
          </button>
        </div>
      </div>
    </main>
  );
}
