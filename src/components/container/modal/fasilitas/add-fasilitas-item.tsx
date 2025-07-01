'use client'

import { useState, useRef, FormEvent } from 'react'
import { Plus } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { useDisclosure } from '@/hooks/use-disclosure'
import BankImageSelector from '../../bank-image-selector'

type AddFasilitasItemModalProps = {
  id: string // slug
  category: string
}

export default function AddFasilitasItemModal({ id, category }: AddFasilitasItemModalProps) {
  const { isOpen, setIsOpen } = useDisclosure()
  const [fasilitasImage, setFasilitasImage] = useState('')
  const [denahImage, setDenahImage] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    // Pastikan field category dan slug dikirim
    formData.set('category', category)
    formData.set('slug', id)
    formData.set('image', fasilitasImage)
    formData.set('denah_lokasi', denahImage)
    formData.set('description', description)

    const res = await fetch('/api/update-fasilitas-details', {
      method: 'POST',
      body: formData,
    })

    const result = await res.json()
      if (result.success) {
      setSuccess(true)
      setFasilitasImage('')
      setDenahImage('')
      setDescription('')
      setIsOpen(false)
    } else {
      alert(result.error || 'Gagal menyimpan data')
    }

    setLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-background_primary hover:bg-slate-700">
          <p className="hidden md:block">Add Fasilitas Item</p>
          <Plus />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          {/* Input hidden agar bisa dibaca FormData */}
          <input type="hidden" name="category" value={category} />
          <input type="hidden" name="slug" value={id} />
          <input type="hidden" name="image" value={fasilitasImage} />
          <input type="hidden" name="denah_lokasi" value={denahImage} />

          <DialogHeader>
            <DialogTitle>Tambah Detail Fasilitas</DialogTitle>
          </DialogHeader>

          <div>
            <Label>Deskripsi</Label>
            <Textarea
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Gambar Fasilitas</Label>
            <Input
              type="url"
              value={fasilitasImage}
              onChange={(e) => setFasilitasImage(e.target.value)}
              placeholder="URL gambar fasilitas"
            />
            {fasilitasImage && (
              <img src={fasilitasImage} alt="Preview" className="w-full h-48 object-cover border rounded" />
            )}
            <BankImageSelector
              onImageSelect={(url) => setFasilitasImage(url)}
              selectedImageUrl={fasilitasImage}
              triggerButton={
                <Button type="button" variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Pilih dari Bank Image
                </Button>
              }
            />
          </div>

          <div className="space-y-3">
            <Label>Denah Lokasi</Label>
            <Input
              type="url"
              value={denahImage}
              onChange={(e) => setDenahImage(e.target.value)}
              placeholder="URL denah lokasi"
            />
            {denahImage && (
              <img src={denahImage} alt="Preview Denah" className="w-full h-48 object-cover border rounded" />
            )}
            <BankImageSelector
              onImageSelect={(url) => setDenahImage(url)}
              selectedImageUrl={denahImage}
              triggerButton={
                <Button type="button" variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Pilih Denah dari Bank Image
                </Button>
              }
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading} className="bg-slate-800 hover:bg-slate-700">
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>

          {success && (
            <p className="text-sm text-green-600">Berhasil menambahkan detail fasilitas!</p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}

