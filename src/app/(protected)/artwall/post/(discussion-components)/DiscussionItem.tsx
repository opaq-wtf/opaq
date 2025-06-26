"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Heart,
  Reply,
  MoreVertical,
  Edit,
  Trash2,
  Pin,
  Flag,
  User,
  Clock,
  Crown
} from 'lucide-react';
import { toast } from 'sonner';
import './discussions.css';

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
  is_hearted?: boolean; // Heart from post author
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    full_name: string;
  };
  user_liked?: boolean;
}

interface DiscussionItemProps {
  discussion: Discussion;
  postAuthorId?: string;
  currentUserId?: string;
  onReply: (discussionId: string, username: string) => void;
  onEdit: (discussion: Discussion) => void;
  onDelete: (discussionId: string) => void;
  onLike: (discussionId: string) => void;
  onPin?: (discussionId: string) => void;
  onHeart?: (discussionId: string) => void; // New heart function
  onLoadReplies?: (discussionId: string) => void;
  replies?: Discussion[];
  isReply?: boolean;
  showReplies?: boolean;
}

export function DiscussionItem({
  discussion,
  postAuthorId,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onLike,
  onPin,
  onHeart,
  onLoadReplies,
  replies = [],
  isReply = false,
  showReplies = false
}: DiscussionItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const isPostAuthor = currentUserId === postAuthorId;
  const isOwnDiscussion = currentUserId === discussion.user_id;
  const isDiscussionAuthor = discussion.user_id === postAuthorId;

  const formatDate = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    }).format(date);
  };

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      await onLike(discussion.id);
    } finally {
      setIsLiking(false);
    }
  };

  // Close menu when clicking outside
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className={`discussion-thread discussion-item ${isReply ? 'discussion-reply-indent' : ''} ${discussion.is_pinned ? 'discussion-pinned' : ''}`}>
      <Card className="bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/70 transition-all duration-200">
        <div className="p-4">
          <div className="flex gap-3">
            {/* User Avatar */}
            <div className="discussion-avatar">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              {/* Discussion Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">
                      {discussion.user.full_name}
                    </span>
                    <span className="text-gray-400 text-sm">
                      @{discussion.user.username}
                    </span>
                    {isDiscussionAuthor && (
                      <div className="discussion-creator-badge flex items-center gap-1">
                        <Crown className="w-2.5 h-2.5" />
                        Creator
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 discussion-timestamp">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs text-gray-500">{formatDate(discussion.createdAt)}</span>
                    </div>
                    {discussion.is_edited && (
                      <span className="discussion-edit-indicator">(edited)</span>
                    )}
                    {discussion.is_hearted && (
                      <div className="flex items-center gap-1 discussion-heart-animation">
                        <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
                        <span className="text-xs text-red-400 font-medium">❤️</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Menu Button */}
                {(isOwnDiscussion || isPostAuthor) && (
                  <div className="relative" onClick={handleMenuClick}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMenu(!showMenu)}
                      className="text-gray-400 hover:text-white p-1.5 h-auto opacity-60 hover:opacity-100"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>

                    {showMenu && (
                      <div className="discussion-dropdown-menu absolute right-0 top-8 rounded-lg shadow-xl z-20 min-w-36 py-1">
                        {isOwnDiscussion && (
                          <>
                            <button
                              onClick={() => {
                                onEdit(discussion);
                                setShowMenu(false);
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700/50 flex items-center gap-2 transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                onDelete(discussion.id);
                                setShowMenu(false);
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700/50 flex items-center gap-2 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </>
                        )}
                        {isPostAuthor && !isReply && onPin && (
                          <button
                            onClick={() => {
                              onPin(discussion.id);
                              setShowMenu(false);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-yellow-400 hover:bg-gray-700/50 flex items-center gap-2 transition-colors"
                          >
                            <Pin className="w-3.5 h-3.5" />
                            {discussion.is_pinned ? 'Unpin' : 'Pin'}
                          </button>
                        )}
                        {isPostAuthor && onHeart && (
                          <button
                            onClick={() => {
                              onHeart(discussion.id);
                              setShowMenu(false);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700/50 flex items-center gap-2 transition-colors"
                          >
                            <Heart className={`w-3.5 h-3.5 ${discussion.is_hearted ? 'fill-current' : ''}`} />
                            {discussion.is_hearted ? 'Remove heart' : 'Heart'}
                          </button>
                        )}
                        {!isOwnDiscussion && (
                          <button
                            onClick={() => {
                              toast.info('Report functionality will be implemented');
                              setShowMenu(false);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-yellow-400 hover:bg-gray-700/50 flex items-center gap-2 transition-colors"
                          >
                            <Flag className="w-3.5 h-3.5" />
                            Report
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Discussion Content */}
              <div className="discussion-content text-gray-200 mb-3 leading-relaxed text-sm">
                {discussion.content}
              </div>

              {/* Discussion Actions */}
              <div className="discussion-actions flex items-center gap-6 text-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`discussion-like-button p-1 h-auto flex items-center gap-1.5 hover:bg-black ${
                    discussion.user_liked
                      ? 'text-red-500 hover:text-red-400'
                      : 'text-gray-400 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${discussion.user_liked ? 'fill-current' : ''}`} />
                  <span className="font-medium">{discussion.likes || 0}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReply(discussion.id, discussion.user.username)}
                  className="p-1 h-auto text-gray-400 hover:text-blue-400 hover:bg-transparent flex items-center gap-1.5 transition-colors"
                >
                  <Reply className="w-4 h-4" />
                  <span className="font-medium">Reply</span>
                </Button>

                {/* Load/Show Replies Button */}
                {discussion.replies_count > 0 && onLoadReplies && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onLoadReplies(discussion.id)}
                    className="p-1 h-auto text-gray-400 hover:text-gray-200 hover:bg-transparent flex items-center gap-1.5 transition-colors"
                  >
                    <span className="font-medium">
                      {showReplies ? 'Hide' : 'View'} {discussion.replies_count}{' '}
                      {discussion.replies_count === 1 ? 'reply' : 'replies'}
                    </span>
                  </Button>
                )}
              </div>

              {/* Replies */}
              {showReplies && replies.length > 0 && (
                <div className="mt-6 space-y-4 discussion-reply-indicator">
                  {replies.map((reply) => (
                    <DiscussionItem
                      key={reply.id}
                      discussion={reply}
                      postAuthorId={postAuthorId}
                      currentUserId={currentUserId}
                      onReply={onReply}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onLike={onLike}
                      onHeart={onHeart}
                      isReply={true}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
