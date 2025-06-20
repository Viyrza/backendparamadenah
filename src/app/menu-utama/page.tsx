'use client';
import { useRouter } from 'next/navigation';
// import Image from 'next/image';

// import KCipayung from '@/public/kampus_cipayung.svg';

export default function DashboardPage() {
  const router = useRouter();

  

  const menuItems = [
    { name: "Cipayung", icon: "", path: "/menu-utama/kampus-cipayung" },
    { name: "Cikarang", icon: "/kampus_cikarang.svg", path: "/menu_utama/kampus_cikarang" },
    { name: "Trinity", icon: "/kampus_trinity.svg", path: "/menu_utama/kampus_trinity" },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="pt-6 text-4xl font-bold text-blue-600">
        Selamat Datang di Dashboard Admin Paramadenah!
      </h1>
      <div className="pt-8 grid grid-cols-1 gap-6">
        {menuItems.map((campus) => (
            
          <div
            key={campus.name}
            className="rounded-xl overflow-hidden shadow-md transform hover:scale-105 transition-transform duration-300 cursor-pointer"
            onClick={() => router.push(campus.path)}
          >
            {/* <Image
              src={}
              alt={campus.name}
              width={714}
              height={192}
              className="w-full h-48 object-cover"
            /> */}
            <div className="p-4">
              <h3 className="text-xl font-semibold text-blue-600">
                {campus.name}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
