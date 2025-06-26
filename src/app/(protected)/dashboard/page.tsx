import DashHeader from "./(dash-components)/dash-header";
import DashNav from "./(dash-components)/dash-navbar";
import DashBody from "./(dash-components)/dash-body";
import { Taskbar } from "../taskbar";

export default function DashboardPage() {
  return (
    <div className="min-h-screen pb-12 relative bg-black">
      <DashHeader />
      <div className="flex">
        <DashNav />
        <div className="flex-1">
          <DashBody />
        </div>
      </div>
      <Taskbar />
    </div>
  );
}
