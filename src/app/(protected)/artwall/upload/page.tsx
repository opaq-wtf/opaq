"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Eye,
  EyeOff,
  Save,
  Send,
  Trash2,
  ArrowLeft,
  Loader2
} from "lucide-react";
import { EditorToolbar } from "./components/EditorToolbar";
import { ImageToolbar } from "./components/ImageToolbar";
import { useEditor } from "./hooks/useEditor";
import "./editor-styles.css";

export default function ArtWallPostEdit() {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState("");
  const [labels, setLabels] = useState("");
  const [status, setStatus] = useState("Draft");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImg, setSelectedImg] = useState<HTMLImageElement | null>(null);
  const [imgToolbar, setImgToolbar] = useState<{ x: number; y: number } | null>(null);
  const [imgProps, setImgProps] = useState<{ width?: number; align?: string; crop?: boolean }>({});
  const [hasContent, setHasContent] = useState(false);
  const [isEditorFocused, setIsEditorFocused] = useState(false);

  // Get content from editor
  const getEditorContent = useCallback(() => {
    return editorRef.current?.innerHTML || "";
  }, []);

  // Check if editor has meaningful content
  const checkHasContent = useCallback(() => {
    const content = editorRef.current?.innerText || "";
    const htmlContent = editorRef.current?.innerHTML || "";
    // Check for actual text content or images
    const hasText = content.trim().length > 0;
    const hasImages = htmlContent.includes('<img');
    setHasContent(hasText || hasImages);
  }, []);

  // Use the editor hook for word/char counting
  const { wordCount, charCount, updateCounts } = useEditor(title, getEditorContent);

  // Helper function to clear all draft data
  const clearAllDraftData = useCallback(() => {
    localStorage.removeItem("draft-post");
    setIsDraftSaved(false);
  }, []);

  // Form validationartwall
  const validateForm = useCallback(() => {
    const newErrors: { title?: string; content?: string } = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    const content = editorRef.current?.innerHTML || "";
    if (!content.trim() || content === "<br>") {
      newErrors.content = "Content is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title]);

  // Submit post
  const handleSubmit = async (publish = false) => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const content = getEditorContent();
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content,
          labels: labels.split(",").map(label => label.trim()).filter(Boolean),
          status: publish ? "Published" : status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save post");
      }

      // Clear all draft-related data on successful save/publish
      clearAllDraftData();

      // Show success message
      toast.success(publish ? "Post published successfully!" : "Post saved successfully!");

      // Redirect to artwall after a short delay
      setTimeout(() => {
        router.push("/artwall");
      }, 1000);

    } catch (error) {
      console.error("Error saving post:", error);
      toast.error(`Failed to save post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-save functionality with visual feedback
  useEffect(() => {
    const autoSave = () => {
      if (title.trim() || getEditorContent().trim()) {
        const draftData = {
          title,
          content: getEditorContent(),
          labels,
          timestamp: Date.now()
        };
        localStorage.setItem("draft-post", JSON.stringify(draftData));
        setIsDraftSaved(true);
        setTimeout(() => setIsDraftSaved(false), 2000);
      }
    };

    const interval = setInterval(autoSave, 30000); // Auto-save every 30 seconds
    return () => clearInterval(interval);
  }, [title, labels, getEditorContent]);

  // Update counts when content changes
  useEffect(() => {
    updateCounts();
  }, [title, updateCounts]);

  // Check content on mount and when editor changes
  useEffect(() => {
    checkHasContent();
  }, [checkHasContent]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem("draft-post");
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        const isRecent = Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000; // 24 hours

        if (isRecent && (parsed.title || parsed.content)) {
          const shouldLoad = confirm("Found a recent draft. Would you like to continue editing it?");
          if (shouldLoad) {
            setTitle(parsed.title || "");
            setLabels(parsed.labels || "");
            if (editorRef.current && parsed.content) {
              editorRef.current.innerHTML = parsed.content;
              // Check content after loading
              setTimeout(() => checkHasContent(), 100);
            }
          } else {
            // If user chooses not to load draft, clear it
            clearAllDraftData();
          }
        } else {
          // Clear old drafts
          clearAllDraftData();
        }
      } catch (error) {
        console.error("Error loading draft:", error);
        clearAllDraftData();
      }
    }
  }, [clearAllDraftData, checkHasContent]);

  // Cleanup effect - clear drafts when component unmounts if content was successfully saved
  useEffect(() => {
    return () => {
      // Only clear drafts on unmount if the component is being unmounted due to successful save/publish
      // This is handled by the success callback in handleSubmit
    };
  }, []);

  // Clear draft
  const clearDraft = () => {
    const confirmed = confirm("Are you sure you want to clear all content? This action cannot be undone.");
    if (!confirmed) return;

    clearAllDraftData();
    setTitle("");
    setLabels("");
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
    setErrors({});
    setHasContent(false);
    updateCounts();
    toast.success("Draft cleared");
  };

  // Custom list insertion function
  // Features:
  // - Creates proper DOM structure for lists
  // - Handles text selection conversion to list items
  // - Supports both ul (bullet) and ol (numbered) lists
  // - Works with keyboard shortcuts: Ctrl+L (bullet), Ctrl+Shift+L (numbered)
  // - Tab/Shift+Tab for indentation/outdentation
  // - Enter key creates new list items, double Enter exits list
  const insertList = (type: 'ul' | 'ol') => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    // Create the list element
    const listElement = document.createElement(type);
    listElement.className = type === 'ul' ? 'list-disc' : 'list-decimal';

    if (selectedText.trim()) {
      // If text is selected, convert it to list items
      const lines = selectedText.split('\n').filter(line => line.trim());
      lines.forEach(line => {
        const li = document.createElement('li');
        li.textContent = line.trim();
        listElement.appendChild(li);
      });
    } else {
      // Create a single empty list item
      const li = document.createElement('li');
      li.innerHTML = '&nbsp;'; // Non-breaking space to make it focusable
      listElement.appendChild(li);
    }

    // Insert the list
    range.deleteContents();
    range.insertNode(listElement);

    // Move cursor to the first list item
    const firstLi = listElement.querySelector('li');
    if (firstLi) {
      const newRange = document.createRange();
      newRange.setStart(firstLi, 0);
      newRange.setEnd(firstLi, firstLi.childNodes.length);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }

    editorRef.current.focus();
    checkHasContent();
  };

  // Toolbar actions
  const format = (command: string, value?: string) => {
    if (command === 'insertUnorderedList') {
      insertList('ul');
      return;
    }
    if (command === 'insertOrderedList') {
      insertList('ol');
      return;
    }

    // For other commands, try execCommand first, with fallbacks for some
    try {
      document.execCommand(command, false, value);
    } catch (error) {
      console.warn('execCommand failed for', command, error);
      // Add manual implementations for critical commands if needed
      if (command === 'bold') {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const strong = document.createElement('strong');
          try {
            range.surroundContents(strong);
          } catch (error) {
            console.log('Surround contents failed, inserting strong tag manually', error);
            strong.textContent = range.toString();
            range.deleteContents();
            range.insertNode(strong);
          }
        }
      }
    }
    editorRef.current?.focus();
  };

  // Handle keyboard shortcuts and list behavior
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Tab key for list indentation
      if (e.key === 'Tab') {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const currentElement = range.startContainer.nodeType === Node.TEXT_NODE
            ? range.startContainer.parentElement
            : range.startContainer as Element;

          const listItem = currentElement?.closest('li');
          if (listItem) {
            e.preventDefault();

            if (e.shiftKey) {
              // Outdent (Shift + Tab)
              const parentList = listItem.parentElement;
              const grandParentList = parentList?.parentElement?.closest('ul, ol');

              if (grandParentList) {
                // Move this item to the parent level
                const parentLi = parentList?.parentElement?.closest('li');
                if (parentLi) {
                  grandParentList.insertBefore(listItem, parentLi.nextSibling);

                  // If the nested list is now empty, remove it
                  if (parentList && parentList.children.length === 0) {
                    parentList.remove();
                  }
                }
              }
            } else {
              // Indent (Tab)
              const prevSibling = listItem.previousElementSibling as HTMLLIElement;
              if (prevSibling) {
                // Find or create a nested list in the previous item
                let nestedList = prevSibling.querySelector('ul, ol') as HTMLUListElement | HTMLOListElement;
                if (!nestedList) {
                  const parentList = listItem.parentElement;
                  nestedList = document.createElement(parentList?.tagName.toLowerCase() as 'ul' | 'ol');
                  prevSibling.appendChild(nestedList);
                }

                // Move current item to nested list
                nestedList.appendChild(listItem);
              }
            }

            // Restore focus
            const newRange = document.createRange();
            newRange.setStart(listItem, 0);
            newRange.setEnd(listItem, 0);
            selection.removeAllRanges();
            selection.addRange(newRange);

            return;
          }
        }
      }

      // Handle list behavior with Enter key
      if (e.key === 'Enter' && !e.shiftKey) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const currentElement = range.startContainer.nodeType === Node.TEXT_NODE
            ? range.startContainer.parentElement
            : range.startContainer as Element;

          // Check if we're in a list item
          const listItem = currentElement?.closest('li');
          const list = listItem?.parentElement;

          if (listItem && list && (list.tagName === 'UL' || list.tagName === 'OL')) {
            e.preventDefault();

            // If the current list item is empty, exit the list
            if (!listItem.textContent?.trim()) {
              // Create a new paragraph after the list
              const newP = document.createElement('p');
              newP.innerHTML = '&nbsp;';

              // Find the top-level list to insert after
              let topLevelList = list;
              while (topLevelList.parentElement?.closest('ul, ol')) {
                topLevelList = topLevelList.parentElement.closest('ul, ol')!;
              }

              topLevelList.parentNode?.insertBefore(newP, topLevelList.nextSibling);

              // Remove the empty list item
              listItem.remove();

              // If the list is now empty, remove it
              if (list.children.length === 0) {
                list.remove();
              }

              // Focus the new paragraph
              const newRange = document.createRange();
              newRange.setStart(newP, 0);
              newRange.setEnd(newP, 0);
              selection.removeAllRanges();
              selection.addRange(newRange);

              checkHasContent();
              return;
            }

            // Create a new list item
            const newLi = document.createElement('li');
            newLi.innerHTML = '&nbsp;';

            // Insert after current list item
            listItem.parentNode?.insertBefore(newLi, listItem.nextSibling);

            // Focus the new list item
            const newRange = document.createRange();
            newRange.setStart(newLi, 0);
            newRange.setEnd(newLi, 0);
            selection.removeAllRanges();
            selection.addRange(newRange);

            return;
          }
        }
      }

      // Handle other keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSubmit(false);
            break;
          case 'Enter':
            e.preventDefault();
            handleSubmit(true);
            break;
          case 'p':
            e.preventDefault();
            setIsPreviewMode(!isPreviewMode);
            break;
          case 'b':
            if (editorRef.current === document.activeElement) {
              e.preventDefault();
              format('bold');
            }
            break;
          case 'i':
            if (editorRef.current === document.activeElement) {
              e.preventDefault();
              format('italic');
            }
            break;
          case 'u':
            if (editorRef.current === document.activeElement) {
              e.preventDefault();
              format('underline');
            }
            break;
          case 'l':
            if (editorRef.current === document.activeElement) {
              e.preventDefault();
              format(e.shiftKey ? 'insertOrderedList' : 'insertUnorderedList');
            }
            break;
          case 'z':
            if (editorRef.current === document.activeElement) {
              e.preventDefault();
              format('undo');
            }
            break;
          case 'y':
            if (editorRef.current === document.activeElement) {
              e.preventDefault();
              format('redo');
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPreviewMode, handleSubmit, format]);

  // Insert image at cursor
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editorRef.current) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const img = document.createElement("img");
        img.src = event.target?.result as string;
        img.alt = file.name;
        img.className = "max-w-full my-2 rounded shadow cursor-move";
        img.draggable = true;
        img.style.display = "block";
        img.style.maxWidth = "100%";
        img.style.height = "auto";
        img.addEventListener("click", (ev) => onImageClick(ev, img));
        img.addEventListener("dragstart", onImageDragStart);
        img.addEventListener("dragend", onImageDragEnd);

        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          sel.getRangeAt(0).insertNode(img);
        } else {
          editorRef.current?.appendChild(img);
        }

        // Check content after adding image
        checkHasContent();
        updateCounts();
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    }
  };

  // Drag and drop support
  let draggedImg: HTMLImageElement | null = null;
  function onImageDragStart(e: DragEvent) {
    draggedImg = e.target as HTMLImageElement;
    e.dataTransfer?.setData("text/plain", "img");
  }
  function onImageDragEnd(_e: DragEvent) {
    draggedImg = null;
  }
  function onEditorDrop(e: React.DragEvent<HTMLDivElement>) {
    if (draggedImg && editorRef.current) {
      e.preventDefault();
      const range = document.caretRangeFromPoint(e.clientX, e.clientY);
      if (range) {
        range.insertNode(draggedImg);
      }
    }
  }

  // Image toolbar
  function onImageClick(ev: Event, img: HTMLImageElement) {
    ev.stopPropagation();
    setSelectedImg(img);
    setImgToolbar({ x: (ev as MouseEvent).clientX, y: (ev as MouseEvent).clientY });
    setImgProps({
      width: img.width,
      align: img.style.textAlign || "center",
      crop: img.style.objectFit === "cover"
    });
  }

  function closeImgToolbar() {
    setSelectedImg(null);
    setImgToolbar(null);
  }

  function setImgAlign(align: string) {
    if (selectedImg) {
      selectedImg.style.display = "block";
      selectedImg.style.margin = align === "center" ? "0 auto" : align === "left" ? "0 auto 0 0" : "0 0 0 auto";
      setImgProps((p) => ({ ...p, align }));
    }
  }

  function setImgWidth(width: number) {
    if (selectedImg) {
      selectedImg.style.width = width + "px";
      setImgProps((p) => ({ ...p, width }));
    }
  }

  function setImgCrop(crop: boolean) {
    if (selectedImg) {
      selectedImg.style.objectFit = crop ? "cover" : "contain";
      selectedImg.style.height = crop ? "200px" : "auto";
      setImgProps((p) => ({ ...p, crop }));
    }
  }

  // Deselect image on editor click
  function onEditorClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target instanceof HTMLImageElement) return;
    closeImgToolbar();
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
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
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="#FF5722"/>
              <path d="M20.5 10.5C20.5 9.11929 19.3807 8 18 8H12C10.6193 8 9.5 9.11929 9.5 10.5V21.5C9.5 22.8807 10.6193 24 12 24H20C21.3807 24 22.5 22.8807 22.5 21.5V13C22.5 11.6193 21.3807 10.5 20.5 10.5Z" fill="white"/>
            </svg>
            <span className="font-bold text-xl text-white">Artwall</span>
            <span className="text-gray-400 text-sm ml-2">/ Create Post</span>
          </div>
          {isDraftSaved && (
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <Save className="w-3 h-3" />
              Draft saved
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
          >
            {isPreviewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {isPreviewMode ? "Edit" : "Preview"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSubmit(false)}
            disabled={isLoading}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </Button>
          <Button
            size="sm"
            onClick={() => handleSubmit(true)}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Publish
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={clearDraft}
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 w-full max-w-7xl mx-auto mt-8 gap-8 px-4">
        {/* Editor Section */}
        <section className="flex-1 bg-gray-900 rounded-lg shadow-xl p-8 flex flex-col border border-gray-700">
          <div className="mb-4">
            <input
              className={`text-3xl font-bold w-full outline-none border-b-2 py-3 transition bg-transparent text-white placeholder-gray-400 ${
                errors.title ? 'border-red-500' : 'border-gray-700 focus:border-blue-500'
              }`}
              placeholder="Enter your post title..."
              value={title}
              onChange={e => {
                setTitle(e.target.value);
                if (errors.title) setErrors(prev => ({ ...prev, title: undefined }));
              }}
            />
            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Toolbar */}
          <EditorToolbar
            onFormat={format}
            onImageUpload={() => fileInputRef.current?.click()}
            fileInputRef={fileInputRef}
            onImageChange={handleImageUpload}
          />

          {/* Rich Text Editor */}
          <div className="flex-1 relative">
            {isPreviewMode ? (
              <div
                className="min-h-[400px] p-4 border-2 rounded-lg bg-gray-800 text-white border-gray-600"
                style={{ fontSize: "1.1rem", lineHeight: "1.6" }}
              >
                <div className="prose-custom max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: getEditorContent() }} />
                </div>
                {!getEditorContent().trim() && (
                  <div className="text-gray-500 italic">Nothing to preview yet. Write some content first!</div>
                )}
              </div>
            ) : (
              <>
                <div
                  ref={editorRef}
                  className={`editor-content min-h-[400px] outline-none p-4 border-2 rounded-lg bg-gray-800 text-white transition resize-none ${
                    errors.content ? 'border-red-500' : 'border-gray-600 focus:border-blue-400'
                  }`}
                  contentEditable
                  suppressContentEditableWarning
                  spellCheck={true}
                  aria-label="Post content editor"
                  style={{ fontSize: "1.1rem", lineHeight: "1.6" }}
                  onDrop={onEditorDrop}
                  onClick={onEditorClick}
                  onFocus={() => setIsEditorFocused(true)}
                  onBlur={() => setIsEditorFocused(false)}
                  onInput={() => {
                    if (errors.content) setErrors(prev => ({ ...prev, content: undefined }));
                    checkHasContent();
                    updateCounts();
                  }}
                />
                {!hasContent && !isEditorFocused && (
                  <div className="absolute top-5 left-5 text-gray-500 pointer-events-none">
                    Write your post content here... You can add images, format text, and more!
                  </div>
                )}
              </>
            )}
            {errors.content && <p className="text-red-400 text-sm mt-2">{errors.content}</p>}
          </div>

          {/* Image Toolbar */}
          {imgToolbar && selectedImg && (
            <ImageToolbar
              position={imgToolbar}
              imgProps={imgProps}
              onAlignChange={setImgAlign}
              onWidthChange={setImgWidth}
              onCropToggle={() => setImgCrop(!imgProps.crop)}
              onClose={closeImgToolbar}
            />
          )}
        </section>

        {/* Sidebar */}
        <aside className="w-80 bg-gray-900 rounded-lg shadow-xl p-6 flex flex-col gap-6 border border-gray-700 h-fit">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Labels <span className="text-gray-500">(comma separated)</span>
            </label>
            <input
              className="w-full border border-gray-600 rounded-lg px-4 py-3 focus:border-blue-500 outline-none bg-gray-800 text-white placeholder-gray-400 transition"
              placeholder="e.g. travel, tech, lifestyle"
              value={labels}
              onChange={e => setLabels(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              className="w-full border border-gray-600 rounded-lg px-4 py-3 focus:border-blue-500 outline-none bg-gray-800 text-white transition"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </select>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Post Statistics</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex justify-between">
                <span>Characters:</span>
                <span>{charCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Words:</span>
                <span>{wordCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Reading time:</span>
                <span>~ {Math.ceil(wordCount / 200)} min</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Keyboard Shortcuts</h3>
            <div className="space-y-1 text-xs text-gray-400">
              <div className="flex justify-between">
                <span>Save Draft:</span>
                <span className="bg-gray-800 px-2 py-1 rounded">Ctrl+S</span>
              </div>
              <div className="flex justify-between">
                <span>Publish:</span>
                <span className="bg-gray-800 px-2 py-1 rounded">Ctrl+Enter</span>
              </div>
              <div className="flex justify-between">
                <span>Preview:</span>
                <span className="bg-gray-800 px-2 py-1 rounded">Ctrl+P</span>
              </div>
              <div className="flex justify-between">
                <span>Bold:</span>
                <span className="bg-gray-800 px-2 py-1 rounded">Ctrl+B</span>
              </div>
              <div className="flex justify-between">
                <span>Italic:</span>
                <span className="bg-gray-800 px-2 py-1 rounded">Ctrl+I</span>
              </div>
              <div className="flex justify-between">
                <span>Underline:</span>
                <span className="bg-gray-800 px-2 py-1 rounded">Ctrl+U</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-auto">
            <Button
              onClick={() => handleSubmit(false)}
              disabled={isLoading}
              variant="secondary"
              className="flex-1"
            >
              Save Draft
            </Button>
            <Button
              onClick={() => router.back()}
              variant="destructive"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </aside>
      </main>
    </div>
  );
}
