import { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
};

export default function Button({
  children,
  onClick,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="
        rounded-2xl
        bg-amber-300
        px-5
        py-3
        font-medium
        transition
        hover:brightness-95
      "
    >
      {children}
    </button>
  );
}