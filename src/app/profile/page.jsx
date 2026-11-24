import ProfileClient from "@/components/ProfileClient";

export const metadata = { title: "Profil - Anyme" };

export default function ProfilePage() {
  return (
    <div className="space-y-6 pb-10">
      <div className="industrial-border">
        <h1 className="text-2xl font-bold uppercase tracking-tight">Profil</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Atur tampilan akun, foto, dan stikermu</p>
      </div>
      <ProfileClient />
    </div>
  );
}
