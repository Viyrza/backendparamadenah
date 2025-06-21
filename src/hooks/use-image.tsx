'use client'
import { useEffect, useState } from 'react'

export function useBankImages() {
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchImages = async () => {
      const res = await fetch('/api/upload')
      const result = await res.json()
      if (result.success) {
        setImages(result.data)
      }
      setLoading(false)
    }

    fetchImages()
  }, [])

  return { images, loading }
}
