import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { feed as feedTable } from '@/db/schema/feed';
import { item as itemTable } from '@/db/schema/item';
import { auth } from '@/lib/auth';

function sanitizeHtml(html: string): string {
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

function validateTitle(title: unknown): string {
  if (typeof title !== 'string' || title.trim().length === 0) {
    throw new Error('Title is required and must be a non-empty string');
  }
  if (title.length > 500) {
    throw new Error('Title must be 500 characters or fewer');
  }
  return title.trim();
}

function validateLink(link: unknown): string | null {
  if (link === undefined || link === null || link === '') {
    return null;
  }
  if (typeof link !== 'string' || link.length > 2048) {
    throw new Error('Link must be 2048 characters or fewer');
  }
  return link;
}

function validateDescription(description: unknown): string | null {
  if (description === undefined || description === null || description === '') {
    return null;
  }
  if (typeof description !== 'string' || description.length > 5000) {
    throw new Error('Description must be 5000 characters or fewer');
  }
  return description;
}

function validateAuthor(author: unknown): string | null {
  if (author === undefined || author === null || author === '') {
    return null;
  }
  if (typeof author !== 'string' || author.length > 200) {
    throw new Error('Author must be 200 characters or fewer');
  }
  return author;
}

function validateContent(content: unknown): string | null {
  if (content === undefined || content === null || content === '') {
    return null;
  }
  if (typeof content !== 'string') {
    throw new Error('Content must be a string');
  }
  return sanitizeHtml(content);
}

function validatePubDate(pubDate: unknown): number | null {
  if (pubDate === undefined || pubDate === null) {
    return null;
  }
  if (typeof pubDate === 'number') {
    return pubDate;
  }
  if (typeof pubDate === 'string') {
    const parsed = Date.parse(pubDate);
    if (Number.isNaN(parsed)) {
      throw new Error('pubDate must be a valid date');
    }
    return parsed;
  }
  throw new Error('pubDate must be a number (ms timestamp) or ISO string');
}

function validateGuid(guid: unknown): string | null {
  if (guid === undefined || guid === null || guid === '') {
    return null;
  }
  if (typeof guid !== 'string' || guid.length > 500) {
    throw new Error('GUID must be 500 characters or fewer');
  }
  return guid;
}

function validateBody(body: Record<string, unknown>) {
  const allowedFields = ['title', 'link', 'description', 'author', 'content', 'pubDate', 'guid'];
  const unknownFields = Object.keys(body).filter((k) => !allowedFields.includes(k));
  if (unknownFields.length > 0) {
    return { error: `Unknown fields: ${unknownFields.join(', ')}` };
  }

  try {
    return {
      author: validateAuthor(body.author),
      content: validateContent(body.content),
      description: validateDescription(body.description),
      guid: validateGuid(body.guid),
      link: validateLink(body.link),
      pubDate: validatePubDate(body.pubDate),
      title: validateTitle(body.title),
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Validation error' };
  }
}

async function getSessionFromApiKey(request: Request) {
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing x-api-key header' }, { status: 401 });
  }

  try {
    const session = await auth.api.getSession({
      headers: new Headers({ 'x-api-key': apiKey }),
    });
    if (!session) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }
    return session;
  } catch {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }
}

function lookupFeed(feedId: string, userId: string) {
  const feedData = db.select().from(feedTable).where(eq(feedTable.id, feedId)).get();
  if (!feedData) {
    return NextResponse.json({ error: 'Feed not found' }, { status: 404 });
  }
  if (feedData.userId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return feedData;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ feedId: string }> }
) {
  const contentType = request.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 });
  }

  const session = await getSessionFromApiKey(request);
  if (session instanceof NextResponse) {
    return session;
  }

  const { feedId } = await params;

  const feedOrResponse = lookupFeed(feedId, session.user.id);
  if (feedOrResponse instanceof NextResponse) {
    return feedOrResponse;
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validated = validateBody(body);
  if ('error' in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const finalGuid = validated.guid ?? id;
  const now = new Date();

  // biome-ignore lint/style/noNonNullAssertion: returning() always returns
  const result = db
    .insert(itemTable)
    .values({
      author: validated.author,
      content: validated.content,
      createdAt: now,
      description: validated.description,
      feedId,
      guid: finalGuid,
      id,
      link: validated.link,
      pubDate: validated.pubDate ? new Date(validated.pubDate) : null,
      title: validated.title,
      updatedAt: now,
    } as any)
    .returning()
    .get()!;

  db.update(feedTable).set({ rssXml: null }).where(eq(feedTable.id, feedId)).run();

  return NextResponse.json(result, { status: 201 });
}
