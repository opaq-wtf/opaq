"use client";

import { useState } from "react";
import { User, Camera } from "lucide-react";

interface ProfileAvatarProps {
  fullName: string;
  profilePicture?: string | null;
  profilePictureData?: string | null; // Base64 image data from database
  size?: "sm" | "md" | "lg" | "xl";
  showEditButton?: boolean;
  onEdit?: () => void;
  className?: string;
}

export default function ProfileAvatar({
  fullName,
  profilePicture,
  profilePictureData,
  size = "md",
  showEditButton = false,
  onEdit,
  className = "",
}: ProfileAvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Get initials from full name (first letter of first name + first letter of last name)
  const getInitials = (name: string) => {
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length === 0) return "U"; // Default for empty name

    if (nameParts.length === 1) {
      // Only first name provided - use first letter
      return nameParts[0].charAt(0).toUpperCase();
    }

    // First name + Last name initials
    const firstInitial = nameParts[0].charAt(0).toUpperCase();
    const lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
    return firstInitial + lastInitial;
  };

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "w-8 h-8 text-sm";
      case "md":
        return "w-12 h-12 text-lg";
      case "lg":
        return "w-16 h-16 text-xl";
      case "xl":
        return "w-24 h-24 text-3xl";
      default:
        return "w-12 h-12 text-lg";
    }
  };

  // Generate a consistent color based on the name
  const getAvatarColor = (name: string) => {
    const colors = [
      "from-blue-500 to-purple-600",
      "from-green-500 to-teal-600",
      "from-orange-500 to-red-600",
      "from-pink-500 to-rose-600",
      "from-indigo-500 to-blue-600",
      "from-yellow-500 to-orange-600",
      "from-purple-500 to-pink-600",
      "from-teal-500 to-green-600",
    ];

    // Simple hash function to consistently assign colors
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const sizeClasses = getSizeClasses();
  const colorClasses = getAvatarColor(fullName);
  const initials = getInitials(fullName);

  // Determine if we should show the image or initials
  // Priority: profilePictureData (from DB) > profilePicture (URL) > initials
  const shouldShowImage = (profilePictureData || profilePicture) && !imageError;
  const imageSource = profilePictureData || profilePicture;

  return (
    <div className={`relative ${className}`}>
      <div
        className={`${sizeClasses} bg-gradient-to-br ${colorClasses} rounded-full flex items-center justify-center flex-shrink-0 shadow-md relative overflow-hidden`}
      >
        {shouldShowImage ? (
          <img
            src={imageSource!}
            alt={`${fullName}'s profile picture`}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="text-white font-semibold select-none">
            {initials}
          </span>
        )}

        {/* Edit overlay button */}
        {showEditButton && (
          <div
            onClick={onEdit}
            className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer"
          >
            <Camera className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
    </div>
  );
}
