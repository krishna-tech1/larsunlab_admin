"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";


const categories = ["All Events", "Conference", "Exhibition", "Internal"];



export default function EventsPage() {
  const [active, setActive] = useState("All Events");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`);
        const data = await response.json();
        if (response.ok) {
          setEvents(data);
        }
      } catch (error) {
        console.error("Fetch events error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filtered =
    active === "All Events"
      ? events
      : events.filter((e) =>
          e.type.toLowerCase().includes(active.toLowerCase()) ||
          (active === "Conference" && e.type.toLowerCase() === "conference")
        );

  return (
    <>
      <section className="bg-[#f4f5f9] py-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* TITLE */}
          <h1 className="text-[40px] md:text-[44px] font-extrabold text-[#2b1e70] leading-tight">
            Global Scientific Gatherings <br /> & Breakthroughs
          </h1>

          {/* FILTER BUTTONS */}
          <div className="flex gap-3 mt-6 flex-wrap">
            {categories.map((cat, i) => (
              <button
                key={i}
                onClick={() => setActive(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  active === cat
                    ? "bg-[#2b1e70] text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* GRID */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-[320px] animate-pulse shadow-sm" />
              ))
            ) : filtered.length === 0 ? (
              <div className="col-span-full py-20 text-center text-gray-500">
                <p>No scientific gatherings found in this category.</p>
              </div>
            ) : (
              filtered.map((item, i) => (
                <Link
                  href={`/eventss/${item.id}`}
                  key={i}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full border border-gray-100"
                >
                  {/* IMAGE - TOP */}
                  <div className="relative h-[260px] overflow-hidden">
                    <Image 
                      src={item.images?.[0]?.url || "/events/placeholder.jpg"} 
                      alt={item.title} 
                      fill 
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ width: "100%", height: "100%" }}
                      className="object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-[#2b1e70] rounded-lg tracking-wider uppercase">
                      {item.type}
                    </span>
                  </div>

                  {/* CONTENT - BELOW IMAGE */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-center text-[11px] font-bold text-orange-500 uppercase tracking-widest mb-2">
                     {item.endDate ? `${item.date} - ${item.endDate}` : item.date}
                    </div>

                    <h3 className="text-[#2b1e70] font-bold text-xl leading-tight mb-4 group-hover:text-orange-500 transition-colors">
                      {item.title}
                    </h3>

                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center gap-2 text-gray-500 text-sm font-medium">
                      <span className="text-orange-500">📍</span> {item.location}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>


    </>
  );
}
