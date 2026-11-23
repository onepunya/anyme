
export default function Footer() {
  return (
    <footer className="border-t border-border mt-10">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-5 mb-8">
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
              <li><span>© 2026 Anyme - onepunya</span></li>
              <li><span>All rights reserved</span></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3">Connect</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <a
                  href="https://github.com/onepunya"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-primary transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://chat.whatsapp.com/FRL4FzReE0X4qf8Yy80RkW?mode=gi_t"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-primary transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                  </svg>
                  Komunitas
                </a>
              </li>
              <li>
                <a
                  href="https://onepunya.github.io/siswanda-fox_onepunya-/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-primary transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 shrink-0">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  Website
                </a>
              </li>
              <li>
                <a
                  href="/download"
                  className="flex items-center gap-1.5 hover:text-primary transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 shrink-0">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download APK
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            © 2026 <span className="text-primary font-bold">Anyme</span>. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made with ❤️ for anime fans
          </p>
        </div>
      </div>
    </footer>
  );
}
