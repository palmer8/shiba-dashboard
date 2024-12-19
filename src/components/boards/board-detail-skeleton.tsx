export function BoardDetailSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-muted rounded-md w-3/4" />
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded-md w-1/4" />
        <div className="h-4 bg-muted rounded-md w-1/3" />
      </div>
      <div className="h-[400px] bg-muted rounded-md" />
    </div>
  );
}
