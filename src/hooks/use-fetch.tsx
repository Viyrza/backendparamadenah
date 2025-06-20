import { useEffect, useState, useCallback } from "react";
import { ref, get } from "firebase/database";
import { database } from "@/lib/firebase/firebase.config";

export function useFetchData<T>(path: string) {
  const [dataList, setDataList] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const dataRef = ref(database, path);
      const snapshot = await get(dataRef);
      const data = snapshot.val();

      if (!data) {
        setDataList([]);
      } else {
        const parsedList = Object.entries(data).map(([id, value]: [string, any]) => ({
          id,
          ...value,
        }));
        setDataList(parsedList);
      }

      setError(null);
    } catch (err: any) {
      console.error(`Gagal fetch data dari ${path}:`, err);
      setError("Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { dataList, loading, error, refetch: fetchData };
}
