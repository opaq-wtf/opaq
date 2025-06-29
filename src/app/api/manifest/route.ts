import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getJson } from "serpapi";
import MongoConnect from "@/lib/mongodb/lib/mongoose";
import ManifestHistory from "@/lib/mongodb/model/manifest-history";
import { getSession } from "@/lib/session";

// IMPORTANT: Set your GEMINI_API_KEY in a .env.local file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    // Get user session for history saving
    const session = await getSession();

    // 1. Search the web for context
    const searchResponse = await getJson({
      engine: "google",
      q: prompt,
      api_key: process.env.SERPAPI_API_KEY,
    });

    const organicResults = searchResponse.organic_results.slice(0, 5);
    const searchContext = organicResults
      .map(
        (result: any) =>
          `Title: ${result.title}\nLink: ${result.link}\nSnippet: ${result.snippet}`
      )
      .join("\n---\n");

    // 2. Generate content with search context
    const enhancedPrompt = `Based on the following web search results, please provide a comprehensive answer to the user's query. Your response must be in well-structured Markdown format, using paragraphs to separate distinct ideas. Cite your sources using Markdown links [like this](URL) immediately after the relevant sentences. Ensure all links from the search results are included as citations.\n\nSearch Results:\n${searchContext}\n\nUser Query:\n${prompt}`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(enhancedPrompt);
    const response = result.response;
    const text = response.text();    // 3. Save to history if user is authenticated
    if (session?.userId) {
      try {
        await MongoConnect();

        // Generate a short title from the prompt (first 50 characters)
        const title = prompt.length > 50 ? prompt.substring(0, 50) + "..." : prompt;

        const historyEntry = new ManifestHistory({
          id: nanoid(),
          user_id: session.userId,
          prompt,
          response: text,
          title,
        });

        await historyEntry.save();
      } catch (historyError) {
        // Don't fail the main request if history saving fails
        console.error("Error saving to history:", historyError);
      }
    }

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Error in Gemini API route:", error);
    const errorMessage =
      error.message.includes("serpapi")
        ? "Failed to fetch search results. Please check your SerpApi key."
        : "Failed to generate content from Gemini";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
}
