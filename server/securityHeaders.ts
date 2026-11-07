export function securityHeaders(sites=false):Record<string,string>{
 return {
  'Content-Security-Policy':`default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors ${sites?"'self' https://chatgpt.com https://chat.openai.com":"'none'"}; worker-src 'self' blob:; upgrade-insecure-requests`,
  ...(!sites?{'X-Frame-Options':'DENY'}:{}),
  'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin',
  'Permissions-Policy':'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
 };
}
export function secureResponse(response:Response,sites=false){const headers=new Headers(response.headers);for(const [key,value] of Object.entries(securityHeaders(sites)))if(!headers.has(key))headers.set(key,value);return new Response(response.body,{status:response.status,statusText:response.statusText,headers});}
