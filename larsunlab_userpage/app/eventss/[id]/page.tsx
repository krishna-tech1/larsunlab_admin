"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, Calendar, Clock, ArrowLeft } from "lucide-react";

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImg, setCurrentImg] = useState(0);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`);
        const data = await response.json();
        // Backend returns array, find the specific one
        const found = data.find((e: any) => e.id === id);
        if (found) {
          setEvent(found);
        }
      } catch (error) {
        console.error("Fetch event error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  // Auto-play Slider - 2 seconds
  useEffect(() => {
    if (event?.images?.length > 1) {
      const timer = setInterval(() => {
        setCurrentImg((prev) => (prev + 1) % event.images.length);
      }, 2000);
      return () => clearInterval(timer);
    }
  }, [event]);

  const nextImg = () => {
    setCurrentImg((prev) => (prev + 1) % event.images.length);
  };

  const prevImg = () => {
    setCurrentImg((prev) => (prev === 0 ? event.images.length - 1 : prev - 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#2b1e70]/20 border-t-[#2b1e70] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-[#2b1e70] mb-4">Event Breakthrough Not Found</h2>
        <Link href="/eventss" className="text-orange-500 font-bold flex items-center gap-2">
          <ArrowLeft size={18} /> Return to Gatherings
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* NAVIGATION BAR */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/eventss" className="text-[#2b1e70] font-bold text-sm flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-orange-500 group-hover:text-white transition-all">
              <ArrowLeft size={16} />
            </div>
            Back to Events
          </Link>
          <div className="bg-orange-50 px-4 py-1.5 rounded-full text-[10px] font-black text-orange-600 uppercase tracking-widest border border-orange-100">
            {event.type}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* LEFT: SLIDER SECTION */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative h-[300px] md:h-[480px] rounded-[32px] overflow-hidden shadow-2xl bg-gray-100 group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImg}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={event.images?.[currentImg]?.url || "/events/placeholder.jpg"}
                    alt={event.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* OVERLAY CONTROLS */}
              {event.images?.length > 1 && (
                <>
                  <button
                    onClick={prevImg}
                    className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-white/10 backdrop-blur-md text-white rounded-2xl hover:bg-white hover:text-[#2b1e70] transition-all opacity-0 group-hover:opacity-100 border border-white/20"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImg}
                    className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-white/10 backdrop-blur-md text-white rounded-2xl hover:bg-white hover:text-[#2b1e70] transition-all opacity-0 group-hover:opacity-100 border border-white/20"
                  >
                    <ChevronRight size={24} />
                  </button>

                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                    {event.images.map((_: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImg(idx)}
                        className={`h-1.5 transition-all rounded-full ${currentImg === idx ? "w-8 bg-white" : "w-2 bg-white/40"
                          }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* THUMBNAILS */}
            {event.images?.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {event.images.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImg(idx)}
                    className={`relative w-24 h-20 rounded-2xl overflow-hidden flex-shrink-0 transition-all ${currentImg === idx ? "ring-2 ring-orange-500 ring-offset-2" : "opacity-60 grayscale hover:grayscale-0"
                      }`}
                  >
                    <Image src={img.url} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: DETAILS SECTION */}
          <div className="lg:col-span-5 py-2">
            <h1 className="text-3xl lg:text-5xl font-extrabold text-[#2b1e70] leading-tight mb-6 break-words">
              {event.title}
            </h1>

            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-orange-500">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-0.5">Event Date</p>
                  <p className="font-bold text-[#2b1e70]">
                    {event.endDate ? `${event.date} - ${event.endDate}` : event.date}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-orange-500">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-0.5">Event Venue</p>
                  <p className="font-bold text-[#2b1e70]">{event.location}</p>
                </div>
              </div>
            </div>

            <div className="prose prose-slate max-w-none">
              <h4 className="text-sm font-black uppercase tracking-[3px] text-gray-400 mb-4">The Event Highlights</h4>
              <p className="text-gray-600 leading-relaxed text-lg italic border-l-4 border-orange-500 pl-6 py-2 bg-orange-50/30 rounded-r-2xl whitespace-pre-wrap">
                {event.description || "Join us in this groundbreaking scientific clinical event to witness the future of precision medical breakthroughs."}
              </p>
            </div>

            <div className="mt-10 pt-10 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Share Breakthrough</p>
                <div className="flex gap-4 mt-2">
                  {/* Mock Social Links */}
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-[#2b1e70] hover:text-white transition-all cursor-pointer font-bold text-xs leading-none pt-0.5">f</div>
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-[#2b1e70] hover:text-white transition-all cursor-pointer font-bold text-xs leading-none pt-0.5">in</div>
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-[#2b1e70] hover:text-white transition-all cursor-pointer font-bold text-xs leading-none pt-0.5">x</div>
                </div>
              </div>

              <button
                onClick={() => document.getElementById("footer")?.scrollIntoView({ behavior: "smooth" })}
                className="px-8 py-4 bg-[#2b1e70] text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 hover:scale-[1.05] active:scale-[0.95] transition-all"
              >
                Enquire Now
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
