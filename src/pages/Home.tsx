import React from "react";
import { ArrowRight, Phone, MessageSquare, ShieldCheck } from "lucide-react";
import FeaturesAndStatsSection from "../components/FeaturesAndStatsSection";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const HeroSection: React.FC = () => {
  return (
    <>
      <Navbar />
      <div
        className="relative flex min-h-screen w-full items-end bg-cover bg-center  text-white"
        style={{ backgroundImage: "url('/src/assets/landing/bg-image.jpg')" }}
      >
        {/* Dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/60" />

        <main className="relative z-10  max-w-7xl mx-auto px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pb-24">
          <div className="grid grid-cols-1 items-end gap-12 lg:grid-cols-2">
            <div className="flex flex-col items-start gap-y-6 text-left">
              <div className="inline-flex items-center space-x-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium">
                <ShieldCheck className="text-blue-400" size={18} />
                <span>11K+ Permanent & Satisfied Users</span>
              </div>
              <h1 className="text-2xl font-bold text-white md:text-3xl lg:text-5xl tracking-wider">
                Your AI-Powered Prescription Companion
              </h1>
              <p className="text-lg text-white/80">
                MediiMate AI ensures you take the right dose, at the right time,
                in the right way—personalized to your health needs.
              </p>
              <a
                href="#"
                className="group mt-4 inline-flex items-center justify-center space-x-2 rounded-lg bg-white px-6 py-3.5 text-base font-semibold text-gray-800 shadow-lg transition hover:bg-gray-200"
              >
                <span>Get Started for Free</span>
                <ArrowRight
                  size={20}
                  className="transition-transform group-hover:translate-x-1"
                />
              </a>
            </div>

            {/* Right Column: Glassmorphism Card - Adjusted for bottom-right alignment */}
            <div className="flex justify-start lg:justify-end">
              {" "}
              {/* Use justify-start on small, justify-end on large screens */}
              <div className="w-full max-w-sm space-y-4 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-lg">
                {/* Top part of the card */}
                <div className="flex items-center space-x-4">
                  <div className="flex -space-x-2 overflow-hidden">
                    <img
                      className="inline-block h-10 w-10 rounded-full ring-2 ring-white/20"
                      src="https://i.pravatar.cc/150?img=1"
                      alt="User 1"
                    />
                    <img
                      className="inline-block h-10 w-10 rounded-full ring-2 ring-white/20"
                      src="https://i.pravatar.cc/150?img=2"
                      alt="User 2"
                    />
                    <img
                      className="inline-block h-10 w-10 rounded-full ring-2 ring-white/20"
                      src="https://i.pravatar.cc/150?img=3"
                      alt="User 3"
                    />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">54%</p>
                    <p className="text-xs font-light text-white/80">
                      OF USERS IMPROVED ADHERENCE
                    </p>
                  </div>
                </div>

                {/* Bottom part of the card */}
                <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                  <div className="flex flex-col items-center gap-2 rounded-lg p-2">
                    <p className="text-[10px] font-bold tracking-wider text-white/70">
                      TELEHEALTH
                    </p>
                    <p className="text-[10px] text-white/60">
                      15 MINUTE REPLIES
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-2 rounded-lg bg-white/20 p-2">
                    <p className="text-[10px] font-bold tracking-wider text-white">
                      SMART SCHEDULING
                    </p>
                    <MessageSquare size={16} className="mt-1" />
                  </div>
                  <div className="flex flex-col items-center gap-2 rounded-lg p-2">
                    <p className="text-[10px] font-bold tracking-wider text-white/70">
                      24/7 SUPPORT
                    </p>
                    <Phone size={16} className="mt-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <div>
        <FeaturesAndStatsSection />
      </div>
      <div>
        <Footer />
      </div>
    </>
  );
};

export default HeroSection;
