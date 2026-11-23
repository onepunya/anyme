import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h1 className="text-6xl font-bold">404</h1>
            <h2 className="text-2xl font-bold">Page Not Found</h2>
            <p className="text-muted-foreground">
              The page you are looking for doesn&apos;t exist or has been moved.
            </p>
            <Button asChild>
              <Link href="/">Go back home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
