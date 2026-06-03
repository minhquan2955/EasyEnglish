import { useState } from 'react';
import { MapPin, Phone, EnvelopeSimple, CaretDown } from '@phosphor-icons/react';

const MOCK_CENTERS = [
  {
    id: 1,
    city: 'Hà Nội',
    name: 'EasyEnglish Cầu Giấy',
    address: 'Tầng 2, Tòa nhà Indochina Plaza, 241 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
    phone: '024 7300 0000',
    email: 'caugiay@easyenglish.edu.vn'
  },
  {
    id: 2,
    city: 'Hà Nội',
    name: 'EasyEnglish Đống Đa',
    address: '165 Thái Hà, Láng Hạ, Đống Đa, Hà Nội',
    phone: '024 7300 0001',
    email: 'dongda@easyenglish.edu.vn'
  },
  {
    id: 3,
    city: 'TP. Hồ Chí Minh',
    name: 'EasyEnglish Quận 1',
    address: '58 Nguyễn Đình Chiểu, Đa Kao, Quận 1, TP. Hồ Chí Minh',
    phone: '028 7300 0000',
    email: 'quan1@easyenglish.edu.vn'
  },
  {
    id: 4,
    city: 'TP. Hồ Chí Minh',
    name: 'EasyEnglish Quận 7',
    address: 'Tầng 2, Crescent Mall, 101 Tôn Dật Tiên, Tân Phú, Quận 7, TP. Hồ Chí Minh',
    phone: '028 7300 0001',
    email: 'quan7@easyenglish.edu.vn'
  },
  {
    id: 5,
    city: 'Đà Nẵng',
    name: 'EasyEnglish Hải Châu',
    address: '309 Đống Đa, Thạch Thang, Hải Châu, Đà Nẵng',
    phone: '0236 7300 0000',
    email: 'haichau@easyenglish.edu.vn'
  }
];

const CITIES = ['Tất cả', 'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng'];

export default function Centers() {
  const [selectedCity, setSelectedCity] = useState('Tất cả');

  const filteredCenters = MOCK_CENTERS.filter(
    center => selectedCity === 'Tất cả' || center.city === selectedCity
  );

  return (
    <main className="min-h-screen bg-canvas-light text-ink pt-24 pb-16">
      <div className="w-full max-w-[1280px] mx-auto px-6">
        
        {/* Header */}
        <div className="mb-12 border-b border-ash-light pb-8">
          <h1 className="display-xl uppercase mb-4">
            Hệ thống trung tâm
          </h1>
          <p className="text-[18px] text-body-light max-w-3xl">
            Với hệ thống trung tâm trải dài trên toàn quốc, EasyEnglish mang đến môi trường học tập chuẩn quốc tế, cơ sở vật chất hiện đại và tiện nghi nhất cho học viên.
          </p>
        </div>

        {/* Filter */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-4">
            {CITIES.map(city => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-6 py-3 rounded-full font-bold text-[16px] transition-colors border ${
                  selectedCity === city 
                    ? 'bg-ps-blue border-ps-blue text-canvas-light' 
                    : 'bg-transparent border-ash-light text-body-light hover:border-ps-blue hover:text-ps-blue'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Centers List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCenters.map(center => (
            <div 
              key={center.id} 
              className="bg-white p-8 rounded-md border border-ash-light hover:border-ps-blue shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col h-full"
            >
              <h3 className="text-[24px] font-display font-bold text-ink mb-6 group-hover:text-ps-blue transition-colors">
                {center.name}
              </h3>
              
              <div className="space-y-4 mb-8 flex-grow text-body-light text-[16px]">
                <div className="flex items-start gap-3">
                  <MapPin size={24} weight="light" className="text-ps-blue shrink-0 mt-0.5" />
                  <span>{center.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={24} weight="light" className="text-ps-blue shrink-0" />
                  <span>{center.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <EnvelopeSimple size={24} weight="light" className="text-ps-blue shrink-0" />
                  <span>{center.email}</span>
                </div>
              </div>
              
              <div className="pt-6 border-t border-ash-light mt-auto">
                <a 
                  href={`tel:${center.phone.replace(/\s+/g, '')}`}
                  className="text-ps-blue font-bold text-[16px] uppercase tracking-wider hover:text-ink transition-colors inline-block"
                >
                  Liên hệ ngay
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
