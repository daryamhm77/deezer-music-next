"use client";

import { useState } from "react";
import { FiExternalLink } from "react-icons/fi";

import shareMessages from "@/messages/en/share.json";

type OpenInDeezerButtonProps = {
  url: string;
  className?: string;
  /** Icon-only compact control (player / row actions). */
  compact?: boolean;
};

export function OpenInDeezerButton({
  url,
  className = "",
  compact = false,
}: OpenInDeezerButtonProps) {
  if (!url) return null;

  if (compact) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`grid h-8 w-8 place-items-center text-secondary-text hover:text-primary ${className}`}
        aria-label={shareMessages.openInDeezer}
        title={shareMessages.openInDeezerHint}
      >
        <FiExternalLink size={16} />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-primary-text hover:border-primary hover:text-primary ${className}`}
      title={shareMessages.openInDeezerHint}
    >
      <FiExternalLink size={16} />
      {shareMessages.openInDeezer}
    </a>
  );
}

type ShareButtonProps = {
  title: string;
  text?: string;
  url: string;
  className?: string;
  compact?: boolean;
  label?: string;
};

export function ShareButton({
  title,
  text,
  url,
  className = "",
  compact = false,
  label,
}: ShareButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "shared">("idle");

  const handleShare = async () => {
    try {
      const { shareOrCopy } = await import("@/utils/share");
      const result = await shareOrCopy({ title, text, url });
      setStatus(result);
      window.setTimeout(() => setStatus("idle"), 2000);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setStatus("idle");
    }
  };

  const aria =
    status === "copied"
      ? shareMessages.copied
      : status === "shared"
        ? shareMessages.shared
        : label || shareMessages.share;

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleShare}
        className={`grid h-8 w-8 cursor-pointer place-items-center text-secondary-text hover:text-white ${className}`}
        aria-label={aria}
        title={aria}
      >
        <ShareIcon />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-primary-text hover:border-white ${className}`}
    >
      <ShareIcon />
      {status === "copied"
        ? shareMessages.copied
        : status === "shared"
          ? shareMessages.shared
          : label || shareMessages.share}
    </button>
  );
}

function ShareIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.59 13.51 15.42 17.49" />
      <path d="m15.41 6.51-6.82 3.98" />
    </svg>
  );
}
