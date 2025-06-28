"use client";

import { useState, useRef, ChangeEvent, FormEvent, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, ArrowLeft, Loader2, X } from "lucide-react";
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
  const [aadhar, setAadhar] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestedTags] = useState([
    "Innovation",
    "Technology",
    "Sustainability",
    "AI",
    "Social Impact",
    "Healthcare",
  ]);

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (tags.length === 0) {
      alert("Please add at least one tag.");
      document.getElementById("tags")?.focus();
      return;
    }
    setIsSubmitting(true);
    // Form submission logic here...
    console.log({
      title,
      description,
      file,
      tags,
      aadhar,
    });
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      // Show success message, maybe with a toast
      alert("Pitch submitted successfully!");
      router.push("/bloom/my-pitches");
    }, 2000);
  };

  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
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
                  <CardTitle className="text-white">Categorization & Verification</CardTitle>
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
                  <div className="space-y-2">
                    <label htmlFor="aadhar" className="text-gray-400 font-medium">Aadhaar Number</label>
                    <input
                      id="aadhar"
                      type="text"
                      value={aadhar}
                      onChange={(e) => setAadhar(e.target.value)}
                      placeholder="XXXX-XXXX-XXXX"
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:ring-blue-500"
                      pattern="\d{4}-\d{4}-\d{4}"
                      title="Enter a valid 12-digit Aadhaar number in XXXX-XXXX-XXXX format"
                      required
                    />
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
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Pitch"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
