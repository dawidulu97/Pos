"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
    setNote(currentNote)
  }, [currentNote])

  const handleSave = () => {
    onSaveNote(note)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
          <DialogDescription>Add a note to the current order.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              placeholder="Enter your note here..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={5}
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
