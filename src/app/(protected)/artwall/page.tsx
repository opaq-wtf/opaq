import { Import } from "lucide-react";
import HomeNav from "../artwall/(home-components)/homenav";
import { ArtwallBody } from "./(home-components)/artwall-body";
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
