"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Send, X, User, Smile } from 'lucide-react';

interface DiscussionFormProps {
  postId: string;
  parentId?: string;
  replyingTo?: string;
  placeholder?: string;
  onSubmit: (content: string, parentId?: string) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function DiscussionForm({
  postId,
  parentId,
  replyingTo,
  placeholder = "Start a discussion...",
  onSubmit,
  onCancel,
  isSubmitting = false
}: DiscussionFormProps) {
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    try {
      await onSubmit(content.trim(), parentId);
      setContent('');
      setIsFocused(false);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const handleCancel = () => {
    setContent('');
    setIsFocused(false);
    onCancel?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e as any);
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <Card className="bg-gray-900/70 border-gray-700/70 hover:border-gray-600/70 transition-all duration-200">
      <form onSubmit={handleSubmit} className="p-4">
        {replyingTo && (
          <div className="mb-3 flex items-center gap-2 text-sm text-gray-400 bg-blue-600/10 px-3 py-2 rounded-lg border border-blue-600/20">
            <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
            <span>Replying to <span className="text-blue-400 font-medium">@{replyingTo}</span></span>
          </div>
        )}

        <div className="flex gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
            <User className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1">
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                rows={isFocused ? 4 : 2}
                maxLength={1000}
                disabled={isSubmitting}
                style={{ minHeight: isFocused ? '100px' : '50px' }}
              />

              {/* Emoji button placeholder */}
              {isFocused && (
                <button
                  type="button"
                  className="absolute right-3 bottom-3 text-gray-400 hover:text-gray-300 transition-colors"
                  title="Add emoji (coming soon)"
                  onClick={() => {/* Emoji picker would go here */}}
                >
                  <Smile className="w-4 h-4" />
                </button>
              )}
            </div>

            {(isFocused || content.trim()) && (
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-4">
                  <div className={`text-xs transition-colors ${
                    content.length > 900 ? 'text-red-400' :
                    content.length > 700 ? 'text-yellow-400' : 'text-gray-400'
                  }`}>
                    {content.length}/1000
                  </div>
                  {isFocused && (
                    <div className="text-xs text-gray-500">
                      Press Ctrl+Enter to post
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {onCancel && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                      disabled={isSubmitting}
                      className="text-gray-400 hover:text-white hover:bg-gray-700/50"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  )}

                  <Button
                    type="submit"
                    size="sm"
                    disabled={!content.trim() || isSubmitting}
                    className={`${
                      content.trim() && !isSubmitting
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    } transition-all duration-200 transform hover:scale-105`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-1" />
                        {parentId ? 'Reply' : 'Discussion'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Helpful tip for new users */}
            {!isFocused && !content && !parentId && (
              <div className="mt-2 text-xs text-gray-500">
                Share your thoughts respectfully and constructively
              </div>
            )}
          </div>
        </div>
      </form>
    </Card>
  );
}
