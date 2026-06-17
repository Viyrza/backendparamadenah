'use server'

import { z } from 'zod'
import { ref, push, get, set } from 'firebase/database'
import { database } from '@/lib/firebase/firebase.config'
import { NavigationNodeFormValidation, UpdateNavigationNodeFormValidation } from '@/lib/validation/navigation-node'

export async function createNavigationNode(
    prevState: any,
    formData: FormData
): Promise<
    | { success: true; id: string }
    | {
          success: false
          error: {
              fieldErrors?: any
              formError?: string
          }
      }
> {
    const latitude = formData.get('latitude')
    const longitude = formData.get('longitude')
    const connectionsStr = formData.get('connections') || '[]'
    const type = formData.get('type')
    const gedungSlug = formData.get('gedung_slug')
    
    console.log('[Server] FormData entries:')
    for (const [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value)
    }
    console.log('[Server] gedung_slug:', gedungSlug)
    
    const parsed = NavigationNodeFormValidation.safeParse({
        name: formData.get('name'),
        latitude: latitude ? parseFloat(latitude as string) : undefined,
        longitude: longitude ? parseFloat(longitude as string) : undefined,
        type: type as any,
        gedung_slug: formData.get('gedung_slug') || undefined,
        connections: JSON.parse(connectionsStr as string),
    })

    if (!parsed.success) {
        console.log('[Server] Validation failed:', parsed.error.flatten().fieldErrors)
        return {
            success: false,
            error: {
                fieldErrors: parsed.error.flatten().fieldErrors,
            },
        }
    }

    const data = parsed.data

    try {
        const navigationNodesRef = ref(database, 'navigation_nodes')
        const snapshot = await get(navigationNodesRef)
        const existingData = snapshot.exists() ? snapshot.val() : {}

        // Check for duplicate names
        const existingName = Object.values(existingData).find(
            (node: any) => node.name.toLowerCase() === data.name.toLowerCase()
        )

        if (existingName) {
            return {
                success: false,
                error: {
                    fieldErrors: {
                        name: ['Nama lokasi sudah digunakan'],
                    },
                },
            }
        }

        let maxId = 0
        Object.values(existingData).forEach((node: any) => {
            if (node.id && typeof node.id === 'number' && node.id > maxId) {
                maxId = node.id
            }
        })
        const newId = maxId + 1

        const newNodeData: any = {
            id: newId,
            name: data.name,
            latitude: data.latitude,
            longitude: data.longitude,
            type: data.type,
            connections: data.connections || [],
            slug: data.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '_')
                .replace(/^_|_$/g, ''),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }

        if (data.type === 'building' && data.gedung_slug) {
            const gedungRef = ref(database, `gedung/${data.gedung_slug}`)
            const gedungSnapshot = await get(gedungRef)

            if (!gedungSnapshot.exists()) {
                return {
                    success: false,
                    error: {
                        fieldErrors: {
                            gedung_slug: ['Gedung tidak ditemukan'],
                        },
                    },
                }
            }

            const gedungData = gedungSnapshot.val()
            if (
                gedungData.latitude !== data.latitude ||
                gedungData.longitude !== data.longitude
            ) {
                return {
                    success: false,
                    error: {
                        fieldErrors: {
                            latitude: ['Koordinat gedung tidak sesuai dengan data gedung'],
                            longitude: ['Koordinat gedung tidak sesuai dengan data gedung'],
                        },
                    },
                }
            }

            if (gedungData.name !== data.name) {
                return {
                    success: false,
                    error: {
                        fieldErrors: {
                            name: ['Nama tidak sesuai dengan data gedung'],
                        },
                    },
                }
            }
        }

        const newNodeRef = ref(database, `navigation_nodes/${newNodeData.slug}`)
        await set(newNodeRef, newNodeData)

        const connectionsToSync = data.connections || []
        for (const conn of connectionsToSync) {
            const targetNodeRef = ref(database, `navigation_nodes/${conn.target}`)
            const targetSnapshot = await get(targetNodeRef)
            if (targetSnapshot.exists()) {
                const targetData = targetSnapshot.val()
                const targetConnections: { target: string; distance: number }[] = targetData.connections || []
                const alreadyConnected = targetConnections.some((c: any) => c.target === newNodeData.slug)
                if (!alreadyConnected) {
                    targetConnections.push({ target: newNodeData.slug, distance: conn.distance })
                    await set(ref(database, `navigation_nodes/${conn.target}/connections`), targetConnections)
                }
            }
        }

        return {
            success: true,
            id: newNodeData.slug,
        }
    } catch (err) {
        console.error('Gagal membuat navigation node:', err)
        return {
            success: false,
            error: {
                formError: 'Terjadi kesalahan saat menyimpan data lokasi navigasi',
            },
        }
    }
}

export async function getNavigationNodes() {
    const nodesRef = ref(database, 'navigation_nodes')

    try {
        const snapshot = await get(nodesRef)
        const data = snapshot.val()

        if (!data) return []

        const nodesList = Object.entries(data).map(
            ([id, value]: [string, any]) => ({
                id,
                firebaseId: id,
                ...value,
            })
        )

        nodesList.sort(
            (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
        )

        return nodesList
    } catch (error) {
        console.error('Gagal ambil data navigation nodes:', error)
        return []
    }
}

export async function getNavigationNodesPaginated(page: number = 1, limit: number = 5) {
    const nodesRef = ref(database, 'navigation_nodes')

    try {
        const snapshot = await get(nodesRef)
        const data = snapshot.val()

        if (!data)
            return {
                data: [],
                total: 0,
                currentPage: page,
                totalPages: 0,
                hasNextPage: false,
                hasPrevPage: false,
            }

        const nodesList = Object.entries(data).map(
            ([id, value]: [string, any]) => ({
                id,
                firebaseId: id,
                ...value,
            })
        )

        nodesList.sort(
            (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
        )

        const total = nodesList.length
        const totalPages = Math.ceil(total / limit)
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        const paginatedData = nodesList.slice(startIndex, endIndex)

        return {
            data: paginatedData,
            total,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        }
    } catch (error) {
        console.error('Gagal ambil data navigation nodes paginated:', error)
        return {
            data: [],
            total: 0,
            currentPage: page,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
        }
    }
}

export async function getNavigationNodeById(nodeId: string) {
    try {
        const nodeRef = ref(database, `navigation_nodes/${nodeId}`)
        const snapshot = await get(nodeRef)

        if (!snapshot.exists()) {
            return null
        }

        return {
            id: nodeId,
            firebaseId: nodeId,
            ...snapshot.val(),
        }
    } catch (error) {
        console.error('Gagal ambil navigation node by ID:', error)
        return null
    }
}

export async function updateNavigationNode(
    nodeId: string,
    prevState: any,
    formData: FormData
): Promise<
    | { success: true; id: string }
    | {
          success: false
          error: {
              fieldErrors?: any
          }
      }
> {
    const latitude = formData.get('latitude')
    const longitude = formData.get('longitude')
    const connectionsStr = formData.get('connections') || '[]'

    const parsed = UpdateNavigationNodeFormValidation.safeParse({
        name: formData.get('name'),
        latitude: latitude ? parseFloat(latitude as string) : undefined,
        longitude: longitude ? parseFloat(longitude as string) : undefined,
        type: formData.get('type'),
        gedung_slug: formData.get('gedung_slug') || undefined,
        connections: JSON.parse(connectionsStr as string),
    })

    if (!parsed.success) {
        return {
            success: false,
            error: {
                fieldErrors: parsed.error.flatten().fieldErrors,
            },
        }
    }

    const data = parsed.data

    try {
        const nodeRef = ref(database, `navigation_nodes/${nodeId}`)
        const snapshot = await get(nodeRef)

        if (!snapshot.exists()) {
            return {
                success: false,
                error: {
                    fieldErrors: {
                        name: ['Lokasi navigasi tidak ditemukan'],
                    },
                },
            }
        }

        const existingData = snapshot.val()

        // Check for duplicate names
        const allNodesRef = ref(database, 'navigation_nodes')
        const allNodesSnapshot = await get(allNodesRef)
        const allNodesData = allNodesSnapshot.exists() ? allNodesSnapshot.val() : {}

        const duplicateName = Object.entries(allNodesData).find(
            ([id, node]: [string, any]) =>
                id !== nodeId && node.name.toLowerCase() === data.name.toLowerCase()
        )

        if (duplicateName) {
            return {
                success: false,
                error: {
                    fieldErrors: {
                        name: ['Nama lokasi sudah digunakan oleh lokasi lain'],
                    },
                },
            }
        }

        const updatedNodeData: any = {
            ...existingData,
            name: data.name,
            latitude: data.latitude,
            longitude: data.longitude,
            type: data.type,
            connections: data.connections || [],
            updated_at: new Date().toISOString(),
        }
        if (data.type === 'building' && data.gedung_slug) {
            const gedungRef = ref(database, `gedung/${data.gedung_slug}`)
            const gedungSnapshot = await get(gedungRef)

            if (!gedungSnapshot.exists()) {
                return {
                    success: false,
                    error: {
                        fieldErrors: {
                            gedung_slug: ['Gedung tidak ditemukan'],
                        },
                    },
                }
            }

            const gedungData = gedungSnapshot.val()
            if (
                gedungData.latitude !== data.latitude ||
                gedungData.longitude !== data.longitude
            ) {
                return {
                    success: false,
                    error: {
                        fieldErrors: {
                            latitude: ['Koordinat gedung tidak sesuai dengan data gedung'],
                            longitude: ['Koordinat gedung tidak sesuai dengan data gedung'],
                        },
                    },
                }
            }

            if (gedungData.name !== data.name) {
                return {
                    success: false,
                    error: {
                        fieldErrors: {
                            name: ['Nama tidak sesuai dengan data gedung'],
                        },
                    },
                }
            }

            updatedNodeData.gedung_slug = data.gedung_slug
        } else if (updatedNodeData.gedung_slug) {
            delete updatedNodeData.gedung_slug
        }

        await set(nodeRef, updatedNodeData)

        // Auto Bidirectional Sync: diff old connections vs new connections
        const oldConnections: { target: string; distance: number }[] = existingData.connections || []
        const newConnections: { target: string; distance: number }[] = data.connections || []

        // Koneksi yang dihapus: ada di old tapi tidak ada di new
        const removedConnections = oldConnections.filter(
            (old: any) => !newConnections.some((n: any) => n.target === old.target)
        )

        // Koneksi yang ditambahkan: ada di new tapi tidak ada di old
        const addedConnections = newConnections.filter(
            (n: any) => !oldConnections.some((old: any) => old.target === n.target)
        )

        // Koneksi yang distance-nya berubah
        const updatedConnections = newConnections.filter((n: any) => {
            const old = oldConnections.find((o: any) => o.target === n.target)
            return old && old.distance !== n.distance
        })

        // Hapus reverse connection dari target yang sudah tidak terhubung
        for (const removed of removedConnections) {
            const targetRef = ref(database, `navigation_nodes/${removed.target}`)
            const targetSnap = await get(targetRef)
            if (targetSnap.exists()) {
                const targetData = targetSnap.val()
                const targetConns: any[] = targetData.connections || []
                const filtered = targetConns.filter((c: any) => c.target !== nodeId)
                await set(ref(database, `navigation_nodes/${removed.target}/connections`), filtered)
            }
        }

        // Tambahkan reverse connection pada target yang baru ditambahkan
        for (const added of addedConnections) {
            const targetRef = ref(database, `navigation_nodes/${added.target}`)
            const targetSnap = await get(targetRef)
            if (targetSnap.exists()) {
                const targetData = targetSnap.val()
                const targetConns: any[] = targetData.connections || []
                const alreadyConnected = targetConns.some((c: any) => c.target === nodeId)
                if (!alreadyConnected) {
                    targetConns.push({ target: nodeId, distance: added.distance })
                    await set(ref(database, `navigation_nodes/${added.target}/connections`), targetConns)
                }
            }
        }

        // Update distance pada reverse connection yang berubah
        for (const updated of updatedConnections) {
            const targetRef = ref(database, `navigation_nodes/${updated.target}`)
            const targetSnap = await get(targetRef)
            if (targetSnap.exists()) {
                const targetData = targetSnap.val()
                const targetConns: any[] = targetData.connections || []
                const reverseConn = targetConns.find((c: any) => c.target === nodeId)
                if (reverseConn) {
                    reverseConn.distance = updated.distance
                    await set(ref(database, `navigation_nodes/${updated.target}/connections`), targetConns)
                }
            }
        }

        return {
            success: true,
            id: nodeId,
        }
    } catch (err) {
        console.error('Gagal mengupdate navigation node:', err)
        return {
            success: false,
            error: {},
        }
    }
}

export async function deleteNavigationNode(nodeId: string): Promise<{
    success: boolean
    error?: string
}> {
    try {
        const nodeRef = ref(database, `navigation_nodes/${nodeId}`)
        const snapshot = await get(nodeRef)

        if (!snapshot.exists()) {
            return {
                success: false,
                error: 'Lokasi navigasi tidak ditemukan',
            }
        }

        // Bersihkan reverse connections: hapus referensi ke node ini dari semua node lain
        const nodeData = snapshot.val()
        const nodeConnections: { target: string; distance: number }[] = nodeData.connections || []
        for (const conn of nodeConnections) {
            const targetRef = ref(database, `navigation_nodes/${conn.target}`)
            const targetSnap = await get(targetRef)
            if (targetSnap.exists()) {
                const targetData = targetSnap.val()
                const targetConns: any[] = targetData.connections || []
                const filtered = targetConns.filter((c: any) => c.target !== nodeId)
                await set(ref(database, `navigation_nodes/${conn.target}/connections`), filtered)
            }
        }

        await set(nodeRef, null)

        return {
            success: true,
        }
    } catch (error) {
        console.error('Gagal menghapus navigation node:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}
