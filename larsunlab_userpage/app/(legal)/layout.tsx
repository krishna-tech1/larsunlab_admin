import React from "react";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1 bg-[#f7f8fc]">
      {/* Hero Header Section */}
      <div className="bg-[#2b1e70] text-white py-12 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-gray-300 mb-4 uppercase tracking-wider">
            <a href="/" className="hover:text-white transition-colors">Home</a>
            <span>/</span>
            <span className="text-white font-medium">Legal Information</span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            Legal & Compliance
          </h1>
          <p className="mt-4 text-lg text-gray-300 max-w-2xl">
            At Larsun Labs, we are committed to transparency, regulatory excellence, and the highest standards of pharmaceutical integrity.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-16">
        <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 p-5 md:p-12">
          {children}
        </div>


      </div>
    </main>
  );
}
