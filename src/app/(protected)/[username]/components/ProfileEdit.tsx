"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Save, Camera, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import ProfileAvatar from "@/components/common/ProfileAvatar";

interface User {
    id: string;
    full_name: string;
    email: string;
    username: string;
    bio?: string;
    location?: string;
    website?: string;
    contact_visible?: boolean;
    profile_picture?: string;
    profile_picture_data?: string;
    date_of_birth?: string;
}

interface ProfileEditProps {
    user: User;
    onClose: () => void;
    onUpdate: (updatedUser: User) => void;
}

// Zod validation schema
const profileEditSchema = z.object({
    full_name: z.string().min(1, "Full name is required"),
    bio: z.string(),
    location: z.string(),
    website: z.string().refine((url) => {
        if (!url) return true; // Allow empty string
        try {
            new URL(url.startsWith('http') ? url : `https://${url}`);
            return true;
        } catch {
            return false;
        }
    }, "Please enter a valid website URL"),
    contact_visible: z.boolean(),
    profile_picture_data: z.string(),
    date_of_birth: z.string().refine((date) => {
        if (!date) return true; // Allow empty string (optional field)

        const dobDate = new Date(date);
        if (isNaN(dobDate.getTime())) return false; // Invalid date

        // Check if date is not in the future
        if (dobDate > new Date()) return false;

        // Check minimum age of 16 years
        const sixteenYearsAgo = new Date();
        sixteenYearsAgo.setFullYear(sixteenYearsAgo.getFullYear() - 16);

        return dobDate <= sixteenYearsAgo;
    }, "You must be at least 16 years old and date cannot be in the future"),
});

type ProfileEditForm = z.infer<typeof profileEditSchema>;

export default function ProfileEdit({ user, onClose, onUpdate }: ProfileEditProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
        watch,
    } = useForm<ProfileEditForm>({
        resolver: zodResolver(profileEditSchema),
        defaultValues: {
            full_name: user.full_name || "",
            bio: user.bio || "",
            location: user.location || "",
            website: user.website || "",
            contact_visible: user.contact_visible || false,
            profile_picture_data: user.profile_picture_data || "",
            date_of_birth: user.date_of_birth ? new Date(user.date_of_birth).toISOString().split('T')[0] : "",
        }
    });

    const [previewImage, setPreviewImage] = useState<string | null>(user.profile_picture_data || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onSubmit = async (data: ProfileEditForm) => {
        try {
            const response = await axios.put("/api/user/profile", data);

            if (response.data.user) {
                onUpdate(response.data.user);
                toast.success("Profile updated successfully!");
                onClose();
            }
        } catch (error: any) {
            console.error("Error updating profile:", error);
            toast.error(error.response?.data?.message || "Failed to update profile");
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Please upload a valid image file (JPEG, PNG, GIF, WebP)");
            return;
        }

        // Check file size (1MB = 1024 * 1024 bytes)
        if (file.size > 1024 * 1024) {
            toast.error("Image too large. Maximum size is 1MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64String = event.target?.result as string;
            setPreviewImage(base64String);
            setValue('profile_picture_data', base64String);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setPreviewImage(null);
        setValue('profile_picture_data', '');
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const triggerImageUpload = () => {
        fileInputRef.current?.click();
    };

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <Card className="bg-gray-900 border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Profile Picture Section */}
                            <div className="flex flex-col items-center space-y-4">
                                <div className="relative">
                                    <ProfileAvatar
                                        fullName={watch('full_name')}
                                        profilePictureData={previewImage}
                                        size="xl"
                                        className="border-2 border-gray-700"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={triggerImageUpload}
                                        className="absolute -bottom-2 -right-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-full p-2"
                                    >
                                        <Camera className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={triggerImageUpload}
                                        className="border-gray-600 text-gray-300 hover:bg-gray-800"
                                    >
                                        <Camera className="h-4 w-4 mr-2" />
                                        {previewImage ? "Change Photo" : "Add Photo"}
                                    </Button>
                                    {previewImage && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleRemoveImage}
                                            className="border-red-600 text-red-400 hover:bg-red-600/10"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Remove
                                        </Button>
                                    )}
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />

                                <p className="text-xs text-gray-400 text-center">
                                    Maximum file size: 1MB<br />
                                    Supported formats: JPEG, PNG, GIF, WebP
                                </p>
                            </div>

                            {/* Full Name */}
                            <div>
                                <label htmlFor="full_name" className="block text-sm font-medium text-gray-300 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="full_name"
                                    {...register('full_name')}
                                    className={`w-full px-3 py-2 bg-gray-800 border ${errors.full_name ? 'border-red-500' : 'border-gray-700'} rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent`}
                                    placeholder="Enter your full name"
                                />
                                {errors.full_name && (
                                    <p className="text-red-400 text-sm mt-1">{errors.full_name.message}</p>
                                )}
                            </div>

                            {/* Bio */}
                            <div>
                                <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
                                    Bio
                                </label>
                                <textarea
                                    id="bio"
                                    rows={4}
                                    {...register('bio')}
                                    className={`w-full px-3 py-2 bg-gray-800 border ${errors.bio ? 'border-red-500' : 'border-gray-700'} rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none`}
                                    placeholder="Tell us about yourself..."
                                />
                                {errors.bio && (
                                    <p className="text-red-400 text-sm mt-1">{errors.bio.message}</p>
                                )}
                            </div>

                            {/* Location */}
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    id="location"
                                    {...register('location')}
                                    className={`w-full px-3 py-2 bg-gray-800 border ${errors.location ? 'border-red-500' : 'border-gray-700'} rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent`}
                                    placeholder="City, Country"
                                />
                                {errors.location && (
                                    <p className="text-red-400 text-sm mt-1">{errors.location.message}</p>
                                )}
                            </div>

                            {/* Website */}
                            <div>
                                <label htmlFor="website" className="block text-sm font-medium text-gray-300 mb-2">
                                    Website
                                </label>
                                <input
                                    type="url"
                                    id="website"
                                    {...register('website')}
                                    className={`w-full px-3 py-2 bg-gray-800 border ${errors.website ? 'border-red-500' : 'border-gray-700'} rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent`}
                                    placeholder="https://yourwebsite.com"
                                />
                                {errors.website && (
                                    <p className="text-red-400 text-sm mt-1">{errors.website.message}</p>
                                )}
                            </div>

                            {/* Date of Birth - Can only be set once */}
                            <div>
                                <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-300 mb-2">
                                    <Calendar className="h-4 w-4 inline mr-2" />
                                    Date of Birth
                                    {user.date_of_birth && (
                                        <span className="text-xs text-yellow-400 ml-2">(Already set, cannot be changed)</span>
                                    )}
                                </label>
                                {user.date_of_birth ? (
                                    <div className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-400">
                                        {new Date(user.date_of_birth).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                ) : (
                                    <>
                                        <input
                                            type="date"
                                            id="date_of_birth"
                                            {...register('date_of_birth')}
                                            max={new Date().toISOString().split('T')[0]} // Prevent future dates
                                            className={`w-full px-3 py-2 bg-gray-800 border ${errors.date_of_birth ? 'border-red-500' : 'border-gray-700'} rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent`}
                                        />
                                        {errors.date_of_birth && (
                                            <p className="text-red-400 text-sm mt-1">{errors.date_of_birth.message}</p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-1">
                                            Once set, your date of birth cannot be changed. You must be at least 16 years old.
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Contact Visibility */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="contact_visible"
                                    {...register('contact_visible')}
                                    className="w-4 h-4 text-yellow-400 bg-gray-800 border-gray-700 rounded focus:ring-yellow-400 focus:ring-2"
                                />
                                <label htmlFor="contact_visible" className="text-sm text-gray-300">
                                    Make my contact information visible to other users
                                </label>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-6">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-yellow-400 hover:bg-yellow-500 text-black"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
