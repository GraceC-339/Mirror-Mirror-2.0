import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/AuthDialog";
import { ChatInterface } from "@/components/ChatInterface";
import { SelfieCapture } from "@/components/SelfieCapture";
import { AffirmationDisplay } from "@/components/AffirmationDisplay";
import { ReflectionGallery } from "@/components/ReflectionGallery";
import { Sparkles, LogOut, History, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import heroBg from "@/assets/hero-bg.jpg";

type Phase = 'welcome' | 'chat' | 'selfie' | 'affirmation' | 'gallery';

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>('welcome');
  const [emotion, setEmotion] = useState("");
  const [conversation, setConversation] = useState<any[]>([]);
  const [selfieUrl, setSelfieUrl] = useState<string>();
  const [affirmation, setAffirmation] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleStartReflection = () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    setPhase('chat');
  };

  const handleChatComplete = (conv: any[]) => {
    setConversation(conv);
    const userEmotion = conv.find(m => m.role === 'user')?.content || 'neutral';
    setEmotion(userEmotion);
    setPhase('selfie');
  };

  const handleSelfieCapture = async (url: string) => {
    setSelfieUrl(url);
    await generateAffirmation(url);
  };

  const handleSkipSelfie = async () => {
    await generateAffirmation();
  };

  const generateAffirmation = async (selfie?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-affirmation', {
        body: { emotion, conversation }
      });

      if (error) throw error;

      setAffirmation(data.affirmation);
      
      // Save reflection
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        await supabase.from('reflections').insert({
          user_id: currentUser.id,
          emotion,
          conversation,
          selfie_url: selfie,
          affirmation: data.affirmation
        });
      }

      setPhase('affirmation');
    } catch (error) {
      console.error('Error generating affirmation:', error);
      toast({
        title: "Error",
        description: "Failed to generate affirmation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleComplete = () => {
    setPhase('welcome');
    setEmotion("");
    setConversation([]);
    setSelfieUrl(undefined);
    setAffirmation("");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setPhase('welcome');
  };

  return (
    <div 
      className="min-h-screen bg-gradient-soft relative"
      style={{
        backgroundImage: phase === 'welcome' ? `url(${heroBg})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <nav className="backdrop-blur-xl bg-card/60 border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-primary animate-float" />
            <h1 className="text-2xl font-light text-foreground">Mirror</h1>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setPhase(phase === 'gallery' ? 'welcome' : 'gallery')}
                variant="outline"
                size="sm"
                className="border-primary/30"
              >
                {phase === 'gallery' ? (
                  <>
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </>
                ) : (
                  <>
                    <History className="w-4 h-4 mr-2" />
                    Gallery
                  </>
                )}
              </Button>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="border-primary/30"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {phase === 'welcome' && (
          <div className="text-center space-y-8 max-w-2xl mx-auto animate-fade-in">
            <div className="space-y-4">
              <Sparkles className="w-16 h-16 text-primary mx-auto animate-float" />
              <h2 className="text-5xl font-light text-foreground">
                Know Thyself
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                A daily ritual of self-reflection and mindful appreciation. 
                Pause, reflect, and see yourself with compassion.
              </p>
            </div>

            <div className="backdrop-blur-xl bg-card/80 rounded-3xl p-12 border border-primary/30 space-y-6">
              <div className="space-y-4 text-left">
                <div className="flex gap-4">
                  <div className="w-2 h-2 mt-2 rounded-full bg-primary flex-shrink-0" />
                  <p className="text-foreground">
                    <span className="font-medium">Emotional Check-in:</span> Share how you're feeling in a brief, supportive conversation
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="w-2 h-2 mt-2 rounded-full bg-secondary flex-shrink-0" />
                  <p className="text-foreground">
                    <span className="font-medium">Mirror Moment:</span> Optionally capture a selfie while truly seeing yourself
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="w-2 h-2 mt-2 rounded-full bg-accent flex-shrink-0" />
                  <p className="text-foreground">
                    <span className="font-medium">Personal Affirmation:</span> Receive words of encouragement tailored to you
                  </p>
                </div>
              </div>

              <Button
                onClick={handleStartReflection}
                size="lg"
                className="w-full bg-gradient-calm text-foreground hover:opacity-90 transition-opacity text-lg py-6"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Begin Today's Reflection
              </Button>

              {!user && (
                <p className="text-sm text-muted-foreground">
                  Sign in to save your reflections and track your journey
                </p>
              )}
            </div>
          </div>
        )}

        {phase === 'chat' && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-light text-center mb-8 text-foreground">
              How are you feeling today?
            </h2>
            <ChatInterface emotion={emotion} onComplete={handleChatComplete} />
          </div>
        )}

        {phase === 'selfie' && (
          <div className="animate-fade-in space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-light mb-2 text-foreground">
                The Mirror Moment
              </h2>
              <p className="text-muted-foreground">
                Take a moment to truly see yourself
              </p>
            </div>
            <SelfieCapture onCapture={handleSelfieCapture} onSkip={handleSkipSelfie} />
          </div>
        )}

        {phase === 'affirmation' && (
          <div className="animate-fade-in space-y-6">
            <h2 className="text-3xl font-light text-center mb-8 text-foreground">
              Your Affirmation
            </h2>
            <AffirmationDisplay
              affirmation={affirmation}
              selfieUrl={selfieUrl}
              onComplete={handleComplete}
            />
          </div>
        )}

        {phase === 'gallery' && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-light text-center mb-8 text-foreground">
              Your Reflection Journey
            </h2>
            <ReflectionGallery />
          </div>
        )}
      </main>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
};

export default Index;