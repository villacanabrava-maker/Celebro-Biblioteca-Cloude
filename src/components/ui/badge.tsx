import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        success: "bg-success-muted text-success",
        outline: "border border-border text-foreground",
        tagBlue: "bg-[var(--tag-blue-bg)] text-[var(--tag-blue-fg)]",
        tagGreen: "bg-[var(--tag-green-bg)] text-[var(--tag-green-fg)]",
        tagPurple: "bg-[var(--tag-purple-bg)] text-[var(--tag-purple-fg)]",
        tagPink: "bg-[var(--tag-pink-bg)] text-[var(--tag-pink-fg)]",
        tagAmber: "bg-[var(--tag-amber-bg)] text-[var(--tag-amber-fg)]",
        tagTeal: "bg-[var(--tag-teal-bg)] text-[var(--tag-teal-fg)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  );
}

const TAG_VARIANTS = [
  "tagBlue",
  "tagGreen",
  "tagPurple",
  "tagPink",
  "tagAmber",
  "tagTeal",
] as const;

/** Escolhe uma cor pastel estável para uma tag de tema a partir do texto dela. */
function tagVariantForLabel(label: string) {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = (hash * 31 + label.charCodeAt(i)) >>> 0;
  }
  return TAG_VARIANTS[hash % TAG_VARIANTS.length];
}

export { Badge, badgeVariants, tagVariantForLabel };
