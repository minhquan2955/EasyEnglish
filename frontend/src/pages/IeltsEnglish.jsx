import { PlayCircle } from "@phosphor-icons/react";
import ieltsImg from "../assets/ielts.png";

export default function IeltsEnglish() {
  return (
    <main>
      {/* 1. Hero Video (White Canvas) */}
      <section className="bg-canvas-light text-ink w-full py-16 md:py-24">
        <div className="w-full max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="display-lg text-ps-blue uppercase mb-4">
              Luyện thi IELTS cho học sinh
            </h1>
            <p className="text-[18px] text-body-light max-w-2xl mx-auto">
              Chương trình Tiếng Anh IELTS: lộ trình IELTS Pathway và Access,
              xây nền tảng tư duy và chiến lược học để học sinh đạt điểm số xứng
              đáng.
            </p>
          </div>
          <div className="w-full aspect-video bg-surface-soft rounded-md overflow-hidden relative group cursor-pointer shadow-2xl">
            <img
              src={ieltsImg}
              alt="Hero Video Placeholder"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-canvas-dark/30 flex items-center justify-center">
              <PlayCircle
                size={88}
                weight="fill"
                className="text-canvas-light group-hover:text-ps-blue transition-colors"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Triết lý giáo dục (Dark Canvas) */}
      <section className="bg-canvas-dark text-on-dark w-full py-24">
        <div className="w-full max-w-[1280px] mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2">
              <h2 className="display-lg mb-8 uppercase">
                Điểm số phản ánh năng lực, nhưng cách học mới quyết định kết quả
              </h2>
              <div className="space-y-6 text-[18px] text-on-dark-mute leading-relaxed">
                <p>
                  Kỳ thi IELTS không chỉ là một bài kiểm tra ngôn ngữ. Nó là
                  cánh cổng đầu tiên để con bước vào đại học quốc tế, giành học
                  bổng, hoặc đơn giản là được lựa chọn những con đường rộng mở
                  hơn trong tương lai.
                </p>
                <p>
                  Nhưng để đạt được điểm số xứng đáng, con cần nhiều hơn một lớp
                  luyện thi. Cần một lộ trình học thuật dài hạn, xây dựng nền
                  tảng tư duy và chiến lược học tập để con:
                </p>
                <ul className="list-disc list-inside space-y-2 mt-4 text-on-dark">
                  <li>Hiểu - thay vì học vẹt</li>
                  <li>Tư duy bằng tiếng Anh thay vì dịch từng câu</li>
                  <li>Cán đích bằng năng lực thật, không bằng may rủi</li>
                </ul>
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <div className="grid grid-cols-2 gap-4">
                <img
                  src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop"
                  alt="Students learning"
                  className="rounded-sm object-cover aspect-square w-full shadow-lg"
                />
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
                  alt="Students engaging"
                  className="rounded-sm object-cover aspect-square w-full shadow-lg mt-8"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Lộ trình cá nhân hóa (PlayStation Blue Canvas) */}
      <section className="bg-ps-blue text-on-dark w-full py-24">
        <div className="w-full max-w-[1280px] mx-auto px-6 text-center">
          <h2 className="display-lg mb-16 uppercase">
            Lộ trình chinh phục IELTS bám sát đến từng band điểm
          </h2>
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-canvas-light text-ink p-10 rounded-md shadow-2xl flex flex-col items-center text-center transform transition-transform hover:-translate-y-2 border-t-8 border-ps-blue">
              <div className="w-16 h-16 rounded-full bg-ps-blue text-canvas-light flex items-center justify-center text-[24px] font-bold font-display mb-6">
                1
              </div>
              <h3 className="text-[24px] font-display font-bold text-ps-blue mb-2">
                IELTS Access
              </h3>
              <p className="text-[14px] font-bold uppercase tracking-wider mb-6 opacity-60">
                Lộ trình 2 năm
              </p>
              <p className="text-[16px] text-body-light leading-relaxed">
                Giúp học viên chuyển đổi ngôn ngữ từ tiếng Anh giao tiếp sang
                tiếng Anh học thuật. Học viên được trang bị tiền đề vững chắc
                trước khi bước vào các cấp độ luyện thi chính thức.
              </p>
            </div>

            <div className="bg-canvas-light text-ink p-10 rounded-md shadow-2xl flex flex-col items-center text-center transform transition-transform hover:-translate-y-2 border-t-8 border-ps-blue">
              <div className="w-16 h-16 rounded-full bg-ps-blue text-canvas-light flex items-center justify-center text-[24px] font-bold font-display mb-6">
                2
              </div>
              <h3 className="text-[24px] font-display font-bold text-ps-blue mb-2">
                IELTS Pathway
              </h3>
              <p className="text-[14px] font-bold uppercase tracking-wider mb-6 opacity-60">
                Lộ trình 2.5 năm
              </p>
              <p className="text-[16px] text-body-light leading-relaxed">
                Khoá học chuyên sâu giúp học viên hoàn thiện kỹ năng và chiến
                lược bài thi IELTS.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Sự an tâm của Phụ huynh (White Canvas) */}
      <section className="bg-canvas-light text-ink w-full py-24">
        <div className="w-full max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="display-lg uppercase text-ps-blue">
              5 điều khác biệt
            </h2>
            <p className="text-[24px] font-display font-light mt-2 max-w-2xl mx-auto">
              chỉ có tại chương trình IELTS - EasyEnglish
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                num: "01",
                title: "Cam kết đầu ra theo từng cấp độ",
                desc: "Mỗi học viên đều có lộ trình rõ ràng, mục tiêu điểm số cụ thể và cam kết được đo lường. Không luyện chung chung, không thi theo cảm tính.",
              },
              {
                num: "02",
                title: "Chiến lược luyện thi cá nhân hóa",
                desc: "Lộ trình 8 cấp độ được thiết kế bám sát cấu trúc đề thi IELTS thật, từng kỹ năng được xây dựng theo chiến thuật riêng.",
              },
              {
                num: "03",
                title: "100% giáo viên quốc tế & thực chiến IELTS",
                desc: "Đội ngũ giáo viên am hiểu sâu về cấu trúc bài thi, tiêu chí chấm điểm, giúp nắm chắc kỹ thuật, tâm lý phòng thi.",
              },
              {
                num: "04",
                title: "Phương pháp học theo năng lực cá nhân",
                desc: "Kết hợp học trực tiếp với giáo viên và hệ thống luyện tập trực tuyến giúp học viên làm quen đề sớm, tối ưu kỹ năng làm bài.",
              },
              {
                num: "05",
                title: "Mục tiêu là năng lực toàn cầu",
                desc: "Sau khóa học, học viên không chỉ đạt mục tiêu IELTS mà còn tự tin hòa nhập môi trường học tập quốc tế.",
              },
            ].map((reason, i) => (
              <div
                key={i}
                className="bg-surface-soft p-8 rounded-md border-l-4 border-ps-blue transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:bg-white group"
              >
                <div className="text-[40px] font-display font-light text-ps-blue mb-4 opacity-50">
                  {reason.num}
                </div>
                <h3 className="text-[20px] font-bold mb-3 group-hover:text-ps-blue transition-colors">
                  {reason.title}
                </h3>
                <p className="text-[16px] text-body-light transition-colors">
                  {reason.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Gương mặt nổi bật (Dark Canvas) */}
      <section className="bg-canvas-dark text-on-dark w-full py-24">
        <div className="w-full max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[14px] font-bold uppercase tracking-widest text-ps-blue mb-2 block">
              Gương mặt IELTS
            </span>
            <h2 className="display-lg text-canvas-light uppercase mb-2">
              ĐIỂM SỐ KHÔNG ĐẾN TỪ MAY MẮN
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: "Trần Khôi Nguyên",
                score: "IELTS 8.5",
                img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1974&auto=format&fit=crop",
              },
              {
                name: "Nguyễn AnDy",
                score: "IELTS 7.5",
                img: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?q=80&w=1926&auto=format&fit=crop",
              },
              {
                name: "Lê Nguyên",
                score: "IELTS 7.5",
                img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1974&auto=format&fit=crop",
              },
              {
                name: "Dương Mai Ngọc",
                score: "IELTS 7.0",
                img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop",
              },
            ].map((student, i) => (
              <div
                key={i}
                className="bg-surface-dark-card rounded-md overflow-hidden relative group"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={student.img}
                    alt={student.name}
                    className="w-full h-full object-cover grayscale opacity-80 transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105 group-hover:opacity-100"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6">
                  <h4 className="text-[20px] font-bold text-on-dark mb-1">
                    {student.name}
                  </h4>
                  <p className="text-[18px] font-display font-bold text-ps-blue">
                    {student.score}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
