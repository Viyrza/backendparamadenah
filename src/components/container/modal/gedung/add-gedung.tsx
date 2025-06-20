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
import { createGedung } from '@/actions/admin/gedung'

const initialState:
    | { success: true; id: string | null }
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

type AddModalGedungProps = {
    refetch: () => void
}

export default function AddModalGedung(props: AddModalGedungProps) {
    const { isOpen, setIsOpen } = useDisclosure()

    const [state, formAction, isPending] = useActionState(
        createGedung,
        initialState
    )
    useEffect(() => {
        if (state.success) {
            props.refetch?.()
        }
    }, [state.success, props.refetch])

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="default"
                    size="lg"
                    className="bg-slate-800 hover:bg-slate-700"
                >
                    <p className="hidden md:block">Add Gedung</p>
                    <Plus />
                </Button>
            </DialogTrigger>

            <DialogContent aria-describedby={undefined}>
                <form action={formAction} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>Add New Gedung</DialogTitle>
                    </DialogHeader>

                    <div>
                        <Label>Name</Label>
                        <Input name="name" type="text" required />
                        {!state.success && state.error?.fieldErrors?.name && (
                            <p className="text-sm text-red-500">
                                {state.error.fieldErrors.name[0]}
                            </p>
                        )}
                    </div>
                    <div>
                        <Label>Code Gedung (Gedung A)</Label>
                        <Input name="kode_gedung" type="text" required />
                        {!state.success &&
                            state.error?.fieldErrors?.kode_gedung && (
                                <p className="text-sm text-red-500">
                                    {state.error.fieldErrors.kode_gedung[0]}
                                </p>
                            )}
                    </div>

                    <div>
                        <Label>Image URL</Label>
                        <Input name="image" type="url" />
                        {!state.success && state.error?.fieldErrors?.image && (
                            <p className="text-sm text-red-500">
                                {state.error.fieldErrors.image[0]}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="mt-4 bg-slate-800 hover:bg-slate-700"
                        >
                            {isPending ? 'Submitting...' : 'Submit'}
                        </Button>
                    </DialogFooter>

                    {state.success && (
                        <p className="text-sm text-green-600">
                            Kampus berhasil ditambahkan!
                        </p>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    )
}
