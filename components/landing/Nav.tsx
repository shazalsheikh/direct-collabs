import { SITE } from "@/lib/site.config";
import { Container } from "@/components/ui";

export function Nav() {
  return (
    <header className="pt-4 sm:pt-6">
      <Container wide className="flex items-center justify-between">
        <span className="display text-lg tracking-tight">
          Direct<span className="text-lime">Collabs</span>
        </span>
        <a
          href={SITE.owner.instagramUrl}
          target="_blank"
          rel="noopener"
          className="text-sm text-bone-3 hover:text-bone min-h-11 inline-flex items-center"
        >
          @{SITE.owner.instagram}
        </a>
      </Container>
    </header>
  );
}
