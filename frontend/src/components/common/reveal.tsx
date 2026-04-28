"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "left" | "right" | "fade";

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  delay?: number; // ms
  duration?: number; // ms
  distance?: number; // px
  direction?: Direction;
  once?: boolean;
  threshold?: number; // 0..1
  rootMargin?: string;
  /** When true, renders children directly without wrapper (uses cloneElement). */
  asChild?: boolean;
}

const offsetFor = (direction: Direction, distance: number) => {
  switch (direction) {
    case "up":
      return `translate3d(0, ${distance}px, 0)`;
    case "down":
      return `translate3d(0, -${distance}px, 0)`;
    case "left":
      return `translate3d(${distance}px, 0, 0)`;
    case "right":
      return `translate3d(-${distance}px, 0, 0)`;
    default:
      return "translate3d(0, 0, 0)";
  }
};

export function Reveal({
  as: Comp = "div",
  delay = 0,
  duration = 700,
  distance = 24,
  direction = "up",
  once = true,
  threshold = 0.15,
  rootMargin = "0px 0px -10% 0px",
  className,
  style,
  children,
  ...props
}: RevealProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof window !== "undefined" && "IntersectionObserver" in window) {
      const obs = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setVisible(true);
              if (once) obs.disconnect();
            } else if (!once) {
              setVisible(false);
            }
          }
        },
        { threshold, rootMargin }
      );
      obs.observe(el);
      return () => obs.disconnect();
    } else {
      setVisible(true);
    }
  }, [once, rootMargin, threshold]);

  return (
    <Comp
      ref={ref}
      className={cn(className)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate3d(0,0,0)" : offsetFor(direction, distance),
        transitionProperty: "opacity, transform",
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        transitionDelay: `${delay}ms`,
        willChange: "opacity, transform",
        ...style,
      }}
      {...props}
    >
      {children}
    </Comp>
  );
}
