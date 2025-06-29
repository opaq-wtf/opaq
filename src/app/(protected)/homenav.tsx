"use client";
import { logout } from "@/actions/logout";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import ProfileAvatar from "@/components/common/ProfileAvatar";
import axios from "axios";

// Custom hook to handle clicks outside a referenced element
function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void,
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref, handler]);
}

interface CurrentUser {
  id: string;
  username: string;
  fullName: string;
  full_name?: string;
  profile_picture_data?: string;
}

export default function HomeNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setMenuOpen(false));

  // Fetch current user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get("/api/auth/me");
        setCurrentUser(response.data);
      } catch (error) {
        console.error("Error fetching current user:", error);
        // User might not be logged in
        setCurrentUser(null);
      }
    };

    fetchCurrentUser();
  }, []);
  return (
    <header className="bg-black ">
      <div className="mx-auto max-w-screen-xl px-2 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between">
          <div className="flex-1 md:flex md:items-center md:gap-12">
            <Link href="/home" className="text-teal-600 dark:text-teal-300 flex flex-col items-start">
              <span className="sr-only">Home</span>
              <Image
                src="https://forcdn.pages.dev/assets/outerAsset%2014opaq-ful.svg"
                alt="Home Logo"
                width={32}
                height={32}
                className="h-8 w-auto object-cover rounded"
              />
            </Link>
            <link
              href="https://fonts.googleapis.com/css2?family=Kanit:wght@400;700&display=swap"
              rel="stylesheet"
            />
          </div>

          <div className="md:flex md:items-center md:gap-12">
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                className="overflow-hidden rounded-full border border-gray-300 shadow-inner dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                onClick={() => setMenuOpen((open) => !open)}
              >
                <span className="sr-only">Toggle dashboard menu</span>
                {currentUser ? (
                  <ProfileAvatar
                    fullName={currentUser.fullName || currentUser.full_name || "User"}
                    profilePictureData={currentUser.profile_picture_data}
                    size="md"
                    className="border-0"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">?</span>
                  </div>
                )}
              </button>

              {menuOpen && (
                <div
                  className="absolute end-0 z-10 mt-0.5 w-56 rounded-md border border-gray-100 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900"
                  role="menu"
                >
                  <div className="p-2">
                    <Link
                      href={currentUser ? `/${currentUser.username}` : "#"}
                      className="block rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                    >
                      My profile
                    </Link>

                    <form action={logout}>
                      <button
                        type="submit"
                        className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-sm text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-600/10"
                        role="menuitem"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="size-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                          />
                        </svg>
                        Logout
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
