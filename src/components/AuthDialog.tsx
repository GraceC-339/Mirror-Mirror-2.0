import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AuthDialog = ({ open, onOpenChange }: AuthDialogProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "Account created!",
          description: "Welcome to Mirror. Let's begin your reflection journey.",
        });
      }
      onOpenChange(false);
    } catch (error: any) {
      const rawMessage = error?.message || "Authentication failed";
      const lowerMessage = rawMessage.toLowerCase();

      if (lowerMessage.includes("email not confirmed") || lowerMessage.includes("email not verified")) {
        toast({
          title: "Email confirmation is enabled",
          description: "Turn off Confirm Email in Supabase: Authentication -> Providers -> Email.",
          variant: "destructive",
        });
        return;
      }

      const isSchemaIssue =
        lowerMessage.includes("database") ||
        lowerMessage.includes("relation") ||
        lowerMessage.includes("schema");

      toast({
        title: "Error",
        description: isSchemaIssue
          ? "Auth worked but database setup is incomplete for this Supabase project. Run your migrations on the project in your .env file."
          : rawMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md backdrop-blur-xl bg-card/80 border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light">
            {isLogin ? "Welcome Back" : "Begin Your Journey"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isLogin
              ? "Sign in to continue your reflection practice"
              : "Create an account to start your daily self-reflection ritual"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-primary/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="border-primary/20"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-calm text-foreground hover:opacity-90 transition-opacity"
          >
            {loading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
          </Button>
        </form>
        <div className="text-center text-sm">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline"
          >
            {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};