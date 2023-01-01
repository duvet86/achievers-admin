import type { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

export default function ButtonSecondary({
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
          ? "flex items-center justify-center rounded bg-slate-100 py-2 px-4 text-slate-400 " +
            className
          : "flex items-center justify-center rounded border border-slate-300 bg-slate-200 px-4 py-2 hover:bg-slate-300 " +
            className
      }
    >
      {children}
    </button>
  );
}
