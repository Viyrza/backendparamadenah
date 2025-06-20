import { database } from '@/lib/firebase/firebase.config'
import { ref, get, set } from 'firebase/database'

// Demo data untuk testing relasi
export const demoData = {
    gedung: [
        {
            name: 'Gedung Nurcholis',
            kode_gedung: 'NC',
            image: '/gedungnurcholis.svg',
        },
        {
            name: 'Gedung Jusuf Kalla',
            kode_gedung: 'JK',
            image: '/gedungjusufkala.svg',
        },
        {
            name: 'Gedung TPR Rachmat',
            kode_gedung: 'TPR',
            image: '/gedungtprachmat.svg',
        },
    ],
    kelas: [
        // Gedung Nurcholis (NC)
        {
            code_kelas: 'A1-1',
            kapasitas_orang: 40,
            total_papan_tulis: 1,
            total_televisi: 1,
            lantai: 'lantai_1',
            gedung_kode: 'NC',
        },
        {
            code_kelas: 'A1-2',
            kapasitas_orang: 45,
            total_papan_tulis: 1,
            total_televisi: 1,
            lantai: 'lantai_1',
            gedung_kode: 'NC',
        },
        {
            code_kelas: 'A2-1',
            kapasitas_orang: 35,
            total_papan_tulis: 1,
            total_televisi: 1,
            lantai: 'lantai_2',
            gedung_kode: 'NC',
        },
        // Gedung Jusuf Kalla (JK)
        {
            code_kelas: 'B1-1',
            kapasitas_orang: 50,
            total_papan_tulis: 2,
            total_televisi: 1,
            lantai: 'lantai_1',
            gedung_kode: 'JK',
        },
        {
            code_kelas: 'B1-2',
            kapasitas_orang: 48,
            total_papan_tulis: 1,
            total_televisi: 2,
            lantai: 'lantai_1',
            gedung_kode: 'JK',
        },
        // Gedung TPR (TPR)
        {
            code_kelas: 'C1-1',
            kapasitas_orang: 60,
            total_papan_tulis: 2,
            total_televisi: 2,
            lantai: 'lantai_1',
            gedung_kode: 'TPR',
        },
    ],
}

// Function untuk setup demo data dengan relasi
export async function setupDemoData() {
    try {
        console.log('🚀 Starting demo data setup...')

        // Map untuk menyimpan ID gedung berdasarkan kode
        const gedungIdMap: Record<string, string> = {}

        // 1. Buat gedung terlebih dahulu
        console.log('📋 Creating gedung...')
        for (const gedungData of demoData.gedung) {
            const gedungRef = ref(database, 'gedung')
            const snapshot = await get(gedungRef)
            const existingData = snapshot.exists() ? snapshot.val() : {}
            const newId = Object.keys(existingData).length + 1

            const newGedungRef = ref(database, `gedung/gedung_${newId}`)
            const gedungPayload = {
                id: newId,
                name: gedungData.name,
                kode_gedung: gedungData.kode_gedung,
                image: gedungData.image,
                slug: gedungData.name.toLowerCase().replace(/\s+/g, '-'),
                kelas: {},
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }

            await set(newGedungRef, gedungPayload)
            gedungIdMap[gedungData.kode_gedung] = `gedung_${newId}`

            console.log(
                `✅ Created gedung: ${gedungData.name} (ID: gedung_${newId})`
            )
        }

        // 2. Buat kelas dengan relasi ke gedung
        console.log('🏫 Creating kelas with relations...')
        for (const kelasData of demoData.kelas) {
            const gedungId = gedungIdMap[kelasData.gedung_kode]

            if (!gedungId) {
                console.error(
                    `❌ Gedung with code ${kelasData.gedung_kode} not found!`
                )
                continue
            }

            // Buat kelas di koleksi kelas
            const kelasRef = ref(database, `kelas/${kelasData.lantai}`)
            const kelasSnapshot = await get(kelasRef)
            const existingKelas = kelasSnapshot.exists()
                ? kelasSnapshot.val()
                : {}
            const kelasCount = Object.keys(existingKelas).length

            const kelasId = `${kelasData.lantai}_${kelasCount + 1}`
            const newKelasRef = ref(
                database,
                `kelas/${kelasData.lantai}/${kelasId}`
            )

            const kelasPayload = {
                id: `${kelasData.lantai}-${kelasCount + 1}`,
                code_kelas: kelasData.code_kelas,
                kapasitas_orang: kelasData.kapasitas_orang,
                total_papan_tulis: kelasData.total_papan_tulis,
                total_televisi: kelasData.total_televisi,
                lantai: kelasData.lantai,
                gedung_id: gedungId,
                slug: kelasData.code_kelas.toLowerCase().replace(/[-]/g, ''),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }

            await set(newKelasRef, kelasPayload)

            // Tambahkan referensi kelas ke gedung
            const gedungKelasRef = ref(
                database,
                `gedung/${gedungId}/kelas/${kelasId}`
            )
            const kelasReference = {
                id: kelasId,
                code_kelas: kelasData.code_kelas,
                lantai: kelasData.lantai,
                slug: kelasPayload.slug,
            }

            await set(gedungKelasRef, kelasReference)

            console.log(
                `✅ Created kelas: ${kelasData.code_kelas} in ${gedungId}`
            )
        }

        console.log('🎉 Demo data setup completed successfully!')

        // Print summary
        console.log('\n📊 Summary:')
        console.log(`- Created ${demoData.gedung.length} gedung`)
        console.log(`- Created ${demoData.kelas.length} kelas`)
        console.log('- All relations established successfully')

        return {
            success: true,
            message: 'Demo data created successfully',
            gedungCreated: demoData.gedung.length,
            kelasCreated: demoData.kelas.length,
        }
    } catch (error) {
        console.error('❌ Error setting up demo data:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}

// Function untuk membersihkan demo data
export async function cleanupDemoData() {
    try {
        console.log('🧹 Cleaning up demo data...')

        // Hapus semua gedung
        const gedungRef = ref(database, 'gedung')
        await set(gedungRef, null)

        // Hapus semua kelas
        const kelasRef = ref(database, 'kelas')
        await set(kelasRef, null)

        console.log('✅ Demo data cleanup completed')

        return {
            success: true,
            message: 'Demo data cleaned up successfully',
        }
    } catch (error) {
        console.error('❌ Error cleaning up demo data:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}

// Function untuk memverifikasi relasi
export async function verifyRelations() {
    try {
        console.log('🔍 Verifying relations...')

        const gedungRef = ref(database, 'gedung')
        const kelasRef = ref(database, 'kelas')

        const [gedungSnapshot, kelasSnapshot] = await Promise.all([
            get(gedungRef),
            get(kelasRef),
        ])

        const gedungData = gedungSnapshot.val() || {}
        const kelasData = kelasSnapshot.val() || {}

        let issues: string[] = []
        let verified = 0

        // Check gedung -> kelas relations
        for (const [gedungId, gedung] of Object.entries(gedungData) as [
            string,
            any
        ][]) {
            if (gedung.kelas) {
                for (const [kelasId, kelasRef] of Object.entries(
                    gedung.kelas
                ) as [string, any][]) {
                    // Check if kelas exists in kelas collection
                    const kelasExists = Object.values(kelasData).some(
                        (lantaiData: any) => lantaiData && lantaiData[kelasId]
                    )

                    if (!kelasExists) {
                        issues.push(
                            `Gedung ${gedungId} references non-existent kelas ${kelasId}`
                        )
                    } else {
                        verified++
                    }
                }
            }
        }

        // Check kelas -> gedung relations
        Object.entries(kelasData).forEach(
            ([lantai, lantaiData]: [string, any]) => {
                if (lantaiData) {
                    Object.entries(lantaiData).forEach(
                        ([kelasId, kelas]: [string, any]) => {
                            if (
                                kelas.gedung_id &&
                                !gedungData[kelas.gedung_id]
                            ) {
                                issues.push(
                                    `Kelas ${kelasId} references non-existent gedung ${kelas.gedung_id}`
                                )
                            }
                        }
                    )
                }
            }
        )

        console.log(`✅ Verified ${verified} relations`)
        if (issues.length > 0) {
            console.log('⚠️ Issues found:')
            issues.forEach((issue) => console.log(`  - ${issue}`))
        }

        return {
            success: true,
            verified,
            issues,
            isConsistent: issues.length === 0,
        }
    } catch (error) {
        console.error('❌ Error verifying relations:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}
