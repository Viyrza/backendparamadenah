'use client'

import { useActionState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDisclosure } from '@/hooks/use-disclosure'
import { Plus } from 'lucide-react'
import { createKelas } from '@/actions/admin/kelas'

const initialState:
    | { success: true; id: string | null }
    | {
          success: false
          error: {
              fieldErrors?: {
                  code_kelas?: string[]
                  kapasitas_orang?: string[]
                  total_papan_tulis?: string[]
                  total_televisi?: string[]
                  lantai?: string[]
                  gedung_id?: string[]
                  image?: string[]
              }
          }
      } = {
    success: false,
    error: {
        fieldErrors: {},
    },
}

type AddKelasToGedungModalProps = {
    gedungId: string
    gedungName: string
    refetch: (page?: number) => void
}

export default function AddKelasToGedungModal(
    props: AddKelasToGedungModalProps
) {
    const { isOpen, setIsOpen } = useDisclosure()

    const [state, formAction, isPending] = useActionState(
        createKelas,
        initialState
    )

    // Reset form and close modal when kelas is successfully created
    useEffect(() => {
        if (state.success) {
            setIsOpen(false)
            props.refetch?.()
        }
    }, [state.success, setIsOpen, props])

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="default"
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Kelas
                </Button>
            </DialogTrigger>

            <DialogContent aria-describedby={undefined}>
                <form action={formAction} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>
                            Tambah Kelas ke {props.gedungName}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3 max-h-96 overflow-y-auto p-2">
                        {/* Hidden input untuk gedung_id */}
                        <input
                            type="hidden"
                            name="gedung_id"
                            value={props.gedungId}
                        />

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
                            <Label>Lantai</Label>
                            <select
                                name="lantai"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Pilih Lantai</option>
                                <option value="lantai_1">Lantai 1</option>
                                <option value="lantai_2">Lantai 2</option>
                                <option value="lantai_3">Lantai 3</option>
                                <option value="lantai_4">Lantai 4</option>
                                <option value="lantai_5">Lantai 5</option>
                            </select>
                            {!state.success &&
                                state.error?.fieldErrors?.lantai?.map(
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
                                min="1"
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
                        </div>

                        <div>
                            <Label>Jumlah Papan Tulis</Label>
                            <Input
                                name="total_papan_tulis"
                                type="number"
                                placeholder="masukan jumlah papan tulis"
                                min="0"
                                defaultValue="1"
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
                                placeholder="masukan jumlah televisi"
                                min="0"
                                defaultValue="1"
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
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={isPending}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isPending ? 'Menyimpan...' : 'Tambah Kelas'}
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
