"use client"
import React from 'react'
import Modal from './Modal'
import Button from './Button'

type Props = {
  open: boolean
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function Confirm({ open, title, description, confirmText='Confirm', cancelText='Cancel', onConfirm, onCancel }: Props) {
  return (
    <Modal open={open} onClose={onCancel} widthClass="max-w-md">
      <div className="p-4">
        <h3 className="font-semibold mb-2">{title}</h3>
        {description && <p className="text-sm text-[#a9bcc2] mb-4">{description}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>{cancelText}</Button>
          <Button onClick={onConfirm}>{confirmText}</Button>
        </div>
      </div>
    </Modal>
  )
}

