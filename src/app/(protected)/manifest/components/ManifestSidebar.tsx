"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    History,
    X,
    Trash2,
    Clock,
    ChevronLeft,
    ChevronRight,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ManifestHistoryEntry {
    id: string;
    user_id: string;
    prompt: string;
    response: string;
    title: string;
    createdAt: string;
    updatedAt: string;
}

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

interface ManifestSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectHistory: (prompt: string, response: string) => void;
}

export default function ManifestSidebar({
    isOpen,
    onClose,
    onSelectHistory,
}: ManifestSidebarProps) {
    const [history, setHistory] = useState<ManifestHistoryEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
    });
    const [selectedEntry, setSelectedEntry] = useState<ManifestHistoryEntry | null>(null);

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        }).format(date);
    };

    // Fetch history from API
    const fetchHistory = async (page: number = 1) => {
        try {
            setLoading(true);
            const response = await fetch(
                `/api/manifest/history?page=${page}&limit=10`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch history");
            }

            const data = await response.json();
            setHistory(data.history);
            setPagination(data.pagination);
        } catch (error) {
            console.error("Error fetching history:", error);
            toast.error("Failed to load history");
        } finally {
            setLoading(false);
        }
    };

    // Delete history entry
    const deleteEntry = async (entryId: string) => {
        try {
            const response = await fetch(`/api/manifest/history?id=${entryId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete entry");
            }

            toast.success("History entry deleted");

            // Remove from local state
            setHistory((prev) => prev.filter((entry) => entry.id !== entryId));

            // Clear selected entry if it was deleted
            if (selectedEntry?.id === entryId) {
                setSelectedEntry(null);
            }

            // Refresh pagination info
            fetchHistory(pagination.page);
        } catch (error) {
            console.error("Error deleting entry:", error);
            toast.error("Failed to delete entry");
        }
    };

    // Handle page navigation
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            fetchHistory(newPage);
        }
    };

    // Load initial history when sidebar opens
    useEffect(() => {
        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Sidebar */}
            <div className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-gray-900 border-l border-gray-700 shadow-xl">
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-700">
                        <div className="flex items-center gap-2">
                            <History className="h-5 w-5 text-yellow-400" />
                            <h2 className="text-lg font-semibold text-white">Manifest History</h2>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="text-gray-400 hover:text-white"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden">
                        {!selectedEntry ? (
                            // History List View
                            <div className="h-full flex flex-col">
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {loading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="h-6 w-6 animate-spin text-yellow-400" />
                                        </div>
                                    ) : history.length === 0 ? (
                                        <div className="text-center py-8">
                                            <History className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                                            <p className="text-gray-400">No history yet</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Your manifest sessions will appear here
                                            </p>
                                        </div>
                                    ) : (
                                        history.map((entry) => (
                                            <Card
                                                key={entry.id}
                                                className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
                                            >
                                                <CardContent className="p-3">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div
                                                            className="flex-1 min-w-0"
                                                            onClick={() => setSelectedEntry(entry)}
                                                        >
                                                            <h3 className="text-sm font-medium text-white line-clamp-2 mb-1">
                                                                {entry.title}
                                                            </h3>
                                                            <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                                                                <Clock className="h-3 w-3" />
                                                                {formatDate(entry.createdAt)}
                                                            </div>
                                                            <p className="text-xs text-gray-500 line-clamp-2">
                                                                {entry.prompt}
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onSelectHistory(entry.prompt, entry.response);
                                                                    onClose();
                                                                }}
                                                                className="text-gray-400 hover:text-yellow-400 h-6 w-6 p-0"
                                                            >
                                                                <History className="h-3 w-3" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    deleteEntry(entry.id);
                                                                }}
                                                                className="text-gray-400 hover:text-red-400 h-6 w-6 p-0"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </div>

                                {/* Pagination */}
                                {pagination.pages > 1 && (
                                    <div className="border-t border-gray-700 p-4">
                                        <div className="flex items-center justify-between">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handlePageChange(pagination.page - 1)}
                                                disabled={pagination.page === 1}
                                                className="text-gray-400 hover:text-white disabled:opacity-50"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                Previous
                                            </Button>
                                            <span className="text-sm text-gray-400">
                                                Page {pagination.page} of {pagination.pages}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handlePageChange(pagination.page + 1)}
                                                disabled={pagination.page === pagination.pages}
                                                className="text-gray-400 hover:text-white disabled:opacity-50"
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Detail View
                            <div className="h-full flex flex-col">
                                <div className="border-b border-gray-700 p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedEntry(null)}
                                            className="text-gray-400 hover:text-white"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Back
                                        </Button>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    onSelectHistory(selectedEntry.prompt, selectedEntry.response);
                                                    onClose();
                                                }}
                                                className="text-gray-400 hover:text-yellow-400"
                                            >
                                                <History className="h-4 w-4" />
                                                Use
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteEntry(selectedEntry.id)}
                                                className="text-gray-400 hover:text-red-400"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white">{selectedEntry.title}</h3>
                                    <p className="text-sm text-gray-400">{formatDate(selectedEntry.createdAt)}</p>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-300 mb-2">Prompt</h4>
                                        <div className="text-sm text-gray-400 bg-gray-800 rounded-lg p-3">
                                            {selectedEntry.prompt}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-300 mb-2">Response</h4>
                                        <div className="text-sm text-gray-300 bg-gray-800 rounded-lg p-3 prose prose-invert max-w-none prose-a:text-blue-400">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {selectedEntry.response}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
