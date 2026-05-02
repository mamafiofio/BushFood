import type { ButtonHTMLAttributes, ReactNode } from "react";

const huntPrimaryButtonClass =
  "inline-flex min-h-hunt-button w-full items-center justify-center rounded-[length:var(--radius-button)] bg-hunt-action-bg px-hunt-button-x font-black text-base text-hunt-action-fg transition-hunt hover:bg-hunt-action-bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hunt-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-hunt-action-bg active:bg-hunt-action-bg-hover";

export type HuntPrimaryButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  children: ReactNode;
  className?: string;
};

/** Primary CTA — same control on welcome and homescreen (shape, padding, motion). */
export function HuntPrimaryButton({
  children,
  className = "",
  type = "button",
  ...rest
}: HuntPrimaryButtonProps) {
  return (
    <button type={type} className={`${huntPrimaryButtonClass} ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
}
