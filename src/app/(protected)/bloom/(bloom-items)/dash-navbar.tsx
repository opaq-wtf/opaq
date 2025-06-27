// "use client";
// import React, { useState } from "react";

// export default function DashNav() {
//   const [open, setOpen] = useState(false);

//   return (
//     <div>
//       <div className="min-h-screen">
//         <div
//           className={`sidebar min-h-screen overflow-hidden hover:shadow-lg fixed top-0 left-0 z-40 bg-black ${
//             open ? "w-54" : "w-[3.35rem]"
//           }`}
//           style={{
//             transition: "all .4s ease-in-out",
//             height: "100vh",
//           }}
//         >
//           <div className="flex h-screen flex-col justify-start pt-2 pb-6">
//             <div>
              
//               {/* Menu Button */}
//               <div className="flex justify-items-end mx-2">
//                 <button
//                   aria-label="Toggle menu"
//                   onClick={() => setOpen((prev) => !prev)}
//                   className="p-2 rounded hover:bg-gray-200 transition hover:text-gray-600"
//                 >
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-6 w-6 text-gray-100 hover:text-gray-600"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M4 6h16M4 12h16M4 18h16"
//                     />
//                   </svg>
//                 </button>
//               </div>
//               <ul className="mt-6 space-y-2 tracking-wide">
//                 <li className="min-w-max hover:bg-gray-900 hover:text-white transition-all duration-300 ease-in-out">
//                   <a
//                     href="#"
//                     aria-label="dashboard"
//                     className="relative flex items-center space-x-4  px-4 py-3"
//                   >
//                     <svg
//                       className="-ml-1 h-6 w-6"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                     >
//                       <path
//                         d="M6 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8ZM6 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1Z"
//                         className="fill-current text-cyan-400 dark:fill-slate-600"
//                       ></path>
//                       <path
//                         d="M13 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V8Z"
//                         className="fill-current text-cyan-200 group-hover:text-cyan-300"
//                       ></path>
//                       <path
//                         d="M13 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1Z"
//                         className="fill-current group-hover:text-sky-300"
//                       ></path>
//                     </svg>
//                     <span className="mr-1 px-4 font-medium ">My Posts</span>
//                   </a>
//                 </li>
//                 {/* Menu button is above this */}
//                 <li className="min-w-max hover:bg-gray-900 hover:text-white transition-all duration-300 ease-in-out">
//                   <a
//                     href="#"
//                     className="group flex items-center space-x-4 rounded-md px-4 py-3 "
//                   >
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="h-5 w-5"
//                       viewBox="0 0 20 20"
//                       fill="currentColor"
//                     >
//                       <path
//                         className="fill-current text-gray-600 group-hover:text-cyan-600"
//                         fillRule="evenodd"
//                         d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
//                         clipRule="evenodd"
//                       />
//                       <path
//                         className="fill-current text-gray-300 group-hover:text-cyan-300"
//                         d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z"
//                       />
//                     </svg>
//                     <span className="px-4 group-hover:text-gray-700">My Likes</span>
//                   </a>
//                 </li>
//                 {/* ...rest of your menu items */}
//                 <li className="min-w-max hover:bg-gray-900 hover:text-white transition-all duration-300 ease-in-out">
//                   <a
//                     href="#"
//                     className="group flex items-center space-x-4 rounded-md px-4 py-3 "
//                   >
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="h-5 w-5"
//                       viewBox="0 0 20 20"
//                       fill="currentColor"
//                     >
//                       <path
//                         className="fill-current text-gray-600 group-hover:text-cyan-600"
//                         d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"
//                       />
//                       <path
//                         className="fill-current text-gray-300 group-hover:text-cyan-300"
//                         d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"
//                       />
//                     </svg>
//                     <span className="px-4 group-hover:text-gray-700">
//                       My saves
//                     </span>
//                   </a>
//                 </li>
//                 <li className="min-w-max hover:bg-gray-900 hover:text-white transition-all duration-300 ease-in-out">
//                   <a
//                     href="#"
//                     className="group flex items-center space-x-4 rounded-md px-4 py-3 "
//                   >
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="h-5 w-5"
//                       viewBox="0 0 20 20"
//                       fill="currentColor"
//                     >
//                       <path
//                         className="fill-current text-gray-300 group-hover:text-cyan-300"
//                         d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"
//                       />
//                       <path
//                         className="fill-current text-gray-600 group-hover:text-cyan-600"
//                         fillRule="evenodd"
//                         d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
//                         clipRule="evenodd"
//                       />
//                     </svg>
//                     <span className="px-4 group-hover:text-gray-700">Polls</span>
//                   </a>
//                 </li>
//                 <li className="min-w-max hover:bg-gray-900 hover:text-white transition-all duration-300 ease-in-out">
//                   <a
//                     href="#"
//                     className="group flex items-center space-x-4 rounded-md px-4 py-3 "
//                   >
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="h-5 w-5"
//                       viewBox="0 0 20 20"
//                       fill="currentColor"
//                     >
//                       <path
//                         className="fill-current text-gray-300 group-hover:text-cyan-300"
//                         d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"
//                       />
//                       <path
//                         className="fill-current text-gray-600 group-hover:text-cyan-600"
//                         fillRule="evenodd"
//                         d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
//                         clipRule="evenodd"
//                       />
//                     </svg>
//                     <span className="px-4 group-hover:text-gray-700">Followers</span>
//                   </a>
//                 </li>
//               </ul>
//             </div>
        
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
