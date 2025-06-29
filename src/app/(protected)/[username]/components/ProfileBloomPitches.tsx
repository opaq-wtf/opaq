"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Eye,
    Heart,
    Calendar,
    Edit,
    Lock,
    Globe,
    FileText,
    Image as ImageIcon,
    Video,
    File,
    Filter,
    List,
    Grid3X3,
    Lightbulb
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";

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

interface ProfileBloomPitchesProps {
    userId: string;
    isOwnProfile: boolean;
}

export default function ProfileBloomPitches({ userId, isOwnProfile }: ProfileBloomPitchesProps) {
    const [pitches, setPitches] = useState<Pitch[]>([]);
    const [allPitches, setAllPitches] = useState<Pitch[]>([]); // Store all pitches for accurate counting
    const [loading, setLoading] = useState(true);
    // Set initial filter based on profile type
    const [filter, setFilter] = useState<"all" | "public" | "private">(isOwnProfile ? "all" : "public");
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        pages: 0
    });
    const router = useRouter();

    // Get counts for different visibility states
    const getCounts = () => {
        if (!isOwnProfile) return { all: allPitches.length, public: allPitches.length, private: 0 };

        const publicCount = allPitches.filter(pitch => pitch.visibility === "public").length;
        const privateCount = allPitches.filter(pitch => pitch.visibility === "private").length;
        return {
            all: allPitches.length,
            public: publicCount,
            private: privateCount
        };
    };

    const counts = getCounts();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    const truncateDescription = (description: string, maxLength: number = 150) => {
        return description.length > maxLength
            ? description.substring(0, maxLength) + "..."
            : description;
    };

    const getFileType = (fileUrl: string) => {
        const extension = fileUrl.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return 'image';
        if (['mp4', 'webm', 'ogg'].includes(extension || '')) return 'video';
        if (['pdf'].includes(extension || '')) return 'pdf';
        return 'file';
    };

    const getFileIcon = (fileType: string) => {
        switch (fileType) {
            case 'image': return <ImageIcon className="w-6 h-6" />;
            case 'video': return <Video className="w-6 h-6" />;
            case 'pdf': return <FileText className="w-6 h-6" />;
            default: return <File className="w-6 h-6" />;
        }
    };

    useEffect(() => {
        fetchPitches();
    }, [userId, filter, pagination.page]);

    // Reset filter when profile type changes
    useEffect(() => {
        setFilter(isOwnProfile ? "all" : "public");
    }, [isOwnProfile]);

    const fetchPitches = async (page: number = pagination.page) => {
        try {
            setLoading(true);

            // Build query parameters
            const params: any = {
                limit: pagination.limit,
                page: page,
            };

            if (isOwnProfile) {
                params.user_only = true;
                // For own profile, don't filter by visibility in API call
                // We'll handle filtering on the frontend to get accurate counts
            } else {
                params.user_id = userId;
                // For other users, only fetch public pitches
                params.visibility = "public";
            }

            const response = await axios.get("/api/pitches", { params });

            if (response.data.pitches) {
                const allUserPitches = response.data.pitches;

                console.log(`[ProfileBloomPitches] Fetched ${allUserPitches.length} pitches for ${isOwnProfile ? 'own' : 'other'} profile`);
                console.log(`[ProfileBloomPitches] Current filter: ${filter}`);

                // Store all pitches for counting
                if (isOwnProfile) {
                    setAllPitches(allUserPitches);
                } else {
                    // For other users, we already filtered to public only
                    const publicPitches = allUserPitches.filter((pitch: Pitch) => pitch.visibility === "public");
                    setAllPitches(publicPitches);
                    console.log(`[ProfileBloomPitches] Found ${publicPitches.length} public pitches out of ${allUserPitches.length} total`);
                }

                // Filter pitches based on current filter
                let filteredPitches = allUserPitches;
                if (isOwnProfile) {
                    if (filter === "public") {
                        filteredPitches = allUserPitches.filter((pitch: Pitch) => pitch.visibility === "public");
                    } else if (filter === "private") {
                        filteredPitches = allUserPitches.filter((pitch: Pitch) => pitch.visibility === "private");
                    }
                    // If filter === "all", show all pitches (no filtering)
                    console.log(`[ProfileBloomPitches] Filtered to ${filteredPitches.length} pitches with filter: ${filter}`);
                } else {
                    // For other users, we already filtered to public only in the API call
                    filteredPitches = allUserPitches.filter((pitch: Pitch) => pitch.visibility === "public");
                    console.log(`[ProfileBloomPitches] Showing ${filteredPitches.length} public pitches for other user`);
                }

                setPitches(filteredPitches);

                // Update pagination
                const total = filteredPitches.length;
                setPagination(prev => ({
                    ...prev,
                    total,
                    pages: Math.ceil(total / pagination.limit),
                    page: page
                }));
            }
        } catch (error) {
            console.error("Error fetching pitches:", error);
            toast.error("Failed to fetch pitches");
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const handlePitchClick = (pitchId: string) => {
        router.push(`/bloom/pitch/${pitchId}`);
    };

    const handleEditClick = (e: React.MouseEvent, pitchId: string) => {
        e.stopPropagation();
        router.push(`/bloom/upload?edit=${pitchId}`);
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="bg-gray-800 border-gray-700 animate-pulse">
                        <CardContent className="p-6">
                            <div className="flex gap-4">
                                <div className="w-20 h-20 bg-gray-700 rounded" />
                                <div className="flex-1">
                                    <div className="h-6 bg-gray-700 rounded mb-3" />
                                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
                                    <div className="h-4 bg-gray-700 rounded w-1/2" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (pitches.length === 0) {
        const getEmptyMessage = () => {
            if (isOwnProfile) {
                if (filter === "all") return "No pitches yet";
                if (filter === "public") return "No public pitches yet";
                if (filter === "private") return "No private pitches yet";
            }
            return "No public pitches";
        };

        const getEmptyDescription = () => {
            if (isOwnProfile) {
                if (filter === "private") return "Create some private pitches to work on your ideas before sharing them publicly.";
                return "Start sharing your innovative ideas and projects!";
            }
            return "This user hasn't shared any public pitches yet.";
        };

        return (
            <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-8 text-center">
                    <Lightbulb className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                        {getEmptyMessage()}
                    </h3>
                    <p className="text-gray-400 mb-4">
                        {getEmptyDescription()}
                    </p>
                    {isOwnProfile && (
                        <Button
                            onClick={() => router.push("/bloom/upload")}
                            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                        >
                            <Lightbulb className="w-4 h-4 mr-2" />
                            Create Your First Pitch
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
                                All ({counts.all})
                            </Button>
                            <Button
                                variant={filter === "public" ? "default" : "ghost"}
                                onClick={() => setFilter("public")}
                                className={filter === "public" ? "bg-yellow-400 text-black" : "text-gray-400 hover:text-white"}
                                size="sm"
                            >
                                <Globe className="w-4 h-4 mr-1" />
                                Public ({counts.public})
                            </Button>
                            <Button
                                variant={filter === "private" ? "default" : "ghost"}
                                onClick={() => setFilter("private")}
                                className={filter === "private" ? "bg-yellow-400 text-black" : "text-gray-400 hover:text-white"}
                                size="sm"
                            >
                                <Lock className="w-4 h-4 mr-1" />
                                Private ({counts.private})
                            </Button>
                        </>
                    )}
                    {!isOwnProfile && (
                        <div className="text-gray-400 text-sm">
                            {counts.public} public pitch{counts.public !== 1 ? 'es' : ''}
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

            {/* Pitches Display */}
            <div className={viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                : "space-y-6"
            }>
                {pitches.map((pitch) => (
                    <Card
                        key={pitch.id}
                        className="bg-gray-900 border-gray-700 hover:border-gray-600 transition-all duration-200 cursor-pointer hover:shadow-lg"
                        onClick={() => handlePitchClick(pitch.id)}
                    >
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CardTitle className="text-lg font-semibold text-white line-clamp-2 hover:text-yellow-400 transition-colors">
                                            {pitch.title}
                                        </CardTitle>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {pitch.visibility === "private" ? (
                                                <Lock className="w-4 h-4 text-yellow-400" />
                                            ) : (
                                                <Globe className="w-4 h-4 text-green-400" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {isOwnProfile && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => handleEditClick(e, pitch.id)}
                                        className="text-gray-400 hover:text-yellow-400 ml-2"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className="pt-0">
                            <div className="flex gap-4 mb-4">
                                {/* File Preview */}
                                <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {getFileType(pitch.fileUrl) === 'image' ? (
                                        <Image
                                            src={pitch.fileUrl}
                                            alt={pitch.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.parentElement!.innerHTML = '<div class="text-gray-400 text-center">' + getFileIcon(getFileType(pitch.fileUrl)) + '</div>';
                                            }}
                                        />
                                    ) : (
                                        <div className="text-gray-400">
                                            {getFileIcon(getFileType(pitch.fileUrl))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-gray-400 mb-3 line-clamp-3 leading-relaxed">
                                        {truncateDescription(pitch.description, viewMode === "grid" ? 100 : 150)}
                                    </p>
                                </div>
                            </div>

                            {/* Tags */}
                            {pitch.tags && pitch.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {pitch.tags.slice(0, viewMode === "grid" ? 2 : 4).map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 text-xs bg-yellow-400/20 text-yellow-400 rounded-full border border-yellow-400/30"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                    {pitch.tags.length > (viewMode === "grid" ? 2 : 4) && (
                                        <span className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded-full border border-gray-700">
                                            +{pitch.tags.length - (viewMode === "grid" ? 2 : 4)} more
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Stats and Date */}
                            <div className="flex items-center justify-between text-sm text-gray-400 pt-3 border-t border-gray-800">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 hover:text-red-400 transition-colors">
                                        <Heart className="w-4 h-4" />
                                        <span>{pitch.likesCount || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                                        <Eye className="w-4 h-4" />
                                        <span>{pitch.viewsCount || 0}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 text-xs">
                                    <Calendar className="w-3 h-3" />
                                    <span>{formatDate(pitch.createdAt)}</span>
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
                        onClick={() => router.push("/bloom/upload")}
                        className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                    >
                        <Lightbulb className="w-4 h-4 mr-2" />
                        Create New Pitch
                    </Button>
                </div>
            )}
        </div>
    );
}
