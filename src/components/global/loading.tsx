function LoadingBar() {
  return (
    <div className="flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <LoadingBar />
    </div>
  );
}

export { LoadingBar, LoadingOverlay };
