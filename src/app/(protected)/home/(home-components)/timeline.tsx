"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Share2, Bookmark, Flag, Tag, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import axios from 'axios';
import Loader from '@/components/common/Loader';

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
  comments: number;
}

export function ArtwallBody() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [interactions, setInteractions] = useState<
    Record<string, PostInteraction>
  >({});
  const router = useRouter();

  // Function to extract text content and limit description
  const getPostDescription = (htmlContent: string) => {
    // Remove HTML tags and get plain text
    const textContent = htmlContent.replace(/<[^>]*>/g, "").trim();
    const words = textContent.split(" ");

    // Limit to approximately 2 lines (about 20-25 words)
    if (words.length > 25) {
      return words.slice(0, 25).join(" ") + "...";
    }
    return textContent;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Fetch posts from API
  const fetchPosts = async (pageNum: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/posts?status=Published&page=${pageNum}&limit=10`,
      );

      const data = response.data;

      if (append) {
        setPosts((prev) => [...prev, ...data.posts]);
      } else {
        setPosts(data.posts);
      }

      // Fetch interactions for each post
      const interactionPromises = data.posts.map(async (post: Post) => {
        try {
          const interactionResponse = await axios.get(
            `/api/interactions?post_id=${post.id}`,
          );
          const interactionData = interactionResponse.data;
          return {
            postId: post.id,
            ...interactionData.stats,
            ...interactionData.user_interaction,
          };
        } catch (error) {
          console.error("Error fetching interaction for post:", post.id, error);
          return {
            postId: post.id,
            liked: false,
            saved: false,
            likes: 0,
            saves: 0,
            views: 0,
            comments: 0
          };
        }
      });

      const interactionResults = await Promise.all(interactionPromises);
      const newInteractions: Record<string, PostInteraction> = {};

      interactionResults.forEach((result) => {
        newInteractions[result.postId] = {
          liked: result.liked || false,
          saved: result.saved || false,
          likes: result.likes || 0,
          saves: result.saves || 0,
          views: result.views || 0,
          comments: result.comments || 0
        };
      });

      setInteractions((prev) => ({ ...prev, ...newInteractions }));
      setHasMore(data.pagination.page < data.pagination.pages);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  // Handle post interactions
  const handleLike = async (postId: string) => {
    const currentInteraction = interactions[postId];
    const newLikedState = !currentInteraction?.liked;

    // Optimistic update
    setInteractions((prev) => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        liked: newLikedState,
        likes: newLikedState
          ? prev[postId].likes + 1
          : Math.max(0, prev[postId].likes - 1),
      },
    }));

    try {
      const response = await axios.post("/api/interactions", {
        post_id: postId,
        action: "like",
        value: newLikedState,
      });

      const result = response.data;

      // Update with real data from server
      setInteractions((prev) => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          liked: result.interaction.liked,
          likes: result.stats.likes,
        },
      }));

      toast.success(newLikedState ? "Added to likes" : "Removed from likes");
    } catch (error) {
      // Revert optimistic update on error
      setInteractions((prev) => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          liked: currentInteraction?.liked || false,
          likes: currentInteraction?.likes || 0,
        },
      }));
      console.error("Error updating like:", error);
      toast.error("Failed to update like");
    }
  };

  const handleSave = async (postId: string) => {
    const currentInteraction = interactions[postId];
    const newSavedState = !currentInteraction?.saved;

    // Optimistic update
    setInteractions((prev) => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        saved: newSavedState,
        saves: newSavedState
          ? prev[postId].saves + 1
          : Math.max(0, prev[postId].saves - 1),
      },
    }));

    try {
      const response = await axios.post("/api/interactions", {
        post_id: postId,
        action: "save",
        value: newSavedState,
      });

      const result = response.data;

      // Update with real data from server
      setInteractions((prev) => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          saved: result.interaction.saved,
          saves: result.stats.saves,
        },
      }));

      toast.success(newSavedState ? "Post saved" : "Removed from saved posts");
    } catch (error) {
      // Revert optimistic update on error
      setInteractions((prev) => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          saved: currentInteraction?.saved || false,
          saves: currentInteraction?.saves || 0,
        },
      }));
      console.error("Error updating save:", error);
      toast.error("Failed to update save");
    }
  };

  const handleShare = async (post: Post) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: getPostDescription(post.content),
          url: window.location.origin + `/artwall/post/${post.id}`,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          window.location.origin + `/artwall/post/${post.id}`,
        );
        toast.success("Post link copied to clipboard");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("Failed to share post");
    }
  };

  const handleReport = (_postId: string) => {
    // You can implement a proper report modal here
    toast.info("Report functionality will be implemented");
  };

  // Navigate to full post
  const handlePostClick = async (postId: string) => {
    // Navigate to post page - view tracking will be handled by the individual post page
    router.push(`/artwall/post/${postId}`);
  };

  // Load more posts
  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage, true);
    }
  };

  // Load initial posts
  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading && posts.length === 0) {
    return (
      <Loader />
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-gray-300 mb-2">
            No posts yet
          </h2>
          <p className="text-gray-400 mb-6">
            Be the first to share your thoughts!
          </p>
          <Button
            onClick={() => router.push("/artwall/upload")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Create First Post
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Feed Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Latest Posts</h1>
          <p className="text-gray-400">
            Discover amazing content from the community
          </p>
        </div>
        <Button
          onClick={() => router.push("/artwall/upload")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Create Post
        </Button>
      </div>

      {/* Posts Feed */}
      {posts.map((post) => (
        <Card
          key={post.id}
          className="bg-gray-900 border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
          onClick={() => handlePostClick(post.id)}
        >
          <CardHeader className="pb-3">
            {/* User Info */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {post.user.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className="font-medium text-white hover:text-blue-400 cursor-pointer transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/${post.user.username}`);
                    }}
                  >
                    {post.user.full_name}
                  </span>
                  <span className="text-gray-400 text-sm">
                    @{post.user.username}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{formatDate(post.createdAt)}</span>
                  <span>•</span>
                  <span>{interactions[post.id]?.views || 0} views</span>
                </div>
              </div>
            </div>

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-2 line-clamp-2 hover:text-blue-400 transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {getPostDescription(post.content)}
                </p>
              </div>
            </div>

            {/* Labels */}
            {post.labels && post.labels.length > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <Tag className="w-4 h-4 text-gray-400" />
                <div className="flex flex-wrap gap-1">
                  {post.labels.slice(0, 3).map((label, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full"
                    >
                      {label}
                    </span>
                  ))}
                  {post.labels.length > 3 && (
                    <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full">
                      +{post.labels.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="pt-0">
            {/* Action Buttons */}
            <div className="flex items-center justify-between border-t border-gray-700 pt-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(post.id);
                  }}
                  className={`text-gray-400 hover:text-red-400 ${
                    interactions[post.id]?.liked ? "text-red-400" : ""
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 mr-1 ${
                      interactions[post.id]?.liked ? "fill-current" : ""
                    }`}
                  />
                  <span className="text-sm">
                    {interactions[post.id]?.likes || 0}
                  </span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave(post.id);
                  }}
                  className={`text-gray-400 hover:text-blue-400 ${
                    interactions[post.id]?.saved ? "text-blue-400" : ""
                  }`}
                >
                  <Bookmark
                    className={`w-4 h-4 mr-1 ${
                      interactions[post.id]?.saved ? "fill-current" : ""
                    }`}
                  />
                  <span className="text-sm">{interactions[post.id]?.saves || 0}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Navigate to post detail page where comments are displayed
                    router.push(`/artwall/post/${post.id}`);
                  }}
                  className="text-gray-400 hover:text-purple-400"
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm">{interactions[post.id]?.comments || 0}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare(post);
                  }}
                  className="text-gray-400 hover:text-green-400"
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  <span className="text-sm">Share</span>
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReport(post.id);
                }}
                className="text-gray-400 hover:text-yellow-400"
              >
                <Flag className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center py-8">
          <Button
            onClick={loadMore}
            disabled={loading}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-300 mr-2"></div>
                Loading...
              </>
            ) : (
              "Load More Posts"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
