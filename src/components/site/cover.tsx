import Image from "next/image";

export function Cover({
  src,
  alt,
  priority = false,
  className = "",
  sizes = "(min-width: 1024px) 33vw, 100vw",
  fit = "cover",
}: {
  src?: string | null;
  alt: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
  fit?: "cover" | "contain";
}) {
  if (!src) {
    return (
      <div
        className={`absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.55),transparent_42%),linear-gradient(160deg,#1e1b4b,#070b14)] ${className}`}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      className={`${fit === "contain" ? "object-contain" : "object-cover"} ${className}`}
      sizes={sizes}
    />
  );
}
