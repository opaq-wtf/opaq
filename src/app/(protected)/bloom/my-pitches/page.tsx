"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Upload,
  Eye,
  Heart,
  Calendar,
  Clock,
  ArrowLeft,
  Loader2,
  Settings,
  Globe,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import PitchVisibilityModal from "./components/PitchVisibilityModal";

interface Pitch {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  irysId: string;
  tags: string[];
  visibility: "public" | "private";
  viewsCount: number;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

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
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibilityModal, setVisibilityModal] = useState<{
    isOpen: boolean;
    pitch: Pitch | null;
  }>({ isOpen: false, pitch: null });

  useEffect(() => {
    const fetchPitches = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/pitches?user_only=true&limit=20&page=1');

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Please sign in to view your pitches');
          }
          throw new Error('Failed to fetch pitches');
        }

        const data = await response.json();
        setPitches(data.pitches || []);
        setPagination(data.pagination || null);
      } catch (err) {
        console.error('Error fetching pitches:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load your pitches';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchPitches();
  }, []);

  const handleVisibilityChange = (pitchId: string, newVisibility: "public" | "private") => {
    setPitches(prevPitches =>
      prevPitches.map(pitch =>
        pitch.id === pitchId ? { ...pitch, visibility: newVisibility } : pitch
      )
    );
  };

  const openVisibilityModal = (pitch: Pitch) => {
    setVisibilityModal({ isOpen: true, pitch });
  };

  const closeVisibilityModal = () => {
    setVisibilityModal({ isOpen: false, pitch: null });
  };

  return (
    <div className="bg-black text-white min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
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
            {pagination && (
              <span className="text-sm text-gray-500 mt-1">
                ({pagination.total} total)
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              disabled={loading}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Refresh'
              )}
            </Button>
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
        </div>

        {/* Pitches List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-3 text-gray-400">Loading your pitches...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Try Again
            </Button>
          </div>
        ) : pitches.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-medium mb-2 text-gray-300">No pitches yet</h3>
            <p className="text-gray-500 mb-6">Start by uploading your first pitch to showcase your ideas!</p>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/bloom/upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Your First Pitch
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {pitches.map((pitch) => {
              const { date, time } = formatDateTime(pitch.createdAt);
              return (
                <Card
                  key={pitch.id}
                  className="bg-gray-900 border-gray-800 overflow-hidden transition-all hover:shadow-lg hover:border-blue-500/50"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        {/* Title and Visibility Status */}
                        <div className="flex items-start justify-between mb-2">
                          <h2
                            className="text-2xl font-bold text-gray-100 cursor-pointer hover:text-blue-400 transition-colors flex-1"
                            onClick={() => router.push(`/bloom/pitch/${pitch.id}`)}
                          >
                            {pitch.title}
                          </h2>
                          <div className="flex items-center gap-2 ml-4">
                            {/* Visibility Indicator */}
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              pitch.visibility === "public"
                                ? "bg-green-900/30 text-green-400 border border-green-700"
                                : "bg-orange-900/30 text-orange-400 border border-orange-700"
                            }`}>
                              {pitch.visibility === "public" ? (
                                <Globe className="w-3 h-3" />
                              ) : (
                                <Lock className="w-3 h-3" />
                              )}
                              {pitch.visibility === "public" ? "Public" : "Private"}
                            </div>

                            {/* Visibility Settings Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openVisibilityModal(pitch);
                              }}
                              className="text-gray-400 hover:text-white hover:bg-gray-800 p-2"
                              title="Manage visibility"
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <p
                          className="text-gray-400 mb-4 text-sm leading-relaxed cursor-pointer hover:text-gray-300 transition-colors"
                          onClick={() => router.push(`/bloom/pitch/${pitch.id}`)}
                        >
                          {pitch.description}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500 mb-4">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" /> {date}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> {time}
                          </span>
                          {pitch.tags && pitch.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {pitch.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="bg-blue-900/50 text-blue-300 text-xs px-2 py-1 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                              {pitch.tags.length > 3 && (
                                <span className="text-gray-500 text-xs">
                                  +{pitch.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="border-t border-gray-800 pt-4 flex flex-wrap justify-between items-center gap-4">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors">
                            <Eye className="w-4 h-4 text-cyan-400" />
                            {pitch.viewsCount} {pitch.viewsCount === 1 ? 'View' : 'Views'}
                          </span>
                          <span className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors">
                            <Heart className="w-4 h-4 text-rose-500" />
                            {pitch.likesCount} {pitch.likesCount === 1 ? 'Support' : 'Supports'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Visibility Modal */}
      {visibilityModal.isOpen && visibilityModal.pitch && (
        <PitchVisibilityModal
          isOpen={visibilityModal.isOpen}
          onClose={closeVisibilityModal}
          pitch={visibilityModal.pitch}
          onVisibilityChange={handleVisibilityChange}
        />
      )}
    </div>
  );
}
