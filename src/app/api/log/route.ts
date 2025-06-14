// THIS FILE IS FOR CREATING LOGS TO CHECK WHICH END-POINT IS BEING HIT (MOSTLY FOR DEBUGGING PROCESS)

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  const __dirname = path.resolve();

  const logPath = path.join(__dirname, "access.log");
  const accessLog = `${message}\n`;

  fs.appendFile(logPath, accessLog, (err) => {
    if (err) console.error("Failed to write the log: ", err);
  });

  return NextResponse.json({ message: "ok" }, { status: 200 });
}
