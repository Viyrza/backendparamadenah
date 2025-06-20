// app/menu_utama/layout.js
import Sidebar from './sidebar';

export const metadata = {
  title: 'Paramadenah Admin',
  description: 'Halaman dashboard admin untuk aplikasi Paramadenah',
};

export default function MenuUtamaLayout({ children }: {children: React.ReactNode}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className=" w-full overflow-y-auto px-20">
        {children}
      </main>
    </div>
  );
}
