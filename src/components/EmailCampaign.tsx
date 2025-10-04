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
  const [smtpConfigured, setSmtpConfigured] = useState(false);
  const { toast } = useToast();

  const MAX_EMAILS = 20;

  useEffect(() => {
    fetchSentCount();
    checkSmtpSetup();

    // Re-check SMTP setup whenever credentials are updated elsewhere
    const handler = () => checkSmtpSetup();
    window.addEventListener('smtp-config-updated', handler);
    return () => window.removeEventListener('smtp-config-updated', handler);
  }, []);

  const checkSmtpSetup = async () => {
    try {
      console.log("Checking SMTP setup...");
      const { data, error } = await supabase.functions.invoke("check-smtp-setup");
      console.log("SMTP check response:", { data, error });
      
      if (error) {
        console.error("SMTP check error:", error);
        throw error;
      }
      
      setSmtpConfigured(data?.configured || false);
      console.log("SMTP configured:", data?.configured);
    } catch (error: any) {
      console.error("Error checking SMTP setup:", error);
      setSmtpConfigured(false);
    }
  };

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

    if (!smtpConfigured) {
      toast({
        variant: "destructive",
        title: "SMTP Not Configured",
        description: "Please configure your Gmail SMTP settings in the dashboard first.",
      });
      return;
    }
    
    // Parse format: "email,name,company;email,name,company"
    const recipientList = recipients
      .split(";")
      .map(entry => {
        const [email, name, company] = entry.split(",").map(s => s.trim());
        return { email, name: name || "", company: company || "" };
      })
      .filter(r => r.email);
    
    if (recipientList.length === 0) {
      toast({
        variant: "destructive",
        title: "No recipients",
        description: "Please enter at least one recipient in format: email,name,company",
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
              <Label htmlFor="recipients">Recipients</Label>
              <Textarea
                id="recipients"
                placeholder="john@company.com,John,Company Inc;jane@business.com,Jane,Business Co"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                rows={3}
                required
                disabled={sending}
              />
              <p className="text-xs text-muted-foreground">
                Format: email,name,company;email,name,company
              </p>
            </div>

            {!smtpConfigured && (
              <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
                <p className="text-sm text-destructive font-medium">
                  ⚠️ SMTP Not Configured
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Please configure your Gmail SMTP settings using the "SMTP Settings" button in the top right corner before sending emails.
                </p>
              </div>
            )}

            <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Campaign Features:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>AI-generated human-like content</li>
                <li>Sent directly from your Gmail account</li>
                <li>1-minute delay between each email</li>
                <li>Secure SMTP with encryption</li>
              </ul>
            </div>

            <Button 
              type="submit" 
              disabled={sending || sentCount >= MAX_EMAILS || !smtpConfigured}
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