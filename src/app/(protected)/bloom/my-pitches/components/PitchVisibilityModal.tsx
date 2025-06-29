"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock, Globe, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface PitchVisibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  pitch: {
    id: string;
    title: string;
    visibility: "public" | "private";
  };
  onVisibilityChange: (pitchId: string, newVisibility: "public" | "private") => void;
}

export default function PitchVisibilityModal({
  isOpen,
  onClose,
  pitch,
  onVisibilityChange,
}: PitchVisibilityModalProps) {
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleRequestOtp = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/pitches/${pitch.id}/visibility`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "request-otp" }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpSent(true);
        toast.success(data.message);
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      console.error("Error requesting OTP:", error);
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-character OTP");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/pitches/${pitch.id}/visibility`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "verify-otp", otp }),
      });

      const data = await response.json();

      if (response.ok) {
        onVisibilityChange(pitch.id, "public");
        toast.success(data.message);
        onClose();
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      toast.error(error.message || "Failed to verify OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMakePrivate = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/pitches/${pitch.id}/visibility`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "make-private" }),
      });

      const data = await response.json();

      if (response.ok) {
        onVisibilityChange(pitch.id, "private");
        toast.success(data.message);
        onClose();
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      console.error("Error making pitch private:", error);
      toast.error(error.message || "Failed to make pitch private");
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setOtpSent(false);
    setOtp("");
    setIsLoading(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <Card className="relative bg-gray-900 border-gray-800 text-white w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">
              Pitch Visibility Settings
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-gray-400">
            Manage who can see "{pitch.title}"
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
            {pitch.visibility === "public" ? (
              <Globe className="h-5 w-5 text-green-400" />
            ) : (
              <Lock className="h-5 w-5 text-orange-400" />
            )}
            <div>
              <p className="font-medium">
                Currently: {pitch.visibility === "public" ? "Public" : "Private"}
              </p>
              <p className="text-sm text-gray-400">
                {pitch.visibility === "public"
                  ? "Everyone can see this pitch"
                  : "Only you can see this pitch"}
              </p>
            </div>
          </div>

          {/* Actions */}
          {pitch.visibility === "private" ? (
            <div className="space-y-4">
              {!otpSent ? (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Globe className="h-5 w-5 text-green-400" />
                    Make Public
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    To make your pitch public and allow everyone to see it, you need to verify your email with an OTP.
                  </p>
                  <Button
                    onClick={handleRequestOtp}
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Verification OTP
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-400" />
                    Enter Verification Code
                  </h3>
                  <p className="text-sm text-gray-400">
                    We've sent a 6-character OTP to your email. Enter it below to make your pitch public.
                  </p>

                  <div className="space-y-3">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                      placeholder="Enter 6-character OTP"
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-center text-lg tracking-widest font-mono focus:border-blue-500 focus:ring-blue-500"
                      maxLength={6}
                    />

                    <div className="flex gap-2">
                      <Button
                        onClick={handleVerifyOtp}
                        disabled={isLoading || otp.length !== 6}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          "Verify & Make Public"
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => setOtpSent(false)}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        Back
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    OTP expires in 10 minutes. Check your spam folder if you don't see the email.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Lock className="h-5 w-5 text-orange-400" />
                Make Private
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Making your pitch private will hide it from public view. Only you will be able to see it.
              </p>
              <Button
                onClick={handleMakePrivate}
                disabled={isLoading}
                variant="outline"
                className="w-full border-orange-600 text-orange-400 hover:bg-orange-600 hover:text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Making Private...
                  </>
                ) : (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Make Private
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
