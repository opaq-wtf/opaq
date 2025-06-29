"use client";

import { useState, useRef } from "react";
import { Upload, X, Check } from "lucide-react";
import ProfileAvatar from "./ProfileAvatar";

interface ProfilePictureUploadProps {
    fullName: string;
    currentProfilePicture?: string | null;
    currentProfilePictureData?: string | null;
    onUploadSuccess?: (imageData: string) => void;
    onRemove?: () => void;
    className?: string;
    size?: "sm" | "md" | "lg" | "xl";
}

export default function ProfilePictureUpload({
    fullName,
    currentProfilePicture,
    currentProfilePictureData,
    onUploadSuccess,
    onRemove,
    className = "",
    size = "lg",
}: ProfilePictureUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Reset previous errors
        setError(null);

        // Validate file type
        const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
        if (!validTypes.includes(file.type)) {
            setError("Please upload a valid image file (JPEG, PNG, GIF, WebP)");
            return;
        }

        // Validate file size (1MB limit)
        const maxSizeInBytes = 1 * 1024 * 1024; // 1MB
        if (file.size > maxSizeInBytes) {
            setError("Image too large. Maximum size is 1MB.");
            return;
        }

        // Convert to base64 and show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setPreviewImage(result);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!previewImage) return;

        setIsUploading(true);
        setError(null);

        try {
            const response = await fetch("/api/user/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    profile_picture_data: previewImage,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to upload image");
            }

            // Call success callback
            onUploadSuccess?.(previewImage);
            setPreviewImage(null);

            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = async () => {
        setIsUploading(true);
        setError(null);

        try {
            const response = await fetch("/api/user/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    profile_picture_data: null,
                    profile_picture: null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to remove profile picture");
            }

            // Call remove callback
            onRemove?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to remove profile picture");
        } finally {
            setIsUploading(false);
        }
    };

    const cancelPreview = () => {
        setPreviewImage(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const hasProfilePicture = currentProfilePictureData || currentProfilePicture;

    return (
        <div className={`flex flex-col items-center space-y-4 ${className}`}>
            {/* Avatar with preview or current image */}
            <div className="relative">
                <ProfileAvatar
                    fullName={fullName}
                    profilePicture={currentProfilePicture}
                    profilePictureData={previewImage || currentProfilePictureData}
                    size={size}
                    showEditButton={!previewImage}
                    onEdit={triggerFileInput}
                />

                {/* Loading overlay */}
                {isUploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </div>

            {/* File input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Action buttons */}
            <div className="flex flex-col items-center space-y-2">
                {previewImage ? (
                    // Preview mode buttons
                    <div className="flex space-x-2">
                        <button
                            onClick={handleUpload}
                            disabled={isUploading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg flex items-center space-x-2 transition-colors"
                        >
                            <Check className="w-4 h-4" />
                            <span>{isUploading ? "Uploading..." : "Save"}</span>
                        </button>
                        <button
                            onClick={cancelPreview}
                            disabled={isUploading}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg flex items-center space-x-2 transition-colors"
                        >
                            <X className="w-4 h-4" />
                            <span>Cancel</span>
                        </button>
                    </div>
                ) : (
                    // Normal mode buttons
                    <div className="flex flex-col items-center space-y-2">
                        <button
                            onClick={triggerFileInput}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
                        >
                            <Upload className="w-4 h-4" />
                            <span>Upload Photo</span>
                        </button>

                        {hasProfilePicture && (
                            <button
                                onClick={handleRemove}
                                disabled={isUploading}
                                className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            >
                                Remove Photo
                            </button>
                        )}
                    </div>
                )}

                {/* Upload guidelines */}
                <div className="text-xs text-gray-500 text-center max-w-sm">
                    <p>Upload a photo (max 1MB)</p>
                    <p>Supported formats: JPEG, PNG, GIF, WebP</p>
                </div>

                {/* Error message */}
                {error && (
                    <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg max-w-sm text-center">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
