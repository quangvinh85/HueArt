import { ARTWORKS } from '../src/data/artworks';
import type { Artwork } from '../src/types';

export function publishedArtwork(row: any): Artwork {
  const imageUrl = `/api/catalog/${row.id}/image`;
  return {
    id: `submission-${row.id}`,
    title: row.title,
    vietnameseTitle: row.title,
    titles: { vi: row.title, en: row.title_en || row.title, fr: row.title_fr || row.title },
    stories: { vi: row.story || '', en: row.story || '', fr: row.story || '' },
    historicalNotes: { vi: '', en: '', fr: '' },
    locations: { vi: row.location || '', en: row.location || '', fr: row.location || '' },
    collection: row.collection,
    year: new Date(row.created_at).getUTCFullYear(),
    orientation: 'landscape',
    aspectRatio: '3/2',
    location: row.location || '',
    story: row.story || '',
    historicalNote: '',
    editionTotal: 0,
    editionsRemaining: 0,
    camera: { camera:'', lens:'', settings:'', locationName:row.location || '', coordinates:'', capturedAt:'' },
    imageUrl,
    highResUrl: imageUrl,
    basePriceUSD: 5,
    mood: row.collection === 'perfume-river' ? 'serene' : row.collection === 'living-traditions' ? 'vibrant' : 'imperial',
    palette: [],
    featured: true,
    photographer: row.author_name,
  };
}

export async function getCatalogue(env: { DB?: any }): Promise<Artwork[]> {
  if (!env.DB) return ARTWORKS;
  const rows = await env.DB.prepare("SELECT id, title, title_en, title_fr, location, story, collection, author_name, created_at FROM artwork_submissions WHERE status = 'accepted' ORDER BY updated_at DESC, id DESC").all();
  return [...rows.results.map(publishedArtwork), ...ARTWORKS];
}
