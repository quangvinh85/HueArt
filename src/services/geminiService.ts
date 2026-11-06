import { ARTWORKS } from '../data/artworks';
import type { Artwork } from '../types';
import type { Language } from '../i18n/translations';
import { requestApi } from '../shop/ordersApi';
export interface CuratorRecommendation { artwork: Artwork; reason: string; recommendedSize: string; recommendedFrame: string; aestheticMood: string; }
export interface CuratorResponse { mode: 'ai' | 'catalog'; curatorNote: string; recommendations: CuratorRecommendation[]; }
export async function getCuratorAdvice(userQuery: string, selectedRoomType = '', preferredMood = '', language: Language = 'vi'): Promise<CuratorResponse> {
  const result = await requestApi<{mode:'ai'|'catalog';curatorNote:string;recommendations:(Omit<CuratorRecommendation,'artwork'> & {artworkId:string;artwork?:Artwork})[]}>('/api/curator', {method:'POST',body:JSON.stringify({query:userQuery,room:selectedRoomType,mood:preferredMood,language})});
  return { ...result,recommendations:result.recommendations.flatMap(rec=>{const artwork=rec.artwork || ARTWORKS.find(art=>art.id===rec.artworkId);return artwork?[{...rec,artwork}]:[];}) };
}
