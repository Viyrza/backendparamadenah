"use client";
import { useEffect, useRef, useState } from "react";
import { database } from "@/lib/firebase/firebase.config";
import { ref, onValue, push, remove } from "firebase/database";
import { PlusCircle, Trash2 } from "lucide-react";
import BankImageSelector from "@/components/container/bank-image-selector";

type Notification = {
  id: string;
  name: string;
  message: string;
};

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch notifications from Firebase
  useEffect(() => {
    const notifRef = ref(database, "notifications");
    const unsubscribe = onValue(notifRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const notifList = Object.entries(data).map(([id, value]: any) => ({
          id,
          ...value,
        }));
        setNotifications(notifList);
      } else {
        setNotifications([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Add notification
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message || !iconUrl) return;
    await push(ref(database, "notifications"), { name, message, iconUrl });
    setName("");
    setMessage("");
    setShowAdd(false);
  };

  // Delete notification
  const handleDelete = async (id: string) => {
    if (confirm("Yakin ingin menghapus notifikasi ini?")) {
      await remove(ref(database, `notifications/${id}`));
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center py-10">
      <div className="w-full max-w-xl">
        <h1 className="text-2xl font-bold text-blue-700 mb-1">NOTIFIKASI</h1>
        <p className="text-lg font-medium mb-6">
          Halaman informasi seputar kampus
        </p>

        <div className="flex flex-col gap-3 mb-6">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="flex items-center border border-red-600 rounded-md bg-white px-4 py-3 shadow-sm"
            >
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{notif.name}</div>
                <div className="text-gray-800 text-sm">{notif.message}</div>
              </div>
              <button
                onClick={() => handleDelete(notif.id)}
                className="ml-3 text-red-600 hover:bg-red-100 rounded-full p-1"
                title="Delete notification"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        {/* Modal Add Notification */}
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl border-4 border-blue-400 p-8 w-full max-w-lg shadow-xl flex flex-col gap-6">
              <form onSubmit={handleAdd} className="flex flex-col gap-6">
                <div>
                  <input
                    className="w-full border-2 border-red-600 rounded-lg px-4 py-3 mb-4 outline-none"
                    placeholder="Nama notifikasi ruangan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <textarea
                    className="w-full border-2 border-red-600 rounded-lg px-4 py-3 mb-4 outline-none"
                    placeholder="Isi notifikasi"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={3}
                  />


                  {/* Atau pilih dari bank image */}
                  <BankImageSelector
                    onImageSelect={(url) => setIconUrl(url)}
                    selectedImageUrl={iconUrl}
                    triggerButton={
                      <button
                        type="button"
                        className="w-full mt-2 border-2 border-blue-400 rounded-lg px-4 py-3 bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition"
                      >
                        Pilih dari Bank Image
                      </button>
                    }
                  />

                  {iconUrl && (
                    <div className="mt-2 flex items-center gap-2">
                      <img
                        src={iconUrl}
                        alt="preview"
                        className="w-10 h-10 object-contain border rounded"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                      <span className="text-xs text-gray-500">Preview Icon</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between gap-4 mt-6">
                  <button
                    type="button"
                    className="flex-1 bg-[#F5F5F5] text-black py-3 rounded-lg shadow border border-gray-200 text-lg font-semibold"
                    onClick={() => {
                      setShowAdd(false);
                      setName("");
                      setMessage("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#005B8F] text-white py-3 rounded-lg shadow text-lg font-semibold"
                    disabled={!name || !message || !iconUrl}
                  >
                    Done
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tombol Add */}
        <div className="flex gap-4">
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-4 py-2 shadow hover:bg-gray-100"
          >
            <PlusCircle className="text-gray-700" /> Add new notification
          </button>
        </div>
      </div>
    </div>
  );
}