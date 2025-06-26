"use client";
import Image from "next/image";
import { Kanit } from "next/font/google";
import { useState } from "react";

const kanit = Kanit({ subsets: ["latin"], weight: ["400", "500", "700"] });

export default function StartNavbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={kanit.className}>
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[99] bg-black/60 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-[100] h-full w-full bg-white dark:bg-gray-900 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ willChange: "transform" }}
      >
        <div className="flex flex-col h-full p-8">
          <div className="flex items-center justify-between mb-8">
            <a className="block" href="/">
              <span className="sr-only">Home</span>
            </a>
            <button
              className="rounded-full bg-gray-100 p-2 text-gray-600 dark:bg-gray-800 dark:text-white"
              aria-label="Close menu"
              onClick={() => setSidebarOpen(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <nav aria-label="Sidebar" className="flex-1">
            <ul className="flex flex-col gap-6 text-lg">
              <li>
                <a
                  className="text-gray-900  hover:text-gray-500/75  transition"
                  href="/about"
                  onClick={() => setSidebarOpen(false)}
                >
                  About
                </a>
              </li>
              <li>
                <a
                  className="text-gray-900 dark:text-white hover:text-gray-500/75 dark:hover:text-white/75 transition"
                  href="/guidelines"
                  onClick={() => setSidebarOpen(false)}
                >
                  Guidelines
                </a>
              </li>
              <li>
                <a
                  className="text-gray-900 dark:text-white hover:text-gray-500/75 dark:hover:text-white/75 transition"
                  href="/reach"
                  onClick={() => setSidebarOpen(false)}
                >
                  Reach
                </a>
              </li>
              <li>
                <a
                  className="rounded-full bg-black px-6 py-3 text-lg font-medium text-white shadow-sm hover:bg-gray-800 transition flex items-center gap-2 justify-center mt-2"
                  href="#"
                  onClick={() => setSidebarOpen(false)}
                >
                  Start Pitching
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
      <header className="fixed top-6 left-1/2 z-50 -translate-x-1/2 rounded-full shadow-lg backdrop-blur-md  border-2 border-gray-100 px-8 py-2 w-[98vw] max-w-6xl  mx-auto">
        <div className="flex h-16 items-center justify-between relative">
          {/* Left padding for pill effect */}
          <div className="w-4 sm:w-8" />
          {/* Main content: logo, nav, button */}
          <div className="flex flex-1 items-center justify-between gap-8 px-4">
            {/* Logo */}
            <a className="block" href="/">
              <span className="sr-only">Home</span>
              <Image
                src="/outerAsset 14opaq-ful.svg"
                alt="Wide Logo"
                width={120}
                height={32}
                priority
              />
            </a>
            {/* Nav (hidden on sm/md) */}
            <nav aria-label="Global" className="hidden lg:block">
              <ul className="flex items-center gap-6 text-md">
                <li>
                  <a
                    className="text-gray-100  hover:font-bold transition-all duration-200 hover:text-gray-700 hover:bg-white hover:p-4 rounded-full"
                    href="/about"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    className="text-gray-100  hover:font-bold transition-all duration-200 hover:text-gray-700 hover:bg-white hover:p-4 rounded-full"
                    href="/guidelines"
                  >
                    Guidelines
                  </a>
                </li>
                <li>
                  <a
                    className="text-gray-100  hover:font-bold transition-all duration-200 hover:text-gray-700 hover:bg-white hover:p-4 rounded-full"
                    href="/reach"
                  >
                    Reach
                  </a>
                </li>
              </ul>
            </nav>
            {/* Button (hidden on sm/md) */}
            <div className="hidden lg:flex items-center gap-4">
              <a
                className="rounded-full bg-white px-5 py-2.5 text-md font-medium text-black shadow-sm hover:bg-transparent border-2 border-white hover:text-white transition ease-in-out duration-300 flex justify-center items-center gap-2"
                href="/sign-in"
              >
                <span className="flex items-center gap-2 w-full justify-center">
                  Start Pitching
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </a>
            </div>
          </div>
          {/* Right padding for pill effect */}
          <div className="w-4 sm:w-8" />
          {/* Hamburger pill button for sm/md */}
          <div className="block lg:hidden absolute right-6 top-1/2 -translate-y-1/2">
            <button
              className="rounded-full bg-white px-4 py-2 flex items-center gap-2 shadow hover:bg-gray-100 transition"
              aria-label="Open menu"
              onClick={() => setSidebarOpen(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}
