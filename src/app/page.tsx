import StartNavbar from "./start-components/startnavbar";
import StartBody from "./start-components/startbody";
import StartFooter from "./start-components/startfooter";

export default function Home() {
  return (
    <div
      className="flex flex-col min-h-screen overflow-hidden backdrop-blur-lg backdrop-saturate-150 rounded-xl shadow-2xl relative"
      style={{
        backgroundImage: "url('https://forcdn.pages.dev/assets/retro.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Blur overlay */}

      <div className="absolute inset-0 bg-black/90 backdrop-blur-lg backdrop-saturate-150 z-0 pointer-events-none" />
      {/* Ensure StartNavbar does not use browser-only APIs or non-deterministic values during SSR */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <StartNavbar />
        <div className="flex-1 flex flex-col mt-28">
          <StartBody />
        </div>
        <StartFooter />
      </div>
    </div>
  );
}
