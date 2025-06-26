"use client";

/*
 * Enhanced View Tracking System:
 * - Views are only counted when users spend meaningful time reading the post
 * - Minimum view time is calculated based on post length (20% of estimated reading time, min 15 seconds)
 * - Views are tracked through multiple engagement signals: time spent, scrolling, and page visibility
 * - Users can only increment view count once per 24 hours to prevent spam while counting return visits
 * - Similar to likes/saves system but with time-based qualification
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DiscussionSection } from '@/app/(protected)/artwall/post/(discussion-components)/DiscussionSection';
import {
  ArrowLeft,
  Heart,
  Share2,
  Bookmark,
  Flag,
  Calendar,
  Tag,
  Eye,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface Post {
  _id: string;
  id: string;
  user_id: string;
  title: string;
  content: string;
  labels: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    full_name: string;
  };
}

interface PostInteraction {
  liked: boolean;
  saved: boolean;
  likes: number;
  saves: number;
  views: number;
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null);
  const [interaction, setInteraction] = useState<PostInteraction>({
    liked: false,
    saved: false,
    likes: 0,
    saves: 0,
    views: 0,
  });
  const [viewTracked, setViewTracked] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  const postId = params.id as string;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Calculate reading time based on content
  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const textContent = content.replace(/<[^>]*>/g, "").trim();
    const wordCount = textContent.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime;
  };

  // Calculate minimum viewing time based on content
  const calculateMinViewTime = (content: string) => {
    const readingTime = calculateReadingTime(content);
    // Minimum view time should be at least 15 seconds, or 20% of estimated reading time
    const minTime = Math.max(15000, readingTime * 60 * 1000 * 0.2); // 20% of reading time in milliseconds
    return Math.min(minTime, 45000); // Cap at 45 seconds for very long posts
  };

  // Track qualified view based on time spent
  const trackView = async () => {
    if (!post || viewTracked) return;

    try {
      await fetch("/api/interactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_id: postId,
          action: "view",
          value: true,
        }),
      });
      setViewTracked(true);
    } catch (error) {
      console.error("Error tracking view:", error);
    }
  };

  // Fetch post by ID
  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts/${postId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch post");
      }

      const data = await response.json();
      setPost(data.post);
      setStartTime(Date.now()); // Record when user started viewing the post

      // Fetch current user - this is a simple approach
      // In a real app, you'd get this from your auth context/provider
      try {
        // For now, we'll extract user ID from the session or make an API call
        // This is a placeholder - you'll need to implement based on your auth system
        const userResponse = await fetch('/api/auth/me');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setCurrentUser({ id: userData.id, username: userData.username });
        }
      } catch (userError) {
        console.warn('Could not fetch current user:', userError);
        // Set a fallback or handle gracefully
        setCurrentUser(null);
      }

      // Fetch interaction data
      const interactionResponse = await fetch(
        `/api/interactions?post_id=${postId}`,
      );
      if (interactionResponse.ok) {
        const interactionData = await interactionResponse.json();
        setInteraction({
          liked: interactionData.user_interaction.liked,
          saved: interactionData.user_interaction.saved,
          likes: interactionData.stats.likes,
          saves: interactionData.stats.saves,
          views: interactionData.stats.views,
        });
      }

      // Note: View tracking is now handled by the time-based system below
    } catch (error) {
      console.error("Error fetching post:", error);
      toast.error("Failed to load post");
      router.push("/artwall");
    } finally {
      setLoading(false);
    }
  };

  // Handle interactions
  const handleLike = async () => {
    const newLikedState = !interaction.liked;

    // Optimistic update
    setInteraction((prev) => ({
      ...prev,
      liked: newLikedState,
      likes: newLikedState ? prev.likes + 1 : Math.max(0, prev.likes - 1),
    }));

    try {
      const response = await fetch("/api/interactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_id: postId,
          action: "like",
          value: newLikedState,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update like");
      }

      const result = await response.json();

      // Update with real data from server
      setInteraction((prev) => ({
        ...prev,
        liked: result.interaction.liked,
        likes: result.stats.likes,
        views: result.stats.views,
      }));

      toast.success(newLikedState ? "Added to likes" : "Removed from likes");
    } catch (error) {
      // Revert optimistic update on error
      setInteraction((prev) => ({
        ...prev,
        liked: !newLikedState,
        likes: newLikedState ? prev.likes - 1 : prev.likes + 1,
      }));
      console.error("Error updating like:", error);
      toast.error("Failed to update like");
    }
  };

  const handleSave = async () => {
    const newSavedState = !interaction.saved;

    // Optimistic update
    setInteraction((prev) => ({
      ...prev,
      saved: newSavedState,
      saves: newSavedState ? prev.saves + 1 : Math.max(0, prev.saves - 1),
    }));

    try {
      const response = await fetch("/api/interactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_id: postId,
          action: "save",
          value: newSavedState,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update save");
      }

      const result = await response.json();

      // Update with real data from server
      setInteraction((prev) => ({
        ...prev,
        saved: result.interaction.saved,
        saves: result.stats.saves,
        views: result.stats.views,
      }));

      toast.success(newSavedState ? "Post saved" : "Removed from saved posts");
    } catch (error) {
      // Revert optimistic update on error
      setInteraction((prev) => ({
        ...prev,
        saved: !newSavedState,
        saves: newSavedState ? prev.saves - 1 : prev.saves + 1,
      }));
      console.error("Error updating save:", error);
      toast.error("Failed to update save");
    }
  };

  const handleShare = async () => {
    if (!post) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: `Check out this post: ${post.title}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Post link copied to clipboard");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("Failed to share post");
    }
  };

  const handleReport = () => {
    toast.info("Report functionality will be implemented");
  };

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  // Time-based view tracking
  useEffect(() => {
    if (!post || viewTracked || startTime === 0) return;

    const minViewTime = calculateMinViewTime(post.content);

    const timer = setTimeout(() => {
      const timeSpent = Date.now() - startTime;
      if (timeSpent >= minViewTime) {
        trackView();
      }
    }, minViewTime);

    // Also track view when user scrolls significantly or interacts with the page
    let hasScrolled = false;
    const handleScroll = () => {
      if (!hasScrolled && window.scrollY > 150) {
        // Scrolled more than 150px (shows engagement)
        hasScrolled = true;
        const timeSpent = Date.now() - startTime;
        if (timeSpent >= 8000) {
          // At least 8 seconds spent reading
          trackView();
        }
      }
    };

    // Track view on page visibility change (user switches tabs/comes back)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        const timeSpent = Date.now() - startTime;
        const minViewTime = calculateMinViewTime(post.content);
        // Track if user spent reasonable time reading (at least 12 seconds or calculated min time)
        if (timeSpent >= Math.max(minViewTime, 12000)) {
          trackView();
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [post, viewTracked, startTime]);

  // Track view when component unmounts (user navigates away)
  useEffect(() => {
    return () => {
      if (post && !viewTracked && startTime > 0) {
        const timeSpent = Date.now() - startTime;
        const minViewTime = calculateMinViewTime(post.content);
        // Track if user spent adequate time reading (at least 8 seconds or calculated min time)
        if (timeSpent >= Math.max(minViewTime, 8000)) {
          // Use navigator.sendBeacon for reliable tracking on page unload
          if (navigator.sendBeacon) {
            const blob = new Blob(
              [
                JSON.stringify({
                  post_id: postId,
                  action: "view",
                  value: true,
                }),
              ],
              { type: "application/json" },
            );
            navigator.sendBeacon("/api/interactions", blob);
          } else {
            trackView();
          }
        }
      }
    };
  }, [post, viewTracked, startTime, postId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-2xl font-bold text-gray-300 mb-2">Post not found</h2>
          <p className="text-gray-400 mb-6">The post you're looking for doesn't exist or has been removed.</p>
          <Button
            onClick={() => router.push("/artwall")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Back to Feed
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 w-full bg-black/95 backdrop-blur-sm shadow-lg px-6 py-4 flex items-center justify-between border-b border-gray-800 z-40">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="32" height="32" rx="8" fill="#FF5722" />
              <path
                d="M20.5 10.5C20.5 9.11929 19.3807 8 18 8H12C10.6193 8 9.5 9.11929 9.5 10.5V21.5C9.5 22.8807 10.6193 24 12 24H20C21.3807 24 22.5 22.8807 22.5 21.5V13C22.5 11.6193 21.3807 10.5 20.5 10.5Z"
                fill="white"
              />
            </svg>
            <span className="font-bold text-xl text-white">Artwall</span>
          </div>
        </div>

        {/* Action buttons in header */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`text-gray-400 hover:text-red-400 ${
              interaction.liked ? "text-red-400" : ""
            }`}
          >
            <Heart
              className={`w-4 h-4 ${interaction.liked ? "fill-current" : ""}`}
            />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className={`text-gray-400 hover:text-blue-400 ${
              interaction.saved ? "text-blue-400" : ""
            }`}
          >
            <Bookmark
              className={`w-4 h-4 ${interaction.saved ? "fill-current" : ""}`}
            />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="text-gray-400 hover:text-green-400"
          >
            <Share2 className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReport}
            className="text-gray-400 hover:text-yellow-400"
          >
            <Flag className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="pb-6">
            {/* Post Title */}
            <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Post Meta Information */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {post.user.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className="font-medium text-white hover:text-blue-400 cursor-pointer transition-colors"
                    onClick={() => router.push(`/${post.user.username}`)}
                  >
                    {post.user.full_name}
                  </span>
                  <span className="text-gray-400 text-sm">
                    @{post.user.username}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mt-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{calculateReadingTime(post.content)} min read</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{interaction.views} views</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Labels */}
            {post.labels && post.labels.length > 0 && (
              <div className="flex items-center gap-2 mb-6">
                <Tag className="w-4 h-4 text-gray-400" />
                <div className="flex flex-wrap gap-2">
                  {post.labels.map((label, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-full border border-gray-700"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Interaction Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-400 border-t border-gray-700 pt-4">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{interaction.likes} likes</span>
              </div>
              <div className="flex items-center gap-1">
                <Bookmark className="w-4 h-4" />
                <span>{interaction.saves} saves</span>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Post Content */}
            <div
              className="prose prose-lg prose-invert max-w-none"
              style={{
                fontSize: "1.1rem",
                lineHeight: "1.8",
                color: "#e5e7eb",
              }}
            >
              <div
                dangerouslySetInnerHTML={{ __html: post.content }}
                className="post-content"
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Bar at Bottom */}
        <Card className="bg-gray-900 border-gray-700 mt-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={handleLike}
                  className={`text-gray-400 hover:text-red-400 ${
                    interaction.liked ? "text-red-400" : ""
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 mr-2 ${
                      interaction.liked ? "fill-current" : ""
                    }`}
                  />
                  <span>
                    {interaction.liked ? "Liked" : "Like"} ({interaction.likes})
                  </span>
                </Button>

                <Button
                  variant="ghost"
                  onClick={handleSave}
                  className={`text-gray-400 hover:text-blue-400 ${
                    interaction.saved ? "text-blue-400" : ""
                  }`}
                >
                  <Bookmark
                    className={`w-5 h-5 mr-2 ${
                      interaction.saved ? "fill-current" : ""
                    }`}
                  />
                  <span>
                    {interaction.saved ? "Saved" : "Save"} ({interaction.saves})
                  </span>
                </Button>

                <Button
                  variant="ghost"
                  onClick={handleShare}
                  className="text-gray-400 hover:text-green-400"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share
                </Button>
              </div>

              <Button
                variant="ghost"
                onClick={handleReport}
                className="text-gray-400 hover:text-yellow-400"
              >
                <Flag className="w-5 h-5 mr-2" />
                Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Discussions Section */}
        <div className="mt-8">
          <DiscussionSection
            postId={postId}
            postAuthorId={post.user_id}
            currentUserId={currentUser?.id}
          />
        </div>
      </main>

      {/* Custom styles for post content */}
      <style jsx global>{`
        .post-content h1,
        .post-content h2,
        .post-content h3,
        .post-content h4,
        .post-content h5,
        .post-content h6 {
          color: #ffffff;
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .post-content h1 {
          font-size: 2rem;
        }
        .post-content h2 {
          font-size: 1.75rem;
        }
        .post-content h3 {
          font-size: 1.5rem;
        }
        .post-content h4 {
          font-size: 1.25rem;
        }

        .post-content p {
          margin-bottom: 1.5rem;
          line-height: 1.8;
        }

        .post-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 2rem 0;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }

        .post-content ul,
        .post-content ol {
          margin: 1.5rem 0;
          padding-left: 2rem;
        }

        .post-content li {
          margin-bottom: 0.5rem;
        }

        .post-content blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          margin: 2rem 0;
          font-style: italic;
          color: #d1d5db;
          background: rgba(59, 130, 246, 0.1);
          padding: 1rem;
          border-radius: 4px;
        }

        .post-content code {
          background: #374151;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-family: "Monaco", "Consolas", monospace;
          font-size: 0.9rem;
        }

        .post-content pre {
          background: #1f2937;
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
          margin: 1.5rem 0;
        }

        .post-content pre code {
          background: none;
          padding: 0;
        }
      `}</style>
    </div>
  );
}
