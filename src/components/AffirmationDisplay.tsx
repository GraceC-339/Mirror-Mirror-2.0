import { Button } from "@/components/ui/button";
import { Download, Share2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AffirmationDisplayProps {
  affirmation: string;
  selfieUrl?: string;
  onComplete: () => void;
}

export const AffirmationDisplay = ({ affirmation, selfieUrl, onComplete }: AffirmationDisplayProps) => {
  const { toast } = useToast();

  const handleShare = async () => {
    try {
      await navigator.share({
        title: "My Daily Affirmation",
        text: affirmation,
      });
    } catch (error) {
      navigator.clipboard.writeText(affirmation);
      toast({
        title: "Copied!",
        description: "Affirmation copied to clipboard",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {selfieUrl && (
        <div className="relative aspect-[3/4] max-w-md mx-auto rounded-3xl overflow-hidden border-4 border-primary/30">
          <img
            src={selfieUrl}
            alt="Your reflection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
              <Sparkles className="w-6 h-6 text-white mb-3 mx-auto" />
              <p className="text-white text-center text-lg leading-relaxed font-light">
                {affirmation}
              </p>
            </div>
          </div>
        </div>
      )}

      {!selfieUrl && (
        <div className="backdrop-blur-xl bg-card/80 rounded-3xl p-12 border border-primary/30">
          <Sparkles className="w-8 h-8 text-primary mb-6 mx-auto animate-float" />
          <p className="text-foreground text-center text-2xl leading-relaxed font-light">
            {affirmation}
          </p>
        </div>
      )}

      <div className="flex gap-3 justify-center">
        {selfieUrl && (
          <Button
            onClick={() => {
              const a = document.createElement('a');
              a.href = selfieUrl;
              a.download = 'reflection.jpg';
              a.click();
            }}
            variant="outline"
            className="border-primary/30"
          >
            <Download className="w-4 h-4 mr-2" />
            Save
          </Button>
        )}
        <Button
          onClick={handleShare}
          variant="outline"
          className="border-primary/30"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button
          onClick={onComplete}
          className="bg-gradient-calm text-foreground"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};