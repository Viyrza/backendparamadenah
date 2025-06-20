// app/menu_utama/Sidebar.js
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';


type MenuItems = {
    name: string;
    href: string;
    icon: string;
}

const menuItems: MenuItems [] = [
  { name: "Dashboard", href: "/menu_utama", icon: "/Home.svg" },
  { name: "Cipayung", href: "/menu_utama/kampus_cipayung", icon: "/kampus_cipayung.svg" },
  { name: "Cikarang", href: "/menu_utama/kampus_cikarang", icon: "/kampus_cikarang.svg" },
  { name: "Trinity", href: "/menu_utama/kampus_trinity", icon: "/kampus_trinity.svg" },
  { name: "Notification", href: "/menu_utama/notification", icon: "/Notification.svg" },
  { name: "Log Out", href: "/menu_utama/logout", icon: "/logoutlogo.svg" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-1/5 h-full bg-background_primary text-white p-4 flex flex-col justify-between">
      <div>
        <div className="mb-8">
          <Image
            src="/paramadenahlogo.svg"
            alt="Logo Paramadenah"
            width={500}
            height={250}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">MAIN MENU</h2>
          {menuItems.map((item) => (
            <Link key={item.name} href={item.href}>
              <div
                className={`flex items-center gap-2 p-2 rounded cursor-pointer transition ${
                  pathname === item.href ? "bg-gray-400" : "hover:bg-blue-700"
                }`}
              >
                <Image
                  src={item.icon}
                  alt={item.name + " icon"}
                  width={24}
                  height={24}
                />
                <span>{item.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-auto text-center">
        <span className="text-xs">© 2025 Paramadenah</span>
      </div>
    </div>
  );
}
