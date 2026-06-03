import { PlayCircle } from "@phosphor-icons/react";
import kidsrc from "../assets/kid.png";
export default function ChildrenEnglish() {
  return (
    <main>
      {/* 1. Hero Video (White Canvas) */}
      <section className="bg-canvas-light text-ink w-full py-16 md:py-24">
        <div className="w-full max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="display-lg text-ps-blue uppercase mb-4">
              Anh ngữ "đo ni đóng giày" cho lứa tuổi thiếu nhi
            </h1>
            <p className="text-[18px] text-body-light max-w-2xl mx-auto">
              Lộ trình tiếng Anh cá nhân hóa cho thiếu nhi — đồng hành để con
              tiến bộ đúng cách, chuẩn Cambridge Pre-A1 Starters đến A2 Flyers.
            </p>
          </div>
          <div className="w-full aspect-video bg-surface-soft rounded-md overflow-hidden relative group cursor-pointer shadow-2xl">
            <img
              src={kidsrc}
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
                Nơi con được đồng hành để tiến bộ đúng cách
              </h2>
              <div className="space-y-6 text-[18px] text-on-dark-mute leading-relaxed">
                <p>
                  Ở lứa tuổi thiếu nhi, cá tính của con phát triển rất mạnh mẽ.
                  Thái độ học tập sẽ phụ thuộc nhiều vào việc con được dẫn dắt
                  đúng hướng, được tôn trọng cá tính, tốc độ và cảm xúc học tập
                  của riêng con.
                </p>
                <p>
                  Tiếng Anh không còn dừng lại ở sự "cảm thụ" đơn thuần. Đây là
                  giai đoạn chuyển mình quan trọng sang tư duy ngôn ngữ học
                  thuật, giúp con nuôi dưỡng lòng thấu cảm, sự tự lập và khả
                  năng làm chủ việc học và cuộc sống.
                </p>
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <div className="grid grid-cols-2 gap-4">
                <img
                  src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop"
                  alt="Students learning"
                  className="rounded-sm object-cover aspect-square w-full shadow-lg"
                />
                <img
                  src="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=2070&auto=format&fit=crop"
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
            Lộ trình "Đo ni đóng giày" dành riêng cho con
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                num: "1",
                title: "Nuôi dưỡng lòng thấu cảm",
                desc: "Con hiểu và quan tâm đến cảm xúc của người khác qua tương tác xã hội.",
              },
              {
                num: "2",
                title: "Tự giác học tập",
                desc: "Con bắt đầu chịu trách nhiệm cho lựa chọn và việc học của mình.",
              },
              {
                num: "3",
                title: "Độc lập làm chủ",
                desc: "Con tự quản lý việc học và thực hiện cam kết của mình.",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="bg-canvas-light text-ink p-10 rounded-md shadow-2xl flex flex-col items-center text-center transform transition-transform hover:-translate-y-2"
              >
                <div className="w-16 h-16 rounded-full bg-ps-blue text-canvas-light flex items-center justify-center text-[24px] font-bold font-display mb-6">
                  {step.num}
                </div>
                <h3 className="text-[22px] font-display font-bold text-ps-blue mb-4">
                  {step.title}
                </h3>
                <p className="text-[16px] text-body-light">{step.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-[18px] font-bold uppercase tracking-widest opacity-90">
            Cam kết con đạt trình độ Pre-A1 Starters - A2 Flyers chuẩn Cambridge
          </p>
        </div>
      </section>

      {/* 4. Sự an tâm của Phụ huynh (White Canvas) */}
      <section className="bg-canvas-light text-ink w-full py-24">
        <div className="w-full max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[14px] font-bold uppercase tracking-widest text-ps-blue mb-2 block">
              Làm sao để bố mẹ an tâm thấy rằng
            </span>
            <h2 className="display-lg uppercase">
              Con đang từng bước tiến bộ thực sự?
            </h2>
            <p className="text-[18px] text-body-light mt-6 max-w-2xl mx-auto">
              Con không học một mình, sự trưởng thành của con được đo đếm, hỗ
              trợ và theo sát nhờ:
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                num: "01",
                title: "Giáo trình độc quyền",
                desc: "Thiết kế riêng cho trẻ em Việt Nam, đảm bảo đầu ra chuẩn Cambridge/ IELTS.",
              },
              {
                num: "02",
                title: "Giáo viên đẳng cấp quốc tế",
                desc: "Giám sát bởi International House, phương pháp giảng dạy độc quyền đã được chứng minh.",
              },
              {
                num: "03",
                title: "Đánh giá thời gian thực",
                desc: "Giúp giáo viên nắm bắt rõ tiến độ, điều chỉnh bài giảng kịp thời.",
              },
              {
                num: "04",
                title: "Hệ thống tạo động lực",
                desc: "Khích lệ từng tiến bộ nhỏ của con với các cơ chế khen thưởng hấp dẫn.",
              },
              {
                num: "05",
                title: "Ứng dụng học tập tại nhà",
                desc: "Kết nối liền mạch kiến thức học từ lớp đến nhà.",
              },
              {
                num: "06",
                title: "Cố vấn học tập đồng hành 24/7",
                desc: "Trả lời mọi thắc mắc dựa trên dữ liệu học tập minh bạch, rõ ràng.",
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

      {/* 5. Lời Phụ huynh (Dark Canvas) */}
      <section className="bg-canvas-dark text-on-dark w-full py-24">
        <div className="w-full max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="display-lg text-ps-blue uppercase mb-2">
              Niềm tự hào
            </h2>
            <p className="text-[24px] font-display font-light">
              Khi con chinh phục những đỉnh cao mới
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-surface-dark-card p-10 rounded-md relative">
              <span className="text-[80px] font-display text-ps-blue absolute top-4 left-6 opacity-20">
                "
              </span>
              <p className="text-[16px] text-on-dark-mute leading-relaxed mb-8 relative z-10">
                Điều mà tôi lo lắng nhất trước khi con vào học tại EasyEnglish
                đó là kỹ năng thuyết trình trước đám đông. Tôi mong rằng con sẽ
                mạnh dạn hơn, biết đưa ra ý kiến, dám phản biện và tự tin trong
                giao tiếp. Sau khi học, Minh Châu đã có thể nói tiếng Anh nhuần
                nhuyễn. Tôi rất vui vì điều tôi lo lắng nhất đã trở thành điều
                tôi tự hào nhất.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-ps-blue text-canvas-light flex items-center justify-center font-bold text-xl">
                  H
                </div>
                <div>
                  <h4 className="text-[16px] font-bold text-on-dark">
                    Chị Lê Thị Hương
                  </h4>
                  <p className="text-[14px] text-ps-blue">
                    Phụ huynh bé Nguyễn Minh Châu
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-surface-dark-card p-10 rounded-md relative">
              <span className="text-[80px] font-display text-ps-blue absolute top-4 left-6 opacity-20">
                "
              </span>
              <p className="text-[16px] text-on-dark-mute leading-relaxed mb-8 relative z-10">
                Trước khi bé vào học, băn khoăn lớn nhất của tôi đó là tìm được
                một trung tâm Anh ngữ mà ở đó con có niềm yêu thích với việc đi
                học. Tôi nhận thấy sự thay đổi trong thói quen học tập của con
                như con tự giác học tập hơn và luôn cảm thấy rất hào hứng trong
                việc hoàn thành bài tập. Tôi cảm thấy rất vui và tự hào về con.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-ps-blue text-canvas-light flex items-center justify-center font-bold text-xl">
                  T
                </div>
                <div>
                  <h4 className="text-[16px] font-bold text-on-dark">
                    Chị Hoàng Minh Trang
                  </h4>
                  <p className="text-[14px] text-ps-blue">
                    Phụ huynh bé La Ngọc Tuệ Nhi
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
