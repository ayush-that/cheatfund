// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  ArrowRight,
  Play,
  Sparkles,
  TrendingUp,
  Shield,
  Users,
} from "lucide-react";
import { useState } from "react";

const EnhancedHero = () => {
  const [isHovered, setIsHovered] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  };

  return (
    <section className="relative overflow-hidden py-20 pt-32 lg:py-32">
      {/* Background Elements */}
      <div className="from-primary/5 to-secondary/5 absolute inset-0 bg-gradient-to-br via-transparent" />

      {/* Animated Background Orbs */}
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="bg-primary/10 absolute top-20 left-10 h-72 w-72 rounded-full blur-3xl"
      />
      <motion.div
        variants={floatingVariants}
        animate="animate"
        style={{ animationDelay: "2s" }}
        className="bg-secondary/10 absolute right-10 bottom-20 h-96 w-96 rounded-full blur-3xl"
      />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-5xl text-center"
        >
          {/* Announcement Badge */}
          <motion.div variants={itemVariants}>
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 group mb-8 cursor-pointer px-6 py-2 text-sm font-medium transition-colors"
            >
              <motion.span
                className="bg-primary mr-3 h-2 w-2 rounded-full transition-transform group-hover:scale-110"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              />
              <Sparkles className="mr-2 h-4 w-4" />
              Announcing $2M in Seed Funding
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Badge>
          </motion.div>

          {/* Main Headline */}
          <motion.div variants={itemVariants}>
            <h1 className="mb-8 text-5xl leading-tight font-bold text-balance sm:text-6xl lg:text-7xl">
              <span className="from-foreground to-foreground/80 bg-gradient-to-r bg-clip-text text-transparent">
                Decentralized Chit Funds
              </span>
              <br />
              <span className="from-primary via-primary to-secondary bg-gradient-to-r bg-clip-text text-transparent">
                for Web3 Communities
              </span>
            </h1>
          </motion.div>

          {/* Description */}
          <motion.div variants={itemVariants}>
            <p className="text-muted-foreground mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-balance lg:text-2xl">
              Join the future of community finance. Create, participate, and
              manage chit funds with complete transparency through{" "}
              <span className="text-primary font-semibold">
                Ethereum smart contracts
              </span>
              .
            </p>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            variants={itemVariants}
            className="mb-12 flex flex-wrap justify-center gap-4"
          >
            {[
              { icon: Shield, text: "Audited Smart Contracts" },
              { icon: Users, text: "Community Governed" },
              { icon: TrendingUp, text: "Instant Settlements" },
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-card/50 border-border/50 flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium backdrop-blur"
              >
                <feature.icon className="text-primary h-4 w-4" />
                {feature.text}
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants}>
            <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
              >
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground group relative overflow-hidden rounded-xl px-8 py-4 text-lg font-semibold shadow-lg transition-all duration-300 hover:shadow-xl"
                >
                  <motion.div
                    className="from-primary/20 to-secondary/20 absolute inset-0 bg-gradient-to-r"
                    initial={{ x: "-100%" }}
                    animate={{ x: isHovered ? "100%" : "-100%" }}
                    transition={{ duration: 0.6 }}
                  />
                  <span className="relative z-10 flex items-center">
                    Launch App
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="hover:bg-muted/50 group rounded-xl border-2 bg-transparent px-8 py-4 text-lg font-semibold transition-all duration-300"
                >
                  <Play className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                  Watch Demo
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div variants={itemVariants} className="mt-16">
            <p className="text-muted-foreground mb-6 text-sm font-medium">
              Trusted by leading Web3 communities
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
              {["Ethereum", "Polygon", "Arbitrum", "Optimism"].map(
                (network, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ opacity: 1, scale: 1.1 }}
                    className="cursor-pointer text-lg font-semibold tracking-wide transition-all"
                  >
                    {network}
                  </motion.div>
                ),
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Gradient */}
      <div className="from-background absolute right-0 bottom-0 left-0 h-32 bg-gradient-to-t to-transparent" />
    </section>
  );
};

export { EnhancedHero };
