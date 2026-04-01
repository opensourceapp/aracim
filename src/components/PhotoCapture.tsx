import { useRef } from "react";
import { Camera, X } from "lucide-react";

interface PhotoCaptureProps {
  photos: string[];
  onAdd: (photo: string) => void;
  onRemove: (index: number) => void;
}

export function PhotoCapture({ photos, onAdd, onRemove }: PhotoCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Fotoğraf boyutu 2MB'dan küçük olmalı.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        onAdd(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="flex gap-2 flex-wrap mt-2">
      {photos.map((photo, index) => (
        <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden group">
          <img src={photo} alt={`Fotoğraf ${index + 1}`} className="w-full h-full object-cover" />
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(index); }}
            className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3 w-3 text-white" />
          </button>
        </div>
      ))}
      <button
        onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
        className="w-16 h-16 rounded-lg glass flex items-center justify-center hover:bg-white/15 transition-colors"
      >
        <Camera className="h-5 w-5 text-muted-white" />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
