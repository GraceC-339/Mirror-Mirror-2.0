import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SelfieCaptureProps {
  onCapture: (url: string) => void;
  onSkip: () => void;
}

export const SelfieCapture = ({ onCapture, onSkip }: SelfieCaptureProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown === 0) {
      capturePhoto();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const startCountdown = () => {
    setCountdown(3);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    setCountdown(null);

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirmPhoto = async () => {
    if (!capturedImage) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();

      const fileName = `${user.id}/${Date.now()}.jpg`;
      const { data, error } = await supabase.storage
        .from('selfies')
        .upload(fileName, blob);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('selfies')
        .getPublicUrl(fileName);

      onCapture(publicUrl);
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Failed to save photo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative aspect-[3/4] rounded-3xl overflow-hidden border-4 border-primary/30 bg-card/50 backdrop-blur-sm">
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
            />
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-8xl font-light text-white animate-breathe">
                  {countdown}
                </div>
              </div>
            )}
          </>
        ) : (
          <img
            src={capturedImage}
            alt="Captured selfie"
            className="w-full h-full object-cover"
          />
        )}
        
        <canvas ref={canvasRef} className="hidden" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
          <p className="text-white text-center text-sm mb-4 animate-breathe">
            {countdown === null && !capturedImage
              ? "Take a moment. Really look at yourself."
              : capturedImage
              ? "You look beautiful today"
              : "Get ready..."}
          </p>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        {!capturedImage ? (
          <>
            <Button
              onClick={onSkip}
              variant="outline"
              className="flex-1 border-primary/30"
            >
              Skip
            </Button>
            <Button
              onClick={startCountdown}
              disabled={countdown !== null}
              className="flex-1 bg-gradient-calm text-foreground"
            >
              <Camera className="w-5 h-5 mr-2" />
              Capture
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={retake}
              variant="outline"
              className="flex-1 border-primary/30"
              disabled={uploading}
            >
              <X className="w-5 h-5 mr-2" />
              Retake
            </Button>
            <Button
              onClick={confirmPhoto}
              className="flex-1 bg-gradient-calm text-foreground"
              disabled={uploading}
            >
              <Check className="w-5 h-5 mr-2" />
              {uploading ? "Saving..." : "Confirm"}
            </Button>
          </>
        )}
      </div>

      <style>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
};