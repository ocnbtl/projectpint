import Link from "next/link";
import type { MarkdownInlineToken, MarkdownBlock } from "../lib/content-render";

function renderInline(tokens: MarkdownInlineToken[], keyPrefix: string) {
  return tokens.map((token, index) => {
    if (token.type === "link") {
      const isInternal = token.href.startsWith("/");
      if (isInternal) {
        return (
          <Link key={`${keyPrefix}-link-${index}`} href={token.href}>
            {token.text}
          </Link>
        );
      }
      return (
        <a key={`${keyPrefix}-link-${index}`} href={token.href} rel="noreferrer" target="_blank">
          {token.text}
        </a>
      );
    }
    return <span key={`${keyPrefix}-text-${index}`}>{token.text}</span>;
  });
}

export function MarkdownArticle({ blocks, slug }: { blocks: MarkdownBlock[]; slug: string }) {
  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === "h1") return <h1 key={`${slug}-${index}`}>{renderInline(block.inline, `${slug}-${index}`)}</h1>;
        if (block.type === "h2") return <h2 key={`${slug}-${index}`}>{renderInline(block.inline, `${slug}-${index}`)}</h2>;
        if (block.type === "h3") return <h3 key={`${slug}-${index}`}>{renderInline(block.inline, `${slug}-${index}`)}</h3>;
        if (block.type === "ul") {
          return (
            <ul key={`${slug}-${index}`}>
              {block.items.map((item, itemIndex) => (
                <li key={`${slug}-${index}-${itemIndex}`}>{renderInline(item.inline, `${slug}-${index}-${itemIndex}`)}</li>
              ))}
            </ul>
          );
        }
        if (block.type === "ol") {
          return (
            <ol key={`${slug}-${index}`}>
              {block.items.map((item, itemIndex) => (
                <li key={`${slug}-${index}-${itemIndex}`}>{renderInline(item.inline, `${slug}-${index}-${itemIndex}`)}</li>
              ))}
            </ol>
          );
        }
        return <p key={`${slug}-${index}`}>{renderInline(block.inline, `${slug}-${index}`)}</p>;
      })}
    </>
  );
}
