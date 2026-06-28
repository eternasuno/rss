import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { feed } from '@/db/schema/feed';
import { item } from '@/db/schema/item';
import { generateRssXml } from '@/lib/rss-xml';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ feedId: string }> }
) {
  const { feedId } = await params;

  const feedData = db.select().from(feed).where(eq(feed.id, feedId)).get();
  if (!feedData) {
    return NextResponse.json({ error: 'Feed not found' }, { status: 404 });
  }

  let xml = feedData.rssXml;

  if (!xml) {
    const items = db.select().from(item).where(eq(item.feedId, feedId)).all();
    xml = generateRssXml(
      {
        authorName: feedData.authorName,
        copyright: feedData.copyright,
        description: feedData.description,
        language: feedData.language,
        link: feedData.link,
        siteUrl: feedData.siteUrl,
        title: feedData.title,
        updatedAt: feedData.updatedAt.getTime(),
      },
      items.map((i) => ({
        author: i.author,
        content: i.content,
        description: i.description,
        guid: i.guid,
        link: i.link,
        pubDate: i.pubDate?.getTime() ?? null,
        title: i.title,
      }))
    );

    db.update(feed).set({ rssXml: xml }).where(eq(feed.id, feedId)).run();
  }

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}
