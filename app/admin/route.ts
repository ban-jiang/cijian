import {env} from 'cloudflare:workers';
import {ownerStatus} from '../../server/analytics.mjs';
import {adminHtml} from '../../generated/admin-html';
export const dynamic='force-dynamic';
export function GET(request:Request){const status=ownerStatus(request,env);const html=status===200?adminHtml:status===401?'<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>词间 · 管理登录</title><body style="font:18px sans-serif;background:#f6f6ef;padding:40px"><h1>词间 · 使用统计</h1><p>此页面仅供作者查看，测验无需登录。</p><a target="_top" href="/signin-with-chatgpt?return_to=%2Fadmin">使用作者的 ChatGPT 账号登录 →</a><p><a href="/">返回测验</a></p></body></html>':'<!doctype html><meta charset="utf-8"><h1>仅作者可查看统计</h1><a href="/">返回测验</a>';return new Response(html,{status,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow'}});}
