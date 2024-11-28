interface GlobalTitleProps {
  title: string;
  description?: string;
}

export function GlobalTitle({ title, description }: GlobalTitleProps) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="font-bold text-2xl">{title}</h1>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
