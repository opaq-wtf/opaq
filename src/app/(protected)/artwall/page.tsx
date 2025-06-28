"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import HomeNav from "../homenav";
import { Taskbar } from "../taskbar";
import ArtwallBody from "./artwall-body";
import { LikedPostsList } from "./components/LikedPostsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ArtwallPage() {
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get("/api/auth/me");
        setCurrentUser(response.data);
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  return (
    <div className="min-h-screen pb-12 relative bg-black">
      <HomeNav />
      <div className="flex justify-center">
        <div className="flex-1 max-w-4xl">
          <Tabs defaultValue="my-posts" className="w-full px-4 py-6">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800 text-gray-300">
              <TabsTrigger
                value="my-posts"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                My posts
              </TabsTrigger>
              <TabsTrigger
                value="liked-posts"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Liked posts
              </TabsTrigger>
              <TabsTrigger
                value="followers"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Followers
              </TabsTrigger>
              <TabsTrigger
                value="following"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Following
              </TabsTrigger>
            </TabsList>
            <TabsContent value="my-posts">
              <ArtwallBody />
            </TabsContent>
            <TabsContent value="liked-posts" className="pt-4">
              <LikedPostsList currentUserId={currentUser?.id} />
            </TabsContent>
            <TabsContent value="followers" className="text-gray-400 pt-4">
              {/* Content for Followers will go here. */}
              <div className="flex items-center justify-center min-h-[200px] border border-gray-700 rounded-lg p-4">
                <p>Content for Followers will go here.</p>
              </div>
            </TabsContent>
            <TabsContent value="following" className="text-gray-400 pt-4">
              {/* Content for Following will go here. */}
              <div className="flex items-center justify-center min-h-[200px] border border-gray-700 rounded-lg p-4">
                <p>Content for Following will go here.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Taskbar />
    </div>
  );
}
