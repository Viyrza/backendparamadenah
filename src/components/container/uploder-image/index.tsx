'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'

export default function ImageUploader() {
  const [images, setImages] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setImages((prev) => [...prev, result.data])
      } else {
        console.error('Upload failed:', result.error)
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  const { getRootProps, getInputProps } = useDropzone({ onDrop })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className="border border-dashed p-8 text-center cursor-pointer rounded bg-gray-100"
      >
        <input {...getInputProps()} />
        {uploading ? 'Uploading...' : 'Click or drag image to upload'}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((img, idx) => (
          <div key={idx}>
            <img
              src={img.secure_url}
              alt={`Uploaded ${idx}`}
              className="rounded shadow"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
