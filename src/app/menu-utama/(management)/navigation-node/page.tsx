'use client'

import { useCallback, useEffect, useState } from 'react'
import AddNavigationNodeModal from '@/components/container/modal/navigation-node/add-navigation-node'
import EditNavigationNodeModal from '@/components/container/modal/navigation-node/edit-navigation-node'
import DeleteNavigationNodeModal from '@/components/container/modal/navigation-node/delete-navigation-node'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { getNavigationNodesPaginated, getNavigationNodes } from '@/actions/admin/navigation-node'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const NODE_TYPES: { [key: string]: string } = {
    entrance: 'Entrance (Pintu Masuk)',
    parking: 'Parking (Tempat Parkir)',
    intersection: 'Intersection (Persimpangan)',
    landmark: 'Landmark (Penanda)',
    building: 'Building (Gedung)',
}

const BUILDING_TYPE_SLUGS = ['gedung_hm_jusuf_kalla', 'gedung_nurcholis_madjid']

export default function NavigationNodePage() {
    const [nodes, setNodes] = useState<any[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [pagination, setPagination] = useState<any>(null)
    const [allNodes, setAllNodes] = useState<any[]>([])

    const fetchNodes = useCallback(async () => {
        setLoading(true)
        try {
            const [data, allNodesData] = await Promise.all([
                getNavigationNodesPaginated(currentPage, 10),
                getNavigationNodes()
            ])
            setNodes(data.data || [])
            setPagination({
                total: data.total,
                totalPages: data.totalPages,
                hasNextPage: data.hasNextPage,
                hasPrevPage: data.hasPrevPage,
            })
            setAllNodes(allNodesData)
        } catch (error) {
            console.error('Error fetching navigation nodes:', error)
            setNodes([])
        } finally {
            setLoading(false)
        }
    }, [currentPage])

    useEffect(() => {
        fetchNodes()
    }, [fetchNodes])

    return (
        <div className="w-full space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Navigation Nodes</h1>
                <AddNavigationNodeModal refetch={fetchNodes} />
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
                </div>
            ) : nodes.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">Belum ada lokasi navigasi.</p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Lokasi</TableHead>
                                    <TableHead>Tipe</TableHead>
                                    <TableHead>Gedung Slug</TableHead>
                                    <TableHead>Latitude</TableHead>
                                    <TableHead>Longitude</TableHead>
                                    <TableHead>Koneksi</TableHead>
                                    <TableHead>Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {nodes.map((node) => (
                                    <TableRow key={node.id}>
                                        <TableCell className="font-medium">{node.name}</TableCell>
                                        <TableCell>{NODE_TYPES[node.type] || node.type}</TableCell>
                                        <TableCell>{node.type === 'building' ? node.gedung_slug : '-'}</TableCell>
                                        <TableCell>{node.latitude.toFixed(6)}</TableCell>
                                        <TableCell>{node.longitude.toFixed(6)}</TableCell>
                                        <TableCell>
                                            {node.connections && node.connections.length > 0
                                                ? node.connections.map((c: any) => {
                                                    const targetNode = allNodes.find(n => n.firebaseId === c.target)
                                                    const targetName = targetNode ? targetNode.name : c.target
                                                    return `${targetName} (${c.distance}m)`
                                                }).join(', ')
                                                : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <EditNavigationNodeModal
                                                    nodeId={node.firebaseId}
                                                    refetch={fetchNodes}
                                                />
                                                <DeleteNavigationNodeModal
                                                    nodeId={node.firebaseId}
                                                    nodeName={node.name}
                                                    refetch={fetchNodes}
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {pagination && (
                        <div className="flex justify-between items-center py-4">
                            <p className="text-sm text-gray-600">
                                Halaman {currentPage} dari {pagination.totalPages} (Total: {pagination.total})
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => p - 1)}
                                    disabled={!pagination.hasPrevPage}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => p + 1)}
                                    disabled={!pagination.hasNextPage}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
