import {env} from 'cloudflare:workers';
import {excludeDevice} from '../../../server/analytics.mjs';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{return await excludeDevice(request,env);}catch(error){console.error('Analytics endpoint failed',error instanceof Error?error.message:'unknown');return Response.json({error:'Service unavailable'},{status:503,headers:{'Cache-Control':'no-store'}});}}
