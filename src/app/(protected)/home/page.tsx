import HomeNav from "../homenav";
import { ArtwallBody } from "./(home-components)/timeline";
import { Taskbar } from "../taskbar";

export default function HomePage() {
  return (
    <>
      <HomeNav />
      <ArtwallBody />
      <Taskbar />
    </>
  );
}
