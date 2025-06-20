"use client";

import DataTable from "@/components/container/sadchn-table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getKampus } from "@/actions/admin/gedung";
import AddModalGedung from "@/components/container/modal/gedung/add-gedung";
import { useFetchData } from "@/hooks/use-fetch";

type Gedung = {
  id: string;
  name: string;
  image?: string;
  slug: string;
};

export default function Page() {
  const router = useRouter();
  const { dataList: gedungList, loading, error, refetch } = useFetchData<Gedung>("/gedung");





  return (
    <div className="space-y-6 mx-auto pt-8">
      <div className="grid grid-cols-1 gap-6">
        <div className="flex justify-end">
          <AddModalGedung refetch={refetch}/>
        </div>

        <DataTable
          className="px-5"
          columns={[
            {key: "id", title:"ID"},
            { key: "name", title: "Name" },
            { key: "image", title: "Image" },
            { key: "action", title: "Action" },
          ]}
          rows={gedungList.map((item, index) => ({
            id: Number(item.id),
            name: item.name,
            image: (
              <img
                src={item.image || "https://via.placeholder.com/80x40"}
                alt={item.name}
                className="w-20 h-12 object-cover rounded-md"
              />
            ),
            action: (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    router.push(`/menu-utama/kampus-cipayung/${item.slug}`)
                  }}
                  className="bg-slate-800 hover:bg-slate-700"
                  size="sm"
                >
                  <Eye />
                </Button>
                <Button
                  onClick={() => {
                    console.log("Edit kampus:", item.id);
                  }}
                  className="bg-slate-800 hover:bg-slate-700"
                  size="sm"
                >
                  <Pencil />
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-500"
                  size="sm"
                  onClick={() => {
                    console.log("Hapus kampus:", item.id);
                  }}
                >
                  <Trash />
                </Button>
              </div>
            ),
          }))}
          isLoading={loading}
          refreshCb={refetch}
        />
      </div>
    </div>
  );
}
