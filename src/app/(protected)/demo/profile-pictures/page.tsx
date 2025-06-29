"use client";

import { useState } from "react";
import ProfileAvatar from "@/components/common/ProfileAvatar";
import ProfilePictureUpload from "@/components/common/ProfilePictureUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Demo user interface and data
interface DemoUser {
    id: string;
    full_name: string;
    email: string;
    username: string;
    bio: string;
    profile_picture_data: string | null;
}

const demoUser: DemoUser = {
    id: "demo-user",
    full_name: "John Doe",
    email: "john.doe@example.com",
    username: "johndoe",
    bio: "Software developer passionate about building great user experiences.",
    profile_picture_data: null,
};

export default function ProfilePictureDemoPage() {
    const [user, setUser] = useState<DemoUser>(demoUser);
    const [showUpload, setShowUpload] = useState(false);

    const handleUploadSuccess = (imageData: string) => {
        setUser(prev => ({
            ...prev,
            profile_picture_data: imageData
        }));
        toast.success("Profile picture updated successfully!");
        setShowUpload(false);
    };

    const handleRemove = () => {
        setUser(prev => ({
            ...prev,
            profile_picture_data: null
        }));
        toast.success("Profile picture removed!");
    };

    const resetDemo = () => {
        setUser({ ...demoUser, profile_picture_data: null });
        setShowUpload(false);
        toast.info("Demo reset!");
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-yellow-400 mb-4">
                        Profile Picture System Demo
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Demonstrates default initials display and image upload functionality
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Avatar Display */}
                    <Card className="bg-gray-900 border-gray-700">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                🎨 ProfileAvatar Component
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Different Sizes */}
                            <div>
                                <h3 className="text-lg font-semibold text-yellow-400 mb-4">Different Sizes</h3>
                                <div className="flex items-center gap-4 flex-wrap">
                                    <div className="text-center">
                                        <ProfileAvatar
                                            fullName={user.full_name}
                                            profilePictureData={user.profile_picture_data}
                                            size="sm"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Small</p>
                                    </div>
                                    <div className="text-center">
                                        <ProfileAvatar
                                            fullName={user.full_name}
                                            profilePictureData={user.profile_picture_data}
                                            size="md"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Medium</p>
                                    </div>
                                    <div className="text-center">
                                        <ProfileAvatar
                                            fullName={user.full_name}
                                            profilePictureData={user.profile_picture_data}
                                            size="lg"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Large</p>
                                    </div>
                                    <div className="text-center">
                                        <ProfileAvatar
                                            fullName={user.full_name}
                                            profilePictureData={user.profile_picture_data}
                                            size="xl"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Extra Large</p>
                                    </div>
                                </div>
                            </div>

                            {/* Current User Display */}
                            <div>
                                <h3 className="text-lg font-semibold text-yellow-400 mb-4">Current User</h3>
                                <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
                                    <ProfileAvatar
                                        fullName={user.full_name}
                                        profilePictureData={user.profile_picture_data}
                                        size="lg"
                                        showEditButton={true}
                                        onEdit={() => setShowUpload(true)}
                                    />
                                    <div>
                                        <h4 className="text-white font-semibold">{user.full_name}</h4>
                                        <p className="text-gray-400">@{user.username}</p>
                                        <p className="text-sm text-gray-500">{user.bio}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Name Examples */}
                            <div>
                                <h3 className="text-lg font-semibold text-yellow-400 mb-4">Name Examples</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        "Alice Johnson",
                                        "Bob Smith",
                                        "Catherine Williams",
                                        "David Brown",
                                        "Emma Davis",
                                        "Frank Miller"
                                    ].map(name => (
                                        <div key={name} className="flex items-center gap-2 p-2 bg-gray-800 rounded">
                                            <ProfileAvatar fullName={name} size="sm" />
                                            <span className="text-sm text-gray-300">{name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right Column - Upload Component */}
                    <Card className="bg-gray-900 border-gray-700">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                📁 ProfilePictureUpload Component
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {showUpload ? (
                                <div>
                                    <h3 className="text-lg font-semibold text-yellow-400 mb-4">Upload Interface</h3>
                                    <ProfilePictureUpload
                                        fullName={user.full_name}
                                        currentProfilePictureData={user.profile_picture_data}
                                        onUploadSuccess={handleUploadSuccess}
                                        onRemove={handleRemove}
                                        size="lg"
                                    />
                                    <div className="mt-4 pt-4 border-t border-gray-700">
                                        <Button
                                            onClick={() => setShowUpload(false)}
                                            variant="outline"
                                            className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center space-y-4">
                                    <div className="p-8">
                                        <ProfileAvatar
                                            fullName={user.full_name}
                                            profilePictureData={user.profile_picture_data}
                                            size="xl"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Button
                                            onClick={() => setShowUpload(true)}
                                            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                                        >
                                            {user.profile_picture_data ? "Change Photo" : "Upload Photo"}
                                        </Button>

                                        {user.profile_picture_data && (
                                            <Button
                                                onClick={handleRemove}
                                                variant="outline"
                                                className="w-full border-red-600 text-red-400 hover:bg-red-600/10"
                                            >
                                                Remove Photo
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Features Section */}
                <Card className="bg-gray-900 border-gray-700 mt-8">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            ⚡ Features & Implementation
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold text-yellow-400 mb-3">✅ Features</h3>
                                <ul className="space-y-2 text-gray-300">
                                    <li>• Default initials display (First + Last name)</li>
                                    <li>• Consistent gradient colors per user</li>
                                    <li>• Image upload with 1MB size limit</li>
                                    <li>• Support: JPEG, PNG, GIF, WebP</li>
                                    <li>• SQL database storage (Base64)</li>
                                    <li>• Client & server validation</li>
                                    <li>• Responsive sizing (sm, md, lg, xl)</li>
                                    <li>• Edit overlay with camera icon</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-yellow-400 mb-3">🔧 Usage</h3>
                                <div className="bg-gray-800 p-4 rounded-lg">
                                    <code className="text-sm text-green-400">
                                        {`import ProfileAvatar from "@/components/common/ProfileAvatar";

<ProfileAvatar
  fullName="John Doe"
  profilePictureData={user.profile_picture_data}
  size="lg"
  showEditButton={true}
  onEdit={() => openEditor()}
/>`}
                                    </code>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Reset Demo */}
                <div className="text-center mt-8">
                    <Button
                        onClick={resetDemo}
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                        🔄 Reset Demo
                    </Button>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-gray-500">
                    <p>Demo page showing ProfileAvatar and ProfilePictureUpload components</p>
                    <p className="text-sm">Check PROFILE_PICTURES.md for complete documentation</p>
                </div>
            </div>
        </div>
    );
}
