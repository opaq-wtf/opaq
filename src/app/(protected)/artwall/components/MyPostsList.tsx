"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Link from "next/link";
import {
  Edit,
  Trash2,
  Eye,
  Heart,
  Bookmark,
  Plus,
  Calendar,
  Tag
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
  likes: number;
  saves: number;
  views: number;
}

interface PostWithStats extends Post {
  stats?: PostInteraction;
}

interface MyPostsListProps {
  currentUserId?: string;
}

export function MyPostsList({ currentUserId }: MyPostsListProps) {

  const [posts, setPosts] = useState<PostWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  console.log("Rendering MyPostsList with currentUserId:", currentUserId);
  // Fetch user's posts
  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/posts", {
        params: {
          user_only: true, // This would need to be implemented in the API
          limit: 50
        }
      });

      if (response.data.posts) {
        // Fetch stats for each post
        const postsWithStats = await Promise.all(
          response.data.posts.map(async (post: Post) => {
            try {
              const statsResponse = await axios.get(`/api/interactions?post_id=${post.id}`);
              return {
                ...post,
                stats: statsResponse.data.stats || { likes: 0, saves: 0, views: 0 }
              };
            } catch (error) {
              console.error(`Error fetching stats for post ${post.id}:`, error);
              return {
                ...post,
                stats: { likes: 0, saves: 0, views: 0 }
              };
            }
          })
        );
        setPosts(postsWithStats);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  // Delete post
  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    try {
      setDeleting(postId);
      await axios.delete(`/api/posts/${postId}`);
      setPosts(posts.filter(post => post.id !== postId));
      toast.success("Post deleted successfully");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    } finally {
      setDeleting(null);
    }
  };

  // Toggle post status (publish/unpublish)
  const togglePostStatus = async (post: Post) => {
    try {
      const newStatus = post.status === "Published" ? "Draft" : "Published";
      await axios.put(`/api/posts/${post.id}`, {
        status: newStatus
      });

      setPosts(posts.map(p =>
        p.id === post.id
          ? { ...p, status: newStatus }
          : p
      ));

      toast.success(`Post ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.error("Error updating post status:", error);
      toast.error("Failed to update post status");
    }
  };

  useEffect(() => {
    fetchUserPosts();
  }, []);

  // Filter posts based on status
  const filteredPosts = posts.filter(post => {
    if (filter === "all") return true;
    return post.status.toLowerCase() === filter;
  });

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
      {/* Header with Create Post button and filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-white">My Posts</h2>
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("all")}
              className="text-xs"
            >
              All ({posts.length})
            </Button>
            <Button
              variant={filter === "published" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("published")}
              className="text-xs"
            >
              Published ({posts.filter(p => p.status === "Published").length})
            </Button>
            <Button
              variant={filter === "draft" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("draft")}
              className="text-xs"
            >
              Drafts ({posts.filter(p => p.status === "Draft").length})
            </Button>
          </div>
        </div>

        <Link href="/artwall/upload">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Post
          </Button>
        </Link>
      </div>

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <Card className="bg-gray-900/70 border-gray-700/70 p-8 text-center">
          <div className="text-gray-400">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-medium mb-2">
              {filter === "all"
                ? "No posts yet"
                : `No ${filter} posts`}
            </h3>
            <p className="text-sm mb-4">
              {filter === "all"
                ? "Start creating your first post to share with the community."
                : `You don't have any ${filter} posts.`}
            </p>
            <Link href="/artwall/upload">
              <Button>Create Your First Post</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
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
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${post.status === "Published"
                        ? "bg-green-900/50 text-green-400 border border-green-500/30"
                        : "bg-yellow-900/50 text-yellow-400 border border-yellow-500/30"
                        }`}>
                        {post.status}
                      </span>
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
                        {post.stats && (
                          <>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {post.stats.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {post.stats.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <Bookmark className="w-3 h-3" />
                              {post.stats.saves}
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

                    <Link href={`/artwall/upload?edit=${post.id}`}>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-400">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePostStatus(post)}
                      className={`text-gray-400 hover:text-white ${post.status === "Published" ? "hover:text-yellow-400" : "hover:text-green-400"
                        }`}
                      title={post.status === "Published" ? "Unpublish" : "Publish"}
                    >
                      {post.status === "Published" ? "📤" : "📝"}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                      disabled={deleting === post.id}
                      className="text-gray-400 hover:text-red-400"
                    >
                      {deleting === post.id ? (
                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
