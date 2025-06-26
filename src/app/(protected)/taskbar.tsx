"use client";

import { useState } from "react";

export function Taskbar() {
    const [collapsed, setCollapsed] = useState(false);
    // Track if user manually toggled collapse
    const [manuallyCollapsed, setManuallyCollapsed] = useState(false);

    // Handlers for hover
    const handleMouseEnter = () => setCollapsed(false);
    const handleMouseLeave = () => {
        if (manuallyCollapsed) setCollapsed(true);
    };

    return (
        <div
            className={`w-full bg-gray-900 text-white shadow fixed bottom-0 left-0 z-50 transition-all duration-300 
                ${collapsed ? "h-16 sm:h-12" : "h-32 sm:h-20"}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="grid grid-cols-3 items-center w-full h-full px-2 sm:px-6">
                {/* Search bar (left) */}
                <div className="flex justify-start">
                    <div
                        className={`transition-all duration-300 transform ${collapsed ? 'opacity-0 -translate-y-2 pointer-events-none' : 'opacity-100 translate-y-0'}`}
                        style={{ width: collapsed ? 0 : 'auto' }}
                    >
                        {!collapsed && (
                            <form className="ml-2 sm:ml-4 max-w-xs w-full">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full rounded-full px-4 py-2 bg-gray-200 text-black placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                                />
                            </form>
                        )}
                    </div>
                </div>
                {/* Centered arrow button */}
                <div className="flex justify-center">
                    <button
                        type="button"
                        aria-label={collapsed ? "Expand taskbar" : "Collapse taskbar"}
                        className="bg-gray-700 rounded-full p-1 shadow-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        onClick={() => {
                            setCollapsed((c) => {
                                setManuallyCollapsed(!c ? true : false);
                                return !c;
                            });
                        }}
                    >
                        <svg
                            className={`w-6 h-6 text-white transform transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
                {/* Right-side buttons */}
                <div className="flex justify-end">
                    <div
                        className={`transition-all duration-300 transform ${collapsed ? 'opacity-0 -translate-y-2 pointer-events-none' : 'opacity-100 translate-y-0'}`}
                        style={{ width: collapsed ? 0 : 'auto' }}
                    >
                        {!collapsed && (
                            <div className="grid grid-cols-2 grid-rows-2 gap-2 w-32 sm:w-auto sm:flex sm:gap-2 ml-auto">
                                {/* Feed Button */}
                                <div className="relative group">
                                    <button className="rounded-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 transition-all ease-in-out flex items-center gap-2 w-12 sm:group-hover:w-36 sm:focus:w-36 overflow-hidden duration-300">
                                        <span className="flex justify-center items-center w-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 text-blue-20012" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M7 3h10M9 3v6.132a2 2 0 0 1-.553 1.38l-3.894 4.05A4 4 0 0 0 8.5 21h7a4 4 0 0 0 3.947-6.438l-3.894-4.05A2 2 0 0 1 15 9.132V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M6 17h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                            </svg>
                                        </span>
                                        <span className="whitespace-nowrap opacity-0 sm:group-hover:opacity-100 sm:group-focus:opacity-100 transition-opacity duration-200 pr-8">Studio</span>
                                    </button>
                                </div>
                                {/* Dashboard Button */}
                                <div className="relative group">
                                    <button className="rounded-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 transition-all ease-in-out flex items-center gap-2 w-12 sm:group-hover:w-36 sm:focus:w-36 overflow-hidden duration-300">
                                        <span className="flex justify-center items-center w-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="3" width="7" height="7" rx="2" className="fill-current text-green-400" />
                                                <rect x="14" y="3" width="7" height="7" rx="2" className="fill-current text-green-400" />
                                                <rect x="14" y="14" width="7" height="7" rx="2" className="fill-current text-green-400" />
                                                <rect x="3" y="14" width="7" height="7" rx="2" className="fill-current text-green-400" />
                                            </svg>
                                        </span>
                                        <span className="whitespace-nowrap opacity-0 sm:group-hover:opacity-100 sm:group-focus:opacity-100 transition-opacity duration-200 pr-8">Artwall</span>
                                    </button>
                                </div>
                                {/* Flower Button */}
                                <div className="relative group">
                                    <button className="rounded-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 transition-all ease-in-out flex items-center gap-2 w-12 sm:group-hover:w-36 sm:focus:w-36 overflow-hidden duration-300">
                                        <span className="flex justify-center items-center w-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path
                                                    d="M5 21c7.5-1 13-7.5 14-14 0 0-7 0-12 5S3 19 5 21z"
                                                    fill="currentColor"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </span>
                                        <span className="whitespace-nowrap opacity-0 sm:group-hover:opacity-100 sm:group-focus:opacity-100 transition-opacity duration-200 pr-8">Bloom</span>
                                    </button>
                                </div>
                                {/* Manifest Button */}
                                <div className="relative group">
                                    <button className="rounded-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 transition-all ease-in-out flex items-center gap-2 w-12 sm:group-hover:w-36 sm:focus:w-36 overflow-hidden duration-300">
                                        <span className="flex justify-center items-center w-full relative">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path
                                                    d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                                                    fill="currentColor"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                            {/* Sparkling stars */}
                                            <svg className="absolute left-0 top-0 w-2 h-2 animate-pulse text-yellow-200" fill="currentColor" viewBox="0 0 8 8">
                                                <polygon points="4,0 5,3 8,4 5,5 4,8 3,5 0,4 3,3" />
                                            </svg>
                                            <svg className="absolute right-0 bottom-0 w-1.5 h-1.5 animate-ping text-yellow-100" fill="currentColor" viewBox="0 0 8 8">
                                                <polygon points="4,0 5,3 8,4 5,5 4,8 3,5 0,4 3,3" />
                                            </svg>
                                            <svg className="absolute right-1 top-0 w-1 h-1 animate-pulse text-white" fill="currentColor" viewBox="0 0 8 8">
                                                <polygon points="4,0 5,3 8,4 5,5 4,8 3,5 0,4 3,3" />
                                            </svg>
                                        </span>
                                        <span className="whitespace-nowrap opacity-0 sm:group-hover:opacity-100 sm:group-focus:opacity-100 transition-opacity duration-200 pr-8">Manifest</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}