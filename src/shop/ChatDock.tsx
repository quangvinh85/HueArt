import {useEffect,useState} from 'react';
import {contactLinks,defaultContactSettings,type ContactSettings} from './contactSettings';
import {requestApi} from './ordersApi';
import {useShopLanguage} from './language';
export default function ChatDock({hidden=false}:{hidden?:boolean}){
 const {tr}=useShopLanguage();const [settings,setSettings]=useState<ContactSettings>(defaultContactSettings);
 useEffect(()=>{
  let active=true;let pending=false;
  const load=async()=>{if(pending)return;pending=true;try{const data=await requestApi<ContactSettings>('/api/contact-settings');if(active)setSettings(data);}catch{}finally{pending=false;}};
  const onFocus=()=>{if(!document.hidden)void load();};
  const onStorage=(event:StorageEvent)=>{if(event.key==='hueart_contact_settings_updated')void load();};
  void load();window.addEventListener('focus',onFocus);window.addEventListener('storage',onStorage);
  return()=>{active=false;window.removeEventListener('focus',onFocus);window.removeEventListener('storage',onStorage);};
 },[]);
 const links=contactLinks(settings);
 if(hidden||!links.zalo&&!links.messenger)return null;
 return <nav className="shop-chat-dock" aria-label={tr('Chat với người bán')}>
  {links.zalo&&<a className="shop-chat-link shop-chat-zalo" href={links.zalo} target="_blank" rel="noopener noreferrer" aria-label={tr('Chat Zalo với người bán')}><span className="shop-chat-caption">{tr('Chat Zalo')}</span><svg viewBox="0 0 48 48" aria-hidden="true"><path fill="white" d="M24 7C13.5 7 5 13.7 5 22c0 4.3 2.3 8.2 6 10.9L8.5 40l9.1-4.1c2 .6 4.2.9 6.4.9 10.5 0 19-6.7 19-15S34.5 7 24 7Z"/><text x="24" y="26" textAnchor="middle" fontSize="12" fontWeight="800" fill="#0068ff" fontFamily="Arial,sans-serif">Zalo</text></svg></a>}
  {links.messenger&&<a className="shop-chat-link shop-chat-messenger" href={links.messenger} target="_blank" rel="noopener noreferrer" aria-label={tr('Chat Messenger với người bán')}><span className="shop-chat-caption">Messenger</span><svg viewBox="0 0 48 48" aria-hidden="true"><path fill="white" d="M24 6C13.5 6 5 13.8 5 23.5c0 5.5 2.8 10.3 7.3 13.5v7l6.4-3.5c1.7.5 3.5.8 5.3.8 10.5 0 19-7.8 19-17.6C43 13.8 34.5 6 24 6Z"/><path fill="#7653ed" d="m12 29 10-11 7 5 8-5-10 11-7-5-8 5Z"/></svg></a>}
 </nav>;
}
