/**
 * Tiny safe Markdown → HTML converter.
 *
 * We use this for two admin-editable text surfaces only:
 *   - /refund          (refund policy)
 *   - admin preview    (live preview tab in the editor)
 *
 * Why a hand-rolled converter instead of `marked` / `markdown-it`:
 *   - That class of library + sanitiser would add ~30 KB to the
 *     /refund page bundle, which is currently a 96 KB shared-only
 *     static page. We don't want to regress that.
 *   - The supported syntax is intentionally minimal — headings,
 *     bold, italic, lists, paragraphs, links. Anything fancier
 *     (tables, images, code blocks) doesn't belong in a refund
 *     policy.
 *   - We sanitise BEFORE producing HTML by escaping every byte
 *     of input, then re-introduce a closed set of formatting
 *     spans. That's safer than rendering arbitrary HTML and then
 *     scrubbing it.
 *
 * The output is always `dangerouslySetInnerHTML`-safe because:
 *   - Every `<` / `>` / `&` / `"` from the operator's input is
 *     escaped to entities before any markdown processing.
 *   - The only HTML tags we INSERT are: h2, h3, p, ul, li, strong,
 *     em, a, br. No event handlers, no script.
 *   - URLs in `[text](href)` are validated to start with `https://`,
 *     `http://`, `mailto:`, `tel:`, or `/` — anything else is
 *     rendered as plain text.
 */

const URL_ALLOW = /^(https?:\/\/|mailto:|tel:|\/)/i;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Inline rules: bold, italic, links — applied AFTER HTML-escape. */
function inline(text: string): string {
  // Order matters: do **bold** before *italic* so we don't break
  // up `**foo**` mid-token.
  let out = text;

  // Bold: **text** or __text__
  out = out.replace(
    /(\*\*|__)([^*_\n]+?)\1/g,
    (_m, _d, body) => `<strong>${body}</strong>`
  );

  // Italic: *text* or _text_  (single asterisk, not part of **)
  out = out.replace(
    /(?<!\*)\*([^*\n]+?)\*(?!\*)/g,
    (_m, body) => `<em>${body}</em>`
  );
  out = out.replace(
    /(?<!_)_([^_\n]+?)_(?!_)/g,
    (_m, body) => `<em>${body}</em>`
  );

  // Links: [text](href)
  out = out.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_m: string, label: string, href: string) => {
      const trimmed = href.trim();
      if (!URL_ALLOW.test(trimmed)) return `${label}`;
      const safeHref = escapeHtml(trimmed);
      const external = /^https?:\/\//i.test(trimmed);
      const attrs = external
        ? ` target="_blank" rel="noopener noreferrer"`
        : "";
      return `<a href="${safeHref}"${attrs}>${label}</a>`;
    }
  );

  return out;
}

/** Render the operator's markdown input as a safe HTML string. */
export function renderMarkdown(input: string): string {
  if (!input) return "";

  // 1) Escape EVERYTHING first. The remaining transforms only
  //    re-introduce a closed set of safe tags.
  const escaped = escapeHtml(input).replace(/\r\n?/g, "\n");

  // 2) Walk lines, group into block-level elements.
  const lines = escaped.split("\n");
  const out: string[] = [];

  type Block =
    | { kind: "p"; lines: string[] }
    | { kind: "ul"; items: string[] }
    | null;
  let block: Block = null;

  const flush = () => {
    if (!block) return;
    if (block.kind === "p") {
      const joined = block.lines.join(" ").trim();
      if (joined) out.push(`<p>${inline(joined)}</p>`);
    } else if (block.kind === "ul") {
      const items = block.items
        .map((item) => `<li>${inline(item)}</li>`)
        .join("");
      out.push(`<ul>${items}</ul>`);
    }
    block = null;
  };

  for (const raw of lines) {
    const line = raw.trim();

    // Blank line ends the current block.
    if (line === "") {
      flush();
      continue;
    }

    // Headings — only ## and ###, anything bigger gets rendered
    // as ## (refund policy doesn't need an h1; the page provides
    // its own).
    const h2 = line.match(/^##\s+(.+)$/);
    const h3 = line.match(/^###\s+(.+)$/);
    if (h3) {
      flush();
      out.push(`<h3>${inline(h3[1])}</h3>`);
      continue;
    }
    if (h2) {
      flush();
      out.push(`<h2>${inline(h2[1])}</h2>`);
      continue;
    }

    // Unordered list items.
    const li = line.match(/^[-*]\s+(.+)$/);
    if (li) {
      if (!block || block.kind !== "ul") {
        flush();
        block = { kind: "ul", items: [] };
      }
      block.items.push(li[1]);
      continue;
    }

    // Otherwise paragraph text — accumulate until a blank line.
    if (!block || block.kind !== "p") {
      flush();
      block = { kind: "p", lines: [] };
    }
    block.lines.push(line);
  }

  flush();
  return out.join("\n");
}
