"use client";

export function Taskbar() {
    return (
        <div className="w-full bg-gray-900 text-white shadow fixed bottom-0 left-0 z-50">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full h-auto sm:h-20 px-4 py-2">
                {/* Search bar (top on mobile, left on desktop) */}
                <div className="flex justify-center sm:justify-start w-full sm:w-auto">
                    <form className="max-w-xs w-full">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full rounded-full px-4 py-2 bg-gray-200 text-black placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                        />
                    </form>
                </div>

                {/* Center column (empty, hidden on mobile) */}
                <div className="hidden sm:flex-grow sm:block" />

                {/* Right-side buttons (bottom on mobile, right on desktop) */}
                <div className="flex justify-center sm:justify-end w-full sm:w-auto">
                    <div className="flex flex-row gap-2 w-full sm:w-auto overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 justify-center">
                        {/* Feed Button */}
                        <div className="relative group">
                            <a href="/dashboard" className="rounded-full bg-gray-600 hover:bg-gray-700 text-blue-200 px-4 py-2 transition-all ease-in-out flex items-center gap-2 w-12 sm:group-hover:w-36 sm:focus:w-36 overflow-hidden duration-300">
                                <span className="flex justify-center items-center w-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 text-blue-20012" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M7 3h10M9 3v6.132a2 2 0 0 1-.553 1.38l-3.894 4.05A4 4 0 0 0 8.5 21h7a4 4 0 0 0 3.947-6.438l-3.894-4.05A2 2 0 0 1 15 9.132V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M6 17h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                </span>
                                <span className="whitespace-nowrap opacity-0 sm:group-hover:opacity-100 sm:group-focus:opacity-100 transition-opacity duration-200 pr-8 text-white">Studio</span>
                            </a>
                        </div>
                        {/* Dashboard Button */}
                        <div className="relative group">
                            <a href="/artwall" className="rounded-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 transition-all ease-in-out flex items-center gap-2 w-12 sm:group-hover:w-36 sm:focus:w-36 overflow-hidden duration-300">
                                <span className="flex justify-center items-center w-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="7" height="7" rx="2" className="fill-current text-green-400" />
                                        <rect x="14" y="3" width="7" height="7" rx="2" className="fill-current text-green-400" />
                                        <rect x="14" y="14" width="7" height="7" rx="2" className="fill-current text-green-400" />
                                        <rect x="3" y="14" width="7" height="7" rx="2" className="fill-current text-green-400" />
                                    </svg>
                                </span>
                                <span className="whitespace-nowrap text-white opacity-0 sm:group-hover:opacity-100 sm:group-focus:opacity-100 transition-opacity duration-200 pr-8">Artwall</span>
                            </a>
                        </div>
                        {/* Flower Button */}
                        <div className="relative group">
                            <a href="/bloom" className="rounded-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 transition-all ease-in-out flex items-center gap-2 w-12 sm:group-hover:w-36 sm:focus:w-36 overflow-hidden duration-300">
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
                            </a>
                        </div>
                        {/* Manifest Button */}
                        <div className="relative group">
                            <a className="rounded-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 transition-all ease-in-out flex items-center gap-2 w-12 sm:group-hover:w-36 sm:focus:w-36 overflow-hidden duration-300">
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
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}