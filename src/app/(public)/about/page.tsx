import StartFooter from "@/app/start-components/startfooter";
import StartNavbar from "@/app/start-components/startnavbar";

// Import Kanit font from Google Fonts
import { Kanit } from "next/font/google";

const kanit = Kanit({ subsets: ["latin"], weight: ["400", "700"] });

export default function StartBody() {
  return (
    <div className={kanit.className}>
      <StartNavbar />
      <main className="pl-64 pr-4 pt-16 pb-8 min-h-screen">
        <h1 className="text-6xl font-bold mt-36">Our Story</h1>
        <h1 className="text-6xl font-semibold mt-1">to building yours</h1>
        <br />
        <p className="text-xl mt-4">
          We are a team of passionate individuals...
        </p>
        {/* section-2 */}
        <h1 className="text-6xl font-bold mt-36">Meet</h1>
        <h1 className="text-6xl font-semibold mt-1">The Pirates</h1>
        <br />
        <p className="text-xl mt-4">
          We are a team of passionate individuals...
        </p>
      </main>
      <StartFooter />
    </div>
  );
}
