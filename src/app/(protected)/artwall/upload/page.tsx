"use client";

// Blogger.com Post Edit Page Clone
import React, { useRef, useState } from "react";

export default function BloggerPostEdit() {
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState("");
  const [labels, setLabels] = useState("");
  const [status, setStatus] = useState("Draft");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImg, setSelectedImg] = useState<HTMLImageElement | null>(null);
  const [imgToolbar, setImgToolbar] = useState<{ x: number; y: number } | null>(null);
  const [imgProps, setImgProps] = useState<{ width?: number; align?: string; crop?: boolean }>({});

  // Toolbar actions (basic demo)
  const format = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

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
        img.addEventListener("click", (ev) => onImageClick(ev, img));
        img.addEventListener("dragstart", onImageDragStart);
        img.addEventListener("dragend", onImageDragEnd);
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          sel.getRangeAt(0).insertNode(img);
        } else {
          editorRef.current?.appendChild(img);
        }
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
  function onImageDragEnd(e: DragEvent) {
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
    setImgProps({ width: img.width, align: img.style.textAlign || "center", crop: img.style.objectFit === "cover" });
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
      <header className="w-full bg-black shadow px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="8" fill="#FF5722"/><path d="M20.5 10.5C20.5 9.11929 19.3807 8 18 8H12C10.6193 8 9.5 9.11929 9.5 10.5V21.5C9.5 22.8807 10.6193 24 12 24H20C21.3807 24 22.5 22.8807 22.5 21.5V13C22.5 11.6193 21.3807 10.5 20.5 10.5Z" fill="white"/></svg>
          <span className="font-bold text-xl text-white">Blogger</span>
        </div>
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Publish</button>
          <button className="bg-gray-800 text-gray-200 px-4 py-2 rounded hover:bg-gray-700 transition">Preview</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 w-full max-w-6xl mx-auto mt-8 gap-8">
        {/* Editor Section */}
        <section className="flex-1 bg-black rounded shadow p-8 flex flex-col">
          <input
            className="text-3xl font-bold mb-4 outline-none border-b border-gray-700 focus:border-blue-500 transition bg-black text-white placeholder-gray-400"
            placeholder="Post title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />

          {/* Toolbar */}
          <div className="flex gap-2 mb-4 border-b border-gray-700 pb-2">
            <button onClick={() => format("bold")}
              className="p-2 hover:bg-gray-800 rounded text-white" title="Bold">
              <b>B</b>
            </button>
            <button onClick={() => format("italic")}
              className="p-2 hover:bg-gray-800 rounded text-white" title="Italic">
              <i>I</i>
            </button>
            <button onClick={() => format("underline")}
              className="p-2 hover:bg-gray-800 rounded text-white" title="Underline">
              <u>U</u>
            </button>
            <button onClick={() => format("insertUnorderedList")}
              className="p-2 hover:bg-gray-800 rounded text-white" title="Bullet List">
              <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><circle cx="4" cy="5" r="1.5" fill="#555"/><circle cx="4" cy="9" r="1.5" fill="#555"/><circle cx="4" cy="13" r="1.5" fill="#555"/><rect x="8" y="4.25" width="7" height="1.5" rx="0.75" fill="#555"/><rect x="8" y="8.25" width="7" height="1.5" rx="0.75" fill="#555"/><rect x="8" y="12.25" width="7" height="1.5" rx="0.75" fill="#555"/></svg>
            </button>
            <button onClick={() => format("insertOrderedList")}
              className="p-2 hover:bg-gray-800 rounded text-white" title="Numbered List">
              <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><text x="2" y="7" fontSize="4" fill="#555">1.</text><rect x="8" y="4.25" width="7" height="1.5" rx="0.75" fill="#555"/><text x="2" y="11" fontSize="4" fill="#555">2.</text><rect x="8" y="8.25" width="7" height="1.5" rx="0.75" fill="#555"/><text x="2" y="15" fontSize="4" fill="#555">3.</text><rect x="8" y="12.25" width="7" height="1.5" rx="0.75" fill="#555"/></svg>
            </button>
            <button onClick={() => format("createLink", prompt("Enter URL") || undefined)}
              className="p-2 hover:bg-gray-800 rounded text-white" title="Insert Link">
              <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><path d="M7 11a3 3 0 0 1 0-6h2" stroke="#555" strokeWidth="1.5"/><path d="M11 7a3 3 0 0 1 0 6H9" stroke="#555" strokeWidth="1.5"/></svg>
            </button>
            {/* Insert Image Button */}
            <button
              type="button"
              className="p-2 hover:bg-gray-800 rounded text-white"
              title="Insert Image"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><rect x="2" y="2" width="14" height="14" rx="2" fill="#555"/><circle cx="6" cy="7" r="2" fill="#fff"/><path d="M2 14l4-4a2 2 0 0 1 2.8 0l3.2 3.2a1 1 0 0 0 1.4 0L16 10" stroke="#fff" strokeWidth="1.5"/></svg>
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Rich Text Editor */}
          <div
            ref={editorRef}
            className="min-h-[300px] outline-none p-4 border border-gray-700 rounded bg-black text-white focus:bg-black focus:border-blue-400 transition"
            contentEditable
            suppressContentEditableWarning
            spellCheck={true}
            aria-label="Post content editor"
            style={{ fontSize: "1.1rem" }}
            onDrop={onEditorDrop}
            onClick={onEditorClick}
          >
            Start writing your post here...
          </div>
          {/* Image Toolbar */}
          {imgToolbar && selectedImg && (
            <div
              style={{ position: "fixed", top: imgToolbar.y + 10, left: imgToolbar.x, zIndex: 50 }}
              className="bg-gray-900 text-white rounded shadow-lg p-3 flex gap-2 items-center border border-gray-700"
            >
              <span>Align:</span>
              <button onClick={() => setImgAlign("left")} className="px-2 py-1 rounded hover:bg-gray-700">Left</button>
              <button onClick={() => setImgAlign("center")} className="px-2 py-1 rounded hover:bg-gray-700">Center</button>
              <button onClick={() => setImgAlign("right")} className="px-2 py-1 rounded hover:bg-gray-700">Right</button>
              <span>Width:</span>
              <input
                type="range"
                min={50}
                max={800}
                value={imgProps.width || 300}
                onChange={e => setImgWidth(Number(e.target.value))}
                className="mx-2"
              />
              <span>{imgProps.width || 300}px</span>
              <span>Crop:</span>
              <button
                onClick={() => setImgCrop(!imgProps.crop)}
                className="px-2 py-1 rounded hover:bg-gray-700"
              >
                {imgProps.crop ? "Uncrop" : "Crop"}
              </button>
              <button onClick={closeImgToolbar} className="ml-2 px-2 py-1 rounded bg-red-700 hover:bg-red-800">Close</button>
            </div>
          )}
        </section>

        {/* Sidebar */}
        <aside className="w-80 bg-black rounded shadow p-6 flex flex-col gap-6 border border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Labels</label>
            <input
              className="w-full border border-gray-700 rounded px-3 py-2 focus:border-blue-500 outline-none bg-black text-white placeholder-gray-400"
              placeholder="e.g. travel, tech"
              value={labels}
              onChange={e => setLabels(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
            <select
              className="w-full border border-gray-700 rounded px-3 py-2 focus:border-blue-500 outline-none bg-black text-white"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option className="bg-black text-white">Draft</option>
              <option className="bg-black text-white">Published</option>
            </select>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Save</button>
            <button className="flex-1 bg-gray-800 text-gray-200 px-4 py-2 rounded hover:bg-gray-700 transition">Close</button>
          </div>
        </aside>
      </main>
    </div>
  );
}
