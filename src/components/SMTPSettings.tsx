import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Mail, Trash2, Shield, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SMTPSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SMTPSettings = ({ open, onOpenChange }: SMTPSettingsProps) => {
  const [email, setEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [configuredEmail, setConfiguredEmail] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      checkSetup();
    }
  }, [open]);

  const checkSetup = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-smtp-setup");
      if (error) throw error;
      
      setConfigured(data.configured);
      setConfiguredEmail(data.email || "");
    } catch (error: any) {
      console.error("Error checking SMTP setup:", error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase.functions.invoke("save-smtp-credentials", {
        body: { email, appPassword },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "SMTP credentials saved securely.",
      });

      setEmail("");
      setAppPassword("");
      checkSetup();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save credentials",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your SMTP credentials?")) {
      return;
    }

    setDeleting(true);

    try {
      const { error } = await supabase.functions.invoke("delete-smtp-credentials");

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "SMTP credentials removed from server.",
      });

      setConfigured(false);
      setConfiguredEmail("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete credentials",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Gmail SMTP Settings
          </DialogTitle>
          <DialogDescription>
            Configure your Gmail account to send emails directly from the app
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              🔒 <strong>Don't worry, we don't misuse it!</strong> Your credentials are encrypted and stored securely on our server. We never share or use them for anything other than sending your emails.
            </AlertDescription>
          </Alert>

          {configured && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-sm">Current Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">
                  <strong>Email:</strong> {configuredEmail}
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleting ? "Deleting..." : "Delete Credentials"}
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                {configured ? "Update SMTP Credentials" : "Add SMTP Credentials"}
              </CardTitle>
              <CardDescription className="text-xs">
                You'll need to create a Google App Password. Don't use your regular Gmail password!
                <br />
                <a 
                  href="https://support.google.com/accounts/answer/185833" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Learn how to create an App Password →
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Gmail Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your-email@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appPassword">Google App Password</Label>
                  <div className="relative">
                    <Input
                      id="appPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="16-character app password"
                      value={appPassword}
                      onChange={(e) => setAppPassword(e.target.value)}
                      required
                      disabled={saving}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Format: xxxx xxxx xxxx xxxx (spaces will be removed automatically)
                  </p>
                </div>

                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? "Saving..." : configured ? "Update Credentials" : "Save Credentials"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SMTPSettings;