/**
 * Company wordmark (client, 29 Oct): the site is ELIT KONSERVA, the factory; «Мечта хозяйки» is one of its
 * brands and lives on the brands page. Set in type until a vector logo arrives. TODO(client): vector logo.
 * The name is a proper noun, the same in every locale, so it is not read from messages.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={["wordmark", className].filter(Boolean).join(" ")} translate="no">
      <span className="wordmark__a">ELIT</span> <span className="wordmark__b">KONSERVA</span>
    </span>
  );
}
