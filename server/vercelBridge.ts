export interface VercelBridgeEnv { VERCEL_BRIDGE_TOKEN?: string; }
// A server-to-server credential delegates password authentication to Vercel.
// Browser identity headers are never trusted on this path.
export function vercelBridge(request: Request, env: VercelBridgeEnv) {
  if(!env.VERCEL_BRIDGE_TOKEN || !/^[0-9a-f]{64}$/.test(env.VERCEL_BRIDGE_TOKEN)) return null;
  const supplied=request.headers.get('Authorization') || '';
  const expected='Bearer '+env.VERCEL_BRIDGE_TOKEN;
  let difference=supplied.length^expected.length;
  for(let index=0;index<Math.max(supplied.length,expected.length);index++) difference|=(supplied.charCodeAt(index)||0)^(expected.charCodeAt(index)||0);
  if(difference) return null;
  const ip=request.headers.get('X-HueArt-Client-IP') || '';
  return {userId:'vercel-admin',rateKey:'vercel:'+(ip.length<=64&&/^[0-9a-f:.]+$/i.test(ip)?ip:'unknown')};
}
