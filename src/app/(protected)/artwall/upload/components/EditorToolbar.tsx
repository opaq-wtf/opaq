import React from "react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Code,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";

interface EditorToolbarProps {
  onFormat: (command: string, value?: string) => void;
  onImageUpload: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function EditorToolbar({
  onFormat,
  onImageUpload,
  fileInputRef,
  onImageChange,
}: EditorToolbarProps) {
  const handleLinkInsert = () => {
    const url = prompt("Enter URL:");
    if (url) {
      onFormat("createLink", url);
    }
  };

  return (
    <div className="flex flex-wrap gap-1 mb-4 border-b border-gray-700 pb-4">
      {/* Text formatting */}
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onFormat("bold")}
          className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700"
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onFormat("italic")}
          className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700"
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onFormat("underline")}
          className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700"
          title="Underline (Ctrl+U)"
        >
          <Underline className="w-4 h-4" />
        </Button>
      </div>

      <div className="w-px bg-gray-700 mx-1"></div>

      {/* Headings */}
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onFormat("formatBlock", "h1")}
          className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700"
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onFormat("formatBlock", "h2")}
          className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700"
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onFormat("formatBlock", "h3")}
          className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700"
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </Button>
      </div>

      <div className="w-px bg-gray-700 mx-1"></div>

      {/* Text alignment */}
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onFormat("justifyLeft")}
          className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700"
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onFormat("justifyCenter")}
          className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700"
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onFormat("justifyRight")}
          className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700"
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="w-px bg-gray-700 mx-1"></div>

      {/* Lists */}
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onFormat("insertUnorderedList")}
          className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700"
          title="Bullet List (Ctrl+L)"
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onFormat("insertOrderedList")}
          className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700"
          title="Numbered List (Ctrl+Shift+L)"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
      </div>

      <div className="w-px bg-gray-700 mx-1"></div>

      {/* Special elements */}
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onFormat("formatBlock", "blockquote")}
          className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700"
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onFormat("formatBlock", "pre")}
          className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700"
          title="Code Block"
        >
          <Code className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLinkInsert}
          className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700"
          title="Insert Link"
        >
          <Link2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onImageUpload}
          className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700"
          title="Insert Image"
        >
          <ImageIcon className="w-4 h-4" />
        </Button>
      </div>

      <div className="w-px bg-gray-700 mx-1"></div>

      {/* Undo/Redo */}
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onFormat("undo")}
          className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onFormat("redo")}
          className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700"
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </Button>
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={onImageChange}
        className="hidden"
      />
    </div>
  );
}
