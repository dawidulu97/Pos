"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface NoteModalProps {
  isOpen: boolean
  onClose: () => void
  currentNote: string
  onSaveNote: (note: string) => void
}

export function NoteModal({ isOpen, onClose, currentNote, onSaveNote }: NoteModalProps) {
  const [note, setNote] = useState(currentNote)

  useEffect(() => {
    if (isOpen) {
      setNote(currentNote)
    }
  }, [isOpen, currentNote])

  const handleSave = () => {
    onSaveNote(note)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Order Note</DialogTitle>
          <DialogDescription>Add any special notes or instructions for this order.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="order-note">Note</Label>
            <Textarea
              id="order-note"
              placeholder="e.g., Customer prefers no onions, deliver to back door, etc."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Note</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
