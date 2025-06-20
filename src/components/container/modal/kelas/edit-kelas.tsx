'use client'

import { useActionState, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDisclosure } from '@/hooks/use-disclosure'
import { Pencil } from 'lucide-react'
import { updateKelas, getKelasById } from '@/actions/admin/kelas'
import { getKampus } from '@/actions/admin/gedung'

const initialState:
    | { success: true; id: string }
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

type EditModalKelasProps = {
    kelasId: string
    gedungId: string
    lantai: string
    refetch: (page?: number) => void
}

export default function EditModalKelas(props: EditModalKelasProps) {
    const { isOpen, setIsOpen } = useDisclosure()
    const [kelasData, setKelasData] = useState<any>(null)
    const [gedungList, setGedungList] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    const [state, formAction, isPending] = useActionState(
        (prevState: any, formData: FormData) =>
            updateKelas(
                props.kelasId,
                props.gedungId,
                props.lantai,
                prevState,
                formData
            ),
        initialState
    )

    // Fetch kelas data and gedung list when modal opens
    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                setLoading(true)
                try {
                    const [kelasResult, gedungResult] = await Promise.all([
                        getKelasById(
                            props.kelasId,
                            props.gedungId,
                            props.lantai
                        ),
                        getKampus(),
                    ])
                    setKelasData(kelasResult)
                    setGedungList(gedungResult)
                } catch (error) {
                    console.error('Error fetching data:', error)
                } finally {
                    setLoading(false)
                }
            }
            fetchData()
        }
    }, [isOpen, props.kelasId, props.lantai])

    useEffect(() => {
        if (state.success) {
            props.refetch?.()
            setIsOpen(false)
        }
    }, [state.success])

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Button
                onClick={() => setIsOpen(true)}
                className="bg-slate-800 hover:bg-slate-700"
                size="sm"
            >
                <Pencil className="h-4 w-4" />
            </Button>

            <DialogContent aria-describedby={undefined}>
                <form action={formAction} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>Edit Kelas</DialogTitle>
                    </DialogHeader>

                    {loading ? (
                        <div className="flex items-center justify-center p-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-600"></div>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto p-2">
                            <div>
                                <Label>Pilih Gedung</Label>
                                <select
                                    name="gedung_id"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                                    defaultValue={kelasData?.gedung_id || ''}
                                    required
                                >
                                    <option value="">Pilih Gedung</option>
                                    {gedungList.map((gedung) => (
                                        <option
                                            key={gedung.id}
                                            value={gedung.id}
                                        >
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
                                    defaultValue={kelasData?.code_kelas || ''}
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
                                    defaultValue={
                                        kelasData?.kapasitas_orang || ''
                                    }
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
                                    placeholder="masukan kapasitas papan tulis"
                                    defaultValue={
                                        kelasData?.total_papan_tulis || ''
                                    }
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
                                    defaultValue={
                                        kelasData?.total_televisi || ''
                                    }
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
                                <Label>Lantai</Label>
                                <select
                                    name="lantai"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                                    defaultValue={kelasData?.lantai || ''}
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
                                <Label>Image URL (Optional)</Label>
                                <Input
                                    name="image"
                                    type="url"
                                    placeholder="https://example.com/image.jpg"
                                    defaultValue={kelasData?.image || ''}
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
                    )}

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
                            disabled={isPending || loading}
                            className="bg-slate-800 hover:bg-slate-700"
                        >
                            {isPending ? 'Menyimpan...' : 'Update Kelas'}
                        </Button>
                    </DialogFooter>

                    {state.success && (
                        <p className="text-sm text-green-600">
                            Kelas berhasil diupdate!
                        </p>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    )
}
