"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Link from "next/link";
import {
  Eye,
  Heart,
  Bookmark,
  Calendar,
  Tag,
  HeartOff,
  BookmarkX,
  Share2,
  MessageCircle
} from "lucide-react";
import { toast } from "sonner";

interface Post {
  _id: string;
  id: string;
  user_id: string;
  title: string;
  content: string;
  labels: string[];
  status: "Draft" | "Published";
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
  comments: number;
}

interface PostWithInteraction extends Post {
  interaction?: PostInteraction;
}

interface LikedPostsListProps {
  currentUserId?: string;
}

export function LikedPostsList({ currentUserId }: LikedPostsListProps) {
  const [posts, setPosts] = useState<PostWithInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"liked" | "saved">("liked");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch user's liked/saved posts
  const fetchLikedPosts = async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      // Get user interactions first
      const interactionsResponse = await axios.get(`/api/interactions?user_id=${currentUserId}`);
      const interactions = interactionsResponse.data.interactions || [];

      // Filter interactions based on current filter
      const filteredInteractions = interactions.filter((interaction: any) => {
        if (filter === "liked") return interaction.liked;
        if (filter === "saved") return interaction.saved;
        return false;
      });

      // Get the post IDs
      const postIds = filteredInteractions.map((interaction: any) => interaction.post_id);

      if (postIds.length === 0) {
        setPosts([]);
        setHasMore(false);
        return;
      }

      // Fetch posts data for those IDs (we'll need to implement pagination here)
      const startIndex = (pageNum - 1) * 10;
      const endIndex = startIndex + 10;
      const paginatedPostIds = postIds.slice(startIndex, endIndex);

      if (paginatedPostIds.length === 0) {
        setHasMore(false);
        return;
      }

      // Fetch posts details
      const postsWithDetails = await Promise.all(
        paginatedPostIds.map(async (postId: string) => {
          try {
            const postResponse = await axios.get(`/api/posts/${postId}`);
            const interactionResponse = await axios.get(`/api/interactions?post_id=${postId}`);

            return {
              ...postResponse.data.post,
              interaction: {
                ...interactionResponse.data.user_interaction,
                ...interactionResponse.data.stats
              }
            };
          } catch (error) {
            console.error(`Error fetching post ${postId}:`, error);
            return null;
          }
        })
      );

      const validPosts = postsWithDetails.filter(post => post !== null);

      if (append) {
        setPosts(prev => [...prev, ...validPosts]);
      } else {
        setPosts(validPosts);
      }

      setHasMore(postIds.length > endIndex);
    } catch (error) {
      console.error("Error fetching liked posts:", error);
      toast.error("Failed to fetch posts");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Handle like/unlike
  const handleLike = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post?.interaction) return;

    const newLikedState = !post.interaction.liked;

    // Optimistic update
    setPosts(posts.map(p =>
      p.id === postId && p.interaction
        ? {
          ...p,
          interaction: {
            ...p.interaction,
            liked: newLikedState,
            likes: newLikedState ? p.interaction.likes + 1 : Math.max(0, p.interaction.likes - 1)
          }
        }
        : p
    ));

    try {
      await axios.post("/api/interactions", {
        post_id: postId,
        action: "like",
        value: newLikedState,
      });

      toast.success(newLikedState ? "Added to likes" : "Removed from likes");

      // If we're viewing liked posts and user unliked, remove from list
      if (filter === "liked" && !newLikedState) {
        setPosts(posts.filter(p => p.id !== postId));
      }
    } catch (error) {
      // Revert optimistic update on error
      setPosts(posts.map(p =>
        p.id === postId && p.interaction
          ? {
            ...p,
            interaction: {
              ...p.interaction,
              liked: !newLikedState,
              likes: newLikedState ? p.interaction.likes - 1 : p.interaction.likes + 1
            }
          }
          : p
      ));
      console.error("Error updating like:", error);
      toast.error("Failed to update like");
    }
  };

  // Handle save/unsave
  const handleSave = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post?.interaction) return;

    const newSavedState = !post.interaction.saved;

    // Optimistic update
    setPosts(posts.map(p =>
      p.id === postId && p.interaction
        ? {
          ...p,
          interaction: {
            ...p.interaction,
            saved: newSavedState,
            saves: newSavedState ? p.interaction.saves + 1 : Math.max(0, p.interaction.saves - 1)
          }
        }
        : p
    ));

    try {
      await axios.post("/api/interactions", {
        post_id: postId,
        action: "save",
        value: newSavedState,
      });

      toast.success(newSavedState ? "Post saved" : "Removed from saved posts");

      // If we're viewing saved posts and user unsaved, remove from list
      if (filter === "saved" && !newSavedState) {
        setPosts(posts.filter(p => p.id !== postId));
      }
    } catch (error) {
      // Revert optimistic update on error
      setPosts(posts.map(p =>
        p.id === postId && p.interaction
          ? {
            ...p,
            interaction: {
              ...p.interaction,
              saved: !newSavedState,
              saves: newSavedState ? p.interaction.saves - 1 : p.interaction.saves + 1
            }
          }
          : p
      ));
      console.error("Error updating save:", error);
      toast.error("Failed to update save");
    }
  };

  // Share post
  const handleShare = async (post: Post) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.content.substring(0, 100) + "...",
          url: `${window.location.origin}/artwall/post/${post.id}`,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${window.location.origin}/artwall/post/${post.id}`);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("Failed to share post");
    }
  };

  // Load more posts
  const loadMore = () => {
    if (!loadingMore && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      setPage(1); // Reset page when filter changes
      fetchLikedPosts(1, false);
    }
  }, [currentUserId, filter]);

  useEffect(() => {
    if (page > 1) {
      fetchLikedPosts(page, true);
    }
  }, [page]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // Truncate content for preview
  const truncateContent = (content: string, maxLength: number = 150) => {
    const textContent = content.replace(/<[^>]*>/g, ""); // Remove HTML tags
    return textContent.length > maxLength
      ? textContent.substring(0, maxLength) + "..."
      : textContent;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-gray-900/70 border-gray-700/70 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-2/3"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-white">
            {filter === "liked" ? "Liked Posts" : "Saved Posts"}
          </h2>
          <div className="flex gap-2">
            <Button
              variant={filter === "liked" ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setFilter("liked");
                setPage(1);
                setPosts([]);
              }}
              className="text-xs"
            >
              <Heart className="w-3 h-3 mr-1" />
              Liked
            </Button>
            <Button
              variant={filter === "saved" ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setFilter("saved");
                setPage(1);
                setPosts([]);
              }}
              className="text-xs"
            >
              <Bookmark className="w-3 h-3 mr-1" />
              Saved
            </Button>
          </div>
        </div>
      </div>

      {/* Posts List */}
      {posts.length === 0 ? (
        <Card className="bg-gray-900/70 border-gray-700/70 p-8 text-center">
          <div className="text-gray-400">
            <div className="text-4xl mb-4">
              {filter === "liked" ? "❤️" : "🔖"}
            </div>
            <h3 className="text-lg font-medium mb-2">
              No {filter} posts yet
            </h3>
            <p className="text-sm mb-4">
              {filter === "liked"
                ? "Posts you like will appear here. Start exploring and liking posts you enjoy!"
                : "Posts you save will appear here. Save posts to read them later!"
              }
            </p>
            <Link href="/home">
              <Button>Explore Posts</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="bg-gray-900/70 border-gray-700/70 hover:border-gray-600/70 transition-all duration-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Link
                        href={`/artwall/post/${post.id}`}
                        className="text-lg font-semibold text-white hover:text-blue-400 transition-colors"
                      >
                        {post.title}
                      </Link>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        post.status === "Published"
                          ? "bg-green-900/50 text-green-400 border border-green-500/30"
                          : "bg-yellow-900/50 text-yellow-400 border border-yellow-500/30"
                      }`}>
                        {post.status}
                      </span>
                    </div>

                    {/* Author info */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm text-gray-400">by</span>
                      <Link
                        href={`/${post.user.username}`}
                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        @{post.user.username}
                      </Link>
                    </div>

                    <p className="text-gray-400 text-sm mb-3">
                      {truncateContent(post.content)}
                    </p>

                    {/* Labels */}
                    {post.labels && post.labels.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.labels.map((label, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-md flex items-center gap-1"
                          >
                            <Tag className="w-3 h-3" />
                            {label}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Post stats and meta */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(post.createdAt)}
                        </span>
                        {post.interaction && (
                          <>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {post.interaction.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {post.interaction.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <Bookmark className="w-3 h-3" />
                              {post.interaction.saves}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {post.interaction.comments}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 ml-4">
                    <Link href={`/artwall/post/${post.id}`}>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className={`${
                        post.interaction?.liked
                          ? "text-red-400 hover:text-red-300"
                          : "text-gray-400 hover:text-red-400"
                      }`}
                    >
                      {post.interaction?.liked ? <Heart className="w-4 h-4 fill-current" /> : <Heart className="w-4 h-4" />}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSave(post.id)}
                      className={`${
                        post.interaction?.saved
                          ? "text-blue-400 hover:text-blue-300"
                          : "text-gray-400 hover:text-blue-400"
                      }`}
                    >
                      {post.interaction?.saved ? <Bookmark className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare(post)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={loadMore}
                disabled={loadingMore}
                variant="outline"
                className="bg-gray-800/50 border-gray-700 hover:bg-gray-700/50"
              >
                {loadingMore ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </div>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
