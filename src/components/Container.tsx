import type { ReactNode } from "react";
import { cn } from "../utils/cn";

export default function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-12", className)}>{children}</div>;
}
