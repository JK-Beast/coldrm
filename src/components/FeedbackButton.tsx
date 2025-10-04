import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const FeedbackButton = () => {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSendFeedback = async () => {
    if (!feedback.trim()) {
      toast({
        title: "Error",
        description: "Please enter your feedback",
        variant: "destructive",
      });
      return;
    }

    if (feedback.length > 5000) {
      toast({
        title: "Error",
        description: "Feedback is too long (max 5000 characters)",
        variant: "destructive",
      });
      return;
    }

    setSending(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Not authenticated");
      }

      const { error } = await supabase.functions.invoke('send-feedback', {
        body: { feedback },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Thank you for your feedback!",
      });

      setFeedback("");
      setOpen(false);
    } catch (error: any) {
      console.error("Error sending feedback:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send feedback",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <MessageSquare className="h-4 w-4" />
        Feedback
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Feedback</DialogTitle>
            <DialogDescription>
              Share your thoughts, suggestions, or report issues. Your feedback helps us improve!
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Enter your feedback here..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[150px] resize-none"
              maxLength={5000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {feedback.length} / 5000 characters
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendFeedback}
              disabled={sending || !feedback.trim()}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {sending ? "Sending..." : "Send Feedback"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
