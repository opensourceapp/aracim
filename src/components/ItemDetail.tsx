import { useState, useEffect } from "react";
import { PhotoCapture } from "@/components/PhotoCapture";

interface ItemDetailProps {
  note: string;
  photos: string[];
  onNoteChange: (note: string) => void;
  onAddPhoto: (photo: string) => void;
  onRemovePhoto: (index: number) => void;
}

export function ItemDetail({ note, photos, onNoteChange, onAddPhoto, onRemovePhoto }: ItemDetailProps) {
  const [localNote, setLocalNote] = useState(note);

  useEffect(() => {
    setLocalNote(note);
  }, [note]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localNote !== note) {
        onNoteChange(localNote);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localNote, note, onNoteChange]);

  return (
    <div className="mt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
      <textarea
        value={localNote}
        onChange={(e) => setLocalNote(e.target.value)}
        placeholder="Sorunu açıklayın..."
        rows={2}
        className="w-full rounded-lg glass px-3 py-2 text-sm text-primary-white placeholder:text-muted-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
      />
      <PhotoCapture photos={photos} onAdd={onAddPhoto} onRemove={onRemovePhoto} />
    </div>
  );
}
