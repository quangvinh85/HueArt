import { ApiError } from './orders';
import { getCatalogueEntries } from './catalogue';

const collections = ['imperial-echoes','perfume-river','living-traditions','poetic-monochrome'];
const text = (value:unknown,max:number) => typeof value==='string'?value.trim().slice(0,max):'';
export async function catalogueAdmin(request:Request,env:any,data?:any):Promise<Response>{
  const url=new URL(request.url);
  const entries=await getCatalogueEntries(env);
  const json=(value:unknown)=>Response.json(value,{headers:{'Cache-Control':'private, no-store'}});
  if(url.pathname==='/api/admin/catalog'&&request.method==='GET'){
    const query=(url.searchParams.get('q')||'').trim().toLocaleLowerCase();
    const state=url.searchParams.get('state')||'all';
    if(!['all','visible','hidden','trash'].includes(state))throw new ApiError(400,'Bộ lọc không hợp lệ.');
    const filtered=entries.filter(item=>(state==='trash'?item.deleted:!item.deleted&&(state==='all'||(state==='hidden'?item.hidden:!item.hidden)))&&(`${Object.values(item.artwork.titles).join(' ')} ${item.artwork.photographer||''} ${item.artwork.id}`).toLocaleLowerCase().includes(query));
    const page=Math.max(1,Math.min(100000,Number.parseInt(url.searchParams.get('page')||'1')||1));
    const pageSize=12;
    return json({items:filtered.slice((page-1)*pageSize,page*pageSize),total:filtered.length,page,pageSize,stats:{total:entries.filter(x=>!x.deleted).length,visible:entries.filter(x=>!x.deleted&&!x.hidden).length,hidden:entries.filter(x=>!x.deleted&&x.hidden).length,trash:entries.filter(x=>x.deleted).length}});
  }
  const match=/^\/api\/admin\/catalog\/([a-z0-9-]{1,100})$/.exec(url.pathname);
  if(!match||request.method!=='PATCH')throw new ApiError(404,'Không tìm thấy chức năng này.');
  const item=entries.find(x=>x.artwork.id===match[1]);
  if(!item)throw new ApiError(404,'Không tìm thấy tác phẩm.');
  if(data?.version!==item.version)throw new ApiError(409,'Tác phẩm đã thay đổi. Vui lòng tải lại.');
  let metadata=item.metadata,hidden=item.hidden,deletedAt=item.deletedAt;
  if(data.action==='trash')deletedAt=new Date().toISOString();
  else if(data.action==='restore')deletedAt=null;
  else if(data.action==='save'){
    if(typeof data.hidden!=='boolean'||!collections.includes(data.collection))throw new ApiError(400,'Thông tin tác phẩm không hợp lệ.');
    const titles={vi:text(data.titles?.vi,160),en:text(data.titles?.en,160),fr:text(data.titles?.fr,160)};
    if(titles.vi.length<2)throw new ApiError(400,'Vui lòng nhập tên tác phẩm.');
    titles.en||=titles.vi;titles.fr||=titles.vi;
    const locations={vi:text(data.locations?.vi,200),en:text(data.locations?.en,200),fr:text(data.locations?.fr,200)};
    const stories={vi:text(data.stories?.vi,2000),en:text(data.stories?.en,2000),fr:text(data.stories?.fr,2000)};
    metadata={titles,locations,stories,photographer:text(data.photographer,100),collection:data.collection};
    hidden=data.hidden;
  }else throw new ApiError(400,'Thao tác không hợp lệ.');
  const now=new Date().toISOString();
  const saved=await env.DB.prepare('INSERT INTO catalogue_overrides (artwork_id, metadata_json, hidden, deleted_at, version, updated_at) VALUES (?, ?, ?, ?, 1, ?) ON CONFLICT(artwork_id) DO UPDATE SET metadata_json = excluded.metadata_json, hidden = excluded.hidden, deleted_at = excluded.deleted_at, version = catalogue_overrides.version + 1, updated_at = excluded.updated_at WHERE catalogue_overrides.version = ?').bind(item.artwork.id,JSON.stringify(metadata),Number(hidden),deletedAt,now,item.version).run();
  if(!saved.meta.changes)throw new ApiError(409,'Tác phẩm đã thay đổi. Vui lòng tải lại.');
  return json({ok:true});
}
