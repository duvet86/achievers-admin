import type { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

export default function ButtonDanger({
  children,
  className = "",
  disabled,
  ...rest
}: DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>) {
  return (
    <button
      {...rest}
      disabled={disabled}
      className={
        disabled
          ? "flex items-center justify-center rounded border bg-red-200 py-2 px-4 text-white " +
            className
          : "flex items-center justify-center rounded border bg-red-500 py-2 px-4 text-white hover:bg-red-600 " +
            className
      }
    >
      {children}
    </button>
  );
}
