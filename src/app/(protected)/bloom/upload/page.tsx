"use client";

import { useState, useRef, ChangeEvent, FormEvent, KeyboardEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { WebUploader } from "@irys/web-upload";
import { WebEthereum } from "@irys/web-upload-ethereum";
import { ethers } from "ethers";

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, ArrowLeft, Loader2, X, Lock } from "lucide-react";
import Image from "next/image";

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [irysUrl, setIrysUrl] = useState<string | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [suggestedTags] = useState([
    "Innovation",
    "Technology",
    "Sustainability",
    "AI",
    "Social Impact",
    "Healthcare",
  ]);

  // Check wallet connection on component mount
  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        setWalletConnected(accounts.length > 0);
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask or another Web3 wallet to continue.");
      return;
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletConnected(true);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      alert("Failed to connect wallet. Please try again.");
    }
  };

  const getIrysUploader = async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask or another Web3 wallet is required");
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const irysUploader = await WebUploader(WebEthereum).withProvider(provider);

    return irysUploader;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
    }
  };

  const handleAddTagFromInput = () => {
    const newTags = tagInput.split(',').map(tag => tag.trim()).filter(Boolean);
    newTags.forEach(tag => addTag(tag));
    setTagInput("");
  };

  const handleTagInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.endsWith(',')) {
      const toProcess = value.slice(0, -1);
      const newTags = toProcess.split(',').map(tag => tag.trim()).filter(Boolean);
      newTags.forEach(tag => addTag(tag));
      setTagInput('');
    } else {
      setTagInput(value);
    }
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTagFromInput();
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (tags.length === 0) {
      alert("Please add at least one tag.");
      document.getElementById("tags")?.focus();
      return;
    }

    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Initialize Irys uploader
      const irysUploader = await getIrysUploader();

      // Upload file to Irys/Arweave
      setUploadProgress(25);

      // Get file extension
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';

      // Create Irys tags including file extension
      const irysTags = [
        { name: "Content-Type", value: file.type },
        { name: "File-Extension", value: fileExtension },
        { name: "Application", value: "OPAQ-Pitches" },
        { name: "Title", value: title },
        ...tags.map(tag => ({ name: "Tag", value: tag }))
      ];

      console.log("Uploading with Irys tags:", irysTags);

      // Convert File to Buffer for Irys
      const fileBuffer = await file.arrayBuffer();
      const receipt = await irysUploader.upload(Buffer.from(fileBuffer), {
        tags: irysTags
      });

      setUploadProgress(75);

      const uploadedFileUrl = `https://gateway.irys.xyz/${receipt.id}`;
      setIrysUrl(uploadedFileUrl);
      setUploadProgress(100);      // Create pitch data with Irys URL
      const pitchData = {
        title,
        description,
        fileUrl: uploadedFileUrl,
        irysId: receipt.id,
        tags,
      };

      console.log("Pitch submitted with Irys:", pitchData);

      // Submit pitch data to backend API
      const response = await fetch('/api/pitches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pitchData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit pitch');
      }

      alert("Pitch submitted successfully with decentralized storage!");
      router.push("/bloom/my-pitches");

    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload file. Please make sure you have a Web3 wallet connected and try again.");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/bloom")}
            className="mr-4 text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl text-white sm:text-4xl font-bold tracking-tight">
            Create a New Pitch
          </h1>
        </div>


        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Pitch Details</CardTitle>
                  <CardDescription>
                    Tell us about your innovative idea.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-gray-400 font-medium">Title</label>
                    <input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., AI-Powered Waste Management System"
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="description" className="text-gray-400 font-medium">Description</label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your pitch in detail..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 min-h-[150px] text-white focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Pitch Media</CardTitle>
                  <CardDescription>
                    Upload a compelling image or short video (.gif, .jpg, .png, .mp4).
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/gif, image/jpeg, image/png, video/mp4"
                      required
                    />
                    {filePreview ? (
                      <div className="relative h-48 w-full">
                      <Image
                        src={filePreview}
                        alt="File preview"
                        fill
                        className="mx-auto rounded-lg object-contain"
                      />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                      <Upload className="h-10 w-10" />
                      <p className="font-semibold">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs">
                        PNG, JPG, GIF, or MP4 (MAX. 800x400px)
                      </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Web3 Storage</CardTitle>
                  <CardDescription>
                    Connect your wallet to upload files to decentralized storage (Arweave).
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!walletConnected ? (
                    <div className="text-center py-4">
                      <p className="text-gray-400 mb-4">Wallet connection required for decentralized storage</p>
                      <Button
                        type="button"
                        onClick={connectWallet}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        Connect Wallet
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="flex items-center justify-center text-green-400 mb-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        Wallet Connected
                      </div>
                      <p className="text-xs text-gray-500">Ready for decentralized upload</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Categorization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="tags" className="text-gray-400 font-medium">
                      Tags (at least one required)
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tags.map((tag, index) => (
                        <span
                          key={index}
                          className="flex items-center gap-1 bg-blue-900/50 text-blue-300 text-sm font-medium px-2 py-1 rounded-full"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-blue-400 hover:text-white"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        id="tags"
                        value={tagInput}
                        onChange={handleTagInputChange}
                        onKeyDown={handleTagKeyDown}
                        placeholder="Add a tag"
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:ring-blue-500"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddTagFromInput}
                        className="bg-gray-700 hover:bg-gray-600 border-gray-600 text-white"
                      >
                        Add
                      </Button>
                    </div>
                    <div className="pt-2">
                      <span className="text-xs text-gray-500">Suggestions:</span>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {suggestedTags
                          .filter((suggestedTag) => !tags.includes(suggestedTag))
                          .map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => addTag(tag)}
                              className="bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white text-xs font-medium px-2.5 py-1 rounded-full transition-colors"
                            >
                              + {tag}
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Publish</CardTitle>
                  <CardDescription>
                    Ready to share your pitch with the world?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="h-4 w-4 text-orange-400" />
                      <span className="text-sm font-medium text-orange-400">Privacy Setting</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Your pitch will be created as <strong>private</strong> by default.
                      You can make it public later from your My Pitches page after email verification.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    disabled={isSubmitting || !walletConnected}
                  >
                    {!walletConnected ? (
                      "Connect Wallet to Submit"
                    ) : isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : "Connecting..."}
                      </>
                    ) : (
                      "Submit Pitch"
                    )}
                  </Button>
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                  {irysUrl && (
                    <div className="mt-3 p-2 bg-green-900/20 border border-green-700 rounded text-green-300 text-sm">
                      <p className="font-semibold">File uploaded to Arweave!</p>
                      <p className="text-xs mt-1 break-all">ID: {irysUrl.split('/').pop()}</p>
                    </div>
                  )}
                </CardFooter>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
