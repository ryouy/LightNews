export default function Loading() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[60] flex flex-col items-center justify-center bg-white/75 backdrop-blur-[1px]"
      role="status"
      aria-live="polite"
      aria-busy
    >
      <span className="sr-only">読み込み中</span>
      <div className="flex flex-col items-center gap-3">
        <span
          className="inline-block h-12 w-12 animate-spin rounded-full border-[5px] border-blue-200 border-t-blue-600"
          aria-hidden
        />
        <p className="text-sm font-medium text-blue-800">読み込み中…</p>
      </div>
    </div>
  );
}
