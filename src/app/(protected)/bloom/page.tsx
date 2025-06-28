import { Taskbar } from "../taskbar";
import HomeNav from "../homenav";
import BloomGateway from "./(bloom-items)/bloom-gateway";

export default function DashboardPage() {
  return (
    <div className="min-h-screen pb-12 relative bg-black">
      <HomeNav/>
      <div className="flex">
        <div className="flex-1">
          <BloomGateway/>
        </div>
      </div>
      <Taskbar />
    </div>
  );
}
