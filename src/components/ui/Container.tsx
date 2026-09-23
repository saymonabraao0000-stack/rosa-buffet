import { type ElementType, type ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
};

export default function Container({
  children,
  className = "",
  as: Tag = "div",
}: ContainerProps) {
  return (
    <Tag className={`mx-auto w-[min(1120px,calc(100%-48px))] ${className}`}>
      {children}
    </Tag>
  );
}
