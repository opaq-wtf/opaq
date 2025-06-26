"use client";

import { useState, useEffect } from 'react';
import { DiscussionItem } from './DiscussionItem';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageCircle, ChevronDown, SortAsc, Pin, TrendingUp, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';
import './discussions.css';
import { DiscussionForm } from './DiscussionForm';

interface Discussion {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  likes: number;
  replies_count: number;
  is_edited: boolean;
  is_pinned: boolean;
  is_hearted?: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    full_name: string;
  };
  user_liked?: boolean;
}

interface DiscussionSectionProps {
  postId: string;
  postAuthorId?: string;
  currentUserId?: string;
}

type SortType = 'newest' | 'oldest' | 'top' | 'replies';

export function DiscussionSection({ postId, postAuthorId, currentUserId }: DiscussionSectionProps) {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [replies, setReplies] = useState<Record<string, Discussion[]>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [showReplies, setShowReplies] = useState<Record<string, boolean>>({});
  const [replyingTo, setReplyingTo] = useState<{ discussionId: string; username: string } | null>(null);
  const [editingDiscussion, setEditingDiscussion] = useState<Discussion | null>(null);
  const [editContent, setEditContent] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch discussions
  const fetchDiscussions = async (pageNum: number = 1, append: boolean = false) => {
    try {
      const response = await fetch(`/api/discussions?post_id=${postId}&sort=${sortBy}&page=${pageNum}&limit=20`);

      if (!response.ok) {
        throw new Error('Failed to fetch discussions');
      }

      const data = await response.json();

      if (append) {
        setDiscussions(prev => [...prev, ...data.discussions]);
      } else {
        setDiscussions(data.discussions);
      }

      setHasMore(data.pagination.page < data.pagination.pages);

    } catch (error) {
      console.error('Error fetching discussions:', error);
      toast.error('Failed to load discussions');
    } finally {
      setLoading(false);
    }
  };

  // Fetch replies for a discussion
  const fetchReplies = async (discussionId: string) => {
    try {
      const response = await fetch(`/api/discussions?post_id=${postId}&parent_id=${discussionId}&sort=oldest`);

      if (!response.ok) {
        throw new Error('Failed to fetch replies');
      }

      const data = await response.json();
      setReplies(prev => ({
        ...prev,
        [discussionId]: data.discussions
      }));

    } catch (error) {
      console.error('Error fetching replies:', error);
      toast.error('Failed to load replies');
    }
  };

  // Submit new discussion
  const handleDiscussionSubmit = async (content: string, parentId?: string) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/discussions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: postId,
          content,
          parent_id: parentId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to post discussion');
      }

      const result = await response.json();

      if (parentId) {
        // Add to replies
        setReplies(prev => ({
          ...prev,
          [parentId]: [...(prev[parentId] || []), result.discussion]
        }));

        // Update parent discussion's reply count
        setDiscussions(prev => prev.map(discussion =>
          discussion.id === parentId
            ? { ...discussion, replies_count: discussion.replies_count + 1 }
            : discussion
        ));

        // Show replies for the parent discussion
        setShowReplies(prev => ({ ...prev, [parentId]: true }));
      } else {
        // Add to main discussions
        setDiscussions(prev => [result.discussion, ...prev]);
      }

      setReplyingTo(null);
      toast.success('Discussion posted successfully!');

    } catch (error) {
      console.error('Error posting discussion:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to post discussion');
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  // Edit discussion
  const handleEditSubmit = async () => {
    if (!editingDiscussion || !editContent.trim()) return;

    try {
      const response = await fetch('/api/discussions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          discussion_id: editingDiscussion.id,
          content: editContent
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update discussion');
      }

      // Update discussion in state
      const updateDiscussion = (discussion: Discussion) =>
        discussion.id === editingDiscussion.id
          ? { ...discussion, content: editContent, is_edited: true }
          : discussion;

      setDiscussions(prev => prev.map(updateDiscussion));

      // Update in replies too
      setReplies(prev => {
        const newReplies = { ...prev };
        Object.keys(newReplies).forEach(parentId => {
          newReplies[parentId] = newReplies[parentId].map(updateDiscussion);
        });
        return newReplies;
      });

      setEditingDiscussion(null);
      setEditContent('');
      toast.success('Discussion updated successfully!');

    } catch (error) {
      console.error('Error updating discussion:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update discussion');
    }
  };

  // Delete discussion
  const handleDelete = async (discussionId: string) => {
    if (!confirm('Are you sure you want to delete this discussion?')) return;

    try {
      const response = await fetch(`/api/discussions?discussion_id=${discussionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete discussion');
      }

      // Remove from discussions
      setDiscussions(prev => prev.filter(discussion => discussion.id !== discussionId));

      // Remove from replies
      setReplies(prev => {
        const newReplies = { ...prev };
        Object.keys(newReplies).forEach(parentId => {
          newReplies[parentId] = newReplies[parentId].filter(reply => reply.id !== discussionId);
        });
        return newReplies;
      });

      toast.success('Discussion deleted successfully!');

    } catch (error) {
      console.error('Error deleting discussion:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete discussion');
    }
  };

  // Like/unlike discussion
  const handleLike = async (discussionId: string) => {
    try {
      // Find current like status
      let currentDiscussion = discussions.find(c => c.id === discussionId);
      if (!currentDiscussion) {
        // Check in replies
        for (const parentId in replies) {
          const reply = replies[parentId].find(r => r.id === discussionId);
          if (reply) {
            currentDiscussion = reply;
            break;
          }
        }
      }

      if (!currentDiscussion) return;

      const newLikedState = !currentDiscussion.user_liked;

      // Optimistic update
      const updateLike = (discussion: Discussion) =>
        discussion.id === discussionId
          ? {
              ...discussion,
              user_liked: newLikedState,
              likes: newLikedState ? discussion.likes + 1 : Math.max(0, discussion.likes - 1)
            }
          : discussion;

      setDiscussions(prev => prev.map(updateLike));
      setReplies(prev => {
        const newReplies = { ...prev };
        Object.keys(newReplies).forEach(parentId => {
          newReplies[parentId] = newReplies[parentId].map(updateLike);
        });
        return newReplies;
      });

      const response = await fetch('/api/discussion-interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          discussion_id: discussionId,
          action: 'like',
          value: newLikedState
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update like');
      }

    } catch (error) {
      console.error('Error updating like:', error);
      toast.error('Failed to update like');

      // Revert optimistic update
      const revertLike = (discussion: Discussion) =>
        discussion.id === discussionId
          ? {
              ...discussion,
              user_liked: !discussion.user_liked,
              likes: discussion.user_liked ? discussion.likes - 1 : discussion.likes + 1
            }
          : discussion;

      setDiscussions(prev => prev.map(revertLike));
      setReplies(prev => {
        const newReplies = { ...prev };
        Object.keys(newReplies).forEach(parentId => {
          newReplies[parentId] = newReplies[parentId].map(revertLike);
        });
        return newReplies;
      });
    }
  };

  // Pin/Unpin discussion (post author only)
  const handlePin = async (discussionId: string) => {
    if (currentUserId !== postAuthorId) return;

    try {
      const discussion = discussions.find(c => c.id === discussionId);
      if (!discussion) return;

      const response = await fetch('/api/discussions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          discussion_id: discussionId,
          action: 'pin',
          value: !discussion.is_pinned
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to pin discussion');
      }

      // Update discussion in state
      setDiscussions(prev => prev.map(c =>
        c.id === discussionId
          ? { ...c, is_pinned: !c.is_pinned }
          : c
      ));

      toast.success(discussion.is_pinned ? 'Discussion unpinned' : 'Discussion pinned');
    } catch (error) {
      console.error('Error pinning discussion:', error);
      toast.error('Failed to pin discussion');
    }
  };

  // Heart discussion (post author feature)
  const handleHeart = async (discussionId: string) => {
    if (currentUserId !== postAuthorId) return; // Only post author can heart

    try {
      const response = await fetch('/api/discussion-interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          discussion_id: discussionId,
          action: 'heart',
          value: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to heart discussion');
      }

      // Update discussion in state
      const updateHeart = (discussion: Discussion) =>
        discussion.id === discussionId
          ? { ...discussion, is_hearted: !discussion.is_hearted }
          : discussion;

      setDiscussions(prev => prev.map(updateHeart));
      setReplies(prev => {
        const newReplies = { ...prev };
        Object.keys(newReplies).forEach(parentId => {
          newReplies[parentId] = newReplies[parentId].map(updateHeart);
        });
        return newReplies;
      });

      toast.success('Discussion hearted by creator!');
    } catch (error) {
      console.error('Error hearting discussion:', error);
      toast.error('Failed to heart discussion');
    }
  };

  // Toggle replies visibility
  const handleLoadReplies = async (discussionId: string) => {
    const isCurrentlyShowing = showReplies[discussionId];

    if (isCurrentlyShowing) {
      setShowReplies(prev => ({ ...prev, [discussionId]: false }));
    } else {
      if (!replies[discussionId]) {
        await fetchReplies(discussionId);
      }
      setShowReplies(prev => ({ ...prev, [discussionId]: true }));
    }
  };

  // Load more discussions
  const loadMoreDiscussions = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchDiscussions(nextPage, true);
  };

  useEffect(() => {
    fetchDiscussions(1, false);
    setPage(1);
  }, [postId, sortBy]);

  const getSortIcon = (sortType: SortType) => {
    switch (sortType) {
      case 'top': return <TrendingUp className="w-3 h-3" />;
      case 'oldest': return <Clock className="w-3 h-3" />;
      case 'replies': return <Users className="w-3 h-3" />;
      default: return <SortAsc className="w-3 h-3" />;
    }
  };


  const totalDiscussions = discussions.reduce((total, discussion) => total + 1 + discussion.replies_count, 0);
  const pinnedDiscussions = discussions.filter(c => c.is_pinned);
  const regularDiscussions = discussions.filter(c => !c.is_pinned);

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <Card className="bg-gray-900/50 border-gray-700/50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <MessageCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {totalDiscussions} {totalDiscussions === 1 ? 'Discussion' : 'Discussions'}
              </h3>
              {pinnedDiscussions.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-yellow-400 mt-1">
                  <Pin className="w-3 h-3" />
                  <span>{pinnedDiscussions.length} pinned by creator</span>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Sort Options */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Sort by:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortType)}
                className="discussion-sort-dropdown rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="top">Top discussions</option>
                <option value="replies">Most replies</option>
              </select>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                {getSortIcon(sortBy)}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Discussion Form */}
      {currentUserId && (
        <DiscussionForm
          postId={postId}
          onSubmit={handleDiscussionSubmit}
          isSubmitting={submitting}
          placeholder="Start a discussion..."
        />
      )}

      {/* Reply Form */}
      {replyingTo && currentUserId && (
        <div className="discussion-reply-indicator">
          <DiscussionForm
            postId={postId}
            parentId={replyingTo.discussionId}
            replyingTo={replyingTo.username}
            onSubmit={handleDiscussionSubmit}
            onCancel={() => setReplyingTo(null)}
            isSubmitting={submitting}
            placeholder="Write a reply..."
          />
        </div>
      )}

      {/* Edit Form */}
      {editingDiscussion && (
        <Card className="bg-gray-900/70 border-gray-700/70 p-4">
          <div className="mb-3 text-sm text-gray-400 flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Editing discussion
          </div>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            rows={3}
            maxLength={1000}
            placeholder="Edit your discussion..."
          />
          <div className="flex items-center justify-between mt-3">
            <div className="text-xs text-gray-400">
              {editContent.length}/1000 characters
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingDiscussion(null);
                  setEditContent('');
                }}
                className="text-gray-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleEditSubmit}
                disabled={!editContent.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Save changes
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Discussions List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="discussion-loading bg-gray-800/30 border-gray-700/30 p-4">
              <div className="animate-pulse flex gap-3">
                <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : discussions.length === 0 ? (
        <Card className="bg-gray-900/30 border-gray-700/30 p-12">
          <div className="text-center text-gray-400">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h4 className="text-lg font-medium text-gray-300 mb-2">No discussions yet</h4>
            <p className="text-sm">
              {currentUserId
                ? "Be the first to share your thoughts on this post!"
                : "Sign in to join the conversation!"
              }
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Pinned Discussions */}
          {pinnedDiscussions.map((discussion) => (
            <div key={`pinned-${discussion.id}`} className="relative">
              <div className="absolute -left-2 top-2 flex items-center gap-1 text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full border border-yellow-400/20">
                <Pin className="w-3 h-3" />
                <span className="font-medium">Pinned</span>
              </div>
              <div className="ml-16">
                <DiscussionItem
                  discussion={discussion}
                  postAuthorId={postAuthorId}
                  currentUserId={currentUserId}
                  onReply={(discussionId, username) => setReplyingTo({ discussionId, username })}
                  onEdit={(discussion) => {
                    setEditingDiscussion(discussion);
                    setEditContent(discussion.content);
                  }}
                  onDelete={handleDelete}
                  onLike={handleLike}
                  onPin={currentUserId === postAuthorId ? handlePin : undefined}
                  onHeart={currentUserId === postAuthorId ? handleHeart : undefined}
                  onLoadReplies={handleLoadReplies}
                  replies={replies[discussion.id] || []}
                  showReplies={showReplies[discussion.id] || false}
                />
              </div>
            </div>
          ))}

          {/* Regular Discussions */}
          {regularDiscussions.map((discussion) => (
            <DiscussionItem
              key={discussion.id}
              discussion={discussion}
              postAuthorId={postAuthorId}
              currentUserId={currentUserId}
              onReply={(discussionId, username) => setReplyingTo({ discussionId, username })}
              onEdit={(discussion) => {
                setEditingDiscussion(discussion);
                setEditContent(discussion.content);
              }}
              onDelete={handleDelete}
              onLike={handleLike}
              onPin={currentUserId === postAuthorId ? handlePin : undefined}
              onHeart={currentUserId === postAuthorId ? handleHeart : undefined}
              onLoadReplies={handleLoadReplies}
              replies={replies[discussion.id] || []}
              showReplies={showReplies[discussion.id] || false}
            />
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center pt-6">
              <Button
                variant="outline"
                onClick={loadMoreDiscussions}
                disabled={loading}
                className="border-gray-600 text-gray-300 hover:bg-gray-800/50 hover:border-gray-500 transition-all"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Loading more...
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Load {Math.min(20, totalDiscussions - discussions.length)} more discussions
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
