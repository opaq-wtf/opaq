"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, DollarSign, Eye, FileUp, MessageSquare, PartyPopper } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Define the steps for the progress bar
const steps = [
  { id: 1, name: 'Uploaded', description: 'Your content has been successfully uploaded.', icon: FileUp },
  { id: 2, name: 'Under Review', description: 'Our team is currently reviewing your content.', icon: Eye },
  { id: 3, name: 'Remarks', description: 'Feedback has been provided. Please check mail for details.', icon: MessageSquare },
  { id: 4, name: 'Payment', description: 'Awaiting payment to proceed with publishing.', icon: DollarSign },
  { id: 5, name: 'Published', description: 'Congratulations! Your content is now live.', icon: PartyPopper },
];

const ProgressPage = () => {
  // In a real application, this state would come from your backend API
  const [currentStep, setCurrentStep] = useState(1);

  // Handler to move to the next step for demonstration
  const handleNextStep = () => {
    setCurrentStep((prev) => (prev < steps.length ? prev + 1 : prev));
  };

  // Handler to move to the previous step for demonstration
  const handlePreviousStep = () => {
    setCurrentStep((prev) => (prev > 1 ? prev - 1 : prev));
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl">
        <div className="mb-4">
          <Button asChild variant="ghost">
            <Link href="/bloom">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Your Upload Status</CardTitle>
            <CardDescription>Track the progress of your content from upload to publication.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-y-8 md:gap-x-4">
              {steps.map((step, index) => {
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;
                const isLastStep = index === steps.length - 1;

                return (
                  <React.Fragment key={step.id}>
                    {/* Step Item */}
                    <div className="flex items-center md:flex-col md:items-center md:text-center md:w-40">
                      <div
                        className={cn(
                          "flex items-center justify-center w-12 h-12 rounded-full border-2 shrink-0 transition-all duration-300",
                          isActive ? "border-primary bg-primary/10" : isCompleted ? "border-green-500 bg-green-500/10" : "border-border",
                        )}
                      >
                        {isCompleted ? (
                          <Check className="w-6 h-6 text-green-500" />
                        ) : (
                          <step.icon className={cn("w-6 h-6", isActive ? "text-primary" : "text-muted-foreground")} />
                        )}
                      </div>
                      <div className="md:mt-3 ml-4 md:ml-0">
                        <p className={cn("font-semibold", isActive ? "text-primary" : isCompleted ? "text-green-500" : "text-muted-foreground")}>
                          {step.name}
                        </p>
                        <p className="text-sm text-muted-foreground hidden sm:block">{step.description}</p>
                      </div>
                    </div>

                    {/* Connector Line */}
                    {!isLastStep && (
                      <div className={cn(
                        "h-12 md:h-0.5 w-0.5 md:w-full md:flex-1 transition-colors duration-300",
                        isCompleted ? "bg-green-500" : "bg-border",
                        "mx-auto md:mx-0"
                      )}>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Buttons for demonstration purposes */}
        <div className="mt-8 flex gap-4 justify-center">
          <Button onClick={handlePreviousStep} disabled={currentStep === 1} variant="outline" suppressHydrationWarning>
            Previous Step
          </Button>
          <Button onClick={handleNextStep} disabled={currentStep === steps.length} suppressHydrationWarning>
            Next Step
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
