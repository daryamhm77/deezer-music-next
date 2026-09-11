"use client";

import { useState } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import authMessages from "@/messages/en/auth.json";

type PasswordFieldProps = {
  registration: UseFormRegisterReturn;
  autoComplete?: "new-password" | "current-password";
  error?: string;
  showHint?: boolean;
};

export function PasswordField({
  registration,
  autoComplete = "current-password",
  error,
  showHint = false,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="mb-6 w-full">
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          placeholder={authMessages.passwordPlaceholder}
          autoComplete={autoComplete}
          className="w-full rounded-md border border-border p-2 pr-11 text-primary-text outline-none placeholder:text-secondary-text focus:border-secondary-text"
          {...registration}
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={
            visible
              ? authMessages.hidePassword
              : authMessages.showPassword
          }
          className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-secondary-text hover:text-white"
        >
          {visible ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
        </button>
      </div>
      {showHint ? (
        <p className="mt-2 text-xs text-secondary-text">
          {authMessages.passwordHint}
        </p>
      ) : null}
      {error ? (
        <p className="mt-2 text-xs text-primary">{error}</p>
      ) : null}
    </div>
  );
}
