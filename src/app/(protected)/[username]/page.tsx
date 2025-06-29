"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import HomeNav from "../homenav";
import { Taskbar } from "../taskbar";
import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  EditIcon,
  Mail,
  MapPin,
  Globe,
  Calendar,
  MessageCircle,
  BookOpen,
  User,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react";
import ProfileEdit from "./components/ProfileEdit";
import ProfileArtwallPosts from "./components/ProfileArtwallPosts";
import ProfileBloomPitches from "./components/ProfileBloomPitches";
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
  createdAt?: string;
}

interface CurrentUser {
  id: string;
  username: string;
  fullName: string;
}

interface ProfileStats {
  postsCount: number;
  publishedPostsCount: number;
  pitchesCount: number;
  publicPitchesCount: number;
  followersCount?: number;
  followingCount?: number;
}

export default function ProfilePage() {
  const { username } = useParams() as { username: string };
  const [user, setUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("artwall");

  // Check if current user is viewing their own profile
  const isOwnProfile = currentUser && user && currentUser.id === user.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch current user
        try {
          const currentUserRes = await axios.get("/api/auth/me");
          setCurrentUser(currentUserRes.data);
        } catch (error) {
          console.log(error);
          // User might not be logged in - that's okay
          setCurrentUser(null);
        }

        // Fetch profile user
        const userRes = await axios.post("/api/graphql", {
          query: `
            query($username: String!) {
              userByUsername(username: $username) {
                id
                full_name
                email
                username
                bio
                location
                website
                contact_visible
                profile_picture
                profile_picture_data
                date_of_birth
                createdAt
              }
            }
          `,
          variables: { username },
        });

        if (userRes.data.errors) {
          throw new Error(userRes.data.errors[0].message);
        }

        const userData = userRes.data.data.userByUsername;
        if (!userData) {
          throw new Error("User not found");
        }

        setUser(userData);

        // Fetch profile statistics
        await fetchProfileStats(userData.id);

      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  const fetchProfileStats = async (userId: string) => {
    try {
      // Fetch posts count
      const postsRes = await axios.get("/api/posts", {
        params: {
          user_id: userId,
          limit: 1, // We only need the count
          page: 1
        }
      });

      // Fetch pitches count
      const pitchesRes = await axios.get("/api/pitches", {
        params: {
          user_id: userId,
          limit: 1,
          page: 1
        }
      });

      const stats: ProfileStats = {
        postsCount: postsRes.data.pagination?.total || 0,
        publishedPostsCount: postsRes.data.posts?.filter((p: any) => p.status === "Published").length || 0,
        pitchesCount: pitchesRes.data.pagination?.total || 0,
        publicPitchesCount: pitchesRes.data.pitches?.filter((p: any) => p.visibility === "public").length || 0,
      };

      setProfileStats(stats);
    } catch (error) {
      console.error("Error fetching profile stats:", error);
      // Set default stats on error
      setProfileStats({
        postsCount: 0,
        publishedPostsCount: 0,
        pitchesCount: 0,
        publicPitchesCount: 0,
      });
    }
  };

  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    setIsEditing(false);
    toast.success("Profile updated successfully");
  };

  const _formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };


  const formatJoinDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    const now = new Date();
    const diffInMonths = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());

    if (diffInMonths < 1) {
      return "Joined this month";
    } else if (diffInMonths < 12) {
      return `Joined ${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffInMonths / 12);
      return `Joined ${years} year${years > 1 ? 's' : ''} ago`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <HomeNav />
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <Loader />
        </div>
        <Taskbar />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-black">
        <HomeNav />
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
            <p className="text-gray-400">{error || "The user you're looking for doesn't exist."}</p>
          </div>
        </div>
        <Taskbar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <HomeNav />

      <div className="container mx-auto px-4 py-8 pb-24">
        {/* Enhanced Profile Header */}
        <Card className="bg-gray-900 border-gray-700 mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-start gap-8">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col items-center lg:items-start gap-4">
                <ProfileAvatar
                  fullName={user.full_name}
                  profilePictureData={user.profile_picture_data}
                  profilePicture={user.profile_picture}
                  size="xl"
                  showEditButton={!!isOwnProfile}
                  onEdit={() => setIsEditing(true)}
                  className="shadow-lg"
                />

                {/* Quick Stats */}
                {profileStats && (
                  <div className="grid grid-cols-2 gap-4 text-center lg:text-left">
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="text-xl font-bold text-yellow-400">
                        {isOwnProfile ? profileStats.postsCount : profileStats.publishedPostsCount}
                      </div>
                      <div className="text-xs text-gray-400">
                        {isOwnProfile ? "Total Posts" : "Published Posts"}
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="text-xl font-bold text-blue-400">
                        {isOwnProfile ? profileStats.pitchesCount : profileStats.publicPitchesCount}
                      </div>
                      <div className="text-xs text-gray-400">
                        {isOwnProfile ? "Total Pitches" : "Public Pitches"}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* User Details */}
              <div className="flex-1 w-full lg:w-auto">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                  <div className="text-center lg:text-left">
                    <h1 className="text-4xl font-bold text-white mb-2">{user.full_name}</h1>
                    <p className="text-xl text-gray-400 mb-4">@{user.username}</p>

                    {user.bio && (
                      <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">{user.bio}</p>
                    )}
                  </div>

                  {isOwnProfile && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                      size="lg"
                    >
                      <EditIcon className="w-5 h-5 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>

                {/* Profile Meta Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{formatJoinDate(user.createdAt)}</span>
                  </div>

                  {/* Date of Birth - Only visible to profile owner */}
                  {isOwnProfile && user.date_of_birth && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>Born {new Date(user.date_of_birth).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>
                  )}

                  {user.location && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>{user.location}</span>
                    </div>
                  )}

                  {user.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a
                        href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-yellow-400 hover:text-yellow-300 transition-colors"
                      >
                        {user.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}

                  {/* Contact visibility indicator for profile owner */}
                  {isOwnProfile && (
                    <div className="flex items-center gap-2 text-gray-400">
                      {user.contact_visible ? (
                        <>
                          <Eye className="w-4 h-4 text-green-400" />
                          <span className="text-green-400">Contact visible</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-4 h-4 text-orange-400" />
                          <span className="text-orange-400">Contact private</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Profile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900 border-gray-700 h-14">
            <TabsTrigger
              value="artwall"
              className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-black font-semibold"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              <div className="flex flex-col items-start">
                <span>Artwall Posts</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="bloom"
              className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-black font-semibold"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              <div className="flex flex-col items-start">
                <span>Bloom Pitches</span>

              </div>
            </TabsTrigger>
            <TabsTrigger
              value="contact"
              className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-black font-semibold"
            >
              <Mail className="w-5 h-5 mr-2" />
              Contact
            </TabsTrigger>
          </TabsList>

          <TabsContent value="artwall" className="mt-8">
            <ProfileArtwallPosts userId={user.id} isOwnProfile={isOwnProfile || false} />
          </TabsContent>

          <TabsContent value="bloom" className="mt-8">
            <ProfileBloomPitches userId={user.id} isOwnProfile={isOwnProfile || false} />
          </TabsContent>

          <TabsContent value="contact" className="mt-8">
            {user.contact_visible || isOwnProfile ? (
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-gray-300 font-medium">{user.email}</div>
                      <div className="text-xs text-gray-500">Email Address</div>
                    </div>
                  </div>

                  {user.location && (
                    <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-gray-300 font-medium">{user.location}</div>
                        <div className="text-xs text-gray-500">Location</div>
                      </div>
                    </div>
                  )}

                  {user.website && (
                    <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <div>
                        <a
                          href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
                        >
                          {user.website.replace(/^https?:\/\//, '')}
                        </a>
                        <div className="text-xs text-gray-500">Website</div>
                      </div>
                    </div>
                  )}

                  {/* Profile owner privacy notice */}
                  {isOwnProfile && !user.contact_visible && (
                    <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-400/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Settings className="w-5 h-5 text-yellow-400 mt-0.5" />
                        <div>
                          <h4 className="text-yellow-300 font-medium mb-1">Privacy Setting</h4>
                          <p className="text-sm text-yellow-200/80">
                            Your contact information is currently private. Enable visibility in your profile settings to let others see your contact details.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <EyeOff className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Contact Information Private</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    This user has chosen to keep their contact information private.
                    Only basic profile information is visible to the public.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Enhanced Profile Edit Modal */}
      {isEditing && (
        <ProfileEdit
          user={user}
          onClose={() => setIsEditing(false)}
          onUpdate={handleProfileUpdate}
        />
      )}

      <Taskbar />
    </div>
  );
}
