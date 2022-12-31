import type { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

import { useTransition } from "@remix-run/react";

export default function LoadingButton({
  children,
  className = "",
  ...rest
}: DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>) {
  const transition = useTransition();

  const isSubmitting = transition.state === "submitting";

  return (
    <button
      {...rest}
      disabled={isSubmitting}
      className={
        isSubmitting
          ? "flex items-center rounded bg-blue-200 py-2 px-4 text-white " +
            className
          : "flex items-center rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 " +
            className
      }
    >
      <span className="space-x-2">{children}</span>
    </button>
  );
}
