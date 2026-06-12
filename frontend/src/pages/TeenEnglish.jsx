import { PlayCircle } from '@phosphor-icons/react';

export default function TeenEnglish() {
  return (
    <main>
      {/* 1. Hero Video (White Canvas) */}
      <section className="bg-canvas-light text-ink w-full py-16 md:py-24">
        <div className="w-full max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="display-lg text-ps-blue uppercase mb-4">
              Anh ngữ "đo ni đóng giày" cho lứa tuổi thiếu niên
            </h1>
            <p className="text-[18px] text-body-light max-w-2xl mx-auto">
              Lộ trình tiếng Anh cá nhân hóa cho thiếu niên — chuẩn Cambridge A2 KET đến B2 FCE, phát triển bản lĩnh phòng thi và sự tự tin giao tiếp.
            </p>
          </div>
          <div className="w-full aspect-video bg-surface-soft rounded-md overflow-hidden relative group cursor-pointer shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop" 
              alt="Hero Video Placeholder" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-canvas-dark/30 flex items-center justify-center">
              <PlayCircle size={88} weight="fill" className="text-canvas-light group-hover:text-ps-blue transition-colors" />
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
                Từ bản lĩnh phòng thi đến tự tin vào đời
              </h2>
              <div className="space-y-6 text-[18px] text-on-dark-mute leading-relaxed">
                <p>Ở lứa tuổi thiếu niên, áp lực trên vai con (và bố mẹ) là có thật: Những kỳ thi chuyển cấp cận kề, những chứng chỉ quốc tế cần đạt được.</p>
                <p>Nhưng sâu thẳm, bố mẹ mong nhiều hơn thế: mong thấy con có <strong>tiếng nói riêng</strong>, <strong>vững bản sắc</strong> và <strong>sẵn sàng bước ra thế giới</strong>.</p>
                <p>Và để con có thể tự tin bước đi trên hành trình đó… tiếng Anh không chỉ là kiến thức, mà còn là công cụ để con khẳng định mình trước thế giới.</p>
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <div className="grid grid-cols-2 gap-4">
                <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop" alt="Students learning" className="rounded-sm object-cover aspect-square w-full shadow-lg" />
                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" alt="Students engaging" className="rounded-sm object-cover aspect-square w-full shadow-lg mt-8" />
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
              { num: '1', title: 'Có tiếng nói riêng', desc: 'Con diễn đạt rõ ràng ý tưởng, quan điểm và góc nhìn của mình.' },
              { num: '2', title: 'Vững bản sắc', desc: 'Con hiểu rõ hơn mình là ai và điều gì quan trọng với mình.' },
              { num: '3', title: 'Sẵn sàng bước ra thế giới', desc: 'Con hiểu các góc nhìn rộng hơn cộng đồng của mình, sẵn sàng khẳng định bản thân với thế giới.' }
            ].map((step, i) => (
              <div key={i} className="bg-canvas-light text-ink p-10 rounded-md shadow-2xl flex flex-col items-center text-center transform transition-transform hover:-translate-y-2">
                <div className="w-16 h-16 rounded-full bg-ps-blue text-canvas-light flex items-center justify-center text-[24px] font-bold font-display mb-6">
                  {step.num}
                </div>
                <h3 className="text-[20px] font-display font-bold text-ps-blue mb-4">{step.title}</h3>
                <p className="text-[14px] text-body-light">{step.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-[18px] font-bold uppercase tracking-widest opacity-90">
            Cam kết con đạt trình độ A2 Key for Schools (KET) - B2 First for Schools (FCE) chuẩn Cambridge
          </p>
        </div>
      </section>

      {/* 4. Sự an tâm của Phụ huynh (White Canvas) */}
      <section className="bg-canvas-light text-ink w-full py-24">
        <div className="w-full max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[14px] font-bold uppercase tracking-widest text-ps-blue mb-2 block">Nhưng làm sao để bố mẹ an tâm rằng...</span>
            <h2 className="display-lg uppercase">
              Những nỗ lực của con đang đi đúng hướng?
            </h2>
            <p className="text-[18px] text-body-light mt-6 max-w-2xl mx-auto">
              Bố mẹ không còn phải tự hỏi: "Con có đang học đúng không?". Vì sự trưởng thành của con đã được đồng hành và đảm bảo nhờ:
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { num: '01', title: 'Giáo trình độc quyền', desc: 'Thiết kế riêng cho trẻ em Việt Nam, đảm bảo đầu ra chuẩn Cambridge/ IELTS.' },
              { num: '02', title: 'Giáo viên đẳng cấp quốc tế', desc: 'Được giám sát bởi International House, phương pháp giảng dạy độc quyền đã được chứng minh.' },
              { num: '03', title: 'Hệ thống đánh giá thời gian thực', desc: 'Giúp giáo viên nắm bắt rõ tiến độ, điều chỉnh bài giảng kịp thời và dự đoán sớm các dấu hiệu rủi ro.' },
              { num: '04', title: 'Hệ thống tạo động lực học tập', desc: 'Bảng tiến bộ cá nhân không chỉ ghi nhận kết quả, mà còn khích lệ từng tiến bộ nhỏ của con.' },
              { num: '05', title: 'Ứng dụng học tập thông minh', desc: 'Giúp kết nối liền mạch kiến thức học từ lớp đến nhà với nội dung tùy chỉnh theo tốc độ học viên.' },
              { num: '06', title: 'Cố vấn học tập đồng hành 24/7', desc: 'Trả lời mọi thắc mắc dựa trên căn cứ dữ liệu thời gian thực, minh bạch, rõ ràng.' }
            ].map((reason, i) => (
              <div key={i} className="bg-surface-soft p-8 rounded-md border-l-4 border-ps-blue transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:bg-white group">
                <div className="text-[40px] font-display font-light text-ps-blue mb-4 opacity-50">{reason.num}</div>
                <h3 className="text-[20px] font-bold mb-3 group-hover:text-ps-blue transition-colors">{reason.title}</h3>
                <p className="text-[16px] text-body-light transition-colors">{reason.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Gương mặt nổi bật (Dark Canvas) */}
      <section className="bg-canvas-dark text-on-dark w-full py-24">
        <div className="w-full max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[14px] font-bold uppercase tracking-widest text-ps-blue mb-2 block">Và khi những tiến bộ được nhìn thấy</span>
            <h2 className="display-lg text-ps-blue uppercase mb-2">KHÔNG CHỈ ĐẠT MỤC TIÊU ĐIỂM SỐ</h2>
            <p className="text-[24px] font-display font-light">CON TỰ TIN KHẲNG ĐỊNH MÌNH VỚI THẾ GIỚI</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Nguyễn Minh Châu', score: 'Điểm tuyệt đối Cambridge A2 KET', img: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1974&auto=format&fit=crop' },
              { name: 'Lê Hà Phương', score: 'Điểm tuyệt đối Cambridge B1 PET', img: 'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?q=80&w=2080&auto=format&fit=crop' },
              { name: 'Hoàng Việt Bách', score: 'Điểm tuyệt đối Cambridge B1 PET', img: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=2048&auto=format&fit=crop' },
              { name: 'Huỳnh Tô Vĩnh Hưng', score: 'Điểm tuyệt đối Cambridge A2 KET', img: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=2070&auto=format&fit=crop' }
            ].map((student, i) => (
              <div key={i} className="bg-surface-dark-card rounded-md overflow-hidden relative group">
                <div className="aspect-[4/5] overflow-hidden">
                  <img src={student.img} alt={student.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6">
                  <h4 className="text-[20px] font-bold text-on-dark mb-1">{student.name}</h4>
                  <p className="text-[14px] text-ps-blue font-semibold">{student.score}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
