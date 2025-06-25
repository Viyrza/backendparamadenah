"use client";
import { useEffect, useState } from "react";
import { database } from "@/lib/firebase/firebase.config";
import {
  ref,
  onValue,
  update,
  remove,
} from "firebase/database";

type User = {
  uid: string;
  name: string;
  email: string;
  [key: string]: any;
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [loading, setLoading] = useState(true);

  // Ambil data user dari Realtime Database
  useEffect(() => {
    const usersRef = ref(database, "users");
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userList = Object.entries(data).map(([uid, value]: any) => ({
          uid,
          ...value,
        }));
        setUsers(userList);
      } else {
        setUsers([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Edit user
  const handleEdit = (user: User) => {
    setEditUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
  };

  const handleSave = async () => {
    if (editUser) {
      await update(ref(database, `users/${editUser.uid}`), {
        name: editName,
        email: editEmail,
      });
      setEditUser(null);
    }
  };

  // Hapus user dari database
  const handleDelete = async (uid: string) => {
    if (confirm("Yakin ingin menghapus user ini?")) {
      await remove(ref(database, `users/${uid}`));
    }
  };

  // Ganti password: hanya bisa dilakukan via backend (Admin SDK)
  const handleChangePassword = (uid: string) => {
    alert(
      "Fitur ganti password user lain hanya bisa dilakukan oleh admin backend (server-side)."
    );
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Daftar User</h2>
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-1">Nama</th>
            <th className="border px-2 py-1">Email</th>
            <th className="border px-2 py-1">Status Verifikasi</th>
            <th className="border px-2 py-1">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) =>
            editUser && editUser.uid === user.uid ? (
              <tr key={user.uid}>
                <td className="border px-2 py-1">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="border px-1"
                  />
                </td>
                <td className="border px-2 py-1">
                  <input
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="border px-1"
                  />
                </td>
                <td className="border px-2 py-1">
                  {user.isVerified ? (
                    <span className="text-green-600 font-semibold">Terverifikasi</span>
                  ) : (
                    <span className="text-red-600 font-semibold">Belum</span>
                  )}
                </td>
                <td className="border px-2 py-1">
                  <button
                    onClick={handleSave}
                    className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                  >
                    Simpan
                  </button>
                  <button
                    onClick={() => setEditUser(null)}
                    className="bg-gray-400 text-white px-2 py-1 rounded"
                  >
                    Batal
                  </button>
                </td>
              </tr>
            ) : (
              <tr key={user.uid}>
                <td className="border px-2 py-1">{user.name}</td>
                <td className="border px-2 py-1">{user.email}</td>
                <td className="border px-2 py-1">
                  {user.isVerified ? (
                    <span className="text-green-600 font-semibold">Terverifikasi</span>
                  ) : (
                    <span className="text-red-600 font-semibold">Belum</span>
                  )}
                </td>
                <td className="border px-2 py-1">
                  <button
                    onClick={() => handleEdit(user)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleChangePassword(user.uid)}
                    className="bg-purple-500 text-white px-2 py-1 rounded mr-2"
                  >
                    Ganti Password
                  </button>
                  <button
                    onClick={() => handleDelete(user.uid)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
      <p className="text-xs mt-2 text-gray-500">
        * User yang belum verifikasi email <span className="text-red-600 font-semibold">tidak bisa masuk ke aplikasi Flutter</span>.
      </p>
      <p className="text-xs text-gray-500">
        * Status verifikasi diambil dari field <b>isVerified</b> pada database.
      </p>
    </div>
  );
}