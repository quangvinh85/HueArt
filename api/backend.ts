import type { IncomingMessage,ServerResponse } from 'node:http';
import { Readable } from 'node:stream';
import process from 'node:process';
import { proxyApi,MAX_VERCEL_BODY } from '../server/vercelProxy.ts';

export default async function handler(req:IncomingMessage & {body?:unknown},res:ServerResponse){
  try{
    const host=req.headers.host||'';
    const allowedHosts=(process.env.HUEART_PUBLIC_HOSTS||'').split(',').map(value=>value.trim()).filter(Boolean);
    // Vercel controls routing to assigned domains. An explicit allowlist is optional.
    if(!/^[a-zA-Z0-9.-]+(?::[0-9]+)?$/.test(host)||(allowedHosts.length>0&&!allowedHosts.includes(host))){res.statusCode=400;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({error:'Tên miền chưa được cấu hình cho API.'}));return;}
    const headers=new Headers();
    for(const [key,value] of Object.entries(req.headers))if(value!==undefined)headers.set(key,Array.isArray(value)?value.join(', '):value);
    let body:Buffer|undefined;
    if(req.method!=='GET'&&req.method!=='HEAD'){
      if(Number(req.headers['content-length'])>MAX_VERCEL_BODY)throw new Error('BODY_TOO_LARGE');
      if(req.body!==undefined)body=Buffer.isBuffer(req.body)?req.body:Buffer.from(typeof req.body==='string'?req.body:JSON.stringify(req.body));
      else{const chunks:Buffer[]=[];let length=0;for await(const value of req){const chunk=Buffer.isBuffer(value)?value:Buffer.from(value);length+=chunk.length;if(length>MAX_VERCEL_BODY)throw new Error('BODY_TOO_LARGE');chunks.push(chunk);}body=Buffer.concat(chunks);}
      if(body.length>MAX_VERCEL_BODY)throw new Error('BODY_TOO_LARGE');
    }
    const publicUrl=new URL('https://'+host+req.url);
    if(publicUrl.pathname==='/api/backend' && publicUrl.searchParams.has('__hueart_route')){
      publicUrl.pathname='/api/'+publicUrl.searchParams.get('__hueart_route');
      publicUrl.searchParams.delete('__hueart_route');
    }
    const result=await proxyApi(new Request(publicUrl,{method:req.method,headers,body:body?new Uint8Array(body).buffer:undefined}),{
      backendUrl:process.env.HUEART_BACKEND_URL,
      serviceToken:process.env.HUEART_BACKEND_SERVICE_TOKEN,
      bridgeToken:process.env.HUEART_BACKEND_BRIDGE_TOKEN,
    });
    res.statusCode=result.status;
    result.headers.forEach((value,key)=>{if(key.toLowerCase()!=='set-cookie')res.setHeader(key,value);});
    const cookies=result.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies);
    if(result.body)Readable.fromWeb(result.body as any).on('error',()=>res.destroy()).pipe(res);else res.end();
  }catch(error){
    if(res.headersSent){res.end();return;}
    res.statusCode=error instanceof Error&&error.message==='BODY_TOO_LARGE'?413:500;
    res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');
    res.end(JSON.stringify({error:res.statusCode===413?'Ảnh gửi từ Vercel tối đa 3 MB.':'Chưa xử lý được yêu cầu. Vui lòng thử lại.'}));
  }
}
