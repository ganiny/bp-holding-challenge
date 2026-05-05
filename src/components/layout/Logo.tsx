import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  withText = false,
  size = 40,
}: {
  className?: string;
  withText?: boolean;
  size?: number;
}) {
  return (
    <Link href="/" className={cn("flex items-center gap-3 group", className)} aria-label="BP Holding — home">
      <span
        className="relative inline-flex items-center justify-center overflow-hidden rounded-md bg-white ring-1 ring-border group-hover:ring-brand-gold transition-shadow"
        style={{ width: size, height: size }}
      >
        <Image
          src="/bp-holding.jpg"
          alt="BP Holding"
          width={size}
          height={size}
          priority
          className="object-contain"
        />
      </span>
      {withText ? (
        <span className="flex flex-col leading-tight">
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-brand-gold">
            BP
          </span>
          <span className="text-sm font-semibold text-foreground">Holding</span>
        </span>
      ) : null}
    </Link>
  );
}
