import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, Mail } from "lucide-react";

const EmailCampaign = () => {
  const [subject, setSubject] = useState("");
  const [prompt, setPrompt] = useState("");
  const [recipients, setRecipients] = useState("");
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const { toast } = useToast();

  const MAX_EMAILS = 20;

  useEffect(() => {
    fetchSentCount();
  }, []);

  const fetchSentCount = async () => {
    try {
      const { count, error } = await supabase
        .from("email_campaigns")
        .select("*", { count: "exact", head: true })
        .eq("status", "sent");

      if (error) throw error;
      setSentCount(count || 0);
    } catch (error: any) {
      console.error("Error fetching sent count:", error);
    }
  };

  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const recipientList = recipients.split(",").map(email => email.trim()).filter(Boolean);
    
    if (recipientList.length === 0) {
      toast({
        variant: "destructive",
        title: "No recipients",
        description: "Please enter at least one email address.",
      });
      return;
    }

    if (sentCount + recipientList.length > MAX_EMAILS) {
      toast({
        variant: "destructive",
        title: "Email limit reached",
        description: `You can only send up to ${MAX_EMAILS} emails in the MVP version. You have ${MAX_EMAILS - sentCount} remaining.`,
      });
      return;
    }

    setSending(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("send-cold-emails", {
        body: {
          subject,
          prompt,
          recipients: recipientList,
        },
      });

      if (error) throw error;

      toast({
        title: "Campaign started",
        description: `Sending ${recipientList.length} emails with 1-minute delays between each.`,
      });

      setSubject("");
      setPrompt("");
      setRecipients("");
      fetchSentCount();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send campaign",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-[var(--shadow-soft)]">
        <CardHeader>
          <CardTitle>Create Email Campaign</CardTitle>
          <CardDescription>
            AI-powered cold emails with human-like content ({sentCount}/{MAX_EMAILS} emails sent)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendCampaign} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                placeholder="Quick question about your business"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                disabled={sending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt">Content Prompt for AI</Label>
              <Textarea
                id="prompt"
                placeholder="Write a friendly email introducing our CRM tool for small businesses..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                required
                disabled={sending}
              />
              <p className="text-xs text-muted-foreground">
                The AI will generate human-like content based on your prompt
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipients">Recipients (comma-separated)</Label>
              <Textarea
                id="recipients"
                placeholder="john@example.com, jane@example.com, bob@example.com"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                rows={3}
                required
                disabled={sending}
              />
            </div>

            <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Campaign Features:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>AI-generated human-like content using Cohere</li>
                <li>1-minute delay between each email</li>
                <li>CTA button for easy contact addition</li>
                <li>Spam filter optimization</li>
              </ul>
            </div>

            <Button 
              type="submit" 
              disabled={sending || sentCount >= MAX_EMAILS}
              className="w-full"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending Campaign...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Campaign
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-[var(--shadow-soft)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Campaign Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Emails sent</span>
              <span className="font-medium">{sentCount} / {MAX_EMAILS}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${(sentCount / MAX_EMAILS) * 100}%` }}
              />
            </div>
            {sending && (
              <p className="text-sm text-muted-foreground mt-4">
                ⚠️ Please do not close this page while emails are being sent
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailCampaign;