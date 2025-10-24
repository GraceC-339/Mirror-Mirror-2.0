import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface Reflection {
  id: string;
  emotion: string;
  affirmation: string;
  selfie_url?: string;
  created_at: string;
}

export const ReflectionGallery = () => {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReflections();
  }, []);

  const loadReflections = async () => {
    try {
      const { data, error } = await supabase
        .from('reflections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReflections(data || []);
    } catch (error) {
      console.error('Error loading reflections:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-breathe" />
          <div className="w-3 h-3 bg-primary rounded-full animate-breathe" style={{ animationDelay: '0.2s' }} />
          <div className="w-3 h-3 bg-primary rounded-full animate-breathe" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    );
  }

  const emotionCounts = reflections.reduce((acc, r) => {
    acc[r.emotion] = (acc[r.emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {reflections.length > 0 && (
        <div className="backdrop-blur-xl bg-card/80 rounded-3xl p-8 border border-primary/30">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-light">Your Journey</h3>
          </div>
          <p className="text-muted-foreground">
            You've reflected {reflections.length} time{reflections.length !== 1 ? 's' : ''} this month.
            {topEmotion && (
              <span className="ml-1">
                Most common feeling: <span className="text-primary font-medium capitalize">{topEmotion[0]}</span>
              </span>
            )}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reflections.map((reflection) => (
          <div
            key={reflection.id}
            className="group backdrop-blur-xl bg-card/80 rounded-2xl overflow-hidden border border-primary/30 hover:border-primary/50 transition-all hover:scale-105 animate-fade-in"
          >
            {reflection.selfie_url && (
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={reflection.selfie_url}
                  alt="Reflection"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(reflection.created_at), 'MMM d, yyyy')}
                </span>
                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs capitalize">
                  {reflection.emotion}
                </span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {reflection.affirmation}
              </p>
            </div>
          </div>
        ))}
      </div>

      {reflections.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">
            Your reflection journey begins today.
          </p>
          <p className="text-muted-foreground mt-2">
            Complete your first daily check-in to see it here.
          </p>
        </div>
      )}
    </div>
  );
};