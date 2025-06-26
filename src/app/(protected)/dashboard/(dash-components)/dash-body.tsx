import React from "react";
// Import shadcn UI components
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

const recentPosts = [
	{
		id: 1,
		title: "Understanding React Server Components",
		description:
			"A deep dive into React Server Components and their impact on modern web apps.",
		date: "2024-06-01",
		image: "/retro.gif",
		likes: 42,
	},
	{
		id: 2,
		title: "TypeScript Tips for Large Projects",
		description:
			"Best practices and tips for scaling TypeScript in big codebases.",
		date: "2024-05-28",
		image: "/Eyes.gif",
		likes: 31,
	},
	{
		id: 3,
		title: "Optimizing Next.js Apps",
		description: "Performance strategies for Next.js applications.",
		date: "2024-05-20",
		image: "/logo.svg",
		likes: 27,
	},
];

export default function DashBody() {
	return (
		<div className="flex flex-col items-center justify-center min-h-[80vh] bg-muted py-8">
			<h1 className="text-3xl font-bold mb-8 tracking-tight">
				Recent Blog Posts
			</h1>
			<div className="w-full max-w-2xl space-y-6">
				{recentPosts.map((post) => (
					<Card key={post.id} className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-none rounded-lg">
						<CardContent className="flex items-center p-4">
							<div className="w-1/2 flex-shrink-0">
								<img src={post.image} alt={post.title} className="w-24 h-24 object-cover rounded-md border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900" />
							</div>
							<div className="w-1/2 flex-1 min-w-0 pl-4">
								<div className="text-xl font-bold mb-1 line-clamp-1">
									{post.title}
								</div>
								<div className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">{post.description}</div>
							</div>
							<div className="flex items-center gap-2 mt-2">
								<Button
									variant="ghost"
									size="icon"
									className="p-1 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900"
								>
									<Heart className="w-5 h-5" />
								</Button>
								<span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">
									{post.likes}
								</span>
							</div>
						</CardContent>

					</Card>
				))}
			</div>
		</div>
	);
}
