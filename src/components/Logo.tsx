import Image from "next/image";

type LogoProps = {
  size?: number;
};

export default function Logo({ size = 48 }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="TDSF Dans Sporları Federasyonu"
      width={size}
      height={size}
      className="h-12 w-auto"
      style={{ height: `${size}px`, width: "auto" }}
      priority
      unoptimized
    />
  );
}
