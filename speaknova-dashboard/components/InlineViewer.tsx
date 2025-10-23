"use client"
import React from 'react'

type Props = {
  item: { id: string; title: string; contentType?: string | null; downloadUrl?: string | null; storagePath?: string | null }
  onClose: () => void
}

import { getDownloadURL, getStorage, ref } from 'firebase/storage'
import { useEffect, useState } from 'react'

export default function InlineViewer({ item, onClose }: Props) {
  const [url, setUrl] = useState<string | null>(item.downloadUrl || null)
  const type = item.contentType || ''

  useEffect(() => {
    const fetchUrl = async () => {
      if (!url && item.storagePath) {
        try {
          const s = getStorage()
          const r = ref(s, item.storagePath)
          const u = await getDownloadURL(r)
          setUrl(u)
        } catch {
          // ignore
        }
      }
    }
    fetchUrl()
  }, [item, url])

  let iframeSrc = url || undefined
  if (type.includes('word') || type.includes('officedocument.wordprocessingml') || url?.match(/\.docx?(\?|$)/i)) {
    if (url) iframeSrc = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url || '')}`
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="card w-full max-w-5xl h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-3 border-b border-[#123239]">
          <h3 className="font-medium">{item.title}</h3>
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
        <div className="flex-1">
          {iframeSrc ? (
            <iframe src={iframeSrc} className="w-full h-full rounded-b-lg" />
          ) : (
            <div className="p-4 text-sm text-[#a9bcc2]">No preview available.</div>
          )}
        </div>
      </div>
    </div>
  )
}
