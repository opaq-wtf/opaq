"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Eye, Heart, MessageCircle, Calendar, Edit, Filter, List, Grid3X3 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";

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

interface PostStats {
    likes: number;
    saves: number;
    views: number;
    comments: number;
}

interface PostWithStats extends Post {
    stats?: PostStats;
}

interface ProfileArtwallPostsProps {
    userId: string;
    isOwnProfile: boolean;
}

export default function ProfileArtwallPosts({ userId, isOwnProfile }: ProfileArtwallPostsProps) {
    const [posts, setPosts] = useState<PostWithStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "published" | "draft">("published");
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        pages: 0
    });
    const router = useRouter();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    const truncateContent = (content: string, maxLength: number = 150) => {
        const textContent = content.replace(/<[^>]*>/g, ""); // Remove HTML tags
        return textContent.length > maxLength
            ? textContent.substring(0, maxLength) + "..."
            : textContent;
    };

    useEffect(() => {
        fetchPosts();
    }, [userId, filter, pagination.page]);

    const fetchPosts = async (page: number = pagination.page) => {
        try {
            setLoading(true);

            // Build query parameters
            const params: any = {
                limit: pagination.limit,
                page: page,
            };

            if (isOwnProfile) {
                params.user_only = true;
                if (filter !== "all") {
                    params.status = filter === "published" ? "Published" : "Draft";
                }
            } else {
                params.user_id = userId;
                // For other users, only show published posts
                params.status = filter === "published" ? "Published" : "Draft";
            }

            const response = await axios.get("/api/posts", { params });

            if (response.data.posts) {
                // Fetch stats for each post
                const postsWithStats = await Promise.all(
                    response.data.posts.map(async (post: Post) => {
                        try {
                            const statsResponse = await axios.get(`/api/interactions?post_id=${post.id}`);
                            return {
                                ...post,
                                stats: statsResponse.data.stats || { likes: 0, saves: 0, views: 0, comments: 0 }
                            };
                        } catch (error) {
                            console.error(`Failed to fetch stats for post ${post.id}`, error);

                            return {
                                ...post,
                                stats: { likes: 0, saves: 0, views: 0, comments: 0 }
                            };
                        }
                    })
                );

                setPosts(postsWithStats);

                // Update pagination
                if (response.data.pagination) {
                    setPagination(prev => ({
                        ...prev,
                        total: response.data.pagination.total,
                        pages: response.data.pagination.pages,
                        page: response.data.pagination.page
                    }));
                }
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
            toast.error("Failed to fetch posts");
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const handlePostClick = (postId: string) => {
        router.push(`/artwall/post/${postId}`);
    };

    const handleEditClick = (e: React.MouseEvent, postId: string) => {
        e.stopPropagation();
        router.push(`/artwall/upload?edit=${postId}`);
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="bg-gray-800 border-gray-700 animate-pulse">
                        <CardContent className="p-6">
                            <div className="h-6 bg-gray-700 rounded mb-3" />
                            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
                            <div className="h-4 bg-gray-700 rounded w-1/2" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-8 text-center">
                    <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                        {isOwnProfile ? "No posts yet" : "No public posts"}
                    </h3>
                    <p className="text-gray-400 mb-4">
                        {isOwnProfile
                            ? "Start sharing your thoughts and ideas with the community!"
                            : "This user hasn't published any posts yet."
                        }
                    </p>
                    {isOwnProfile && (
                        <Button
                            onClick={() => router.push("/artwall/upload")}
                            className="bg-yellow-400 hover:bg-yellow-500 text-black"
                        >
                            Create Your First Post
                        </Button>
                    )}
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Enhanced Header with Filters and View Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {/* Filter Tabs */}
                <div className="flex gap-2">
                    {isOwnProfile && (
                        <>
                            <Button
                                variant={filter === "all" ? "default" : "ghost"}
                                onClick={() => setFilter("all")}
                                className={filter === "all" ? "bg-yellow-400 text-black" : "text-gray-400 hover:text-white"}
                                size="sm"
                            >
                                <Filter className="w-4 h-4 mr-1" />
                                All ({posts.length})
                            </Button>
                            <Button
                                variant={filter === "published" ? "default" : "ghost"}
                                onClick={() => setFilter("published")}
                                className={filter === "published" ? "bg-yellow-400 text-black" : "text-gray-400 hover:text-white"}
                                size="sm"
                            >
                                Published
                            </Button>
                            <Button
                                variant={filter === "draft" ? "default" : "ghost"}
                                onClick={() => setFilter("draft")}
                                className={filter === "draft" ? "bg-yellow-400 text-black" : "text-gray-400 hover:text-white"}
                                size="sm"
                            >
                                Drafts
                            </Button>
                        </>
                    )}
                    {!isOwnProfile && (
                        <div className="text-gray-400 text-sm">
                            {pagination.total} published post{pagination.total !== 1 ? 's' : ''}
                        </div>
                    )}
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className={`${viewMode === "list" ? "text-yellow-400" : "text-gray-400"} hover:text-white`}
                    >
                        <List className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className={`${viewMode === "grid" ? "text-yellow-400" : "text-gray-400"} hover:text-white`}
                    >
                        <Grid3X3 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Posts Display */}
            <div className={viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                : "space-y-6"
            }>
                {posts.map((post) => (
                    <Card
                        key={post.id}
                        className="bg-gray-900 border-gray-700 hover:border-gray-600 transition-all duration-200 cursor-pointer hover:shadow-lg"
                        onClick={() => handlePostClick(post.id)}
                    >
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CardTitle className="text-lg font-semibold text-white line-clamp-2 hover:text-yellow-400 transition-colors">
                                            {post.title}
                                        </CardTitle>
                                        {post.status === "Draft" && (
                                            <span className="px-2 py-1 text-xs bg-yellow-400/20 text-yellow-400 rounded-full border border-yellow-400/30">
                                                Draft
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {isOwnProfile && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => handleEditClick(e, post.id)}
                                        className="text-gray-400 hover:text-yellow-400 ml-2"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className="pt-0">
                            <p className="text-gray-400 mb-4 line-clamp-3 leading-relaxed">
                                {truncateContent(post.content, viewMode === "grid" ? 120 : 200)}
                            </p>

                            {/* Labels */}
                            {post.labels && post.labels.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {post.labels.slice(0, viewMode === "grid" ? 2 : 4).map((label, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded-full border border-gray-700"
                                        >
                                            #{label}
                                        </span>
                                    ))}
                                    {post.labels.length > (viewMode === "grid" ? 2 : 4) && (
                                        <span className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded-full border border-gray-700">
                                            +{post.labels.length - (viewMode === "grid" ? 2 : 4)} more
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Post Stats and Date */}
                            <div className="flex items-center justify-between text-sm text-gray-400 pt-3 border-t border-gray-800">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 hover:text-red-400 transition-colors">
                                        <Heart className="w-4 h-4" />
                                        <span>{post.stats?.likes || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                                        <MessageCircle className="w-4 h-4" />
                                        <span>{post.stats?.comments || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1 hover:text-green-400 transition-colors">
                                        <Eye className="w-4 h-4" />
                                        <span>{post.stats?.views || 0}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 text-xs">
                                    <Calendar className="w-3 h-3" />
                                    <span>{formatDate(post.createdAt)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="text-gray-400 hover:text-white disabled:opacity-50"
                    >
                        Previous
                    </Button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                                <Button
                                    key={pageNum}
                                    variant={pagination.page === pageNum ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => handlePageChange(pageNum)}
                                    className={pagination.page === pageNum
                                        ? "bg-yellow-400 text-black"
                                        : "text-gray-400 hover:text-white"
                                    }
                                >
                                    {pageNum}
                                </Button>
                            );
                        })}
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                        className="text-gray-400 hover:text-white disabled:opacity-50"
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Quick Create Button for Own Profile */}
            {isOwnProfile && (
                <div className="flex justify-center pt-4">
                    <Button
                        onClick={() => router.push("/artwall/upload")}
                        className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                    >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Create New Post
                    </Button>
                </div>
            )}
        </div>
    );
}
