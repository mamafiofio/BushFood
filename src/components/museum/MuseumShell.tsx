/**
 * Placeholder shell until individual hunt screens are specified.
 * Decorative shapes are non-interactive; no scan/camera behaviour yet.
 */
export function MuseumShell() {
  return (
    <main className="flex min-h-0 flex-1 flex-col p-hunt-screen">
      <header className="flex flex-col gap-hunt-gap">
        <p className="text-sm font-medium text-hunt-text-muted-on-dark">Koorie plants · Victoria</p>
        <h1 className="text-balance font-black tracking-tight text-hunt-h1 text-hunt-text-heading">
          Museum treasure hunt
        </h1>
        <p className="text-pretty text-base leading-relaxed text-hunt-text">
          Find coloured shapes in the galleries, learn about edible native plants, and build your
          collection. Screen layouts will be added step by step.
        </p>
      </header>

      <section
        className="mt-hunt-gap flex flex-1 flex-col gap-hunt-gap"
        aria-labelledby="shapes-heading"
      >
        <h2 id="shapes-heading" className="sr-only">
          Example shape markers
        </h2>
        <ul className="flex flex-wrap gap-hunt-gap" role="presentation">
          <li className="hunt-shape bg-hunt-accent-muted" aria-hidden="true" />
          <li className="hunt-shape bg-hunt-accent-warm" aria-hidden="true" />
          <li className="hunt-shape bg-hunt-action-bg" aria-hidden="true" />
        </ul>

        <div className="mt-auto flex flex-col gap-hunt-gap pb-hunt-screen">
          <div
            className="inline-flex max-w-full items-center justify-center rounded-[length:var(--radius-button)] bg-hunt-action-bg px-hunt-button-x py-hunt-button-y text-center text-sm font-semibold text-hunt-action-fg transition-hunt"
            aria-hidden="true"
          >
            Primary control preview (not interactive yet)
          </div>
          <p className="text-sm text-hunt-text-soft">
            Primary actions use coral with deep green text for contrast. Motion uses ease-in-out
            over 200ms.
          </p>
        </div>
      </section>
    </main>
  );
}
