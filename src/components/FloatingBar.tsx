import { useNavigate } from "react-router-dom";
import { FileText, RotateCcw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FloatingBarProps {
  percentage: number;
  onReset: () => void;
}

export function FloatingBar({ percentage, onReset }: FloatingBarProps) {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="glass-strong rounded-2xl p-3 flex items-center gap-3 max-w-lg mx-auto">
        {/* Report button */}
        <button
          onClick={() => navigate("/rapor")}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm hover:from-violet-500 hover:to-indigo-500 transition-all active:scale-[0.98]"
        >
          <FileText className="h-4 w-4" />
          Rapor Oluştur
        </button>

        {/* Progress indicator */}
        <span className="text-sm font-bold text-primary-white min-w-[3rem] text-center">
          %{percentage}
        </span>

        {/* Reset button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="p-2.5 rounded-xl glass hover:bg-white/15 transition-colors">
              <RotateCcw className="h-4 w-4 text-muted-white" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="glass-strong border-white/20 text-primary-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-primary-white">Tüm ilerleme sıfırlansın mı?</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-white">
                Bu işlem geri alınamaz. Tüm işaretlemeler, notlar ve fotoğraflar silinecek.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="glass text-secondary-white border-white/20">İptal</AlertDialogCancel>
              <AlertDialogAction onClick={onReset} className="bg-red-500/80 text-white hover:bg-red-500">
                Sıfırla
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
