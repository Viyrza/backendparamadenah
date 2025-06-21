import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUD_API_KEY,
    api_secret: process.env.NEXT_PUBLIC_CLOUD_API_SCRET,
})

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const encodedPublicId = id
        const publicId = decodeURIComponent(encodedPublicId)

        if (!publicId) {
            return NextResponse.json(
                { success: false, error: 'Missing image ID' },
                { status: 400 }
            )
        }
        const result = await cloudinary.uploader.destroy(publicId, {
            invalidate: true,
            resource_type: 'image',
        })
        console.log('Cloudinary delete result:', result)

        if (result.result === 'not found') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Image not found in Cloudinary',
                    publicId: publicId,
                },
                { status: 404 }
            )
        }

        if (result.result !== 'ok') {
            return NextResponse.json(
                {
                    success: false,
                    error: `Cloudinary deletion failed: ${result.result}`,
                    publicId: publicId,
                },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Image deleted successfully',
            data: {
                id: publicId,
                result: result.result,
            },
        })
    } catch (error) {
        console.error('Delete error:', error)
        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error ? error.message : 'Deletion failed',
                details: error instanceof Error ? error.stack : undefined,
            },
            { status: 500 }
        )
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const encodedPublicId = id
        const publicId = decodeURIComponent(encodedPublicId)

        if (!publicId) {
            return NextResponse.json(
                { success: false, error: 'Missing image ID' },
                { status: 400 }
            )
        }

        const body = await request.json()
        const { name, description, tags } = body

        const context = {
            alt: description || '',
            caption: name || '',
        }

        const result = await cloudinary.uploader.explicit(publicId, {
            type: 'upload',
            context: context,
            tags: tags || [],
            public_id: publicId,
        })

        if (!result) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Failed to update image metadata',
                    publicId: publicId,
                },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Image metadata updated successfully',
            data: {
                id: result.public_id,
                name: name,
                description: description,
                tags: tags,
                url: result.secured_url || result.secure_url,
                updatedAt: new Date().toISOString(),
            },
        })
    } catch (error) {
        console.error('Update error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Update failed',
                details: error instanceof Error ? error.stack : undefined,
            },
            { status: 500 }
        )
    }
}
