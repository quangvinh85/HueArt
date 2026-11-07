import {ApiError} from './orders';
import {defaultContactSettings,normalizeMessengerUrl,normalizeZaloPhone,type ContactSettings} from '../src/shop/contactSettings';
export async function getContactSettings(env:{DB:any}):Promise<ContactSettings>{
 const row=await env.DB.prepare("SELECT value_json, version FROM shop_settings WHERE key = 'contact'").first();
 return row?{...defaultContactSettings,...JSON.parse(row.value_json),version:row.version}:{...defaultContactSettings};
}
export function publicContactSettings(settings:ContactSettings){return {...settings,zaloPhone:settings.zaloEnabled?settings.zaloPhone:'',messengerUrl:settings.messengerEnabled?settings.messengerUrl:''};}
export async function saveContactSettings(env:{DB:any},data:any){
 const current=await getContactSettings(env);
 if(data?.version!==current.version)throw new ApiError(409,'Cài đặt đã thay đổi. Vui lòng tải lại.');
 if(typeof data.zaloEnabled!=='boolean'||typeof data.messengerEnabled!=='boolean')throw new ApiError(400,'Cài đặt chat không hợp lệ.');
 const rawPhone=typeof data.zaloPhone==='string'?data.zaloPhone.trim():'';
 const rawMessenger=typeof data.messengerUrl==='string'?data.messengerUrl.trim():'';
 const zaloPhone=normalizeZaloPhone(rawPhone),messengerUrl=normalizeMessengerUrl(rawMessenger);
 if((rawPhone||data.zaloEnabled)&&!zaloPhone)throw new ApiError(400,'Vui lòng nhập số điện thoại Zalo Việt Nam hợp lệ.');
 if(rawMessenger.length>500||(rawMessenger||data.messengerEnabled)&&!messengerUrl)throw new ApiError(400,'Vui lòng nhập liên kết Messenger hoặc Facebook hợp lệ.');
 const settings={zaloEnabled:data.zaloEnabled,zaloPhone,messengerEnabled:data.messengerEnabled,messengerUrl};
 const result=await env.DB.prepare("INSERT INTO shop_settings (key, value_json, version, updated_at) VALUES ('contact', ?, 1, ?) ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, version = shop_settings.version + 1, updated_at = excluded.updated_at WHERE shop_settings.version = ?").bind(JSON.stringify(settings),new Date().toISOString(),current.version).run();
 if(!result.meta.changes)throw new ApiError(409,'Cài đặt đã thay đổi. Vui lòng tải lại.');
 return {...settings,version:current.version+1};
}
