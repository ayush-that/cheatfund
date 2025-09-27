import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  ArrowRight,
  Shield,
  Users,
  Zap,
  Wallet,
  TrendingUp,
  Lock,
} from "lucide-react";
import { CheatFundFeatureStack } from "~/components/sticky-cards";
import { Footer } from "~/components/footer";
import { TubelightNavbar } from "~/components/tubelight-navbar";
import { EnhancedHero } from "~/components/enhanced-hero";

export default function LandingPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <TubelightNavbar />

      {/* Hero Section */}
      <EnhancedHero />

      {/* Sticky Card Animation Section */}
      <section className="relative min-h-screen">
        <CheatFundFeatureStack />
      </section>

      {/* Features Grid */}
      <section id="features" className="bg-muted/30 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-balance">
              Built for the Future of Finance
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-balance">
              Experience chit funds reimagined with blockchain technology, smart
              contracts, and decentralized governance.
            </p>
          </div>

          <div className="mb-16 flex justify-center">
            <div className="relative w-full max-w-md">
              <img
                src="/blockchain-ecosystemx.png"
                alt="Blockchain ecosystem with Ethereum and decentralized components"
                className="h-auto w-full"
              />
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="p-6">
                <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                  <Shield className="text-primary h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  Smart Contract Security
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  All funds are secured by audited Ethereum smart contracts. No
                  intermediaries, complete transparency, and automated
                  execution.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="p-6">
                <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                  <Users className="text-primary h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  Community Governance
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Participate in decentralized decision-making. Vote on fund
                  parameters, dispute resolution, and community proposals.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="p-6">
                <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                  <Zap className="text-primary h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  Instant Settlements
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Automated bidding, instant payouts, and real-time fund
                  management. Experience the speed of decentralized finance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-balance">
              Simple. Transparent. Decentralized.
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-balance">
              Join or create chit funds in three simple steps. No paperwork, no
              middlemen, just pure Web3 innovation.
            </p>
          </div>

          <div className="mb-16 flex justify-center">
            <div className="relative w-full max-w-lg">
              <img
                src="/images/contribute-earn-network.png"
                alt="Decentralized network showing contribute and earn workflow"
                className="h-auto w-full"
              />
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="text-center">
              <div className="bg-primary mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
                <Wallet className="text-primary-foreground h-8 w-8" />
              </div>
              <h3 className="mb-4 text-xl font-semibold">
                Connect Your Wallet
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Connect your Ethereum wallet to get started. Support for
                MetaMask, WalletConnect, and other popular wallets.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
                <Users className="text-primary-foreground h-8 w-8" />
              </div>
              <h3 className="mb-4 text-xl font-semibold">
                Join or Create Funds
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Browse existing chit funds or create your own. Set parameters,
                invite participants, and launch your fund.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
                <TrendingUp className="text-primary-foreground h-8 w-8" />
              </div>
              <h3 className="mb-4 text-xl font-semibold">Participate & Earn</h3>
              <p className="text-muted-foreground leading-relaxed">
                Place bids, make deposits, and receive payouts automatically.
                Track your investments in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="bg-muted/30 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="order-2 lg:order-1">
                <div className="bg-primary/10 mb-8 flex h-20 w-20 items-center justify-center rounded-full">
                  <Lock className="text-primary h-10 w-10" />
                </div>

                <h2 className="mb-6 text-3xl font-bold text-balance">
                  Finance without the middleman.
                </h2>

                <p className="text-muted-foreground mb-8 text-xl leading-relaxed text-balance">
                  Experience true decentralized finance. Our smart contracts
                  eliminate intermediaries while ensuring complete security and
                  transparency for all participants.
                </p>

                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Read Security Audit
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="order-1 lg:order-2">
                <img
                  src="/images/defi-piggy-bank.png"
                  alt="DeFi piggy bank with hands contributing to decentralized finance"
                  className="mx-auto h-auto w-full max-w-md"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-primary mb-2 text-3xl font-bold">$50M+</div>
              <div className="text-muted-foreground">Total Value Locked</div>
            </div>
            <div className="text-center">
              <div className="text-primary mb-2 text-3xl font-bold">
                10,000+
              </div>
              <div className="text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-primary mb-2 text-3xl font-bold">500+</div>
              <div className="text-muted-foreground">Chit Funds Created</div>
            </div>
            <div className="text-center">
              <div className="text-primary mb-2 text-3xl font-bold">99.9%</div>
              <div className="text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-balance">
            Ready to revolutionize your finances?
          </h2>
          <p className="text-primary-foreground/80 mx-auto mb-8 max-w-2xl text-xl text-balance">
            Join thousands of users already participating in the future of
            community finance.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="bg-background text-foreground hover:bg-background/90"
          >
            Get Started Today
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
