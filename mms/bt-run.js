/* IM history and the draft's track record, from the IM library's submission forms.
   Runs in the MMS page after bt.js: window.__btRun(records) -> backtest object.
   records: [{u,fn,t,d,wr,F,rows:[{item,ct,tt,old,xp,pc,cn,dp,at,en,dt,def,ac,dec,com}]}] */
(function(){
const B=()=>window.__bt;
const DEC=['Approved as Submitted','Approved with Modification','Returned','Denied','Withdrawn','Deferred'];
const KEY={'Approved as Submitted':'as','Approved with Modification':'mod','Returned':'ret','Denied':'den','Withdrawn':'wd','Deferred':'def'};
function normDec(s){ s=String(s||'').toLowerCase().trim(); if(!s) return '';
  if(/withdr/.test(s)) return 'Withdrawn'; if(/not approved|reject|den(y|ied)/.test(s)) return 'Denied'; if(/return/.test(s)) return 'Returned'; if(/defer|table|hold/.test(s)) return 'Deferred';
  if(/modif|with mod|w\/ ?mod|with change|with edit|approved with/.test(s)) return 'Approved with Modification'; if(/approv|accept|as submitted/.test(s)) return 'Approved as Submitted'; return ''; }
const nameOf=r=>String(r.en||r.dp||r.at||r.cn||r.ac||'').trim().toLowerCase();
const days=(a,b)=>Math.round((new Date(b)-new Date(a))/864e5);
const median=a=>{ if(!a.length) return null; const s=a.slice().sort((x,y)=>x-y), m=s.length>>1; return s.length%2?s[m]:Math.round((s[m-1]+s[m])/2); };
const LEAKY=new Set(['rm-exists','rm-cn-exists','rm-enum-exists','rm-ac-exists','rm-already-there','rm-dep-already','rm-rename-taken','rm-missing','rm-cn-missing','rm-enum-missing','rm-enum-dp','rm-xpath','rm-parent','rm-old-def','rm-deprecated','rm-similar','rm-enum-near','rm-type-enums']);
const THEMES=[['Definition wording and clarity',/definition|define|clarif|clear|wording|reword|describ|rephrase/],['Already in the model / reuse',/already|exist|reuse|duplicat|in the model|in model|currently/],['Structure, container or XPATH',/xpath|container|structure|parent|location|\bmove/],['Naming and class words',/\bname|class word|camel|rename|suffix/],['Enumerations',/enum/],['Spelling, grammar, punctuation',/spell|typo|grammar|punctuat|capitali|period/],['Missing information',/missing|provide|please add|blank|incomplete|need(s|ed)? (a |an )?(definition|enum|example|value)/],['Coordinate with other groups',/coordinat|other (work ?)?group|sociali|discuss with|check with|consult/],['Breaking change or deprecation',/break|deprecat|backward/],['Acronyms and abbreviations',/acronym|abbreviat|spell out|spelled out/],['Implementation or process language',/implement|process|statut|regulat|system/],['Submission form',/submission form|\bform\b|column|\btab\b/]];

/* the submission rows, as a form the IM Pre-Review can read (no decisions) */
const HDR={item:'Item #',ct:'Change Type',tt:'Change Target Type',old:'Original/Old Value',xp:'XPATH',pc:'Parent CONTAINER Name',cn:'CONTAINER Name',dp:'Data Point Name',at:'Attribute Name',en:'Enumeration Name',dt:'Definition Type',def:'Definition',ac:'Acronym Name'};
function fakeForm(rows,F,name){ const keys=Object.keys(HDR), col=k=>String.fromCharCode(65+keys.indexOf(k));
  const head={n:1,c:Object.fromEntries(keys.map(k=>[col(k),HDR[k]]))};
  const data=rows.map((r,i)=>({n:i+2,c:Object.fromEntries(keys.filter(k=>r[k]).map(k=>[col(k),r[k]]))}));
  const face={name:'Face Page',rows:[['Work Request ID',F.wr||'WR'],['Submission Name',F.name||'x'],['Primary Community of Practice',F.cop||'x'],['Parent Community of Practice',F.parent||'x'],['Parent CoP Approval','Yes'],['Socialized with Other Workgroups','Yes'],['Work Group Chair','x'],['Work Group Facilitator','x'],['Change Priority Category','x'],['Submission Category','x'],['Submission Summary','x']].map((p,i)=>({n:i+1,c:{A:p[0],B:p[1]}})),footer:'',header:''};
  return {name:name||'IMSub_WR2026_01_x_010126.xlsx',sheets:[face,{name:'Reference Model Changes',rows:[head,...data],footer:'',header:''},{name:'Proposed Structure',rows:[{n:1,c:{A:'X'}},{n:2,c:{A:'DEAL_SETS'}}]}]}; }

/* every decision event: a decided form, paired with what was submitted */
function events(recs){
  const R=recs.filter(r=>r.rows&&r.rows.length).map(r=>Object.assign({},r,{dc:r.rows.filter(x=>normDec(x.dec)).length}));
  const seen=new Set(); const uniq=R.filter(r=>{ const k=r.fn+'|'+r.rows.length; if(seen.has(k)) return false; seen.add(k); return true; });
  const byWr={}; uniq.forEach(r=>{ const k=r.wr||('t:'+String(r.t||r.fn).toLowerCase().replace(/[\d_.\-]+/g,' ').replace(/\s+/g,' ').trim().slice(0,40)); (byWr[k]=byWr[k]||[]).push(r); });
  const ev=[];
  Object.entries(byWr).forEach(([wr,L])=>{ L.sort((a,b)=>a.d.localeCompare(b.d)); const decided=L.filter(r=>r.dc>=Math.max(1,r.rows.length*0.5));
    const keep=decided.filter((r,i)=>{ const n=decided[i+1]; if(!n) return true; const same=r.rows.map(nameOf).filter(Boolean), sn=new Set(n.rows.map(nameOf)); const ov=same.length?same.filter(x=>sn.has(x)).length/same.length:0; return !(days(r.d,n.d)<=150&&ov>=0.6); });
    keep.forEach((r,i)=>{ const subs=L.filter(x=>x.dc<x.rows.length*0.5&&x.d<=r.d); const sub=subs.length?subs[subs.length-1]:null;
      const S={}; if(sub) sub.rows.forEach(x=>{ if(x.item) S['i:'+x.item]=x; const nm=nameOf(x); if(nm) S['n:'+nm]=S['n:'+nm]||x; });
      const rows=r.rows.filter(x=>normDec(x.dec)).map(x=>{ const s=(x.item&&S['i:'+x.item]&&nameOf(S['i:'+x.item])===nameOf(x)?S['i:'+x.item]:null)||S['n:'+nameOf(x)]||null; const c={}; Object.keys(HDR).forEach(k=>{ const v=(s||x)[k]; if(v) c[k]=v; }); return {sub:c,paired:!!s,dec:normDec(x.dec),com:x.com||''}; });
      ev.push({wr:wr.startsWith('t:')?'':wr,fn:r.fn,d:r.d,y:+r.d.slice(0,4),F:Object.assign({},(sub&&sub.F)||{},r.F||{}),fmt:r.fmt,first:L[0].d,idx:i,resub:i>0||/IMSub[2-9]|resub/i.test(r.fn),rows}); }); });
  return ev.sort((a,b)=>a.d.localeCompare(b.d));
}

/* run the draft on one event; learning = rule stats from earlier events only */
function draftEvent(e,learn){ const b=B();
  const F=e.F||{}; const P={rows:e.rows.map((x,i)=>Object.assign({_row:i+2},x.sub,{item:x.sub.item||String(i+1)})),F};
  const x=fakeForm(P.rows,F); const res=b.rvImChecks(x,{t:null}); let fnd=res.out.filter(f=>f.item);
  try{ fnd=fnd.concat(b.rvRmChecks(res.P||P)); }catch(err){}
  fnd=fnd.filter(f=>!LEAKY.has(f.rule));
  b.S.iml=learn||{}; b.S.imauto={};
  const rows=b.imDraftRows(res.P&&res.P.rows&&res.P.rows.length===P.rows.length?res.P:P,fnd,null);
  return rows.map((r,i)=>({draft:r.draft.dec,rule:r.draft.rule||'',look:!!r.draft.look,kind:b.imKind(r),tt:String(r.tt||'').toLowerCase(),im:e.rows[i].dec,com:e.rows[i].com,paired:e.rows[i].paired}));
}

window.__btRun=function(recs){
  const ev=events(recs); const out={asOf:new Date().toISOString().slice(0,10),source:{files:recs.length,withRows:recs.filter(r=>r.rows&&r.rows.length).length,events:ev.length,rows:ev.reduce((s,e)=>s+e.rows.length,0)}};
  // ---- what IM decided, by year
  const ys=[...new Set(ev.map(e=>e.y))].sort();
  const appr={}; // per WR: the first event where nearly everything was approved
  const byWr={}; ev.forEach(e=>{ if(e.wr) (byWr[e.wr]=byWr[e.wr]||[]).push(e); });
  Object.values(byWr).forEach(L=>{ const a=L.find(e=>{ const ok=e.rows.filter(r=>/^Approved/.test(r.dec)).length; return ok>=e.rows.length*0.9; }); if(a) appr[a.wr]={y:a.y,days:days(L[0].first,a.d)}; });
  out.years=ys.map(y=>{ const E=ev.filter(e=>e.y===y), rows=E.flatMap(e=>e.rows); const dec={}; DEC.forEach(d=>dec[KEY[d]]=rows.filter(r=>r.dec===d).length);
    const wrs=new Set(E.map(e=>e.wr).filter(Boolean)); const resub=new Set(E.filter(e=>e.resub&&e.wr).map(e=>e.wr));
    const dd=Object.values(appr).filter(a=>a.y===y&&a.days>=0&&a.days<1500).map(a=>a.days);
    return {y,subs:E.length,wrs:wrs.size,resub:resub.size,rows:rows.length,dec,medDays:dd.length>=3?median(dd):null,nDays:dd.length}; });
  // ---- why IM changes rows
  const lastY=ys[ys.length-1]||0; const th={}; ev.forEach(e=>e.rows.forEach(r=>{ if(r.dec==='Approved as Submitted'||!r.com) return; const c=r.com.toLowerCase(); THEMES.forEach(([k,re])=>{ if(re.test(c)){ const t=th[k]=th[k]||{k,n:0,recent:0}; t.n++; if(e.y>=lastY-1) t.recent++; } }); }));
  out.themes=Object.values(th).sort((a,b)=>b.n-a.n);
  out.noComment=ev.reduce((s,e)=>s+e.rows.filter(r=>r.dec!=='Approved as Submitted'&&!r.com).length,0);
  // ---- by community of practice
  const cop={}; ev.forEach(e=>{ const k=String(e.F.cop||'').replace(/community of practice|\(.*?\)|cop$/ig,'').trim()||'Not given'; const c=cop[k]=cop[k]||{cop:k,subs:0,rows:0,as:0}; c.subs++; c.rows+=e.rows.length; c.as+=e.rows.filter(r=>r.dec==='Approved as Submitted').length; });
  out.cop=Object.values(cop).filter(c=>c.cop!=='Not given'||c.rows>0).sort((a,b)=>b.rows-a.rows);
  // ---- the draft, scored year by year with learning from earlier years only
  const learn={}; const scored=[];
  ys.forEach(y=>{ const E=ev.filter(e=>e.y===y); const before=Object.assign({},learn);
    E.forEach(e=>{ let rs; try{ rs=draftEvent(e,before); }catch(err){ return; } rs.forEach((r,i)=>{ r.y=y; r.wr=e.wr; scored.push(r); learn[e.d+'_'+e.wr+'_'+i]={rule:r.rule,kind:r.kind,final:r.im,draft:r.draft,agreed:r.im===r.draft}; }); }); });
  const S=scored.filter(r=>r.im!=='Withdrawn'&&r.im!=='Deferred');
  const isClean=r=>r.draft==='Approved as Submitted'&&!r.look;
  const D={rows:S.length,exact:S.filter(r=>r.im===r.draft).length,cleanRows:S.filter(isClean).length,cleanKept:S.filter(r=>isClean(r)&&r.im==='Approved as Submitted').length,lookRows:S.filter(r=>!isClean(r)).length,
    lookChanged:S.filter(r=>!isClean(r)&&r.im!=='Approved as Submitted').length,imChanged:S.filter(r=>r.im!=='Approved as Submitted').length,caught:S.filter(r=>!isClean(r)&&r.im!=='Approved as Submitted').length,excluded:scored.length-S.length,paired:S.filter(r=>r.paired).length};
  D.byYear=ys.map(y=>{ const L=S.filter(r=>r.y===y); return {y,n:L.length,agree:L.filter(r=>r.im===r.draft).length,cleanRows:L.filter(isClean).length,cleanKept:L.filter(r=>isClean(r)&&r.im==='Approved as Submitted').length,imChanged:L.filter(r=>r.im!=='Approved as Submitted').length,caught:L.filter(r=>!isClean(r)&&r.im!=='Approved as Submitted').length}; }).filter(x=>x.n);
  const bk={}; S.forEach(r=>{ const k=bk[r.kind]=bk[r.kind]||{kind:r.kind,n:0,agree:0}; k.n++; if(r.im===r.draft) k.agree++; }); D.byKind=Object.values(bk).sort((a,b)=>b.n-a.n);
  const br={}; S.forEach(r=>{ if(!r.rule) return; const k=br[r.rule]=br[r.rule]||{rule:r.rule,n:0,keep:0,agree:0}; k.n++; if(r.im==='Approved as Submitted') k.keep++; if(r.im===r.draft) k.agree++; }); D.byRule=Object.values(br).sort((a,b)=>b.n-a.n);
  const ms={}; S.filter(r=>r.im!==r.draft).forEach(r=>{ const k=r.im+' (draft said '+(r.draft==='Approved as Submitted'?'clean':r.draft.replace('Approved with Modification','modify').toLowerCase())+')'; ms[k]=(ms[k]||0)+1; }); D.misses=Object.entries(ms).map(([k,n])=>({k,n})).sort((a,b)=>b.n-a.n);
  out.draft=D;
  out._scored=scored; out._events=ev;
  return out;
};
})();
