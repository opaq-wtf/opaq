// import DashNav from "./(bloom-items)/dash-navbar";
// import DashBody from "./(bloom-items)/dash-body";
import { Taskbar } from "../../taskbar";
import HomeNav from "../../homenav";
import ProgressPage from "./progress";


export default function DashboardPage() {
  return (
    <div className="min-h-screen pb-12 relative bg-black">
      <HomeNav/>
      <div className="flex">
        {/* <DashNav /> */}
        <div className="flex-1">
          {/* <DashBody /> */}
          <ProgressPage />

        </div>
      </div>
      <Taskbar />
    </div>
  );
}
