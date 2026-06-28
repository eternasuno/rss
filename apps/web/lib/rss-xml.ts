function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export interface FeedXmlInput {
  title: string;
  description: string;
  link: string;
  language: string;
  siteUrl?: string | null;
  copyright?: string | null;
  authorName?: string | null;
  updatedAt: number;
}

export interface ItemXmlInput {
  title: string;
  link?: string | null;
  guid: string;
  pubDate?: number | null;
  description?: string | null;
  author?: string | null;
  content?: string | null;
}

function escapeAndWrap(value: string): string {
  return escapeXml(value);
}

function buildChannelSubelements(feed: FeedXmlInput): string {
  const parts: string[] = [];

  parts.push(`    <title>${escapeAndWrap(feed.title)}</title>`);
  parts.push(`    <link>${escapeAndWrap(feed.link || feed.siteUrl || '')}</link>`);
  parts.push(`    <description>${escapeAndWrap(feed.description)}</description>`);
  parts.push(`    <language>${escapeAndWrap(feed.language)}</language>`);
  parts.push(`    <lastBuildDate>${new Date(feed.updatedAt).toUTCString()}</lastBuildDate>`);

  if (feed.copyright) {
    parts.push(`    <copyright>${escapeAndWrap(feed.copyright)}</copyright>`);
  }

  if (feed.authorName) {
    parts.push(`    <managingEditor>${escapeAndWrap(feed.authorName)}</managingEditor>`);
  }

  return parts.join('\n');
}

function buildItemElement(item: ItemXmlInput): string {
  const parts: string[] = [];

  parts.push('    <item>');
  parts.push(`      <title>${escapeAndWrap(item.title)}</title>`);

  if (item.link) {
    parts.push(`      <link>${escapeAndWrap(item.link)}</link>`);
  }

  parts.push(`      <guid isPermaLink="false">${escapeAndWrap(item.guid)}</guid>`);

  if (item.pubDate) {
    parts.push(`      <pubDate>${new Date(item.pubDate).toUTCString()}</pubDate>`);
  }

  if (item.description) {
    parts.push(`      <description>${escapeAndWrap(item.description)}</description>`);
  }

  if (item.author) {
    parts.push(`      <author>${escapeAndWrap(item.author)}</author>`);
  }

  if (item.content) {
    parts.push('      <content:encoded><![CDATA[' + item.content + ']]></content:encoded>');
  }

  parts.push('    </item>');

  return parts.join('\n');
}

export function generateRssXml(feed: FeedXmlInput, items: ItemXmlInput[]): string {
  const xmlParts: string[] = [];

  xmlParts.push('<?xml version="1.0" encoding="UTF-8"?>');
  xmlParts.push('<rss version="2.0">');
  xmlParts.push('  <channel>');
  xmlParts.push(buildChannelSubelements(feed));

  for (const item of items) {
    xmlParts.push(buildItemElement(item));
  }

  xmlParts.push('  </channel>');
  xmlParts.push('</rss>');

  return xmlParts.join('\n') + '\n';
}
