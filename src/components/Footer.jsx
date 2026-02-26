
export default function Footer() {
  return (
    <footer className="border-t border-border mt-10">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 mb-8">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Anyme</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Nonton anime subtitle Indonesia gratis dan berkualitas tinggi.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3">Navigation</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><a href="/" className="hover:text-primary transition-colors">Home</a></li>
              <li><a href="/ongoing" className="hover:text-primary transition-colors">Ongoing</a></li>
              <li><a href="/movie" className="hover:text-primary transition-colors">Movie</a></li>
              <li><a href="/genres" className="hover:text-primary transition-colors">Genres</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3">Explore</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><a href="/populer" className="hover:text-primary transition-colors">Popular</a></li>
              <li><a href="/schedule" className="hover:text-primary transition-colors">Schedule</a></li>
              <li><a href="/search" className="hover:text-primary transition-colors">Search</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3">Info</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><span>© 2025 Anyme</span></li>
              <li><span>All rights reserved</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            © 2025 <span className="text-primary font-bold">Anyme</span>. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made with ❤️ for anime fans
          </p>
        </div>
      </div>
    </footer>
  );
}
