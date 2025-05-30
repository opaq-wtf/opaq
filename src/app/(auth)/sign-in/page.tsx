"use client";

import axios from "axios";
import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import debounce from "lodash.debounce";
import { Toaster, toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { useCallback, useEffect, useState } from "react";
import { redirect } from "next/navigation";

const formSchema = z.object({
  identifier: z
    .string()
    .min(1, { message: "This field is required" })
    .refine(
      (value) => {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        const isUsername = /^[a-zA-Z0-9._]+$/.test(value);
        return isEmail || isUsername;
      },
      { message: "Enter a valid username or email" },
    ),
  password: z.string().min(1, { message: "Password is required" }),
});

type SignInForm = z.infer<typeof formSchema>;

export default function SignIn() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignInForm>({ resolver: zodResolver(formSchema) });

  const [isValidIdentifier, setIsValidIdentifier] = useState<boolean | null>(
    null,
  );
  const identifierValue = watch("identifier");

  const checkUser = useCallback(
    debounce(async (value: string) => {
      try {
        if (!value) return setIsValidIdentifier(null);
        const res = await axios.post("http://localhost:3000/auth/is-user", {
          identifier: value,
        });
        setIsValidIdentifier(res.data.exists);
      } catch {
        setIsValidIdentifier(false);
      }
    }, 1000),
    [],
  );

  useEffect(() => {
    checkUser(identifierValue);
  }, [identifierValue, checkUser]);

  const onSubmit: SubmitHandler<SignInForm> = async (data: SignInForm) => {
    try {
      const res = await axios.post("http://localhost:3000/auth/sign-in", data);
      if (res.status === 200) {
        toast(res.data.message, {
          description: "You will be redirected shortly.",
          action: {
            label: "Close",
            onClick: () => {
              return;
            },
          },
        });
      }
      setTimeout(() => redirect("/profile"), 2000);
    } catch (error: any) {
      if (error.response) {
        console.error(
          "Server error: ",
          error.response.status,
          error.response.data,
        );
        toast(`Error ${error.response.status}`, {
          description: error.response.data?.message || "Something went wrong",
        });
      } else if (error.request) {
        console.error("No response recieved: ", error.request);
        toast("No response from the server.");
      } else {
        console.error("Unexpected error: ", error.message);
        toast("Unexpected error occured.");
      }
    }
  };

  return (
    <>
      <Toaster theme="dark" />
      <div className="bg-black text-white flex min-h-screen flex-col items-center pt-16 sm:justify-center sm:pt-0">
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
                        {isValidIdentifier === true ? (
                          <div className="absolute right-3 translate-y-2">
                            ✅
                          </div>
                        ) : isValidIdentifier === false ? (
                          <div className="absolute right-3 translate-y-2 bg-red-200 border border-red-400 rounded-full ">
                            ❌
                          </div>
                        ) : null}
                      </div>
                      <input
                        type="text"
                        {...register("identifier")}
                        placeholder="[user123, user.123, user_123] or user@mail.com"
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
                      <div className="flex items-center">
                        <input
                          type="password"
                          {...register("password")}
                          className="block w-full border-0 bg-transparent p-0 text-sm file:my-1 placeholder:text-muted-foreground/90 focus:outline-none focus:ring-0 focus:ring-teal-500 sm:leading-7 dark:text-foreground"
                          placeholder="******"
                        />
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
                  >
                    Register
                  </Link>
                  <button
                    className="font-semibold hover:bg-black hover:text-white hover:ring hover:ring-white transition duration-300 inline-flex items-center justify-center rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white text-black h-10 px-4 py-2"
                    type="submit"
                  >
                    {isSubmitting ? "Singing In" : "Sign In"}
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
