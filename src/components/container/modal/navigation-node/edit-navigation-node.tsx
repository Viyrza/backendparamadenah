'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
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
import {
    Select,
} from '@/components/ui/select'
import { Pencil } from 'lucide-react'
import { useDisclosure } from '@/hooks/use-disclosure'
import { updateNavigationNode, getNavigationNodeById, getNavigationNodes } from '@/actions/admin/navigation-node'
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
          }
      } = {
    success: false,
    error: {
        fieldErrors: {},
    },
}

type EditNavigationNodeModalProps = {
    nodeId: string
    refetch: () => void
}

export default function EditNavigationNodeModal(props: EditNavigationNodeModalProps) {
    const { isOpen, setIsOpen } = useDisclosure()
    const [nodeData, setNodeData] = useState<any>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [selectedType, setSelectedType] = useState<string>('')
    const [connections, setConnections] = useState<Connection[]>([])
    const [connectionInput, setConnectionInput] = useState<string>('')
    const [connectionDistance, setConnectionDistance] = useState<string>('')
    const [availableNodes, setAvailableNodes] = useState<any[]>([])
    const [availableGedung, setAvailableGedung] = useState<any[]>([])
    const [selectedGedungSlug, setSelectedGedungSlug] = useState<string>('')
    const [nameValue, setNameValue] = useState<string>('')
    const [latitudeValue, setLatitudeValue] = useState<string>('')
    const [longitudeValue, setLongitudeValue] = useState<string>('')
    const formRef = useRef<HTMLFormElement>(null)

    const [state, formAction, isPending] = useActionState(
        (prevState: any, formData: FormData) =>
            updateNavigationNode(props.nodeId, prevState, formData),
        initialState
    )

    useEffect(() => {
        if (isOpen && props.nodeId) {
            const fetchNodeData = async () => {
                setLoading(true)
                try {
                    const [data, allNodes, allGedung] = await Promise.all([
                        getNavigationNodeById(props.nodeId),
                        getNavigationNodes(),
                        getKampus()
                    ])
                    setNodeData(data)
                    setSelectedType(data?.type || '')
                    setConnections(data?.connections || [])
                    setAvailableNodes(allNodes)
                    setAvailableGedung(allGedung)
                    if (data?.type === 'building' && data?.gedung_slug) {
                        setSelectedGedungSlug(data.gedung_slug)
                        setNameValue(data.name || '')
                        setLatitudeValue(data.latitude ? String(data.latitude) : '')
                        setLongitudeValue(data.longitude ? String(data.longitude) : '')
                    } else {
                        setSelectedGedungSlug('')
                        setNameValue(data?.name || '')
                        setLatitudeValue(data?.latitude ? String(data.latitude) : '')
                        setLongitudeValue(data?.longitude ? String(data.longitude) : '')
                    }
                } catch (error) {
                    console.error('Error fetching navigation node data:', error)
                } finally {
                    setLoading(false)
                }
            }
            fetchNodeData()
        }
    }, [isOpen, props.nodeId])

    useEffect(() => {
        if (state.success) {
            props.refetch?.()
            setIsOpen(false)
        }
    }, [state.success])

    const handleGedungChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const slug = e.target.value
        setSelectedGedungSlug(slug)
        const gedung = availableGedung.find(g => g.id === slug)
        if (gedung) {
            setNameValue(gedung.name || '')
            setLatitudeValue(gedung.latitude ? String(gedung.latitude) : '')
            setLongitudeValue(gedung.longitude ? String(gedung.longitude) : '')
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

    const handleRemoveConnection = (index: number) => {
        setConnections(connections.filter((_, i) => i !== index))
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Button
                onClick={() => setIsOpen(true)}
                className="bg-background_primary hover:bg-slate-700"
                size="sm"
            >
                <Pencil className="h-4 w-4" />
            </Button>

            <DialogContent aria-describedby={undefined} className="max-h-96 overflow-y-auto">
                <form action={formAction} ref={formRef} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>Edit Lokasi Navigasi</DialogTitle>
                    </DialogHeader>

                    {loading ? (
                        <div className="flex items-center justify-center p-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-600"></div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <input type="hidden" name="type" value={selectedType} />
                            {selectedType === 'building' && (
                                <input type="hidden" name="gedung_slug" value={selectedGedungSlug} />
                            )}
                            <input type="hidden" name="connections" value={JSON.stringify(connections)} />
                            <input type="hidden" name="name" value={nameValue} />
                            <input type="hidden" name="latitude" value={latitudeValue} />
                            <input type="hidden" name="longitude" value={longitudeValue} />

                            {selectedType === 'building' && (
                                <div>
                                    <Label htmlFor="gedung_select">Pilih Gedung</Label>
                                    <Select
                                        id="gedung_select"
                                        value={selectedGedungSlug}
                                        onChange={handleGedungChange}
                                        required
                                    >
                                        <option value="">Pilih Gedung...</option>
                                        {availableGedung.map(g => (
                                            <option key={g.id} value={g.id}>
                                                {g.name}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                            )}

                            <div>
                                <Label>Nama Lokasi</Label>
                                <Input
                                    id="edit-name"
                                    name="name"
                                    type="text"
                                    placeholder="Contoh: Gerbang Utama"
                                    defaultValue={nodeData?.name || ''}
                                    required
                                />
                                {!state.success &&
                                    state.error?.fieldErrors?.name?.map(
                                        (error: string, index: number) => (
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
                                <Label>Latitude</Label>
                                <Input
                                    id="edit-latitude"
                                    name="latitude"
                                    type="number"
                                    step="any"
                                    placeholder="Contoh: -6.348201"
                                    defaultValue={nodeData?.latitude || ''}
                                    required
                                />
                                {!state.success &&
                                    state.error?.fieldErrors?.latitude?.map(
                                        (error: string, index: number) => (
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
                                <Label>Longitude</Label>
                                <Input
                                    id="edit-longitude"
                                    name="longitude"
                                    type="number"
                                    step="any"
                                    placeholder="Contoh: 106.841912"
                                    defaultValue={nodeData?.longitude || ''}
                                    required
                                />
                                {!state.success &&
                                    state.error?.fieldErrors?.longitude?.map(
                                        (error: string, index: number) => (
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
                                <Label>Tipe Lokasi</Label>
                                <Select
                                    value={selectedType}
                                    onChange={(e) => {
                                        setSelectedType(e.target.value)
                                        if (e.target.value !== 'building') {
                                            setSelectedGedungSlug('')
                                            setNameValue('')
                                            setLatitudeValue('')
                                            setLongitudeValue('')
                                        } else {
                                            setSelectedGedungSlug('')
                                            setNameValue('')
                                            setLatitudeValue('')
                                            setLongitudeValue('')
                                        }
                                    }}
                                    placeholder="Pilih tipe lokasi"
                                >
                                    <option value="">Pilih tipe lokasi</option>
                                    <option value="entrance">Entrance (Pintu Masuk)</option>
                                    <option value="parking">Parking (Tempat Parkir)</option>
                                    <option value="intersection">Intersection (Persimpangan)</option>
                                    <option value="landmark">Landmark (Penanda)</option>
                                    <option value="building">Building (Gedung)</option>
                                </Select>
                                {!state.success &&
                                    state.error?.fieldErrors?.type?.map(
                                        (error: string, index: number) => (
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
                                <Label>Koneksi ke Lokasi Lain (Opsional)</Label>
                                <div className="flex gap-2 mb-2">
                                    <Select
                                        value={connectionInput}
                                        onChange={(e) => setConnectionInput(e.target.value)}
                                    >
                                        <option value="">Pilih Target Lokasi</option>
                                        {availableNodes
                                            .filter(node => node.firebaseId !== props.nodeId)
                                            .map(node => (
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
                                                    
                                                    </button>
                                                </div>
                                            )
                                        })}
                                    </div>
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
                            className="bg-background_primary hover:bg-slate-700"
                        >
                            {isPending ? 'Menyimpan...' : 'Update Lokasi'}
                        </Button>
                    </DialogFooter>

                    {state.success && (
                        <p className="text-sm text-green-600">
                            Lokasi navigasi berhasil diupdate!
                        </p>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    )
}
