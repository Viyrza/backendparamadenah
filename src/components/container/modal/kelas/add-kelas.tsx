'use client'
import { createKelas } from '@/actions/admin/kelas'
import { getKampus } from '@/actions/admin/gedung'
import { Button } from '@/components/ui/button'
import {
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDisclosure } from '@/hooks/use-disclosure'
import { Dialog } from '@radix-ui/react-dialog'
import { Plus } from 'lucide-react'
import { useActionState, useEffect, useState } from 'react'

type AddModalKelasProps = {
    refetch?: (page?: number) => void
    lantai: string
}

const initialState = {
    success: false,
    error: {
        fieldErrors: {
            code_kelas: [],
            kapasitas_orang: [],
            total_papan_tulis: [],
            total_televisi: [],
            lantai: [],
            gedung_id: [],
            image: [],
        },
    },
    id: null,
}
export default function AddModalKelas(props: AddModalKelasProps) {
    const { isOpen, setIsOpen } = useDisclosure()
    const { lantai, refetch } = props
    const [gedungList, setGedungList] = useState<any[]>([])

    const [state, formAction, isPending] = useActionState(
        createKelas,
        initialState
    )

    // Fetch gedung list when component mounts
    useEffect(() => {
        const fetchGedung = async () => {
            try {
                const gedungs = await getKampus()
                setGedungList(gedungs)
            } catch (error) {
                console.error('Gagal mengambil data gedung:', error)
            }
        }
        fetchGedung()
    }, [])

    // Reset form and close modal when kelas is successfully created
    useEffect(() => {
        if (state.success) {
            setIsOpen(false)
            refetch?.()
        }
    }, [state.success, setIsOpen, refetch])

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="default"
                    size="lg"
                    className="bg-slate-800 hover:bg-slate-700"
                >
                    <p className="hidden md:block">Add Kelas</p>
                    <Plus />
                </Button>
            </DialogTrigger>

            <DialogContent aria-describedby={undefined}>
                <form action={formAction} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>
                            Add New Kelas (Lantai {lantai.split('_')[1]})
                        </DialogTitle>
                    </DialogHeader>{' '}
                    <div className="space-y-3 max-h-96 overflow-y-auto p-2">
                        <input type="hidden" name="lantai" value={lantai} />
                        <div>
                            <Label>Pilih Gedung</Label>
                            <select
                                name="gedung_id"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                                required
                            >
                                <option value="">Pilih Gedung</option>
                                {gedungList.map((gedung) => (
                                    <option key={gedung.id} value={gedung.id}>
                                        {gedung.name} ({gedung.kode_gedung})
                                    </option>
                                ))}
                            </select>
                            {!state.success &&
                                state.error?.fieldErrors?.gedung_id?.map(
                                    (error, index) => (
                                        <p
                                            key={index}
                                            className="text-sm text-red-500"
                                        >
                                            {error}
                                        </p>
                                    )
                                )}
                        </div>
                        <div>
                            <Label>Code Kelas</Label>
                            <Input
                                name="code_kelas"
                                type="text"
                                placeholder="contoh A1-1"
                                required
                            />
                            {!state.success &&
                                state.error?.fieldErrors?.code_kelas?.map(
                                    (error, index) => (
                                        <p
                                            key={index}
                                            className="text-sm text-red-500"
                                        >
                                            {error}
                                        </p>
                                    )
                                )}
                        </div>
                        <div>
                            <Label>Kapasitas (orang)</Label>
                            <Input
                                name="kapasitas_orang"
                                type="number"
                                placeholder="Masukan kapasitas ruangan"
                                required
                            />
                            {!state.success &&
                                state.error?.fieldErrors?.kapasitas_orang?.map(
                                    (error, index) => (
                                        <p
                                            key={index}
                                            className="text-sm text-red-500"
                                        >
                                            {error}
                                        </p>
                                    )
                                )}
                        </div>{' '}
                        <div>
                            <Label>Jumlah Papan Tulis</Label>
                            <Input
                                name="total_papan_tulis"
                                type="number"
                                placeholder="masukan kapasitas papan tulis"
                                required
                            />
                            {!state.success &&
                                state.error?.fieldErrors?.total_papan_tulis?.map(
                                    (error, index) => (
                                        <p
                                            key={index}
                                            className="text-sm text-red-500"
                                        >
                                            {error}
                                        </p>
                                    )
                                )}
                        </div>
                        <div>
                            <Label>Jumlah Televisi</Label>
                            <Input
                                name="total_televisi"
                                type="number"
                                placeholder="masukan kapasitas televisi"
                                required
                            />
                            {!state.success &&
                                state.error?.fieldErrors?.total_televisi?.map(
                                    (error, index) => (
                                        <p
                                            key={index}
                                            className="text-sm text-red-500"
                                        >
                                            {error}
                                        </p>
                                    )
                                )}
                        </div>
                        <div>
                            <Label>Image URL (Optional)</Label>
                            <Input
                                name="image"
                                type="url"
                                placeholder="https://example.com/image.jpg"
                            />
                            {!state.success &&
                                state.error?.fieldErrors?.image?.map(
                                    (error, index) => (
                                        <p
                                            key={index}
                                            className="text-sm text-red-500"
                                        >
                                            {error}
                                        </p>
                                    )
                                )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="mt-4 bg-slate-800 hover:bg-slate-700"
                        >
                            {isPending ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </DialogFooter>
                    {state.success && (
                        <p className="text-sm text-green-600">
                            Kelas berhasil ditambahkan!
                        </p>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    )
}
