import {clientHtml} from '../generated/client-html';
export const dynamic='force-dynamic';
export function GET(){return new Response(clientHtml,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
