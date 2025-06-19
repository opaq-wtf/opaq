export default function StartBody() {
  return (
    <div
      style={{
        position: "fixed", // changed from relative to fixed
        top: 0,
        left: 0,
        width: "100vw", // ensure full viewport width
        height: "100vh", // ensure full viewport height
        minHeight: "100vh",
        backgroundImage: "url('https://forcdn.pages.dev/assets/retro.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        fontFamily: "'Kanit', sans-serif",
        zIndex: 0,
      }}
      className="fixed inset-0"
    >
      {/* Translucent blurred glass overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-none z-0" />
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-none z-0" />
      <section className="w-full h-full flex items-center justify-center relative z-10">
        <div className="mx-auto max-w-6xl px-8 py-16 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2 flex flex-col justify-center">
              <div className="max-w-2xl">
                <h1 className="text-6xl font-bold text-white sm:text-4xl">
                  Open Playground for <br />Advanced Quests
                </h1>
                <p className="mt-6 text-lg text-gray-200">
                  Playground for misfits, quests, and more. Join the adventure!
                </p>
                {/* Start Pitching Button */}
                <button
                  className="mt-8 px-8 py-3 rounded-full border-2 border-white hover:bg-white text-white hover:text-black font-semibold text-lg shadow transition flex items-center gap-2"
                  type="button"
                >
                  Start Pitching
                  <span aria-hidden="true" style={{ display: "inline-block", marginLeft: "0.5em" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="4" y1="12" x2="20" y2="12" />
                      <polyline points="14 6 20 12 14 18" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>
            <div className="md:col-span-1 flex justify-center">
              <img
                src="https://forcdn.pages.dev/assets/Eyes.gif"
                className="rounded-lg shadow-lg max-h-screen"
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