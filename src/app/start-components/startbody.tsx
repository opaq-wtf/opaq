"use client";
import Image from "next/image";
import React from "react";

export default function StartBody() {
  return (
    <div
      style={{
        minHeight: "0", // allow shrinking if needed
        backgroundImage: "url('https://forcdn.pages.dev/assets/retro.png')", // Added bg image
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        fontFamily: "'Kanit', sans-serif",
        zIndex: 0,
      }}
      className="w-full relative flex-1 flex items-center justify-center bg-gray-900 text-white"
    >
      {/* Black translucent frozen glass overlay */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-lg backdrop-saturate-150 z-0 pointer-events-none" />
      {/* Translucent blurred glass overlay */}
      
      <section className="w-full flex items-center justify-center relative z-10">
        <div className="mx-auto max-w-6xl px-8 py-2 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
            <div className="md:col-span-2 flex flex-col justify-center">
              <div className="max-w-2xl">
                <h1 className="text-6xl sm:text-2xl md:text-4xl lg:text-6xl font-bold text-white flex flex-wrap gap-x-1 items-center">
                    <span className="inline-block transition-all duration-300 ease-in-out hover:scale-108 font-bold group relative">
                    Open Playground for
                    </span>
                    <span className="inline-block" style={{ minWidth: "0.8em" }} />
                    <span className="inline-block transition-all duration-300 ease-in-out hover:scale-110">
                    Advance Quests
                    </span>
                </h1>
                <p className="my-6 text-2xl text-gray-200">
                  Hack Till It Hertz. Your playground to break things, build better, and conquer quests.
                </p>
                {/* Start Pitching Button */}
                <a
                  href="#"
                  className="mt-6 inline-flex px-8 py-2 rounded-full border-2 border-white hover:bg-white text-white hover:text-black font-semibold text-lg shadow transition items-center gap-2 w-auto"
                  role="button"
                  style={{ width: "auto" }}
                >
                  Start Pitching
                  <span aria-hidden="true" style={{ display: "inline-block", marginLeft: "0.5em" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="4" y1="12" x2="20" y2="12" />
                      <polyline points="14 6 20 12 14 18" />
                    </svg>
                  </span>
                </a>
              </div>
            </div>
            <div className="md:col-span-1 flex justify-center py-2 relative">
              <Image
                src="https://forcdn.pages.dev/assets/eyes-grey.gif"
                className="rounded-xl shadow-lg max-h-96"
                alt="Animated eyes"
                style={{ display: "block" }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
