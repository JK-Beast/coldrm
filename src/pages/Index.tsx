import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Users, Zap, ArrowRight, CheckCircle2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Warning Banner */}
      <div className="bg-yellow-500/10 border-b-2 border-yellow-500/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <p className="text-center text-sm md:text-base font-medium text-yellow-700 dark:text-yellow-400">
            ⚠️ This is an MVP version and may contain bugs. Use for testing purposes only.
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{
        background: "var(--gradient-hero)",
        minHeight: "90vh"
      }}>
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>

        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-12">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white/90 text-sm font-medium mb-4">
                🚀 MVP Version - Perfect for Getting Started
              </div>
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-tight tracking-tight">
                CRM + Cold Mail
                <br />
                <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                  Made Simple
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                The perfect tool for small business owners and freelancers. Manage contacts and send AI-powered cold emails that actually get responses.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="bg-white text-primary hover:bg-white/90 hover:shadow-[var(--shadow-glow)] hover:scale-105 transition-all duration-300 text-lg px-10 py-7 font-semibold group"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/auth")}
                className="border-2 border-white/30 bg-white/5 text-white hover:bg-white/15 hover:border-white/50 backdrop-blur-md text-lg px-10 py-7 font-semibold"
              >
                Sign In
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-20">
              <div className="text-center space-y-3 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
                <div className="text-5xl font-bold text-white">10</div>
                <div className="text-white/80 font-medium">Contacts</div>
              </div>
              <div className="text-center space-y-3 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
                <div className="text-5xl font-bold text-white">20</div>
                <div className="text-white/80 font-medium">Cold Emails</div>
              </div>
              <div className="text-center space-y-3 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
                <div className="text-5xl font-bold text-white">∞</div>
                <div className="text-white/80 font-medium">Possibilities</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20 space-y-4 animate-fade-in">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Everything you need
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A powerful combination of CRM and cold email tools designed for simplicity and results
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-2 border-border hover:border-primary hover:shadow-[var(--shadow-glow)] transition-all duration-300 group hover:scale-105 bg-gradient-to-br from-card to-card/50">
              <CardContent className="pt-8 pb-8 space-y-6">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[var(--shadow-soft)] group-hover:shadow-[var(--shadow-medium)] transition-all">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Simple CRM</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Manage up to 10 contacts. Add them manually or automatically from email responses.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-border hover:border-primary hover:shadow-[var(--shadow-glow)] transition-all duration-300 group hover:scale-105 bg-gradient-to-br from-card to-card/50">
              <CardContent className="pt-8 pb-8 space-y-6">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[var(--shadow-soft)] group-hover:shadow-[var(--shadow-medium)] transition-all">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold">AI-Powered Emails</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Generate human-like cold emails with Cohere AI. Warm sending to avoid spam filters.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-border hover:border-primary hover:shadow-[var(--shadow-glow)] transition-all duration-300 group hover:scale-105 bg-gradient-to-br from-card to-card/50">
              <CardContent className="pt-8 pb-8 space-y-6">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[var(--shadow-soft)] group-hover:shadow-[var(--shadow-medium)] transition-all">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Smart Campaigns</h3>
                <p className="text-muted-foreground leading-relaxed">
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
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
        <div className="container mx-auto px-4 relative z-10">
          <Card className="max-w-4xl mx-auto border-2 border-primary shadow-[var(--shadow-glow)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 pointer-events-none"></div>
            <CardContent className="p-16 text-center space-y-8 relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight">
                Ready to grow your business?
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                Start managing contacts and sending cold emails today. No credit card required.
              </p>
              <Button 
                size="lg"
                onClick={() => navigate("/auth")}
                className="text-lg px-12 py-8 shadow-[var(--shadow-medium)] hover:shadow-[var(--shadow-glow)] hover:scale-105 transition-all duration-300 group font-semibold"
              >
                Create Free Account
                <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
              <div className="flex items-center justify-center gap-8 pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  10 contacts
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  20 emails
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  AI-powered
                </div>
              </div>
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
