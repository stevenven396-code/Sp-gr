function cors(){return {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, X-App-Token','Access-Control-Max-Age':'86400'};}
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8',...cors()}});}
function safeEqual(a,b){if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let out=0;for(let i=0;i<a.length;i++)out|=a.charCodeAt(i)^b.charCodeAt(i);return out===0;}
export default {async fetch(request,env){
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors()});
  const url=new URL(request.url);if(url.pathname!=='/grade')return json({error:'Not found.'},404);if(request.method!=='POST')return json({error:'Method not allowed.'},405);
  if(!env.ANTHROPIC_API_KEY||!env.APP_ACCESS_TOKEN)return json({error:'Backend secrets are not configured.'},500);
  if(!safeEqual(request.headers.get('x-app-token')||'',env.APP_ACCESS_TOKEN))return json({error:'Invalid app access code.'},401);
  const length=Number(request.headers.get('content-length')||0);if(length>50000)return json({error:'Request is too large.'},413);
  let body;try{body=await request.json();}catch{return json({error:'Invalid JSON request.'},400);}
  if(typeof body.prompt!=='string'||body.prompt.trim().length<50||body.prompt.length>45000)return json({error:'Prompt is missing or too long.'},400);
  try{
    const upstream=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':env.ANTHROPIC_API_KEY,'anthropic-version':'2023-06-01'},body:JSON.stringify({model:'claude-sonnet-4-5-20250929',max_tokens:8000,temperature:0.2,messages:[{role:'user',content:body.prompt}]})});
    const data=await upstream.json().catch(()=>({}));if(!upstream.ok)return json({error:data?.error?.message||`Anthropic API request failed (${upstream.status}).`},upstream.status>=500?502:upstream.status);
    const text=(data.content||[]).filter(x=>x.type==='text').map(x=>x.text).join('\n').trim();if(!text)return json({error:'Claude returned an empty response.'},502);
    const cleaned=text.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'').trim();let result;try{result=JSON.parse(cleaned);}catch{return json({error:'Claude returned a response that could not be read as JSON.'},502);}
    return json({result});
  }catch(e){return json({error:e?.message||'Unable to contact Anthropic.'},502);}
}};
