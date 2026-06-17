'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
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
import { Select } from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { useDisclosure } from '@/hooks/use-disclosure'
import { createNavigationNode, getNavigationNodes } from '@/actions/admin/navigation-node'
import { getKampus } from '@/actions/admin/gedung'

type Connection = {
    target: string
    distance: number
}

const initialState:
    | { success: true; id: string }
    | {
        success: false
        error: {
            fieldErrors?: {
                name?: string[]
                latitude?: string[]
                longitude?: string[]
                type?: string[]
            }
            formError?: string
        }
    } = {
    success: false,
    error: { fieldErrors: {} },
}

type AddNavigationNodeModalProps = {
    refetch?: () => void
}

export default function AddNavigationNodeModal({ refetch }: AddNavigationNodeModalProps) {
    const { isOpen, setIsOpen } = useDisclosure()
    const [state, formAction, isPending] = useActionState(
        async (prevState: any, formData: FormData) => {
            const connectionsToSave = JSON.stringify(connections)
            formData.set('connections', connectionsToSave)
            return createNavigationNode(prevState, formData)
        },
        initialState
    )

    const formRef = useRef<HTMLFormElement>(null)
    const hasRefetched = useRef<boolean>(false)
    const [selectedType, setSelectedType] = useState<string>('')
    const [connections, setConnections] = useState<Connection[]>([])
    const [connectionInput, setConnectionInput] = useState<string>('')
    const [connectionDistance, setConnectionDistance] = useState<string>('')
    const [availableNodes, setAvailableNodes] = useState<any[]>([])
    const [availableGedung, setAvailableGedung] = useState<any[]>([])
    const [selectedGedungSlug, setSelectedGedungSlug] = useState<string>('')

    // Controlled state untuk field yang auto-fill saat tipe building
    const [nameValue, setNameValue] = useState<string>('')
    const [latitudeValue, setLatitudeValue] = useState<string>('')
    const [longitudeValue, setLongitudeValue] = useState<string>('')

    useEffect(() => {
        if (isOpen) {
            getNavigationNodes().then(data => setAvailableNodes(data))
            getKampus().then(data => setAvailableGedung(data))
        }
    }, [isOpen])

    useEffect(() => {
        if (formRef.current) {
            const connectionsInput = formRef.current.querySelector('[name="connections"]')
            if (connectionsInput && connectionsInput instanceof HTMLInputElement) {
                connectionsInput.value = JSON.stringify(connections)
            }
        }
    }, [connections])

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (!open) {
            if (formRef.current) formRef.current.reset()
            setSelectedType('')
            setConnections([])
            setConnectionInput('')
            setConnectionDistance('')
            setSelectedGedungSlug('')
            setNameValue('')
            setLatitudeValue('')
            setLongitudeValue('')
            hasRefetched.current = false
        }
    }

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value
        setSelectedType(newType)
        if (newType !== 'building') {
            setNameValue('')
            setLatitudeValue('')
            setLongitudeValue('')
            setSelectedGedungSlug('')
        } else {
            setLatitudeValue('')
            setLongitudeValue('')
            setSelectedGedungSlug('')
        }
    }

    const handleGedungChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const slug = e.target.value
        setSelectedGedungSlug(slug)
        const gedung = availableGedung.find(g => g.id === slug)
        if (gedung) {
            setNameValue(gedung.name || '')
            setLatitudeValue(gedung.latitude ? String(gedung.latitude) : '')
            setLongitudeValue(gedung.longitude ? String(gedung.longitude) : '')
        } else {
            setNameValue('')
            setLatitudeValue('')
            setLongitudeValue('')
        }
    }

    const handleAddConnection = () => {
        const distance = parseInt(connectionDistance)
        if (connectionInput && distance >= 1 && !connections.some(c => c.target === connectionInput)) {
            setConnections([...connections, { target: connectionInput, distance }])
            setConnectionInput('')
            setConnectionDistance('')
        }
    }

    useEffect(() => {
        if (formRef.current) {
            const connectionsInput = formRef.current.querySelector('[name="connections"]')
            if (connectionsInput && connectionsInput instanceof HTMLInputElement) {
                connectionsInput.value = JSON.stringify(connections)
            }
        }
    }, [connections])

    const handleRemoveConnection = (index: number) => {
        setConnections(connections.filter((_, i) => i !== index))
    }

    const isBuilding = selectedType === 'building'

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    variant="default"
                    size="lg"
                    className="bg-background_primary hover:bg-slate-700"
                >
                    <Plus className="w-4 h-4 mr-2" /> Tambah Lokasi Navigasi
                </Button>
            </DialogTrigger>

            <DialogContent aria-describedby={undefined} className="max-h-96 overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add Navigation Node</DialogTitle>
                </DialogHeader>
                <form 
                    id="add-navigation-node-form" 
                    action={formAction} 
                    ref={formRef}
                >
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <Label htmlFor="type">Tipe Lokasi</Label>
                            <Select
                                id="type"
                                name="type"
                                value={selectedType}
                                onChange={handleTypeChange}
                                required
                            >
                                <option value="">Pilih Tipe</option>
                                <option value="entrance">Entrance</option>
                                <option value="parking">Parkiran</option>
                                <option value="intersection">Persimpangan</option>
                                <option value="landmark">Landmark</option>
                                <option value="building">Gedung</option>
                            </Select>
                            {!state.success &&
                                state.error?.fieldErrors?.type?.map((error: string, idx: number) => (
                                    <p key={idx} className="text-sm text-red-500">{error}</p>
                                ))}
                        </div>
                    </div>

                    {isBuilding && (
                        <div>
                            <Label htmlFor="gedung">Pilih Gedung</Label>
                            <Select
                                id="gedung"
                                name="gedung_slug"
                                value={selectedGedungSlug}
                                onChange={handleGedungChange}
                                required={isBuilding}
                            >
                                <option value="">Pilih Gedung</option>
                                {availableGedung.map(g => (
                                    <option key={g.id} value={g.slug}>{g.name}</option>
                                ))}
                            </Select>
                        </div>
                    )}

                    <div>
                        <Label htmlFor="name">Nama Lokasi</Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Contoh: Gedung HM Jusuf Kalla"
                            required
                            value={nameValue}
                            onChange={(e) => setNameValue(e.target.value)}
                        />
                        {!state.success &&
                            state.error?.fieldErrors?.name?.map((error: string, idx: number) => (
                                <p key={idx} className="text-sm text-red-500">{error}</p>
                            ))}
                    </div>

                    <div>
                        <Label htmlFor="latitude">Latitude</Label>
                        <Input
                            id="latitude"
                            name="latitude"
                            type="number"
                            step="any"
                            placeholder="Contoh: -6.315900"
                            required
                            value={latitudeValue}
                            onChange={(e) => setLatitudeValue(e.target.value)}
                        />
                        {!state.success &&
                            state.error?.fieldErrors?.latitude?.map((error: string, idx: number) => (
                                <p key={idx} className="text-sm text-red-500">{error}</p>
                            ))}
                    </div>

                    <div>
                        <Label htmlFor="longitude">Longitude</Label>
                        <Input
                            id="longitude"
                            name="longitude"
                            type="number"
                            step="any"
                            placeholder="Contoh: 106.841912"
                            required
                            value={longitudeValue}
                            onChange={(e) => setLongitudeValue(e.target.value)}
                        />
                        {!state.success &&
                            state.error?.fieldErrors?.longitude?.map((error: string, idx: number) => (
                                <p key={idx} className="text-sm text-red-500">{error}</p>
                            ))}
                    </div>

                    {isBuilding && (
                        <input
                            type="hidden"
                            name="gedung_slug"
                            value={selectedGedungSlug || ''}
                        />
                    )}

                    <input
                        type="hidden"
                        name="latitude"
                        value={latitudeValue}
                    />
                    <input
                        type="hidden"
                        name="longitude"
                        value={longitudeValue}
                    />
                    <input
                        type="hidden"
                        name="connections"
                        value={JSON.stringify(connections)}
                    />

                    <div>
                        <Label>Koneksi ke Lokasi Lain (Opsional)</Label>
                        <div className="flex gap-2 mb-2">
                            <Select
                                value={connectionInput}
                                onChange={(e) => setConnectionInput(e.target.value)}
                            >
                                <option value="">Pilih Target Lokasi</option>
                                {availableNodes.map(node => (
                                    <option key={node.firebaseId} value={node.firebaseId}>
                                        {node.name}
                                    </option>
                                ))}
                            </Select>
                            <Input
                                type="number"
                                placeholder="Jarak (m)"
                                min="1"
                                value={connectionDistance}
                                onChange={(e) => setConnectionDistance(e.target.value)}
                                className="w-32"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddConnection}
                            >
                                Tambah
                            </Button>
                        </div>
                        {connections.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {connections.map((conn, idx) => {
                                    const targetNode = availableNodes.find(n => n.firebaseId === conn.target)
                                    const targetName = targetNode ? targetNode.name : conn.target
                                    return (
                                        <div
                                            key={idx}
                                            className="bg-slate-200 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                        >
                                            {targetName} ({conn.distance}m)
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveConnection(idx)}
                                                className="font-bold hover:text-red-600"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
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
                            form="add-navigation-node-form"
                            type="submit"
                            disabled={isPending}
                            className="bg-background_primary hover:bg-slate-700"
                        >
                            {isPending ? 'Mengirim...' : 'Tambah Lokasi'}
                        </Button>
                    </DialogFooter>

                    {state.success && (
                        <p className="text-sm text-green-600">
                            Lokasi navigasi berhasil ditambahkan!
                        </p>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    )
}