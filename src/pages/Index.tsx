import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Users, Zap, ArrowRight, CheckCircle2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{
        background: "var(--gradient-hero)",
        minHeight: "80vh"
      }}>
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                CRM + Cold Mail
                <br />
                <span className="text-white/90">Made Simple</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto">
                The perfect tool for small business owners and freelancers. Manage contacts and send AI-powered cold emails that feel human.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="bg-white text-primary hover:bg-white/90 shadow-[var(--shadow-medium)] text-lg px-8 py-6"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/auth")}
                className="border-white text-white hover:bg-white/10 text-lg px-8 py-6"
              >
                Sign In
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16">
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-white">10</div>
                <div className="text-white/70 text-sm">Contacts</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-white">20</div>
                <div className="text-white/70 text-sm">Cold Emails</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-white">∞</div>
                <div className="text-white/70 text-sm">Possibilities</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold">Everything you need</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A powerful combination of CRM and cold email tools designed for simplicity and results
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 hover:border-primary transition-colors shadow-[var(--shadow-soft)]">
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Simple CRM</h3>
                <p className="text-muted-foreground">
                  Manage up to 10 contacts. Add them manually or automatically from email responses.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors shadow-[var(--shadow-soft)]">
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">AI-Powered Emails</h3>
                <p className="text-muted-foreground">
                  Generate human-like cold emails with Cohere AI. Warm sending to avoid spam filters.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors shadow-[var(--shadow-soft)]">
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Smart Campaigns</h3>
                <p className="text-muted-foreground">
                  Send up to 20 emails with 1-minute delays. Track responses with built-in CTA buttons.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Built for small businesses</h2>
              <p className="text-xl text-muted-foreground">
                All the features you need, none of the complexity
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                "No complex setup - start in minutes",
                "AI-generated content that sounds human",
                "Automatic spam filter optimization",
                "Track email opens and responses",
                "Add contacts from email CTAs",
                "MVP pricing - perfect for testing"
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-lg">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto border-2 border-primary shadow-[var(--shadow-medium)]">
            <CardContent className="p-12 text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to grow your business?
              </h2>
              <p className="text-xl text-muted-foreground">
                Start managing contacts and sending cold emails today
              </p>
              <Button 
                size="lg"
                onClick={() => navigate("/auth")}
                className="text-lg px-8 py-6"
              >
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-sm text-muted-foreground">
                MVP version • 10 contacts • 20 emails
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground">
            <p className="font-bold text-primary mb-2">COLDrm</p>
            <p className="text-sm">
              CRM + Cold Mail for Small Businesses
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
