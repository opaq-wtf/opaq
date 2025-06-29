// DO NOT MAKE ANY MODIFICATIONS WITHUOT CONSULTING TEJA(SHOYO)

"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { Toaster, toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

const formSchema = z.object({
  identifier: z
    .string()
    .min(1, { message: "This field is required" })
    .refine(
      (value) => {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        const isUsername = /^[a-z0-9._]+$/.test(value);
        return isEmail || isUsername;
      },
      {
        message: "Enter a valid username or email",
      },
    ),
  password: z.string().min(1, { message: "This field is required" }),
});

type SignInForm = z.infer<typeof formSchema>;

export default function SignIn() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInForm>({ resolver: zodResolver(formSchema) });

  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const onSubmit: SubmitHandler<SignInForm> = async (data: SignInForm) => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/auth/sign-in`, data);
      if (res.status === 200) {
        toast.success(res.data.message, {
          description: "Redirecting you to your profile",
          action: {
            label: "Close",
            onClick: () => {
              return;
            },
          },
        });
        setTimeout(() => {
          router.push('/home');
        }, 1500);
      }
    } catch (error: any) {
      if (error.response) {
        console.error(
          "Server error",
          error.response.status,
          error.response.data.message,
        );
        toast.error(error.response.data.message, {
          description:
            `Error ${error.response.status}` || "Something went wrong",
          action: {
            label: "Close",
            onClick: () => {
              return;
            },
          },
        });
      } else if (error.request) {
        console.error("No response recieved: ", error.request);
        toast.error("No response from the server.", {
          action: {
            label: "Close",
            onClick: () => {
              return;
            },
          },
        });
      } else {
        console.error("Unexpected error: ", error.message);
        toast.error("Unexpected error occured.", {
          action: {
            label: "Close",
            onClick: () => {
              return;
            },
          },
        });
      }
    }
  };

  return (
    <>
      <Toaster theme="dark" />
      <div className="text-white flex min-h-screen flex-col items-center pt-16 sm:justify-center sm:pt-0">
        <Link href="/">
          <div className="dark:text-foreground font-semibold text-2xl tracking-tighter mx-auto flex items-center gap-2">
            <div>
              {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                                stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672Zm-7.518-.267A8.25 8.25 0 1 1 20.25 10.5M8.288 14.212A5.25 5.25 0 1 1 17.25 10.5" />
                            </svg> */}

              <Image src="/logo.svg" alt="OPAQ Logo" width={35} height={35} />
            </div>
            {/* OPAQ */}
          </div>
        </Link>
        <div className="relative mt-12 w-full max-w-lg sm:mt-10">
          <div className="relative -mb-px h-px w-full bg-gradient-to-r from-transparent via-sky-300 to-transparent"></div>
          <div className="mx-5 border dark:border-b-white/50 dark:border-t-white/50 border-b-white/20 sm:border-t-white/20 shadow-[20px_0_20px_20px] shadow-slate-500/10 dark:shadow-white/20 rounded-lg border-white/20 border-l-white/20 border-r-white/20 sm:shadow-sm lg:rounded-xl lg:shadow-none">
            <div className="flex flex-col p-6">
              <h3 className="text-xl font-semibold leading-6 tracking-tighter">
                Sign In
              </h3>
              <p className="mt-1.5 text-sm font-medium text-white/50">
                Welcome back, enter your credentials to continue.
              </p>
            </div>
            <div className="p-6 pt-0">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <div>
                    <div className="group relative rounded-lg border focus-within:border-sky-200 px-3 pb-1.5 pt-2.5 duration-200 focus-within:ring focus-within:ring-sky-300/30">
                      <div className="flex justify-between">
                        <label className="text-xs font-medium group-focus-within:text-white text-gray-400">
                          Username or Email
                        </label>
                      </div>
                      <input
                        type="text"
                        {...register("identifier")}
                        placeholder="user123 or user@mail.com"
                        autoComplete="off"
                        className="block w-full border-0 bg-transparent p-0 text-sm file:my-1 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:font-medium placeholder:text-muted-foreground/90 focus:outline-none focus:ring-0 sm:leading-7 dark:text-foreground"
                      />
                    </div>
                    {errors.identifier && (
                      <p className="text-red-500 pl-1 mt-1">
                        {errors.identifier.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <div>
                    <div className="group relative rounded-lg border focus-within:border-sky-200 px-3 pb-1.5 pt-2.5 duration-200 focus-within:ring focus-within:ring-sky-300/30">
                      <div className="flex justify-between">
                        <label className="text-xs font-medium group-focus-within:text-white text-gray-400">
                          Password
                        </label>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          {...register("password")}
                          className="block w-full border-0 bg-transparent p-0 text-sm file:my-1 placeholder:text-muted-foreground/90 focus:outline-none focus:ring-0 focus:ring-teal-500 sm:leading-7 dark:text-foreground"
                          placeholder="******"
                        />
                        <div className="absolute top-[4px] right-0 transform -translate-y-1/2 cursor-pointer">
                          <button
                            type="button"
                            tabIndex={-1}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none"
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                          >
                            {showPassword ? (
                              // Eye-off icon
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-5 0-9-4.03-9-9 0-1.07.19-2.09.54-3.03m2.1-2.1A8.96 8.96 0 0 1 12 5c5 0 9 4.03 9 9 0 1.07-.19 2.09-.54 3.03m-2.1 2.1A8.96 8.96 0 0 1 12 19c-1.07 0-2.09-.19-3.03-.54m-2.1-2.1A8.96 8.96 0 0 1 5 12c0-1.07.19-2.09.54-3.03m2.1-2.1A8.96 8.96 0 0 1 12 5c1.07 0 2.09.19 3.03.54m2.1 2.1A8.96 8.96 0 0 1 19 12c0 1.07-.19 2.09-.54 3.03m-2.1 2.1A8.96 8.96 0 0 1 12 19c-1.07 0-2.09-.19-3.03-.54m-2.1-2.1A8.96 8.96 0 0 1 5 12c0-1.07.19-2.09.54-3.03m2.1-2.1A8.96 8.96 0 0 1 12 5c1.07 0 2.09.19 3.03.54m2.1 2.1A8.96 8.96 0 0 1 19 12c0 1.07-.19 2.09-.54 3.03m-2.1 2.1A8.96 8.96 0 0 1 12 19c-1.07 0-2.09-.19-3.03-.54m-2.1-2.1A8.96 8.96 0 0 1 5 12c0-1.07.19-2.09.54-3.03m2.1-2.1A8.96 8.96 0 0 1 12 5c1.07 0 2.09.19 3.03.54m2.1 2.1A8.96 8.96 0 0 1 19 12c0 1.07-.19 2.09-.54 3.03m-2.1 2.1A8.96 8.96 0 0 1 12 19z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M3 3l18 18"
                                />
                              </svg>
                            ) : (
                              // Eye icon
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 pl-1 mt-1">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  {/* <label className="flex items-center gap-2">
                                        <input type="checkbox" name="remember" className="outline-none focus:outline focus:outline-sky-300" />
                                        <span className="text-xs">Remember me</span>
                                    </label> */}
                  <Link
                    className="text-sm font-medium dark:text-foreground underline pl-1"
                    href="/forgot-password"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="mt-4 flex items-center justify-end gap-x-2">
                  <Link
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:ring hover:ring-white h-10 px-4 py-2 duration-200 hover:bg-black"
                    href="/sign-up"
                    aria-disabled={isSubmitting}
                  >
                    Sign Up
                  </Link>
                  <button
                    className="font-semibold hover:bg-black hover:text-white hover:ring hover:ring-white transition duration-300 inline-flex items-center justify-center rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white text-black h-10 px-4 py-2"
                    disabled={isSubmitting}
                    type="submit"
                  >
                    {isSubmitting ? "Signing In" : "Sign In"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
