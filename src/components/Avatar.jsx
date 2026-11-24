export default function Avatar({ avatarId, name = "?", size = 32, className = "" }) {
  const style = { width: size, height: size };
  if (avatarId) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/api/media/${avatarId}`}
        alt={name}
        loading="lazy"
        style={style}
        className={`rounded-full object-cover border border-border shrink-0 bg-muted ${className}`}
      />
    );
  }
  return (
    <div
      style={{ ...style, fontSize: Math.max(10, size * 0.42) }}
      className={`rounded-full border border-primary/40 bg-primary/10 text-primary font-black uppercase flex items-center justify-center shrink-0 ${className}`}
    >
      {String(name).trim().charAt(0) || "?"}
    </div>
  );
}
