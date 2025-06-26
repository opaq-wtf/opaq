export function Taskbar() {
    return (
        <div className="w-full h-20 bg-gray-900 text-white flex items-center px-6 shadow fixed bottom-0 left-0 z-50 gap-4">
            <form className="ml-4">
                <input
                    type="text"
                    placeholder="Search..."
                    className="w-full max-w-xs rounded-full px-5 py-2 bg-gray-200 text-black placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
            </form>
            <div className="flex-1" />
            <div className="flex gap-2 ml-auto">
                {/* Feed Button */}
                <div className="relative group">
                <button className="rounded-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 transition-all ease-in-out flex items-center gap-2 w-12 group-hover:w-32 focus:w-32 overflow-hidden duration-300">
                    <span className="flex justify-center items-center w-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 17h16M4 12h16M4 7h16" />
                        </svg>
                    </span>
                      <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200">Feed</span>
                  </button>
                </div>
                {/* Dashboard Button */}
                <div className="relative group">
                  <button className="rounded-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 transition-all ease-in-out flex items-center gap-2 w-12 group-hover:w-36 focus:w-36 overflow-hidden duration-300">
                      <span className="flex justify-center items-center w-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" rx="2" className="fill-current text-green-400" />
                            <rect x="14" y="3" width="7" height="7" rx="2" className="fill-current text-green-400" />
                            <rect x="14" y="14" width="7" height="7" rx="2" className="fill-current text-green-400" />
                            <rect x="3" y="14" width="7" height="7" rx="2" className="fill-current text-green-400" />
                        </svg>
                      </span>
                      <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200 pr-8">Dashboard</span>
                  </button>
                </div>
                {/* Flower Button */}
                <div className="relative group">
                  <button className="rounded-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 transition-all ease-in-out flex items-center gap-2 w-12 group-hover:w-32 focus:w-32 overflow-hidden duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 2c.5 2 2.5 3.5 4.5 3.5 2.5 0 3.5 2.5 1.5 4-1.5 1-1.5 3 0 4 2 1.5 1 4-1.5 4-2 0-4 1.5-4.5 3.5-.5-2-2.5-3.5-4.5-3.5-2.5 0-3.5-2.5-1.5-4 1.5-1 1.5-3 0-4-2-1.5-1-4 1.5-4C9.5 5.5 11.5 4 12 2Z" fill="#fff" stroke="#fff" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="2" fill="#e53e3e" />
                      </svg>
                      <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200">Flower</span>
                  </button>
                </div>
            </div>
        </div>
    );
}