import Hero from '../components/Hero';

export default function Home() {
  return (
    <main>
      <Hero />
      
      {/* Next Chapter: Dark Canvas (Features) */}
      <section className="bg-canvas-dark text-on-dark w-full py-24">
        <div className="w-full max-w-[1280px] mx-auto px-6">
          <h2 className="display-lg mb-16 text-center">Các tính năng nổi bật</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Chất lượng quốc tế', desc: 'Chương trình chuẩn Cambridge phát triển toàn diện 4 kỹ năng.' },
              { title: 'Giáo viên bản ngữ', desc: '100% đội ngũ giáo viên giàu kinh nghiệm, đạt chứng chỉ quốc tế.' },
              { title: 'Phương pháp chủ động', desc: 'Học viên làm trung tâm, rèn luyện tư duy phản biện sáng tạo.' }
            ].map((feature, i) => (
              <div key={i} className="bg-surface-dark-card p-8 rounded-md">
                <h3 className="text-[18px] font-semibold text-on-dark mb-4">{feature.title}</h3>
                <p className="text-[16px] text-on-dark-mute leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Next Chapter: PlayStation Blue Band (CTA) */}
      <section className="bg-ps-blue text-on-dark w-full py-24">
        <div className="w-full max-w-[1280px] mx-auto px-6 text-center">
          <h2 className="text-[35px] font-light font-display mb-8">
            Bắt đầu hành trình cùng EasyEnglish
          </h2>
          <a 
            href="#"
            className="bg-canvas-dark text-on-dark hover:bg-surface-dark-elevated px-7 py-3 rounded-full font-bold text-[18px] transition-colors inline-block"
          >
            Tìm hiểu các khóa học
          </a>
        </div>
      </section>
    </main>
  );
}
