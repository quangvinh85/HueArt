import {ApiError} from './orders';
import {getCatalogue} from './catalogue';
import {defaultHomepageSettings,type HomepageSettings,type HomepageText} from '../src/shop/homepageTypes';
export async function getHomepageSettings(env:{DB:any}):Promise<HomepageSettings>{
 const row=await env.DB.prepare("SELECT value_json,version FROM shop_settings WHERE key = 'homepage'").first();
 return row?{...JSON.parse(row.value_json),version:row.version}:structuredClone(defaultHomepageSettings);
}
function text(value:any,max:number):HomepageText{
 const clean=(v:unknown)=>typeof v==='string'?v.trim():'';
 if(!value||typeof value!=='object'||!clean(value.vi)||['vi','en','fr'].some(lang=>typeof value[lang]!=='string'||value[lang].length>max||/[\u0000-\u001f]/.test(value[lang])))throw new ApiError(400,'Nội dung trang chủ không hợp lệ hoặc quá dài.');
 return {vi:clean(value.vi),en:clean(value.en),fr:clean(value.fr)};
}
export async function saveHomepageSettings(env:any,data:any){
 const current=await getHomepageSettings(env);
 if(data?.version!==current.version)throw new ApiError(409,'Giao diện cửa hàng đã thay đổi. Vui lòng tải lại trước khi lưu.');
 const eyebrow=text(data.eyebrow,80),tagline=text(data.tagline,240),id=data.backgroundArtworkId;
 if(typeof id!=='string'||!(await getCatalogue(env)).some(art=>art.id===id))throw new ApiError(400,'Vui lòng chọn ảnh nền đang hiển thị trong thư viện.');
 const result=await env.DB.prepare("INSERT INTO shop_settings (key,value_json,version,updated_at) VALUES ('homepage',?,1,?) ON CONFLICT(key) DO UPDATE SET value_json=excluded.value_json,version=shop_settings.version+1,updated_at=excluded.updated_at WHERE shop_settings.version=?").bind(JSON.stringify({eyebrow,tagline,backgroundArtworkId:id}),new Date().toISOString(),current.version).run();
 if(!result.meta.changes)throw new ApiError(409,'Giao diện cửa hàng đã thay đổi. Vui lòng tải lại trước khi lưu.');
 return getHomepageSettings(env);
}
