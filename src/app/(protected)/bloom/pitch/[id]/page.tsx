"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock, Eye, Heart, Share2, Loader2, ExternalLink, Plus } from "lucide-react";
import { toast } from "sonner";

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

interface UserInteraction {
  id: string;
  userId: string;
  pitchId: string;
  hasViewed: number;
  hasLiked: number;
  firstViewedAt: string | null;
  lastViewedAt: string | null;
  likedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Helper to format date and time
const formatDateTime = (isoString: string) => {
  const date = new Date(isoString);
  return {
    date: date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC"
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC"
    }),
  };
};

export default function PitchDetailPage() {
  const router = useRouter();
  const params = useParams();
  const pitchId = params.id as string;

  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [userInteraction, setUserInteraction] = useState<UserInteraction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [likingInProgress, setLikingInProgress] = useState(false);

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchPitch = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/pitches/${pitchId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Pitch not found');
          }
          throw new Error('Failed to fetch pitch');
        }

        const data = await response.json();
        setPitch(data.pitch);
        setUserInteraction(data.userInteraction || null);
      } catch (err) {
        console.error('Error fetching pitch:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load pitch';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (pitchId) {
      fetchPitch();
    }
  }, [pitchId]);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: pitch?.title,
        text: pitch?.description,
        url: window.location.href,
      });
    } catch (_err) {
      // Fallback to copying URL to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleLike = async () => {
    if (!pitch || likingInProgress) return;

    try {
      setLikingInProgress(true);

      const response = await fetch(`/api/pitches/${pitch.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Please sign in to like this pitch");
          return;
        }
        throw new Error('Failed to toggle like');
      }

      const data = await response.json();

      // Update the pitch with new like count
      setPitch(prev => prev ? { ...prev, likesCount: data.likesCount } : null);

      // Update the user interaction
      setUserInteraction(prev => prev ?
        { ...prev, hasLiked: data.liked ? 1 : 0, likedAt: data.liked ? new Date().toISOString() : null } :
        null
      );

      toast.success(data.message);
    } catch (err) {
      console.error('Error toggling like:', err);
      toast.error("Failed to update like status");
    } finally {
      setLikingInProgress(false);
    }
  };  const handlePostToArtWall = () => {
    if (!pitch) return;

    // Create the pitch link
    const pitchLink = `${window.location.origin}/bloom/pitch/${pitch.id}`;

    // Add the pitch link to the content (embedded link for WYSIWYG)
    const contentWithLink = `${pitch.description} \n\n---\n🚀 Original Pitch: <a href="${pitchLink}" target="_blank" rel="noopener noreferrer">View on Bloom</a>`;

    // Navigate to artwall upload page with pre-filled data
    const params = new URLSearchParams({
      title: pitch.title,
      content: contentWithLink,
      labels: pitch.tags.join(', '),
      source: 'pitch',
      sourceId: pitch.id,
      pitchLink: pitchLink
    });

    router.push(`/artwall/upload?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="text-gray-400">Loading pitch...</span>
        </div>
      </div>
    );
  }

  if (error || !pitch) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Pitch not found'}</p>
          <Button
            onClick={() => router.push("/bloom")}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const { date, time } = mounted ? formatDateTime(pitch.createdAt) : { date: '', time: '' };

  return (
    <div className="bg-black text-white min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/bloom")}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePostToArtWall}
              className="border-green-600 text-green-300 hover:bg-green-700 hover:text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Post to Art Wall
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Pitch Content */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-white mb-4">
              {pitch.title}
            </CardTitle>

            {/* Meta information */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> {date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> {time}
              </span>
            </div>

            {/* Tags */}
            {pitch.tags && pitch.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {pitch.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-900/50 text-blue-300 text-sm px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </CardHeader>

          <CardContent>
            {/* Description */}
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                {pitch.description}
              </p>
            </div>

            {/* Stats */}
            <div className="border-t border-gray-800 pt-6 mt-8">
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-2 text-gray-400">
                  <Eye className="w-5 h-5 text-cyan-400" />
                  {pitch.viewsCount} {pitch.viewsCount === 1 ? 'View' : 'Views'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  disabled={likingInProgress}
                  className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-colors ${
                    userInteraction?.hasLiked === 1
                      ? 'text-rose-400 hover:text-rose-300 bg-rose-900/20 hover:bg-rose-900/30'
                      : 'text-gray-400 hover:text-rose-400 hover:bg-rose-900/20'
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      userInteraction?.hasLiked === 1 ? 'fill-current text-rose-400' : ''
                    }`}
                  />
                  {pitch.likesCount} {pitch.likesCount === 1 ? 'Support' : 'Supports'}
                  {likingInProgress && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
                </Button>
              </div>
            </div>

            {/* File Info */}
            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 text-sm font-medium mb-1">
                    📁 Attached File
                  </p>
                  {pitch.irysId && (
                    <p className="text-blue-400/70 text-xs">
                      Reference ID: {pitch.irysId}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(pitch.fileUrl, '_blank')}
                  className="border-blue-600 text-blue-300 hover:bg-blue-700 hover:text-white"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
