
import { Atom } from 'lucide-react';

export default function Header() {
  return (
    <header className="py-6 border-b border-border">
      <div className="container mx-auto px-4 flex items-center gap-3">
        <Atom className="text-primary h-8 w-8" />
        <h1 className="text-3xl font-bold font-headline text-foreground">
          ProSocialFlow
        </h1>
      </div>
    </header>
  );
}
