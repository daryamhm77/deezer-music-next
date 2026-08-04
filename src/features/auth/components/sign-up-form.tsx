"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { MdOutlineWaves } from "react-icons/md";
import { zodResolver } from "@hookform/resolvers/zod";

import { GoogleAuthButton } from "@/features/auth/components/google-auth-button";
import {
  signUpSchema,
  type SignUpValues,
} from "@/features/auth/schemas/sign-up.schema";
import { signUp } from "@/lib/auth-client";
import authMessages from "@/messages/en/auth.json";
import { PATHS } from "@/routes/paths";

export function SignUpForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
  });

  const onSubmit = handleSubmit(async (values) => {
    setMessage("");

    const { error } = await signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
    });

    if (error) {
      setMessage(error.message || authMessages.genericError);
      return;
    }

    setMessage(authMessages.signUpSuccess);
    router.push(PATHS.onboarding);
    router.refresh();
  });

  return (
    <div className="flex w-[90%] max-w-[400px] flex-col items-center rounded-md bg-background p-12">
      <MdOutlineWaves className="text-primary" size={44} />
      <h1 className="my-2 mb-8 text-center text-3xl font-bold text-white">
        {authMessages.signUpTitle}
      </h1>

      <div className="mb-6 w-full">
        <GoogleAuthButton />
      </div>

      <div className="mb-6 flex w-full items-center gap-3 text-secondary-text">
        <span className="h-px flex-1 bg-neutral-600" />
        <span className="text-sm">{authMessages.or}</span>
        <span className="h-px flex-1 bg-neutral-600" />
      </div>

      <form onSubmit={onSubmit} className="w-full">
        {message ? (
          <p className="mb-4 bg-primary py-1 text-center font-semibold text-black">
            {message}
          </p>
        ) : null}

        <input
          type="text"
          placeholder={authMessages.namePlaceholder}
          autoComplete="name"
          className="mb-6 w-full rounded-md border border-neutral-600 p-2 text-primary-text outline-none placeholder:text-neutral-600 focus:border-secondary-text"
          {...register("name")}
        />
        <input
          type="email"
          placeholder={authMessages.emailPlaceholder}
          autoComplete="email"
          className="mb-6 w-full rounded-md border border-neutral-600 p-2 text-primary-text outline-none placeholder:text-neutral-600 focus:border-secondary-text"
          {...register("email")}
        />
        <input
          type="password"
          placeholder={authMessages.passwordPlaceholder}
          autoComplete="new-password"
          className="mb-6 w-full rounded-md border border-neutral-600 p-2 text-primary-text outline-none placeholder:text-neutral-600 focus:border-secondary-text"
          {...register("password")}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full cursor-pointer rounded-full bg-primary py-3 font-bold text-black disabled:opacity-60"
        >
          {authMessages.continue}
        </button>

        <div className="my-6 text-center text-secondary-text">
          <span>{authMessages.hasAccount}</span>
          <Link
            href={PATHS.login}
            className="ml-2 text-white underline hover:text-primary"
          >
            {authMessages.logInNow}
          </Link>
        </div>
      </form>
    </div>
  );
}
