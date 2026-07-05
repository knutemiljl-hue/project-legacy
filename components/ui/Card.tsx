import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export default function Card({
  children,
  className = "",
}: CardProps) {
  return (
    <div
      className={`
        rounded-3xl
        bg-white
        border
        border-stone-200
        shadow-sm
        p-6
        ${className}
      `}
    >
      {children}
    </div>
  );
}