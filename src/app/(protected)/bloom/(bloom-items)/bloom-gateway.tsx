import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Wallet, FileText, Hourglass, Lightbulb } from "lucide-react";
import Link from "next/link";
export default function BloomGateway() {
  return (
    <div className="flex flex-col items-center justify-start py-8 px-4 min-h-[80vh] bg-black text-white">
      <h1 className="text-4xl font-bold mb-8 text-center">Bloom Gateway</h1>

      {/* Upload Button */}
      <div className="mb-12">
        <Button size="lg" className="px-8 py-4 text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg" asChild>
          <Link href="/bloom/upload">
            <Upload className="mr-2 h-5 w-5" /> Upload New Content
          </Link>
        </Button>
      </div>

      {/* Grid for blocks */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        {/* Pitches Card */}
        <Link href="/bloom/my-pitches" className="group block h-full">
          <Card className="bg-gray-800 border-gray-700 text-white shadow-md group-hover:shadow-lg group-hover:border-blue-500 transition-all duration-300 h-full">
            <CardContent className="p-6 flex flex-col items-start justify-start gap-4">
              <Lightbulb className="h-12 w-12 text-blue-400 group-hover:text-blue-300 transition-colors" />
              <CardTitle className="text-lg font-semibold">My Pitches</CardTitle>
            </CardContent>
          </Card>
        </Link>

        {/* Wallet Card */}
        <Link href="#" className="group block h-full">
          <Card className="bg-gray-800 border-gray-700 text-white shadow-md group-hover:shadow-lg group-hover:border-green-500 transition-all duration-300 h-full">
            <CardContent className="p-6 flex flex-col items-start justify-start gap-4">
              <Wallet className="h-12 w-12 text-green-400 group-hover:text-green-300 transition-colors" />
              <CardTitle className="text-lg font-semibold">Wallet</CardTitle>
            </CardContent>
          </Card>
        </Link>

        {/* Requests Card */}
        <Link href="#" className="group block h-full">
          <Card className="bg-gray-800 border-gray-700 text-white shadow-md group-hover:shadow-lg group-hover:border-purple-500 transition-all duration-300 h-full">
            <CardContent className="p-6 flex flex-col items-start justify-start gap-4">
              <FileText className="h-12 w-12 text-purple-400 group-hover:text-purple-300 transition-colors" />
              <CardTitle className="text-lg font-semibold">Requests</CardTitle>
            </CardContent>
          </Card>
        </Link>

        {/* Pending Verifications Card */}
        <Link href="/bloom/progress" className="group block h-full">
          <Card className="bg-gray-800 border-gray-700 text-white shadow-md group-hover:shadow-lg group-hover:border-orange-500 transition-all duration-300 h-full">
            <CardContent className="p-6 flex flex-col items-start justify-start gap-4">
              <Hourglass className="h-12 w-12 text-orange-400 group-hover:text-orange-300 transition-colors" />
              <CardTitle className="text-lg font-semibold">Pending pitches</CardTitle>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}