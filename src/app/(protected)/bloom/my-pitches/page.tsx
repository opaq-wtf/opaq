"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Upload,
  Eye,
  Heart,
  User,
  MapPin,
  Calendar,
  Clock,
  Fingerprint,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const pitches = [
  {
    id: 1,
    title: "Revolutionizing Urban Farming with AI",
    description:
      "An innovative approach to vertical farming using AI-powered sensors to optimize growth conditions and maximize yield in urban environments.",
    imageUrl: "/retro.gif",
    views: 1204,
    supports: 157,
    postedDate: "2024-07-15T10:30:00Z",
    author: "Jane Doe",
    place: "Mumbai, India",
    aadhar: "XXXX-XXXX-1234",
  },
  {
    id: 2,
    title: "Eco-Friendly Packaging from Seaweed",
    description:
      "Developing biodegradable packaging materials from seaweed to combat plastic pollution in our oceans.",
    imageUrl: "/Eyes.gif",
    views: 876,
    supports: 98,
    postedDate: "2024-07-10T14:00:00Z",
    author: "Jane Doe",
    place: "Chennai, India",
    aadhar: "XXXX-XXXX-5678",
  },
  {
    id: 3,
    title: "AI-Powered Personal Finance Advisor",
    description:
      "A mobile app that uses AI to provide personalized financial advice, helping users save and invest smarter.",
    imageUrl: "/logo.svg",
    views: 2345,
    supports: 450,
    postedDate: "2024-06-25T09:00:00Z",
    author: "Jane Doe",
    place: "Bengaluru, India",
    aadhar: "XXXX-XXXX-9012",
  },
];

// Helper to format date and time
const formatDateTime = (isoString: string) => {
  const date = new Date(isoString);
  return {
    date: date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  };
};

export default function MyPitchesPage() {
  const router = useRouter();

  return (
    <div className="bg-black text-white min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4 self-start">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white hover:bg-black flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              My Published Pitches
            </h1>
          </div>
          <Button
            size="lg"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            asChild
          >
            <Link href="/bloom/upload" className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              <span>Upload New Pitch</span>
            </Link>
          </Button>
        </div>

        {/* Pitches List */}
        <div className="space-y-6">
          {pitches.map((pitch) => {
            const { date, time } = formatDateTime(pitch.postedDate);
            return (
              <Card
                key={pitch.id}
                className="bg-gray-900 border-gray-800 overflow-hidden transition-all hover:shadow-lg hover:border-blue-500/50"
              >
                <CardContent className="p-0 md:flex">
                  <div className="relative aspect-square w-full flex-shrink-0 md:w-48">
                    <Image
                      src={pitch.imageUrl}
                      alt={pitch.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2 text-gray-100">
                        {pitch.title}
                      </h2>
                      <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                        {pitch.description}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500 mb-4">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" /> {pitch.author}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" /> {pitch.place}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" /> {date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> {time}
                        </span>
                      </div>
                    </div>
                    <div className="border-t border-gray-800 pt-4 flex flex-wrap justify-between items-center gap-4">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors">
                          <Eye className="w-4 h-4 text-cyan-400" />
                          {pitch.views.toLocaleString()} Views
                        </span>
                        <span className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors">
                          <Heart className="w-4 h-4 text-rose-500" />
                          {pitch.supports.toLocaleString()} Supports
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 flex items-center gap-1.5">
                        <Fingerprint className="w-4 h-4" />
                        <span>Aadhaar Verified: {pitch.aadhar}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
