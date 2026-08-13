/**
 * Renders a JSON-LD structured-data script tag.
 *
 * `<` is escaped to prevent `</script>` breakout if any field ever carries
 * user-supplied content (blog titles come from the CMS).
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
