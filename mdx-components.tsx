import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children, ...props }) => (
      <h1
        className="mt-0 scroll-mt-24 text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
        {...props}
      >
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2
        className="mt-10 scroll-mt-24 text-balance text-2xl font-semibold tracking-tight sm:text-3xl"
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3
        className="mt-8 scroll-mt-24 text-xl font-semibold tracking-tight sm:text-2xl"
        {...props}
      >
        {children}
      </h3>
    ),
    p: ({ children, ...props }) => (
      <p className="mt-4 leading-7 text-foreground/90" {...props}>
        {children}
      </p>
    ),
    ul: ({ children, ...props }) => (
      <ul
        className="mt-4 list-disc space-y-1.5 ps-6 leading-7 text-foreground/90 marker:text-brand-gold"
        {...props}
      >
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol
        className="mt-4 list-decimal space-y-1.5 ps-6 leading-7 text-foreground/90 marker:text-brand-gold"
        {...props}
      >
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className="leading-7" {...props}>
        {children}
      </li>
    ),
    a: ({ children, href, ...props }) => (
      <a
        href={href}
        className="font-medium text-brand-gold underline-offset-4 hover:underline"
        {...props}
      >
        {children}
      </a>
    ),
    strong: ({ children, ...props }) => (
      <strong className="font-semibold text-foreground" {...props}>
        {children}
      </strong>
    ),
    hr: (props) => <hr className="my-10 border-border" {...props} />,
    blockquote: ({ children, ...props }) => (
      <blockquote
        className="my-6 border-s-4 border-brand-gold/60 ps-4 italic text-muted-foreground"
        {...props}
      >
        {children}
      </blockquote>
    ),
    ...components,
  };
}
