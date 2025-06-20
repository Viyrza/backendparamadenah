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
import { updateGedung, getGedungById } from '@/actions/admin/gedung'

const initialState:
    | { success: true; id: string }
    | {
          success: false
          error: {
              fieldErrors?: {
                  name?: string[]
                  image?: string[]
                  kode_gedung?: string[]
              }
          }
      } = {
    success: false,
    error: {
        fieldErrors: {},
    },
}

type EditModalGedungProps = {
    gedungId: string
    refetch: () => void
}

export default function EditModalGedung(props: EditModalGedungProps) {
    const { isOpen, setIsOpen } = useDisclosure()
    const [gedungData, setGedungData] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const [state, formAction, isPending] = useActionState(
        (prevState: any, formData: FormData) =>
            updateGedung(props.gedungId, prevState, formData),
        initialState
    )

    // Fetch gedung data when modal opens
    useEffect(() => {
        if (isOpen && props.gedungId) {
            const fetchGedungData = async () => {
                setLoading(true)
                try {
                    const data = await getGedungById(props.gedungId)
                    setGedungData(data)
                } catch (error) {
                    console.error('Error fetching gedung data:', error)
                } finally {
                    setLoading(false)
                }
            }
            fetchGedungData()
        }
    }, [isOpen, props.gedungId])

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
                        <DialogTitle>Edit Gedung</DialogTitle>
                    </DialogHeader>

                    {loading ? (
                        <div className="flex items-center justify-center p-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-600"></div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div>
                                <Label>Nama Gedung</Label>
                                <Input
                                    name="name"
                                    type="text"
                                    placeholder="Masukan nama gedung"
                                    defaultValue={gedungData?.name || ''}
                                    required
                                />
                                {!state.success &&
                                    state.error?.fieldErrors?.name?.map(
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
                                <Label>Kode Gedung</Label>
                                <Input
                                    name="kode_gedung"
                                    type="text"
                                    placeholder="Contoh: NC, JK, TPR"
                                    defaultValue={gedungData?.kode_gedung || ''}
                                    required
                                />
                                {!state.success &&
                                    state.error?.fieldErrors?.kode_gedung?.map(
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
                                    defaultValue={gedungData?.image || ''}
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
                            {isPending ? 'Menyimpan...' : 'Update Gedung'}
                        </Button>
                    </DialogFooter>

                    {state.success && (
                        <p className="text-sm text-green-600">
                            Gedung berhasil diupdate!
                        </p>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    )
}
