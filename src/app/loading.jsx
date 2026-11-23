
export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center space-y-4">
        
        {/* Industrial spinner */}
        <div className="relative inline-flex items-center justify-center w-16 h-16">
          {/* Outer ring */}
          <div className="absolute inset-0 border-2 border-primary/20" />
          {/* Spinning bar */}
          <div className="absolute inset-0 border-2 border-transparent border-t-primary animate-spin" />
          {/* Inner square */}
          <div className="w-4 h-4 bg-primary" />
        </div>

        {/* Text */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Loading
          </p>
          <p className="text-xs text-muted-foreground mt-1 tracking-wider">
            Please wait...
          </p>
        </div>

      </div>
    </div>
  );
}
