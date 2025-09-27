"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Shield, Users, Zap, TrendingUp, Lock } from "lucide-react";

const chitFundFeatures = [
  {
    title: "Smart Contract Security",
    description:
      "All funds secured by audited Ethereum smart contracts with complete transparency and automated execution",
    icon: Shield,
    src: "/blockchain-ecosystem.png",
    color: "from-emerald-500 to-teal-600",
  },
  {
    title: "Community Governance",
    description:
      "Decentralized decision-making with voting on fund parameters, proposals, and dispute resolution",
    icon: Users,
    src: "/contribute-earn-network.png",
    color: "from-blue-500 to-indigo-600",
  },
  {
    title: "Instant Settlements",
    description:
      "Lightning-fast automated bidding, instant payouts, and real-time fund management powered by blockchain",
    icon: Zap,
    src: "/defi-piggy-bank.png",
    color: "from-purple-500 to-pink-600",
  },
  {
    title: "Investment Growth",
    description:
      "Track your investments, participate in profitable chit fund cycles, and maximize your returns",
    icon: TrendingUp,
    src: "/defi-piggy-bank.png",
    color: "from-orange-500 to-red-600",
  },
  {
    title: "Decentralized Finance",
    description:
      "Experience true DeFi without intermediaries, traditional banking limits, or centralized control",
    icon: Lock,
    src: "/blockchain-ecosystem.png",
    color: "from-green-500 to-emerald-600",
  },
];

const CheatFundFeatureCard = ({
  i,
  title,
  description,
  icon: Icon,
  src,
  color,
  progress,
  range,
  targetScale,
}: {
  i: number;
  title: string;
  description: string;
  icon: any;
  src: string;
  color: string;
  progress: any;
  range: [number, number];
  targetScale: number;
}) => {
  const container = useRef<HTMLDivElement>(null);
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div
      ref={container}
      className="sticky top-0 flex items-center justify-center"
    >
      <motion.div
        style={{
          scale,
          top: `calc(-5vh + ${i * 20 + 250}px)`,
        }}
        className="bg-card border-border/50 relative -top-1/4 flex h-[400px] w-[700px] max-w-[90vw] origin-top flex-col overflow-hidden rounded-3xl border shadow-2xl"
      >
        <div className="relative h-full w-full">
          {/* Background image with fallback */}
          <img
            src={src || "/placeholder.svg"}
            alt={title}
            className="h-full w-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
            }}
          />
          <div
            className={`absolute inset-0 bg-gradient-to-br ${color} opacity-30`}
          />

          {/* Content overlay */}
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent p-8">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/20 backdrop-blur-sm">
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-balance text-white">
                {title}
              </h3>
            </div>
            <p className="max-w-lg text-lg leading-relaxed text-pretty text-white/90">
              {description}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const CheatFundFeatureStack = () => {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  return (
    <main
      ref={container}
      className="bg-background relative flex w-full flex-col items-center justify-center pt-[50vh] pb-[100vh]"
    >
      <div className="absolute top-[8%] left-1/2 z-10 grid -translate-x-1/2 content-start justify-items-center gap-6 px-4 text-center">
        <div className="max-w-3xl">
          <h2 className="text-foreground mb-6 text-4xl font-bold text-balance lg:text-5xl">
            Experience the Future of
            <span className="text-primary"> Chit Funds</span>
          </h2>
          <p className="text-muted-foreground mb-8 text-lg leading-relaxed text-balance lg:text-xl">
            Discover how blockchain technology transforms traditional chit funds
            into secure, transparent, and efficient financial instruments for
            the Web3 era.
          </p>
        </div>
        <span className="after:from-muted-foreground relative max-w-[16ch] text-xs leading-tight font-medium tracking-wider uppercase opacity-60 after:absolute after:top-full after:left-1/2 after:h-16 after:w-px after:bg-gradient-to-b after:to-transparent after:content-['']">
          scroll down to explore features
        </span>
      </div>

      {chitFundFeatures.map((feature, i) => {
        const targetScale = Math.max(
          0.5,
          1 - (chitFundFeatures.length - i - 1) * 0.1,
        );
        return (
          <CheatFundFeatureCard
            key={`feature_${i}`}
            i={i}
            {...feature}
            progress={scrollYProgress}
            range={[i * 0.25, 1]}
            targetScale={targetScale}
          />
        );
      })}
    </main>
  );
};

export { CheatFundFeatureStack, CheatFundFeatureCard };
