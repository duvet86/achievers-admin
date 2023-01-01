import type { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

export default function ButtonPrimary({
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
          ? "flex items-center justify-center rounded bg-blue-200 py-2 px-4 text-white " +
            className
          : "flex items-center justify-center rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 " +
            className
      }
    >
      {children}
    </button>
  );
}
