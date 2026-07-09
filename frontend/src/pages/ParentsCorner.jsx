import { useState } from "react";
import mainimg from "../assets/parent1.png";
import side1 from "../assets/parent2.png";
import side2 from "../assets/parent3.png";
import side3 from "../assets/parent4.png";
const SIDEBAR_ITEMS = [
  "Cùng con đến trường",
  "Nội dung hay cho bé",
  "Nội dung hay cho bố mẹ",
  "Cùng con học tiếng Anh",
];

const FEATURED_MAIN = {
  id: 1,
  title: '"TALKSHOW" CỦA CON SAU MỖI BUỔI HỌC',
  summary:
    'Bố mẹ có biết, con sẽ bắt đầu "rơi rụng" kiến thức ngay sau khi buổi học kết thúc?',
  image: mainimg,
};

const FEATURED_SIDE = [
  {
    id: 2,
    title: "THAM GIA TÍCH CỰC TRONG LỚP",
    image: side1,
  },
  {
    id: 3,
    title: "ĐẾN LỚP ĐÚNG GIỜ",
    image: side2,
  },
  {
    id: 4,
    title: "ĂN MỪNG NHỮNG BƯỚC TIẾN NHỎ",
    image: side3,
  },
];

const GRID_POSTS = [
  {
    id: 5,
    title: '"TALKSHOW" CỦA CON SAU MỖI BUỔI HỌC',
    summary:
      'Bố mẹ có biết, con sẽ bắt đầu "rơi rụng" kiến thức ngay sau khi buổi học kết thúc?',
    image: mainimg,
  },
  {
    id: 6,
    title: 'CÙNG CON "KHAI MỞ" TINH THẦN TÍCH CỰC TRONG LỚP',
    summary:
      'Buổi học của con có đang giống như một chiếc "hộp đen" bí ẩn mà bố mẹ rất muốn khám phá?',
    image: side1,
  },
  {
    id: 7,
    title: "SỨC MẠNH CỦA 5 PHÚT ĐẦU BUỔI HỌC TẠI APOLLO",
    summary:
      "Bố mẹ có biết: 5 phút đầu giờ có thể quyết định cả buổi học hào hứng (hoặc uể oải) của con?",
    image: side2,
  },
];

export default function ParentsCorner() {
  const [activeTab, setActiveTab] = useState("Cùng con đến trường");

  return (
    <main className="min-h-screen bg-canvas-light text-ink pt-32 pb-24">
      <div className="w-full max-w-[1280px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Sidebar Menu */}
          <div className="w-full lg:w-1/4 shrink-0">
            <ul className="flex flex-col gap-4">
              {SIDEBAR_ITEMS.map((item, index) => (
                <li
                  key={index}
                  className="border-b border-ash-light pb-4 last:border-0"
                >
                  <button
                    onClick={() => setActiveTab(item)}
                    className={`text-[20px] font-bold text-left transition-colors w-full ${
                      activeTab === item
                        ? "text-ps-blue"
                        : "text-body-light hover:text-ink"
                    }`}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Main Content Area */}
          <div className="w-full lg:w-3/4 flex flex-col gap-16">
            {/* Featured Section */}
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Large Featured */}
              <div className="w-full lg:w-2/3 group cursor-pointer">
                <div className="w-full aspect-[4/3] lg:aspect-[1.5/1] bg-surface-soft rounded-xl overflow-hidden mb-6 relative">
                  <img
                    src={FEATURED_MAIN.image}
                    alt={FEATURED_MAIN.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <h2 className="text-[24px] font-bold text-ink mb-3 uppercase group-hover:text-ps-blue transition-colors leading-snug">
                  {FEATURED_MAIN.title}
                </h2>
                <p className="text-[16px] text-body-light">
                  {FEATURED_MAIN.summary}
                </p>
              </div>

              {/* Right Small List */}
              <div className="w-full lg:w-1/3 flex flex-col gap-4">
                {FEATURED_SIDE.map((post) => (
                  <div
                    key={post.id}
                    className="group cursor-pointer rounded-xl overflow-hidden relative aspect-[16/9] lg:aspect-auto lg:h-[140px] bg-surface-soft"
                  >
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                      <h3 className="text-canvas-light text-[14px] font-bold uppercase leading-tight group-hover:text-ps-blue transition-colors">
                        {post.title}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Grid Section */}
            <div className="grid md:grid-cols-3 gap-8">
              {GRID_POSTS.map((post) => (
                <div
                  key={post.id}
                  className="group cursor-pointer flex flex-col h-full"
                >
                  <div className="w-full aspect-[4/3] bg-surface-soft rounded-xl overflow-hidden mb-6 relative">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-[18px] font-bold text-ink mb-3 uppercase group-hover:text-ps-blue transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-[14px] text-body-light grow">
                    {post.summary}
                  </p>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            <div className="flex justify-center mt-4">
              <button className="bg-ps-blue text-canvas-light hover:bg-ps-blue-pressed px-12 py-3.5 rounded-full font-bold text-[16px] transition-colors uppercase tracking-wider shadow-md hover:shadow-lg">
                TÌM HIỂU THÊM
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
