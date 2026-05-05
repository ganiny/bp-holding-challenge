import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: string;
  lead: string;
  children: ReactNode;
};

export function LegalPageShell({ eyebrow, title, lead, children }: Props) {
  return (
    <main className="flex flex-1 flex-col">
      <section className="bg-brand-navy text-brand-cream">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <p className="text-xs font-mono uppercase tracking-[0.24em] text-brand-gold">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-balance text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mt-6 text-balance text-base text-brand-cream/85 sm:text-lg">
            {lead}
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-14">
        <article className="text-[15px] leading-7">{children}</article>
      </section>
    </main>
  );
}
