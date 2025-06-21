import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUD_API_KEY,
    api_secret: process.env.NEXT_PUBLIC_CLOUD_API_SCRET,
})

export async function POST(req: NextRequest) {
    const formData = await req.formData()
    const file = formData.get('file') as File

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    try {
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader
                .upload_stream({ folder: 'bank-image' }, (error, result) => {
                    if (error) return reject(error)
                    resolve(result)
                })
                .end(buffer)
        })

        return NextResponse.json({ success: true, data: result })
    } catch (error) {
        return NextResponse.json({ success: false, error }, { status: 500 })
    }
}

export async function GET() {
    try {
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'bank-image/',
            max_results: 100,
        })

        return NextResponse.json({ success: true, data: result.resources })
    } catch (error) {
        console.error('Error fetching images:', error)
        return NextResponse.json({ success: false, error }, { status: 500 })
    }
}
