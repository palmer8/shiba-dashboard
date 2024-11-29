import Image from "next/image";

interface EmptyProps {
  description: string;
}

export default function Empty({ description }: EmptyProps) {
  return (
    <div className="h-full w-full flex justify-center items-center gap-6 flex-col pointer-events-none">
      <Image src="/logo.webp" alt="logo" width={240} height={240} />
      <p className="text-md text-muted-foreground">{description}</p>
    </div>
  );
}
