"use client";

import { Orbitron } from "next/font/google";
import Image from "next/image";
import { useEffect, useState } from "react";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["600"],
});

type TimeLeft = {
  days: number;
  hours: string;
  minutes: string;
  seconds: string;
};

export default function Home() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  useEffect(() => {
    const targetDate = new Date("2025-06-15T00:00:00");

    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      const totalSeconds = Math.max(0, Math.floor(diff / 1000));
      const days = Math.floor(totalSeconds / (3600 * 24));
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft({
        days,
        hours: hours.toString().padStart(2, "0"),
        minutes: minutes.toString().padStart(2, "0"),
        seconds: seconds.toString().padStart(2, "0"),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <main className="relative h-screen w-screen overflow-hidden bg-black text-yellow-300">
        <div className="absolute inset-0 z-0">
          <Image
            fill
            src="/retro.gif"
            className="w-full h-full object-cover opacity-30"
            alt="Background GIF"
            unoptimized
          />
        </div>

        <div className="relative z-10 flex items-center justify-center h-full">
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-yellow-200">
              <TimeCard
                label="Days"
                value={timeLeft.days.toString()}
                bg="#e52421"
              />
              <TimeCard label="Hours" value={timeLeft.hours} bg="#f89b1c" />
              <TimeCard label="Minutes" value={timeLeft.minutes} bg="#3df65c" />
              <TimeCard label="Seconds" value={timeLeft.seconds} bg="#65cbd5" />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

type TimeCardProps = {
  label: string;
  value: string;
  bg: string;
};

function TimeCard({ label, value, bg }: TimeCardProps) {
  return (
    <div
      className="border border-yellow-400/40 backdrop-blur-lg rounded-xl p-4 sm:p-6 shadow-lg"
      style={{ backgroundColor: bg }}
    >
      <div
        className={`text-3xl sm:text-5xl font-bold ${orbitron.className} text-black`}
      >
        {value}
      </div>
      <div className="mt-2 text-sm sm:text-base uppercase tracking-wide text-black">
        {label}
      </div>
    </div>
  );
}
