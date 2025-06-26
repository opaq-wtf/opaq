import React from 'react';
import { Button } from '@/components/ui/button';
import { AlignLeft, AlignCenter, AlignRight, X } from 'lucide-react';

interface ImageToolbarProps {
  position: { x: number; y: number };
  imgProps: { width?: number; align?: string; crop?: boolean };
  onAlignChange: (align: string) => void;
  onWidthChange: (width: number) => void;
  onCropToggle: () => void;
  onClose: () => void;
}

export function ImageToolbar({
  position,
  imgProps,
  onAlignChange,
  onWidthChange,
  onCropToggle,
  onClose
}: ImageToolbarProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: position.y + 10,
        left: position.x,
        zIndex: 50
      }}
      className="bg-gray-900 text-white rounded-lg shadow-xl p-4 flex gap-3 items-center border border-gray-600"
    >
      <span className="text-sm font-medium">Align:</span>
      <div className="flex gap-1">
        <Button
          size="sm"
          variant={imgProps.align === "left" ? "default" : "ghost"}
          onClick={() => onAlignChange("left")}
          className="h-8 w-8 p-0"
        >
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant={imgProps.align === "center" ? "default" : "ghost"}
          onClick={() => onAlignChange("center")}
          className="h-8 w-8 p-0"
        >
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant={imgProps.align === "right" ? "default" : "ghost"}
          onClick={() => onAlignChange("right")}
          className="h-8 w-8 p-0"
        >
          <AlignRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Width:</span>
        <input
          type="range"
          min={100}
          max={800}
          value={imgProps.width || 300}
          onChange={e => onWidthChange(Number(e.target.value))}
          className="w-20"
        />
        <span className="text-sm min-w-[50px]">{imgProps.width || 300}px</span>
      </div>

      <Button
        size="sm"
        variant={imgProps.crop ? "default" : "outline"}
        onClick={onCropToggle}
      >
        {imgProps.crop ? "Uncrop" : "Crop"}
      </Button>

      <Button
        size="sm"
        variant="destructive"
        onClick={onClose}
        className="ml-2"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
