"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, MessageSquare, Users, Sparkles } from "lucide-react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }, // Apple-like spring/easing
    },
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden flex flex-col transition-colors duration-500 font-inter">
      {/* Subtle Liquid/Glass Background - Monochrome & Minimal */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-foreground/5 rounded-[40%_60%_70%_30%] blur-[80px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, -90, 0],
            opacity: [0.3, 0.4, 0.3]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-foreground/5 rounded-[60%_40%_30%_70%] blur-[100px]"
        />
      </div>

      {/* Navbar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-4 sm:gap-6 bg-surface/90 dark:bg-surface/10 backdrop-blur-3xl px-3 sm:px-6 py-2 sm:py-3 rounded-full border border-foreground/10 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
          <span className="font-semibold text-lg tracking-tight text-foreground pl-2">LeadsArk</span>

          <div className="hidden md:block w-[1px] h-5 bg-foreground/10"></div>

          <div className="hidden md:flex items-center gap-6 font-medium text-sm text-foreground/60">
            <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="#testimonials" className="hover:text-foreground transition-colors">Stories</Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          </div>

          <div className="w-[1px] h-5 bg-foreground/10"></div>

          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeSwitcher />
            <Link
              href="/login"
              className="px-5 py-2 bg-foreground text-background rounded-full font-medium text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center pt-40 pb-20 px-6 relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full glass-panel border-foreground/10 text-foreground/70 font-medium text-xs tracking-wide">
            <span className="w-2 h-2 rounded-full bg-foreground/40 animate-pulse"></span>
            The new standard for CRM
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-semibold text-foreground tracking-tighter leading-[0.95] mb-8">
            Manage leads. <br className="hidden md:block" />
            <span className="text-foreground/40">Beautifully.</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-foreground/50 max-w-2xl mx-auto mb-12 font-medium tracking-tight">
            A fluid, intuitive workspace designed to keep you focused on what matters: closing deals and building relationships.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="px-8 py-4 bg-foreground text-background rounded-2xl font-semibold text-lg flex items-center gap-2 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.2)] transition-all hover:-translate-y-1 active:scale-95"
            >
              Get Started <ArrowRight size={20} />
            </Link>
          </motion.div>
        </motion.div>

        {/* Minimalist Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.8, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-24 w-full max-w-5xl rounded-[2.5rem] glass-panel p-3 border border-foreground/10 shadow-[0_24px_80px_rgba(0,0,0,0.07)] relative overflow-hidden"
        >
          <div className="w-full aspect-[16/10] md:aspect-[16/9] bg-surface rounded-[2rem] overflow-hidden flex flex-col relative border border-border">
            {/* Mac-style Window Controls */}
            <div className="h-14 border-b border-border flex items-center px-6 gap-2 bg-surface-hover/30">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] shadow-sm"></div>
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] shadow-sm"></div>
              <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] shadow-sm"></div>
            </div>

            {/* Clean UI Mockup */}
            <div className="flex flex-1 p-6 gap-6">
              {/* Sidebar Mockup */}
              <div className="w-48 hidden md:flex flex-col gap-2">
                <div className="flex items-center gap-3 p-2 bg-foreground/5 rounded-lg border border-foreground/5">
                  <div className="w-4 h-4 rounded bg-teal-500/80"></div>
                  <div className="w-16 h-2 bg-foreground/20 rounded-full"></div>
                </div>
                <div className="flex items-center gap-3 p-2">
                  <div className="w-4 h-4 rounded bg-foreground/10"></div>
                  <div className="w-20 h-2 bg-foreground/10 rounded-full"></div>
                </div>
                <div className="flex items-center gap-3 p-2">
                  <div className="w-4 h-4 rounded bg-foreground/10"></div>
                  <div className="w-14 h-2 bg-foreground/10 rounded-full"></div>
                </div>
                <div className="flex items-center gap-3 p-2">
                  <div className="w-4 h-4 rounded bg-foreground/10"></div>
                  <div className="w-24 h-2 bg-foreground/10 rounded-full"></div>
                </div>
              </div>

              {/* Main Content Mockup */}
              <div className="flex-1 flex flex-col gap-6">
                <div className="flex gap-4">
                  {/* Card 1 */}
                  <div className="flex-1 h-32 bg-foreground/[0.02] rounded-2xl border border-border flex flex-col p-4 relative overflow-hidden group">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    </div>
                    <div className="text-xl font-bold text-foreground">1,204</div>
                    <div className="text-xs text-foreground/50">Active Users</div>
                    <svg className="absolute bottom-0 left-0 w-full h-12" preserveAspectRatio="none" viewBox="0 0 100 40">
                      <path d="M0 40 L0 30 Q 10 20 20 25 T 40 10 T 60 15 T 80 5 T 100 0 L 100 40 Z" fill="rgba(59, 130, 246, 0.1)" />
                      <path d="M0 30 Q 10 20 20 25 T 40 10 T 60 15 T 80 5 T 100 0" fill="none" stroke="rgba(59, 130, 246, 0.8)" strokeWidth="2" />
                    </svg>
                  </div>

                  {/* Card 2 */}
                  <div className="flex-1 h-32 bg-foreground/[0.02] rounded-2xl border border-border flex flex-col p-4 relative overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mb-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    </div>
                    <div className="text-xl font-bold text-foreground">$12.4k</div>
                    <div className="text-xs text-foreground/50">Revenue</div>
                    <svg className="absolute bottom-0 left-0 w-full h-12" preserveAspectRatio="none" viewBox="0 0 100 40">
                      <path d="M0 40 L0 35 Q 10 30 20 30 T 40 20 T 60 25 T 80 15 T 100 5 L 100 40 Z" fill="rgba(168, 85, 247, 0.1)" />
                      <path d="M0 35 Q 10 30 20 30 T 40 20 T 60 25 T 80 15 T 100 5" fill="none" stroke="rgba(168, 85, 247, 0.8)" strokeWidth="2" />
                    </svg>
                  </div>

                  {/* Card 3 */}
                  <div className="flex-1 h-32 bg-foreground/[0.02] rounded-2xl border border-border hidden sm:flex flex-col p-4 relative overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center mb-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    </div>
                    <div className="text-xl font-bold text-foreground">84%</div>
                    <div className="text-xs text-foreground/50">Conversion Rate</div>
                    <svg className="absolute bottom-0 left-0 w-full h-12" preserveAspectRatio="none" viewBox="0 0 100 40">
                      <path d="M0 40 L0 25 Q 10 30 20 20 T 40 25 T 60 10 T 80 15 T 100 5 L 100 40 Z" fill="rgba(249, 115, 22, 0.1)" />
                      <path d="M0 25 Q 10 30 20 20 T 40 25 T 60 10 T 80 15 T 100 5" fill="none" stroke="rgba(249, 115, 22, 0.8)" strokeWidth="2" />
                    </svg>
                  </div>
                </div>

                {/* Main Large Chart */}
                <div className="flex-1 bg-foreground/[0.02] rounded-2xl border border-border p-6 flex flex-col relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="text-sm font-medium text-foreground/50 mb-1">Total Leads (30 Days)</div>
                      <div className="text-2xl font-semibold text-foreground tracking-tight">2,481</div>
                    </div>
                    <div className="text-xs font-medium text-teal-600 bg-teal-500/10 px-2.5 py-1 rounded-full">+14.2%</div>
                  </div>

                  {/* CSS Bar Chart */}
                  <div className="flex-1 flex items-end gap-3 md:gap-4 pt-4">
                    {[30, 45, 25, 60, 40, 85, 55, 75, 45, 90, 65, 100].map((val, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${val}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 1 + (i * 0.05), duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="flex-1 bg-gradient-to-t from-teal-500/20 to-teal-400/80 rounded-t-md relative group hover:opacity-80 transition-opacity"
                      >
                        {/* Peak line */}
                        <div className="absolute -top-1 left-0 right-0 h-1 bg-teal-400 rounded-full shadow-[0_0_8px_rgba(45,212,191,0.6)]"></div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Soft fade overlay at bottom */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-surface to-transparent"></div>
          </div>
        </motion.div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-semibold text-foreground tracking-tight mb-6">Pro tools. <br /> Zero clutter.</h2>
            <p className="text-xl text-foreground/50 max-w-2xl mx-auto tracking-tight">Everything you need to manage your business, wrapped in an interface that feels invisible.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="text-foreground" size={24} />,
                title: "Fluid Pipelines",
                desc: "Drag, drop, and manage leads with buttery smooth interactions."
              },
              {
                icon: <MessageSquare className="text-foreground" size={24} />,
                title: "Unified Chat",
                desc: "All your customer conversations, distilled into one clean view."
              },
              {
                icon: <BarChart3 className="text-foreground" size={24} />,
                title: "Clear Insights",
                desc: "Understand your metrics instantly without overwhelming dashboards."
              }
            ].map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="glass-panel p-8 rounded-[2rem] border border-foreground/5 hover:bg-foreground/[0.02] transition-colors duration-500"
              >
                <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center mb-6">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-semibold text-foreground tracking-tight mb-3">{feat.title}</h3>
                <p className="text-foreground/50 leading-relaxed font-medium">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border mt-auto relative z-10">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-sm text-foreground/40 font-medium">
          <p>© {new Date().getFullYear()} LeadsArk. Designed with care.</p>
          <div className="flex gap-8 mt-6 md:mt-0">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
