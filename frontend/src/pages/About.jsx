import { PlayCircle } from "@phosphor-icons/react";

export default function About() {
  return (
    <main>
      {/* 1. Tâm huyết nhà sáng lập (White Canvas) */}
      <section className="bg-canvas-light text-ink w-full py-24">
        <div className="w-full max-w-[1280px] mx-auto px-6">
          <h1 className="display-lg text-center mb-16 uppercase">
            Tâm huyết của nhà sáng lập
          </h1>
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2">
              <p className="text-[18px] text-body-light leading-relaxed mb-6">
                "Chúng tôi thành lập EasyEnglish với sứ mệnh đào tạo thế hệ trẻ
                Việt Nam thành công dân toàn cầu để thúc đẩy sự thịnh vượng, và
                giúp họ thay đổi thế giới theo hướng tích cực hơn. Với chúng
                tôi, phần thưởng lớn nhất là được nhìn thấy cuộc sống của mọi
                người tốt đẹp hơn nhờ sự nỗ lực và nhiệt huyết của đội ngũ giáo
                viên tài năng tại EasyEnglish. Chúng tôi hy vọng có thể giúp
                nhiều học viên hơn nữa và sẽ luôn là 'Nơi những giá trị tốt nhất
                trở nên tốt hơn'."
              </p>
              <div className="mt-8">
                <h3 className="text-[22px] font-display text-ps-blue mb-1">
                  Arabella Peters & Khalid Muhmood
                </h3>
                <p className="text-[16px] text-body-light">
                  Đồng sáng lập EasyEnglish
                </p>
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <div className="aspect-video bg-surface-soft rounded-md overflow-hidden relative group cursor-pointer">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
                  alt="Founder Video Placeholder"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-canvas-dark/30 flex items-center justify-center">
                  <PlayCircle
                    size={72}
                    weight="fill"
                    className="text-canvas-light group-hover:text-ps-blue transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Thành viên Ban Quản Trị (Dark Canvas) */}
      <section className="bg-canvas-dark text-on-dark w-full py-24">
        <div className="w-full max-w-[1280px] mx-auto px-6">
          <h2 className="display-lg text-center mb-16 uppercase">
            Thành viên Ban Quản Trị
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "KHALID MUHMOOD MBE",
                role: "Nhà đầu tư giáo dục kiêm đồng sáng lập",
                image:
                  "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop",
              },
              {
                name: "ARABELLA PETERS",
                role: "Nhà đầu tư giáo dục kiêm đồng sáng lập",
                image:
                  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop",
              },
              {
                name: "DUGIE CAMERON",
                role: "Cố vấn Ban Quản trị",
                image:
                  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1974&auto=format&fit=crop",
              },
            ].map((member, i) => (
              <div key={i} className="flex flex-col group">
                <div className="w-full aspect-[3/4] bg-surface-dark-card rounded-md overflow-hidden mb-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover opacity-90 transition-opacity duration-300 group-hover:opacity-100"
                  />
                </div>
                <h3 className="text-[22px] font-display font-light text-ps-blue mb-2">
                  {member.name}
                </h3>
                <p className="text-[14px] text-on-dark/70">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Những con số ấn tượng (PlayStation Blue Canvas) */}
      <section className="bg-ps-blue text-on-dark w-full py-24">
        <div className="w-full max-w-[1280px] mx-auto px-6 text-center">
          <h2 className="text-[32px] font-display font-light mb-8 uppercase">
            Những con số ấn tượng
          </h2>
          <div className="font-display font-light text-[80px] md:text-[140px] leading-none mb-4">
            1.000.000+
          </div>
          <p className="text-[18px] font-bold uppercase tracking-widest mb-16">
            Học viên tín nhiệm và theo học tại EasyEnglish từ năm 1995
          </p>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                num: "1.000+",
                desc: "Giáo viên trình độ chuyên môn cao và nhiều kinh nghiệm",
              },
              { num: "100%", desc: "Giáo viên là người nước ngoài" },
              {
                num: "75+",
                desc: "Trung tâm quy mô lớn trên cả nước và tiếp tục mở rộng",
              },
              {
                num: "90%",
                desc: "Học sinh đạt điểm tuyệt đối 4 kỹ năng trong các kỳ thi Cambridge",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-canvas-light text-ink p-8 rounded-md flex flex-col items-center text-center"
              >
                <div className="text-[72px] lg:text-[88px] leading-none font-display font-bold text-ps-blue mb-6">
                  {stat.num}
                </div>
                <p className="text-[16px] text-body-light leading-relaxed">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Giáo viên - Tinh hoa của EasyEnglish (White Canvas) */}
      <section className="bg-canvas-light text-ink w-full py-24">
        <div className="w-full max-w-[1280px] mx-auto px-6">
          <h2 className="display-lg text-center mb-12 uppercase text-ps-blue">
            Giáo viên – Tinh hoa của EasyEnglish
          </h2>
          <div className="w-full aspect-video bg-surface-soft rounded-md overflow-hidden relative group cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2132&auto=format&fit=crop"
              alt="Teachers Video Placeholder"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-canvas-dark/20 flex items-center justify-center">
              <PlayCircle
                size={88}
                weight="fill"
                className="text-canvas-light group-hover:text-ps-blue transition-colors shadow-2xl rounded-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Thành tựu (Dark Canvas) */}
      <section className="bg-canvas-dark text-on-dark w-full py-24">
        <div className="w-full max-w-[1280px] mx-auto px-6">
          <h2 className="display-lg text-center mb-16 uppercase">
            Thành tựu EasyEnglish đã đạt được
          </h2>

          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2">
              <div className="bg-canvas-light p-4 rounded-md shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=2070&auto=format&fit=crop"
                  alt="Certificate Placeholder"
                  className="w-full h-auto rounded-sm border border-ash-light"
                />
              </div>
            </div>

            <div className="w-full lg:w-1/2">
              <h3 className="text-[32px] font-display font-light text-ps-blue mb-6">
                Kỷ lục kép cho Lễ Trao Chứng Chỉ Cambridge.
              </h3>
              <p className="text-[18px] text-body-dark leading-relaxed">
                Lễ trao chứng chỉ Cambridge 2024 được đánh giá là bước nhảy vượt
                bậc khi EasyEnglish đồng thời được công nhận kỷ lục ở cả số
                lượng học sinh và chất lượng điểm đầu ra với gần 90% học sinh
                đạt điểm tuyệt đối. Với con số ấn tượng này, EasyEnglish đã được
                Tổ chức Kỷ lục Việt Nam công nhận là: Lễ trao chứng chỉ
                Cambridge đông và có nhiều học sinh đạt điểm tuyệt đối nhất Việt
                Nam, khẳng định chất lượng vượt trội và vị thế của đơn vị đào
                tạo Anh ngữ hàng đầu Việt Nam.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
