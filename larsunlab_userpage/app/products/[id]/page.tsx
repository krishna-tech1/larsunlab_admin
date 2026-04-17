"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Package, ArrowLeft, ShieldCheck, Zap, Beaker } from "lucide-react";

const Footer = () => (
  <footer id="footer" className="bg-gray-50 pt-24 pb-12 px-6 sm:px-8">
    <div className="max-w-7xl mx-auto border-t border-gray-200 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
      <p className="text-sm text-gray-400 font-medium">© 2024 Larsunlab Pharmaceutical. All Rights Reserved.</p>
      <div className="flex gap-8">
        <Link href="#" className="text-xs font-black text-[#2b1e70] uppercase tracking-widest hover:text-orange-500 transition-colors">Privacy Policy</Link>
        <Link href="#" className="text-xs font-black text-[#2b1e70] uppercase tracking-widest hover:text-orange-500 transition-colors">Terms of Service</Link>
      </div>
    </div>
  </footer>
);

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImg, setCurrentImg] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`);
        if (!response.ok) {
           throw new Error("Product not found");
        }
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error("Fetch product error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product?.images?.length > 1) {
      const timer = setInterval(() => {
        setCurrentImg((prev) => (prev + 1) % product.images.length);
      }, 2000);
      return () => clearInterval(timer);
    }
  }, [product]);

  const nextImg = () => {
    setCurrentImg((prev) => (prev + 1) % product.images.length);
  };

  const prevImg = () => {
    setCurrentImg((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#2b1e70]/10 border-t-[#2b1e70] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <Beaker size={48} className="text-gray-200 mb-6" />
        <h2 className="text-2xl font-black text-[#2b1e70] mb-4 uppercase tracking-wider">Molecular Asset Not Located</h2>
        <Link href="/products" className="text-orange-500 font-black flex items-center gap-2 uppercase tracking-widest text-xs">
          <ArrowLeft size={16} /> Return to Pharmacopoeia
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/products" className="text-[#2b1e70] font-black text-xs uppercase tracking-[3px] flex items-center gap-2 sm:gap-4 group">
            <div className="p-2 sm:p-3 rounded-2xl bg-gray-50 group-hover:bg-[#2b1e70] group-hover:text-white transition-all shadow-sm">
              <ArrowLeft size={18} />
            </div>
            <span className="hidden sm:inline">Back to Catalog</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <div className="flex gap-4">
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-10 md:mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 mb-20">
          <div className="lg:col-span-7 space-y-8">
            <div className="relative aspect-[4/3] rounded-[32px] lg:rounded-[48px] overflow-hidden shadow-[0_40px_100px_-20px_rgba(43,30,112,0.15)] bg-gray-50 group border border-gray-100">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImg}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.7, ease: "circOut" }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={product.images?.[currentImg]?.url || "/products/placeholder.jpg"}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ width: "100%", height: "100%" }}
                    className="object-contain p-10"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {product.images?.length > 1 && (
                <>
                  <button onClick={prevImg} className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 p-3 lg:p-6 bg-white/20 backdrop-blur-xl text-[#2b1e70] rounded-2xl lg:rounded-3xl hover:bg-white hover:scale-110 transition-all sm:opacity-0 sm:group-hover:opacity-100 border border-white/40 shadow-xl">
                    <ChevronLeft size={24} className="lg:w-7 lg:h-7" />
                  </button>
                  <button onClick={nextImg} className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 p-3 lg:p-6 bg-white/20 backdrop-blur-xl text-[#2b1e70] rounded-2xl lg:rounded-3xl hover:bg-white hover:scale-110 transition-all sm:opacity-0 sm:group-hover:opacity-100 border border-white/40 shadow-xl">
                    <ChevronRight size={24} className="lg:w-7 lg:h-7" />
                  </button>
                </>
              )}
            </div>

            {product.images?.length > 1 && (
              <div className="flex gap-6 overflow-x-auto py-2 px-1 scrollbar-hide">
                {product.images.map((img: any, idx: number) => (
                  <button key={idx} onClick={() => setCurrentImg(idx)} className={`relative w-32 aspect-square rounded-[24px] overflow-hidden flex-shrink-0 transition-all duration-300 ${currentImg === idx ? "ring-4 ring-orange-400 ring-offset-4 scale-95 shadow-lg" : "opacity-40 grayscale hover:opacity-100 hover:grayscale-0 hover:scale-105"}`}>
                    <Image src={img.url} alt="" fill sizes="150px" style={{ width: "100%", height: "100%" }} className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-5 flex flex-col pt-4">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-5 py-1.5 rounded-full bg-indigo-50 text-[#2b1e70] text-[10px] font-black uppercase tracking-[2px] border border-indigo-100">{product.category}</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-black text-[#2b1e70] leading-[1.1] mb-8 break-words">{product.name}</h1>




          </div>
        </div>
        {/* FULL WIDTH DATA SHEET */}
        <div className="max-w-7xl mx-auto pt-16 md:pt-24 border-t border-gray-200 px-6 sm:px-8 bg-white">
          <div className="mb-20 md:mb-32">
            <h4 className="text-[11px] font-black uppercase tracking-[4px] md:tracking-[6px] text-[#2b1e70] mb-12 md:mb-16 flex items-center gap-4 md:gap-6">
              <div className="w-12 h-[2px] bg-orange-500" /> PRODUCT CLINICAL PROFILE
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
              {/* LEFT: COMPOSITION & OVERVIEW (SPANS 5 COLUMNS) */}
              <section className="lg:col-span-5 space-y-10">
                <div>
                  <span className="text-[11px] font-black text-orange-600 uppercase tracking-widest block mb-4">Chemical Composition</span>
                  <h2 className="text-4xl font-black text-[#2b1e70] mb-8 leading-tight">Description</h2>
                  <div className="bg-gray-50 p-6 sm:p-10 rounded-2xl sm:rounded-[32px] border border-gray-100 shadow-sm">
                    <p className="text-[#2b1e70] leading-relaxed text-lg sm:text-xl font-bold whitespace-pre-wrap italic break-words">
                      "{product.description || "Specifically engineered for high-efficacy molecular management and superior glycemic stability."}"
                    </p>
                  </div>
                </div>

                {/* PACK & STORAGE (COMPACT IN LEFT COL) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                  <div className="p-6 sm:p-8 bg-[#2b1e70] rounded-2xl sm:rounded-[32px] text-white flex justify-between items-center group shadow-xl shadow-indigo-50">
                    <div className="pr-4">
                      <span className="text-[10px] font-black text-white/50 uppercase tracking-widest block mb-1 break-words">Commercial Pack</span>
                      <p className="text-xl sm:text-2xl font-black break-words">{product.packSize || "1 x 10 Units"}</p>
                    </div>
                    <Package size={28} className="text-white/20 shrink-0" />
                  </div>

                  {product.storage && (
                    <div className="p-6 sm:p-8 bg-blue-50 border border-blue-100 rounded-2xl sm:rounded-[32px] flex items-start gap-4 shadow-sm">
                      <ShieldCheck className="text-blue-600 mt-1 flex-shrink-0" size={24} />
                      <div className="min-w-0">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-1 break-words">Storage Condition</span>
                        <p className="text-base sm:text-lg font-bold text-blue-900 leading-tight break-words">{product.storage}</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* RIGHT: CLINICAL DATA (SPANS 7 COLUMNS) */}
              <section className="lg:col-span-7 lg:border-l lg:border-gray-100 lg:pl-20 space-y-12 lg:space-y-20 pt-8 lg:pt-0">
                {product.indication && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-orange-500" />
                      <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Therapeutic Indication</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-black text-[#2b1e70] leading-snug whitespace-pre-wrap pl-6 break-words">{product.indication}</p>
                  </div>
                )}

                {product.modeOfAction && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-indigo-500" />
                      <span className="text-[11px] font-black text-gray-400 text-gray-600 uppercase tracking-widest">Mode Of Action</span>
                    </div>
                    <p className="text-base sm:text-lg text-gray-700 leading-relaxed whitespace-pre-wrap font-bold pl-6 border-l-2 border-gray-50 break-words">{product.modeOfAction}</p>
                  </div>
                )}

                {product.dosage && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-orange-600">
                      <Zap size={16} />
                      <span className="text-[11px] font-black uppercase tracking-widest">Dosage</span>
                    </div>
                    <div className="bg-gray-900 p-6 sm:p-10 rounded-3xl sm:rounded-[40px] text-gray-100 shadow-2xl">
                      <p className="text-lg sm:text-xl font-bold leading-relaxed whitespace-pre-wrap break-words">{product.dosage}</p>
                    </div>
                  </div>
                )}

                {/* GUIDES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-10 border-t border-gray-100">
                  {product.usageInstruction && (
                    <div className="space-y-4">
                      <span className="text-[11px] font-black text-[#2b1e70] uppercase tracking-widest block border-b-2 border-gray-50 pb-2">Usage Guide</span>
                      <p className="text-sm sm:text-base font-bold text-gray-600 leading-relaxed whitespace-pre-wrap break-words">{product.usageInstruction}</p>
                    </div>
                  )}
                  {product.precautions && (
                    <div className="space-y-4">
                      <span className="text-[11px] font-black text-red-600 uppercase tracking-widest block border-b-2 border-red-50 pb-2">Precautions</span>
                      <p className="text-sm sm:text-base font-bold text-gray-600 leading-relaxed whitespace-pre-wrap break-words">{product.precautions}</p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {product.disclaimer && (
              <div className="mt-16 lg:mt-24 p-6 lg:p-12 bg-gray-50 rounded-[24px] lg:rounded-[48px] border border-gray-100 relative overflow-hidden text-left shadow-inner">
                <div className="absolute top-0 left-0 w-2 h-full bg-orange-400" />
                <p className="text-sm text-gray-500 font-bold leading-relaxed whitespace-pre-wrap relative z-10 break-words">
                  <span className="font-black text-[#2b1e70] mr-4 uppercase tracking-[4px] text-[10px] block mb-4">LEGAL DISCLOSURE</span>
                  {product.disclaimer}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
