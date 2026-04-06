import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Send, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  emotion: string;
  onComplete: (conversation: Message[]) => void;
}

export const ChatInterface = ({ emotion, onComplete }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Good day! How are you feeling right now?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-reflection', {
        body: {
          messages: [...messages, userMessage],
          emotion: emotion
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      // Check if conversation is complete (3+ exchanges)
      if (messages.length >= 5) {
        setTimeout(() => onComplete([...messages, userMessage, assistantMessage]), 3000);
      }
    } catch (error: any) {
      console.error('Error:', error);

      const message = typeof error?.message === "string" ? error.message : "Unknown error";
      const isFunctionsFetchError = message.toLowerCase().includes("failed to send a request to the edge function");

      toast({
        title: "Chat service unavailable",
        description: isFunctionsFetchError
          ? "Edge Function is unreachable. Deploy/link functions to this Supabase project and set GOOGLE_GEMINI_API_KEY secret."
          : message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] max-w-2xl mx-auto">
      <div className="flex-1 overflow-y-auto space-y-4 p-6">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                message.role === 'user'
                  ? 'bg-gradient-calm text-foreground'
                  : 'bg-card/80 backdrop-blur-sm border border-primary/20 text-foreground'
              }`}
            >
              {message.role === 'assistant' && (
                <Sparkles className="w-4 h-4 mb-2 text-primary" />
              )}
              <p className="text-sm leading-relaxed">{message.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-card/80 backdrop-blur-sm border border-primary/20 rounded-2xl px-6 py-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-breathe" />
                <div className="w-2 h-2 bg-primary rounded-full animate-breathe" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-breathe" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 border-t border-primary/20">
        <div className="flex gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Share what's on your mind..."
            className="resize-none border-primary/20 bg-card/50 backdrop-blur-sm"
            rows={2}
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            size="icon"
            className="h-auto bg-gradient-calm text-foreground hover:opacity-90"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};