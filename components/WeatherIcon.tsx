type Props = {
  src: string;
  alt: string;
  size?: number;
  className?: string;
};

/** ウェザーニュースの wx アイコン用（外部ドメインのため img のまま） */
export function WeatherIcon({ src, alt, size = 56, className = "" }: Props) {
  if (!src) {
    return (
      <div
        className={`shrink-0 rounded-xl bg-neutral-100 ${className}`}
        style={{ width: size, height: size }}
        aria-hidden
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- 外部ホストの演出用アイコン
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`shrink-0 object-contain ${className}`}
      loading="lazy"
    />
  );
}
