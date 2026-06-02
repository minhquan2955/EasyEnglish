import { PlayCircle } from '@phosphor-icons/react';

export default function KindergartenEnglish() {
  return (
    <main>
      {/* 1. Hero Video (White Canvas) */}
      <section className="bg-canvas-light text-ink w-full py-16 md:py-24">
        <div className="w-full max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="display-lg text-ps-blue uppercase mb-4">
              Anh ngữ "đo ni đóng giày" cho lứa tuổi mẫu giáo
            </h1>
            <p className="text-[18px] text-body-light max-w-2xl mx-auto">
              Lộ trình tiếng Anh cá nhân hóa cho mẫu giáo — đồng hành để con cảm thấy thuộc về, tự tin nói, thỏa trí tò mò, hình thành thói quen học tập, cam kết đạt Pre-A1 chuẩn Cambridge.
            </p>
          </div>
          <div className="w-full aspect-video bg-surface-soft rounded-md overflow-hidden relative group cursor-pointer shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2020&auto=format&fit=crop" 
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
                Nơi con có khởi đầu đúng để lớn lên theo cách của riêng mình
              </h2>
              <div className="space-y-6 text-[18px] text-on-dark-mute leading-relaxed">
                <p>Ở lứa tuổi mẫu giáo, mỗi đứa trẻ là một mầm non với những nhịp điệu phát triển khác nhau. Điều con cần nhất lúc này là nơi mọi nỗ lực nhỏ bé đều được nhìn thấy, thấu hiểu, đồng hành.</p>
                <p>Khi con được nói, được sai, được khích lệ & cảm thấy an toàn cảm xúc, hạt mầm của sự tự tin, tò mò, bền bỉ bắt đầu nảy nở cùng năng lực ngôn ngữ…</p>
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <div className="grid grid-cols-2 gap-4">
                <img src="https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=2040&auto=format&fit=crop" alt="Students learning" className="rounded-sm object-cover aspect-square w-full shadow-lg" />
                <img src="https://images.unsplash.com/photo-1473649085228-583485e6e4d7?q=80&w=2064&auto=format&fit=crop" alt="Students engaging" className="rounded-sm object-cover aspect-square w-full shadow-lg mt-8" />
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[
              { num: '1', title: 'Con cảm thấy thuộc về', desc: 'Con cảm thấy an toàn và thuộc về tập thể. Việc học bắt đầu phát triển khi con sử dụng ngôn ngữ như một sở thích.' },
              { num: '2', title: 'Con thỏa trí tò mò', desc: 'Con khám phá thế giới và đặt câu hỏi với phản xạ ngôn ngữ và diễn đạt tự nhiên, phát âm chuẩn.' },
              { num: '3', title: 'Con tự tin', desc: 'Con dám nói, dám sai và được khích lệ và đó là nền tảng cho sự tự tin lâu dài.' },
              { num: '4', title: 'Con bền bỉ, không bỏ cuộc', desc: '7 thói quen học tập được tích hợp có chủ đích, giúp con chủ động học tập, biết đối mặt khó khăn.' }
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
            Cam kết con đạt trình độ Pre-A1 chuẩn Cambridge
          </p>
        </div>
      </section>

      {/* 4. Sự an tâm của Phụ huynh (White Canvas) */}
      <section className="bg-canvas-light text-ink w-full py-24">
        <div className="w-full max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[14px] font-bold uppercase tracking-widest text-ps-blue mb-2 block">Nhưng làm sao bố mẹ an tâm</span>
            <h2 className="display-lg uppercase">
              Đây chính là khởi đầu đúng dành cho con?
            </h2>
            <p className="text-[18px] text-body-light mt-6 max-w-2xl mx-auto">
              Tạm biệt tất cả những băn khoăn: con đã sẵn sàng chưa?; con có vui học không?... vì hành trình này "may đo" cho chính con:
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { num: '01', title: 'Giáo trình độc quyền', desc: 'Thiết kế riêng cho trẻ em Việt Nam, đảm bảo đầu ra chuẩn Cambridge/ IELTS.' },
              { num: '02', title: 'Giáo viên đẳng cấp quốc tế', desc: 'Giám sát bởi International House, phương pháp giảng dạy độc quyền đã được chứng minh.' },
              { num: '03', title: 'Đánh giá thời gian thực', desc: 'Giúp giáo viên nắm bắt rõ tiến độ, điều chỉnh bài giảng kịp thời.' },
              { num: '04', title: 'Hệ thống tạo động lực', desc: 'Khích lệ từng tiến bộ nhỏ của con với các cơ chế khen thưởng hấp dẫn.' },
              { num: '05', title: 'Ứng dụng học tập tại nhà', desc: 'Kết nối liền mạch kiến thức học từ lớp đến nhà.' },
              { num: '06', title: 'Cố vấn học tập đồng hành 24/7', desc: 'Trả lời mọi thắc mắc dựa trên dữ liệu học tập minh bạch, rõ ràng.' }
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

      {/* 5. Lời Phụ huynh (Dark Canvas) */}
      <section className="bg-canvas-dark text-on-dark w-full py-24">
        <div className="w-full max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[14px] font-bold uppercase tracking-widest text-ps-blue mb-2 block">Để rồi, kết quả ngọt ngào nhất chính là...</span>
            <h2 className="display-lg text-ps-blue uppercase mb-2">Nhìn thấy con tự tin</h2>
            <p className="text-[24px] font-display font-light">Mở cánh cửa tương lai theo cách của mình</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-surface-dark-card p-10 rounded-md relative">
              <span className="text-[80px] font-display text-ps-blue absolute top-4 left-6 opacity-20">"</span>
              <p className="text-[16px] text-on-dark-mute leading-relaxed mb-8 relative z-10">
                Bé nhà mình vốn rất nhát, gặp người lạ là trốn sau lưng mẹ. Nhưng từ khi học tại đây, mình bất ngờ khi thấy con chủ động chào hỏi và líu lo hát tiếng Anh cả ngày. Con không hề sợ sai, vì con biết ở lớp, các thầy cô luôn cổ vũ và tôn trọng mọi ý tưởng của con.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-ps-blue text-canvas-light flex items-center justify-center font-bold text-xl">
                  B
                </div>
                <div>
                  <h4 className="text-[16px] font-bold text-on-dark">Mẹ bé Bo</h4>
                  <p className="text-[14px] text-ps-blue">Bé 5 tuổi &middot; 2 năm đồng hành</p>
                </div>
              </div>
            </div>
            
            <div className="bg-surface-dark-card p-10 rounded-md relative">
              <span className="text-[80px] font-display text-ps-blue absolute top-4 left-6 opacity-20">"</span>
              <p className="text-[16px] text-on-dark-mute leading-relaxed mb-8 relative z-10">
                Điều tôi lo nhất khi con vào lớp 1 là con không tập trung được. Nhưng qua lộ trình "đo ni đóng giày", tôi thấy con hình thành được thói quen tự học rất tốt. Con nhận biết âm, đọc chữ cái tự nhiên và đặc biệt là cực kỳ tự tin khi bước vào môi trường mới.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-ps-blue text-canvas-light flex items-center justify-center font-bold text-xl">
                  P
                </div>
                <div>
                  <h4 className="text-[16px] font-bold text-on-dark">Chị Lan Phương</h4>
                  <p className="text-[14px] text-ps-blue">Phụ huynh học sinh &middot; 2 năm đồng hành</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
