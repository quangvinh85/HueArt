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
  return (await getCatalogueEntries(env)).filter(item=>!item.hidden&&!item.deleted).map(item=>item.artwork);
}

export async function getCatalogueEntries(env:{DB?:any}) {
  const [submissions,overrides] = env.DB ? await Promise.all([
    env.DB.prepare("SELECT id, title, title_en, title_fr, location, story, collection, author_name, created_at, submission_origin FROM artwork_submissions WHERE status = 'accepted' ORDER BY updated_at DESC, id DESC").all(),
    env.DB.prepare('SELECT * FROM catalogue_overrides').all(),
  ]) : [{results:[]},{results:[]}];
  const adminIds=new Set(submissions.results.filter((row:any)=>row.submission_origin==='admin').map((row:any)=>'submission-'+row.id));
  const saved=new Map<string,any>(overrides.results.map((row:any)=>[row.artwork_id,row]));
  return [...submissions.results.map(publishedArtwork),...ARTWORKS].map((artwork:Artwork)=>{
    const row=saved.get(artwork.id);
    const metadata=row?JSON.parse(row.metadata_json):{};
    const merged={...artwork,...metadata};
    if(metadata.titles){merged.title=metadata.titles.vi;merged.vietnameseTitle=metadata.titles.vi;}
    if(metadata.locations)merged.location=metadata.locations.vi;
    if(metadata.stories)merged.story=metadata.stories.vi;
    return {artwork:merged as Artwork,metadata,source:adminIds.has(artwork.id)?'admin':artwork.id.startsWith('submission-')?'submission':'original',hidden:Boolean(row?.hidden),deleted:Boolean(row?.deleted_at),deletedAt:row?.deleted_at||null,version:row?.version||0};
  });
}
