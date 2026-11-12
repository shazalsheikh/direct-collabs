import { SITE } from "@/lib/site.config";
import { Container } from "@/components/ui";

export function Nav() {
  return (
    <header className="pt-4 sm:pt-6">
      <Container wide className="flex items-center justify-between gap-3">
        <span className="display text-lg tracking-tight">
          Direct<span className="text-lime">Collabs</span>
        </span>
        <div className="flex items-center gap-3">
          <a href={SITE.owner.instagramUrl} target="_blank" rel="noopener" className="hidden min-h-11 items-center text-sm text-bone-3 hover:text-bone sm:inline-flex">
            @{SITE.owner.instagram}
          </a>
          <a href="#apply" className="inline-flex min-h-11 items-center rounded-pill border border-bone-3 px-4 text-sm font-semibold text-bone hover:border-lime hover:text-lime">
            Apply
          </a>
        </div>
      </Container>
    </header>
  );
}
