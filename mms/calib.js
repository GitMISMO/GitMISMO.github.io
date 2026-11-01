(function(){
const S={mode:'calib',me:{name:''}}; const esc=s=>String(s==null?'':s); const fmt=s=>s; const stageDef=k=>({name:k});
/* ---------- MISMO boilerplate, word for word (How To - MISMO Work Product Boilerplate Language and Guidance, 04/30/2026) ---------- */
const RV_BOILER={"draft": ["©2026 Mortgage Industry Standards Maintenance Organization, Inc. All Rights Reserved.", "AUTHORIZED USAGE: This MISMO Product (as defined in MISMO’s 2018 Intellectual Property Rights Policy) is in a DRAFT status and usage is restricted to MISMO members and workgroup Participants (as defined in MISMO’s 2018 Intellectual Property Rights Policy) solely for the purpose of advancing development of this MISMO Product. Access by non-MISMO members who are not Participants is not authorized without written express consent from a member of MISMO Staff. If such access is authorized, non-MISMO members who are not Participants will then be subject to the limited usage terms stated here. For a current list of MISMO members see Member Directory | MISMO. Any other use of this MISMO Product, including implementation, is prohibited at this time. Should this MISMO Product proceed to final publication it will be published pursuant to MISMO’s 2018 Intellectual Property Rights Policy and usage terms will apply to all use of this MISMO Product at that time, including payment of applicable royalties.", "PATENT DISCLOSURE REQUEST. MISMO requests that organizations, person, or entities given access to this MISMO Product in DRAFT status provide in writing any patent and or patent applications or other intellectual property rights that might be infringed by an organization that uses or is compliant with this proposed MISMO Product. These disclosures can be sent to info@mismo.org at any time. Use of the IPR Disclosure Form is recommended. A separate and formal request for Participant patent disclosures under MISMO’s 2018 Intellectual Property Rights Policy will be made at the time of publication of this MISMO Product.", "PATENT DISCLAIMER. Attention is drawn to the possibility that some of the elements of this proposed MISMO Product may be the subject of third party patent rights. MISMO will not be held responsible for identifying any or all such patent rights."], "comment": ["©2026 Mortgage Industry Standards Maintenance Organization, Inc. All Rights Reserved.", "AUTHORIZED USAGE / PATENT DISCLOSURE REQUEST: This proposed MISMO Product (as defined in MISMO’s 2018 Intellectual Property Rights Policy) was published on [INSERT DATE] for the purpose of providing an opportunity for comment on the product as well as to afford Participants (as defined in MISMO’s 2018 Intellectual Property Rights Policy) who worked on this MISMO Product at least thirty (30) days’ notice prior to final release of the Product in order to review the product and disclose any applicable Patent Rights (as defined by MISMO’s 2018 Intellectual Property Rights Policy). Disclosures should be submitted using MISMO’s IPR Disclosure Form. Comments should be submitted to info@mismo.org.", "Any other use of this MISMO Product, including implementation, is prohibited at this time.", "At the conclusion of the IPR and Patent Review period, this MISMO Product will be published pursuant to MISMO’s 2018 Intellectual Property Rights Policy and usage terms will apply to all use of this MISMO Product at that time, including payment of applicable royalties.", "ADDITIONAL PATENT DISCLOSURE REQUEST: In addition, MISMO requests that any non-Participant organization that may have any patent and or patent applications, or other intellectual property rights, that might be infringed by an organization that uses or is compliant with this proposed MISMO Product disclose such patents, applications, or intellectual property rights at this time in writing using MISMO’s IPR Disclosure Form.", "PATENT DISCLAIMER. Attention is drawn to the possibility that some of the elements of this proposed MISMO Product may be the subject of third party patent rights. MISMO will not be held responsible for identifying any or all such patent rights."], "commercial-standard": ["©2026 Mortgage Industry Standards Maintenance Organization, Inc. All Rights Reserved.", "NOTE: The above copyright notice must be included in all copies of this MISMO Product and in any derivative works based on this MISMO Product that are produced by Distributor.", "AUTHORIZED COMMERCIAL USAGE: This MISMO Product (as defined in MISMO’s 2018 Intellectual Property Rights Policy) is subject to a commercial MISMO Product Distributor License (the “Distributor License”) and grants the licensee the right to use this Product in Commercial transactions in accordance with the terms of that license. Accordingly, the licensee may incorporate this Product, in whole or in part, into material that may be shared outside of the licensee and made available for sale. The applicable royalty fee for this MISMO Product is currently waived but when instituted will be as indicated on mismo.org. MISMO reserves the right to charge royalty fees upon expiration of any waiver. Following such expiration, any further usage of the MISMO Product will be contingent on payment of such fees.", "REQUIRED LEGAL NOTICES: Per Section 8 of the Distributor License, there are Legal Notices that must be included in all copies of this MISMO Product and in any derivative works based on this MISMO Product including any software applications developed by Distributor based upon this Product. For details, see Distributor Required Legal Notices.", "MISMO PRODUCT USER REGISTRY: Per Section 8 of the Distributor License, by downloading and using this MISMO Product, each Distributor agrees that, when providing any product or service to its customers or associated businesses that incorporates or utilizes the Product in any way, the Distributor will use commercially reasonable efforts to encourage recipients of such products to register with MISMO as a MISMO Product User.", "DISCLAIMERS. Attention is drawn to the possibility that some of the elements of this MISMO Product may be the subject of patent rights. MISMO will not be held responsible for identifying any or all such patent rights. This MISMO Product is subject to the MISMO Product Distributor License Disclaimer and is provided “as is” with no warranties of any kind."], "commercial-collateral": ["©2026 Mortgage Industry Standards Maintenance Organization, Inc. All Rights Reserved.", "NOTE: The above copyright notice must be included in all copies of this MISMO Product and in any derivative works based on this MISMO Product that are produced by Distributor.", "AUTHORIZED COMMERCIAL USAGE: This MISMO Product (as defined in MISMO’s 2018 Intellectual Property Rights Policy) is subject to a MISMO Product Distributor License (the “Distributor License) and grants the licensee the right to use this Product in Commercial transactions in accordance with the terms of that license. Accordingly, the licensee may incorporate this Product, in whole or in part, into material that may be shared outside of the licensee and made available for sale. The applicable royalty fee for this MISMO Product is currently waived but when instituted will be as indicated on mismo.org. MISMO reserves the right to charge royalty fees upon expiration of any waiver. Following such expiration, any further usage of the MISMO Product will be contingent on payment of such fees.", "REQUIRED LEGAL NOTICES: Per Section 8 of the Distributor License, there are Legal Notices that must be included in all copies of this MISMO Product and in any derivative works based on this MISMO Product including any software applications developed by Distributor based upon this Product. For details, see Distributor Required Legal Notices.", "In addition, per Section 2 of the Distributor License, all copies of the Collateral (as defined by MISMO’s 2018 Intellectual Property Rights Policy) and any derivative works must attribute all content taken from the original item of Collateral to MISMO and carry the following legend:", "“This work is intended for internal use only by the clients of ____________ [Insert Name of Distributor], a MISMO Collateral Licensee, and includes, in whole or in part, content from the [Insert Name of Collateral ____________________v. __, dated ____] published by the Mortgage Industry Standards Maintenance Organization, Inc. (“MISMO”). Your access through this work to the [name of Collateral], or parts thereof, does not convey to you any other rights to use, distribute, modify, reproduce, sell, sublicense, offer for sale, publish, or make derivative works of that MISMO product, or any portion of the product contained in this work. The right to make derivative works from any MISMO product is restricted by MISMO either to MISMO members and/or to those who pay the appropriate fee. Please contact MISMO for more information.”", "MISMO PRODUCT USER REGISTRY: Per Section 8 of the Distributor License, by downloading and using this MISMO Product, each Distributor agrees that, when providing any product or service to its customers or associated businesses that incorporates or utilizes the Product in any way, the Distributor will use commercially reasonable efforts to encourage recipients of such products to register with MISMO as a MISMO Product User.", "DISCLAIMERS: Attention is drawn to the possibility that some of the elements of this MISMO Product may be the subject of patent rights. MISMO will not be held responsible for identifying any or all such patent rights. This MISMO Product is subject to the MISMO Product Distributor License Disclaimer and is provided “as is” with no warranties of any kind."], "internal-collateral": ["©2026 Mortgage Industry Standards Maintenance Organization, Inc. All Rights Reserved.", "NOTE: The above copyright notice must be included in all copies of this MISMO Product and in any derivative works based on this MISMO Product that are produced by End User.", "AUTHORIZED INTERNAL USE ONLY: This MISMO Product (as defined in MISMO’s 2018 Intellectual Property Rights Policy) is subject to a MISMO Product End-User License and grants the licensee the right to use this Product for Internal Use Only in accordance with the terms of that license. Accordingly, this MISMO Product may be used for the development of material used for internal organizational purposes only and may not be shared, in whole or in part, outside of the licensee. The applicable royalty fee for this MISMO Product is currently waived but when instituted will be as indicated on mismo.org. MISMO reserves the right to charge royalty fees upon expiration of any waiver. Following such expiration, any further usage of the MISMO Product will be contingent on payment of such fees.", "REQUIRED LEGAL NOTICES: Per Section 7 of the End-User License, there are Legal Notices that must be included in all copies of this MISMO Product and in any derivative works based on this MISMO Product including any software applications developed by Distributor based upon this Product. For details, see End-User License Required Legal Notices.", "In addition, per Section 2 of the End-User License, all copies of the Collateral (as defined by MISMO’s 2018 Intellectual Property Rights Policy) and any derivative works must attribute all content taken from the original item of Collateral to MISMO and carry the following legend:", "“This work is intended for internal use only within ____________ [Insert Name of End-User’s organization], a MISMO Collateral Licensee, and includes, in whole or in part, content from the [Insert Name of Collateral ____________________v. __, dated ____] published by the Mortgage Industry Standards Maintenance Organization, Inc. (“MISMO”). Your access through this work to the [name of Collateral], or parts thereof, does not convey to you any other rights to use, distribute, modify, reproduce, sell, sublicense, offer for sale, publish, or make derivative works of that MISMO product, or any portion of the product contained in this work. The right to make derivative works from any MISMO product is restricted by MISMO either to MISMO members and/or to those who pay the appropriate fee. Please contact MISMO for more information.”", "DISCLAIMERS. Attention is drawn to the possibility that some of the elements of this MISMO Product may be the subject of patent rights. MISMO will not be held responsible for identifying any or all such patent rights. This MISMO Product is subject to the MISMO Product End-User License Disclaimer and is provided “as is” with no warranties of any kind."], "internal-standard": ["©2026 Mortgage Industry Standards Maintenance Organization, Inc. All Rights Reserved.", "NOTE: The above copyright notice must be included in all copies of this MISMO Product and in any derivative works based on this MISMO Product that are produced by End User.", "AUTHORIZED INTERNAL USE ONLY: This MISMO Product (as defined in MISMO’s 2018 Intellectual Property Rights Policy) is subject to a MISMO Product End-User License and grants the licensee the right to use this Product for Internal Use Only in accordance with the terms of that license. Accordingly, this MISMO Product may be used for the development of material used for internal organizational purposes only and may not be shared, in whole or in part, outside of the licensee. The applicable royalty fee for this MISMO Product is currently waived but when instituted will be as indicated on mismo.org. MISMO reserves the right to charge royalty fees upon expiration of any waiver. Following such expiration, any further usage of the MISMO Product will be contingent on payment of such fees.", "REQUIRED LEGAL NOTICES: Per Section 7 of the End-User License, there are Legal Notices that must be included in all copies of this MISMO Product and in any derivative works based on this MISMO Product including any software applications developed by Distributor based upon this Product. For details, see End-User License Required Legal Notices.", "DISCLAIMERS. Attention is drawn to the possibility that some of the elements of this MISMO Product may be the subject of patent rights. MISMO will not be held responsible for identifying any or all such patent rights. This MISMO Product is subject to the MISMO Product End-User License Disclaimer and is provided “as is” with no warranties of any kind."], "noncommercial-standard": ["©2026 Mortgage Industry Standards Maintenance Organization, Inc. All Rights Reserved.", "NOTE: The above copyright notice must be included in all copies of the MISMO Product and in any derivative works based on the MISMO Product that are produced by Distributor.", "AUTHORIZED NON-COMMERCIAL DISTRIBUTOR USAGE: This MISMO Product (as defined in MISMO’s 2018 Intellectual Property Rights Policy) is subject to a Non-Commercial MISMO Product Distributor License (the “Distributor License”) and grants the licensee the right to use this Product in Business to Business transactions in accordance with the terms of that license. Accordingly, the licensee may incorporate this Product, in whole or in part, into material that may be shared outside of the licensee if there is no resulting direct financial profit from the shared material. The applicable royalty fee for this MISMO Product is currently waived but when instituted will be as indicated on mismo.org. MISMO reserves the right to charge royalty fees upon expiration of any waiver. Following such expiration, any further usage of the MISMO Product will be contingent on payment of such fees.", "REQUIRED LEGAL NOTICES: Per Section 8 of the Distributor License, there are Legal Notices that must be included in all copies of this MISMO Product and in any derivative works based on this MISMO Product including any software applications developed by Distributor based upon this Product. For details, see Distributor Required Legal Notices.", "MISMO PRODUCT USER REGISTRY: Per Section 8 of the Distributor License, by downloading and using this MISMO Product, each Distributor agrees that, when providing any product or service to its customers or associated businesses that incorporates or utilizes the Product in any way, the Distributor will use commercially reasonable efforts to encourage recipients of such products to register with MISMO as a MISMO Product User.", "DISCLAIMERS. Attention is drawn to the possibility that some of the elements of this MISMO Product may be the subject of patent rights. MISMO will not be held responsible for identifying any or all such patent rights. This MISMO Product is subject to the MISMO Product Distributor License Disclaimer and is provided “as is” with no warranties of any kind."], "noncommercial-collateral": ["©2026 Mortgage Industry Standards Maintenance Organization, Inc. All Rights Reserved.", "NOTE: The above copyright notice must be included in all copies of this MISMO Product and in any derivative works based on this MISMO Product that are produced by Distributor.", "AUTHORIZED NON-COMMERCIAL DISTRIBUTOR USAGE: This MISMO Product (as defined in MISMO’s 2018 Intellectual Property Rights Policy) is subject to a Non-Commercial MISMO Product Distributor License (the “Distributor License”) and grants the licensee the right to use this Product in Business to Business transactions in accordance with the terms of that license. Accordingly, the licensee may incorporate this Product, in whole or in part, into material that may be shared outside of the licensee if there is no resulting direct financial profit from the shared material. The applicable royalty fee for this MISMO Product is currently waived but when instituted will be as indicated on mismo.org. MISMO reserves the right to charge royalty fees upon expiration of any waiver. Following such expiration, any further usage of the MISMO Product will be contingent on payment of such fees.", "REQUIRED LEGAL NOTICES: Per Section 8 of the Distributor License, there are Legal Notices that must be included in all copies of this MISMO Product and in any derivative works based on this MISMO Product including any software applications developed by Distributor based upon this Product. For details, see Distributor Required Legal Notices.", "In addition, per Section 2 of the Distributor License, all copies of the Collateral (as defined by MISMO’s 2018 Intellectual Property Rights Policy) and any derivative works must attribute all content taken from the original item of Collateral to MISMO and carry the following legend:", "“This work is intended for internal use only by the clients of ____________ [Insert Name of Distributor], a MISMO Collateral Licensee, and includes, in whole or in part, content from the [Insert Name of Collateral ____________________v. __, dated ____] published by the Mortgage Industry Standards Maintenance Organization, Inc. (“MISMO”). Your access through this work to the [name of Collateral], or parts thereof, does not convey to you any other rights to use, distribute, modify, reproduce, sell, sublicense, offer for sale, publish, or make derivative works of that MISMO product, or any portion of the product contained in this work. The right to make derivative works from any MISMO product is restricted by MISMO either to MISMO members and/or to those who pay the appropriate fee. Please contact MISMO for more information.”", "MISMO PRODUCT USER REGISTRY: Per Section 8 of the Distributor License, by downloading and using this MISMO Product, each Distributor agrees that, when providing any product or service to its customers or associated businesses that incorporates or utilizes the Product in any way, the Distributor will use commercially reasonable efforts to encourage recipients of such products to register with MISMO as a MISMO Product User.", "DISCLAIMERS: Attention is drawn to the possibility that some of the elements of this MISMO Product may be the subject of patent rights. MISMO will not be held responsible for identifying any or all such patent rights. This MISMO Product is subject to the MISMO Product Distributor License Disclaimer and is provided “as is” with no warranties of any kind."]};

/* =====================================================================
   Two separate reviews, each with its own report:
     1. Editor and Readiness Review: the work product itself (Word, Excel).
     2. IM Pre-Review: the IM Submission Form, row by row, the way IM reads it.
   Software checks the things that have one right answer (boilerplate word for
   word, copyright year, page numbers, merged cells, required columns,
   definition templates). Claude adds the editor's judgment. Neither one ever
   changes the work product: everything comes back as a report.
   Built from: MISMO Editor Process and Guidance (2023), Work Product
   Boilerplate Language and Guidance (04/30/2026), the IM/AWG Submission Form
   (July 2026), and 3,709 IM-decided rows in the IM library (2021-2026).
   ===================================================================== */

/* ---------- reading files in the browser (nothing is uploaded or stored) ---------- */
async function rvUnzip(buf){
  const u=new Uint8Array(buf), dv=new DataView(buf); let e=u.length-22;
  while(e>0&&dv.getUint32(e,true)!==0x06054b50) e--;
  if(e<=0) throw new Error('This file isn’t a Word or Excel file the review can open.');
  const n=dv.getUint16(e+10,true); let p=dv.getUint32(e+16,true); const files={};
  for(let i=0;i<n;i++){ const meth=dv.getUint16(p+10,true), csz=dv.getUint32(p+20,true), fnl=dv.getUint16(p+28,true), exl=dv.getUint16(p+30,true), cml=dv.getUint16(p+32,true), lho=dv.getUint32(p+42,true);
    files[new TextDecoder().decode(u.subarray(p+46,p+46+fnl))]={meth,csz,lho}; p+=46+fnl+exl+cml; }
  const get=async name=>{ const f=files[name]; if(!f) return null; const l=f.lho, a=l+30+dv.getUint16(l+26,true)+dv.getUint16(l+28,true); const data=u.subarray(a,a+f.csz);
    if(f.meth===0) return new TextDecoder().decode(data);
    return await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text(); };
  return {names:Object.keys(files),get};
}
const rvXml=s=>new DOMParser().parseFromString(s||'<x/>','application/xml');
const rvTags=(d,t)=>[...d.getElementsByTagName(t)];

async function rvReadDocx(buf){
  const z=await rvUnzip(buf); const doc=await z.get('word/document.xml'); if(!doc) throw new Error('No document text found.');
  const D=rvXml(doc);
  const paraText=p=>rvTags(p,'w:t').map(t=>t.textContent).join('');
  const paras=rvTags(D,'w:p').map(p=>{ const st=(p.getElementsByTagName('w:pStyle')[0]||{getAttribute:()=>''}).getAttribute('w:val')||''; return {t:paraText(p),style:st}; });
  const hf=[]; for(const n of z.names.filter(n=>/^word\/(header|footer)\d*\.xml$/.test(n))){ const x=await z.get(n); hf.push({kind:/header/.test(n)?'header':'footer',t:rvTags(rvXml(x),'w:p').map(paraText).join(' ').trim(),page:/PAGE/.test(x)}); }
  const com=await z.get('word/comments.xml');
  const fonts={}; (doc.match(/w:ascii="([^"]+)"/g)||[]).forEach(m=>{ const f=m.slice(9,-1); fonts[f]=(fonts[f]||0)+1; });
  const tocText=(()=>{ const i=doc.indexOf('TOC \\'); if(i<0) return null; const end=doc.indexOf('fldCharType="end"',i); return rvTags(rvXml('<r xmlns:w="w">'+doc.slice(i,end>0?end:i+40000).replace(/^[^<]*/,'')+'</r>'),'w:t').map(t=>t.textContent).join(' '); })();
  // accessibility: alt text on pictures, real heading styles, table header rows, link text, document title
  const pics=rvTags(D,'wp:docPr').map(d=>({name:d.getAttribute('name')||'',descr:(d.getAttribute('descr')||d.getAttribute('title')||'').trim(),deco:/decorative val="1"/.test(new XMLSerializer().serializeToString(d))}));
  const tbls=rvTags(D,'w:tbl').filter(t=>!t.parentNode||t.parentNode.nodeName!=='w:tc'); const tblNoHead=tbls.filter(t=>{ const tr=t.getElementsByTagName('w:tr')[0]; return tr&&!tr.getElementsByTagName('w:tblHeader').length&&t.getElementsByTagName('w:tr').length>3; }).length;
  const fakeHeads=rvTags(D,'w:p').filter(p=>{ const st=(p.getElementsByTagName('w:pStyle')[0]||{getAttribute:()=>''}).getAttribute('w:val')||''; if(/heading|title|toc|caption|list/i.test(st)) return false; const t=paraText(p).trim(); if(t.length<3||t.length>70||/[.:;,]$/.test(t)) return false; const runs=rvTags(p,'w:r').filter(r=>rvTags(r,'w:t').some(x=>x.textContent.trim())); return runs.length&&runs.every(r=>{ const b=r.getElementsByTagName('w:b')[0]; return b&&b.getAttribute('w:val')!=='0'&&b.getAttribute('w:val')!=='false'; })&&!(p.parentNode&&/w:tc/.test(p.parentNode.nodeName)); }).map(p=>paraText(p).trim());
  const links=rvTags(D,'w:hyperlink').map(h=>rvTags(h,'w:t').map(t=>t.textContent).join('').trim()).filter(Boolean);
  const core=await z.get('docProps/core.xml'); const docTitle=core?((core.match(/<dc:title>([^<]*)<\/dc:title>/)||[])[1]||'').trim():'';
  return {kind:'word',a11y:{pics,tables:tbls.length,tblNoHead,fakeHeads,links,docTitle},paras,hf,comments:com?(com.match(/<w:comment /g)||[]).length:0,ins:(doc.match(/<w:ins /g)||[]).length,del:(doc.match(/<w:del /g)||[]).length,fonts,
    images:z.names.filter(n=>/^word\/media\//.test(n)).length,toc:/TOC \\/.test(doc)||/docPartGallery w:val="Table of Contents"/.test(doc),tocText,titlePg:/<w:titlePg/.test(doc),
    text:paras.map(p=>p.t).join('\n')};
}
async function rvReadXlsx(buf){
  const z=await rvUnzip(buf); const ss=[];
  const sst=await z.get('xl/sharedStrings.xml'); if(sst) rvTags(rvXml(sst),'si').forEach(si=>ss.push(rvTags(si,'t').map(t=>t.textContent).join('')));
  const wb=rvXml(await z.get('xl/workbook.xml')), rels=rvXml(await z.get('xl/_rels/workbook.xml.rels')); const rmap={};
  rvTags(rels,'Relationship').forEach(r=>rmap[r.getAttribute('Id')]=r.getAttribute('Target'));
  const names=rvTags(wb,'definedName').map(d=>({name:d.getAttribute('name'),sheet:d.getAttribute('localSheetId'),v:d.textContent}));
  const stx=await z.get('xl/styles.xml'); const xfs=stx?rvTags(rvTags(rvXml(stx),'cellXfs')[0]||rvXml(''),'xf').map(x=>{ const a=x.getElementsByTagName('alignment')[0]; return {h:a&&a.getAttribute('horizontal')||'',v:a&&a.getAttribute('vertical')||'bottom',wrap:a&&a.getAttribute('wrapText')==='1'}; }):[];
  const sheets=[]; let idx=0;
  for(const s of rvTags(wb,'sheet')){ const path='xl/'+String(rmap[s.getAttribute('r:id')]||'').replace(/^\/?xl\//,''); const x=await z.get(path)||''; const d=rvXml(x);
    const rows=[]; let textCells=0, offAlign=0;
    rvTags(d,'row').forEach(r=>{ const row={}; rvTags(r,'c').forEach(c=>{ const col=c.getAttribute('r').replace(/\d+/g,''); const t=c.getAttribute('t'); const vv=c.getElementsByTagName('v')[0]; let v='';
      if(t==='s') v=vv?ss[+vv.textContent]||'':''; else if(t==='inlineStr') v=rvTags(c,'t').map(x=>x.textContent).join(''); else v=vv?vv.textContent:'';
      if(v!==''){ row[col]=v; if(t==='s'||t==='inlineStr'){ textCells++; const xf=xfs[+(c.getAttribute('s')||0)]||{}; if((xf.h&&xf.h!=='left'&&xf.h!=='general')||xf.v!=='top') offAlign++; } } });
      if(Object.keys(row).length) rows.push({n:+r.getAttribute('r'),c:row}); });
    const ps=d.getElementsByTagName('pageSetup')[0], hf=d.getElementsByTagName('headerFooter')[0], sv=d.getElementsByTagName('sheetView')[0];
    sheets.push({name:s.getAttribute('name'),state:s.getAttribute('state')||'visible',rows,merged:rvTags(d,'mergeCell').length,
      orientation:ps&&ps.getAttribute('orientation')||'',fit:!!(d.getElementsByTagName('fitToPage')[0]||(ps&&ps.getAttribute('fitToWidth'))),printArea:names.some(n=>/Print_Area/i.test(n.name)&&+n.sheet===idx),
      header:hf?rvTags(hf,'oddHeader').map(x=>x.textContent).join(' '):'',footer:hf?rvTags(hf,'oddFooter').map(x=>x.textContent).join(' '):'',zoom:sv&&sv.getAttribute('zoomScale')||'100',textCells,offAlign});
    idx++; }
  return {kind:'excel',sheets,text:sheets.map(s=>'## '+s.name+'\n'+s.rows.map(r=>Object.values(r.c).join(' | ')).join('\n')).join('\n\n')};
}
/* PDFs: text only (pdf.js), so layout checks that need Word's structure are skipped */
let rvPdfLib=null;
function rvLoadPdfJs(){ if(window.pdfjsLib) return Promise.resolve(window.pdfjsLib); if(rvPdfLib) return rvPdfLib;
  rvPdfLib=new Promise((res,rej)=>{ const s=document.createElement('script'); s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'; s.onload=()=>{ try{ window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; res(window.pdfjsLib); }catch(e){ rej(e); } }; s.onerror=()=>{ rvPdfLib=null; rej(new Error('The PDF reader couldn’t load. Save the PDF as Word and try again.')); }; document.head.appendChild(s); });
  return rvPdfLib; }
async function rvReadPdf(buf){
  const lib=await rvLoadPdfJs(); const doc=await lib.getDocument({data:new Uint8Array(buf)}).promise; const paras=[]; const pages=[];
  for(let i=1;i<=doc.numPages;i++){ const pg=await doc.getPage(i); const tc=await pg.getTextContent(); const lines=[]; let last=null;
    tc.items.forEach(it=>{ const y=Math.round(it.transform[5]), h=Math.abs(it.transform[3])||10; if(last&&Math.abs(last.y-y)<h*0.5){ last.t+=(last.t.endsWith(' ')||it.str.startsWith(' ')?'':' ')+it.str; } else { last={y,h,t:it.str}; lines.push(last); } });
    let cur=null; lines.forEach((l,k)=>{ const gap=k?Math.abs(lines[k-1].y-l.y):0; if(!cur||gap>l.h*1.6){ cur={t:l.t.trim(),style:'',page:i}; paras.push(cur); } else cur.t=(cur.t+' '+l.t.trim()).trim(); });
    pages.push({n:i,top:(lines[0]||{}).t||'',bottom:(lines[lines.length-1]||{}).t||''}); }
  const body=paras.filter(p=>p.t);
  const hfLines=pages.map(p=>p.bottom); const pageNums=pages.filter(p=>/^\s*(page\s*)?\d+(\s*of\s*\d+)?\s*$|\b\d+\s*$/i.test(p.bottom)).length;
  return {kind:'pdf',paras:body,pages:pages.length,pageNums,hf:[{kind:'header',t:pages.map(p=>p.top).join(' '),page:false},{kind:'footer',t:hfLines.join(' '),page:pageNums>=Math.max(1,pages.length-1)}],text:body.map(p=>p.t).join('\n')};
}
async function rvReadFile(f){
  const buf=await f.arrayBuffer(), ext=(f.name.split('.').pop()||'').toLowerCase();
  if(ext==='pdf') return Object.assign(await rvReadPdf(buf),{name:f.name});
  if(ext==='docx') return Object.assign(await rvReadDocx(buf),{name:f.name});
  if(ext==='xlsx'||ext==='xlsm') return Object.assign(await rvReadXlsx(buf),{name:f.name});
  if(ext==='txt'||ext==='md'||ext==='csv') return {kind:'text',name:f.name,text:await f.text()};
  throw new Error(f.name+': the review reads Word (.docx), Excel (.xlsx) and PDF files.');
}

/* ---------- small text helpers ---------- */
const rvNorm=s=>String(s||'').replace(/[\u2018\u2019]/g,"'").replace(/[\u201C\u201D]/g,'"').replace(/[\u2013\u2014]/g,'-').replace(/\u00a0/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
const rvWords=s=>rvNorm(s).replace(/[^a-z0-9' ]/g,' ').split(' ').filter(Boolean);
function rvSim(a,b){ const A=new Set(rvWords(a)), B=new Set(rvWords(b)); if(!A.size||!B.size) return 0; let n=0; A.forEach(w=>{ if(B.has(w)) n++; }); return n/Math.max(A.size,B.size); }
function rvWordDiff(expected,actual){ const A=rvWords(actual), E=rvWords(expected); const a=new Set(A), e=new Set(E); return {missing:[...new Set(E.filter(w=>!a.has(w)))].slice(0,12),extra:[...new Set(A.filter(w=>!e.has(w)))].slice(0,12)}; }
const RV_YEAR=()=>String(new Date().getFullYear());
const rvQ=s=>'“'+String(s||'').replace(/\s+/g,' ').trim().slice(0,90)+(String(s||'').length>90?'…':'')+'”';

/* ---------- which boilerplate this work request needs now ---------- */
const RV_BP_LABEL={draft:'DRAFT','comment':'IPR/COMMENT PERIOD','commercial-standard':'Commercial Distributor – Standard','commercial-collateral':'Commercial Distributor – Collateral','internal-standard':'Internal Use Only – Standard','internal-collateral':'Internal Use Only – Collateral','noncommercial-standard':'Non-Commercial Distributor – Standard','noncommercial-collateral':'Non-Commercial Distributor – Collateral'};
function rvExpectedBoiler(t){
  const ci=stageIndex('comment'), si=stageIndex(t.stage);
  if(ci<0||si<0||si<ci) return 'draft';
  if(t.stage==='comment'||(t.stage==='gc-comment')) return 'comment';
  const ds=t.designation||{}, lic=String(ds.license||'').toLowerCase(), cls=String(t.classification||(typeof recommend==='function'?(recommend(t)||{}).classification:'')||'').toLowerCase().includes('standard')?'standard':'collateral';
  const l=/non/.test(lic)?'noncommercial':/internal/.test(lic)?'internal':/commercial/.test(lic)?'commercial':'';
  return l?l+'-'+cls:'comment';
}
function rvDetectBoiler(text){
  let best=null, bs=0; const T=rvNorm(text);
  Object.entries(RV_BOILER).forEach(([k,ps])=>{ const key=ps.slice(1).map(p=>rvNorm(p).slice(0,60)); const hits=key.filter(x=>T.includes(x)).length/key.length; if(hits>bs){ bs=hits; best=k; } });
  return bs>=0.34?best:null;
}

/* ---------- 1. Editor and Readiness: the checks software can settle ---------- */
const RV_STANCE=/\bMISMO (strongly )?(believes|thinks|feels|recommends|requires|mandates|expects|insists)\b|\bthe industry should\b|\bmust be used\b|\bis required to use\b|\bshall be used\b/gi;
const RV_ACR_OK=new Set(['MISMO','US','USA','LLC','INC','NOTE','DRAFT','FINAL','OK','ID','TBD','N/A','FAQ','PDF','URL','I','II','III','IV','V','VI','VII','VIII','IX','X','A','AN']);
const RV_TM=[['MERS','MERS®'],['MISMO','MISMO®'],['SMART Doc','SMART Doc®'],['eNote','—']];
function rvEditorChecks(files,ctx){
  const out=[]; const add=(sev,area,issue,suggestion,where,rule)=>out.push({sev,area,issue,suggestion:suggestion||'',where:where||'',rule:rule||'',src:'check'});
  const exp=ctx.boiler, year=RV_YEAR();
  files.forEach(f=>{
    const W=f.name;
    if(f.kind==='word'||f.kind==='pdf'){ const isW=f.kind==='word';
      const body=f.paras.filter(p=>p.t.trim());
      const text=f.text; const found=rvDetectBoiler(text+' '+f.hf.map(h=>h.t).join(' '));
      // boilerplate: right one, word for word
      if(!found) add('fix','Boilerplate','No MISMO boilerplate language was found.','Add the '+RV_BP_LABEL[exp]+' language up front (How To - MISMO Work Product Boilerplate Language and Guidance).',W,'boiler-missing');
      else if(found!==exp) add('fix','Boilerplate','Has the '+RV_BP_LABEL[found]+' language, but this stage needs the '+RV_BP_LABEL[exp]+' language.','Replace it with the '+RV_BP_LABEL[exp]+' language exactly as written in the Boilerplate Guidance.',W,'boiler-wrong');
      const ref=RV_BOILER[found&&found!==exp?exp:exp]||[];
      if(found===exp) ref.slice(1).forEach(p=>{ const want=rvNorm(p); if(rvNorm(text).includes(want.slice(0,Math.min(want.length,400)))) return;
        let best='', bs=0; body.forEach(x=>{ const s=rvSim(p,x.t); if(s>bs){ bs=s; best=x.t; } });
        const head=p.split(/[.:]/)[0].slice(0,60);
        if(bs<0.5) add('fix','Boilerplate','The paragraph beginning '+rvQ(head)+' is missing.','Add it word for word from the Boilerplate Guidance.',W,'boiler-para');
        else { const d=rvWordDiff(p,best); add('fix','Boilerplate','The paragraph beginning '+rvQ(head)+' doesn’t match the approved wording.',(d.missing.length?'Missing words: '+d.missing.join(', ')+'. ':'')+(d.extra.length?'Words not in the approved text: '+d.extra.join(', ')+'. ':'')+'Copy the paragraph exactly from the Boilerplate Guidance; don’t edit legal language.',rvQ(best),'boiler-wording'); } });
      if(found==='comment'&&/\[insert date\]/i.test(text)) add('fix','Boilerplate','The comment period publish date is still “[INSERT DATE]”.','Fill in the date it publishes for comment (MISMO staff confirm the date).',W,'boiler-date');
      if(body.some(p=>/^(draft|comment period)$/i.test(p.t.trim()))) add('recommend','Boilerplate','A heading names the type of boilerplate (for example “DRAFT”).','The guidance says not to add a heading for the boilerplate type.',W,'boiler-heading');
      // copyright
      const cp=(text+' '+f.hf.map(h=>h.t).join(' ')).match(/©\s?(\d{4})\s*Mortgage Industry Standards Maintenance Organization/gi)||[];
      const years=[...new Set(cp.map(x=>x.match(/\d{4}/)[0]))];
      if(!cp.length) add('fix','Copyright','No MISMO copyright line was found.','Add “©'+year+' Mortgage Industry Standards Maintenance Organization, Inc. All Rights Reserved.” to the footer so it shows on every page.',W,'cp-missing');
      else if(years.some(y=>y!==year)) add('fix','Copyright','The copyright year is '+years.join(' and ')+'.','Work products not yet published use the current year: ©'+year+'.',W,'cp-year');
      if(isW&&cp.length&&!f.hf.some(h=>h.kind==='footer'&&/©|copyright/i.test(h.t))) add('fix','Copyright','The copyright isn’t in the footer, so it won’t show on every page.','Put the copyright line in the footer.',W,'cp-footer');
      // headers, footers, page numbers, title
      if(!f.hf.some(h=>h.kind==='footer'&&h.page)) add('fix','Header and Footer','No page numbers were found in the footer.','Add page numbers to every page except the title page.',W,'pg');
      else if(isW&&!f.titlePg) add('recommend','Header and Footer','The title page may be showing a page number.','Turn on “Different First Page” so the title page has no number.',W,'pg-title');
      const hfText=f.hf.map(h=>h.t).join(' ');
      if(!/(v(ersion)?\s?\d|\b(january|february|march|april|may|june|july|august|september|october|november|december)\b|\d{1,2}\/\d{1,2}\/\d{2,4}|\b20\d\d\b)/i.test(hfText.replace(/©\s?\d{4}/g,''))) add('recommend','Header and Footer','The header and footer don’t show a version date or version number.','Show the title, version date, version number (if used) and page number in the header or footer.',W,'hf-version');
      // TOC
      if(f.toc&&f.tocText){ const heads=body.filter(p=>/^heading ?[12]$|^Heading[12]$/i.test(p.style)&&p.t.trim().length>2).map(p=>p.t.trim()); const tocN=rvNorm(f.tocText); const miss=heads.filter(h=>!tocN.includes(rvNorm(h).slice(0,40)));
        if(miss.length) add('fix','Table of Contents','The table of contents is out of date: '+miss.length+' heading'+(miss.length===1?' isn’t':'s aren’t')+' in it (for example '+rvQ(miss[0])+').','Right-click the table of contents and choose Update Field → Update entire table.',W,'toc-stale'); }
      // left-in markup
      const redline=/redline|track|markup|compare/i.test(W);
      if(f.ins+f.del>0&&!redline) add('fix','Clean Copy','Tracked changes are still in the document ('+(f.ins+f.del)+').','Accept or reject all changes before submitting (or name the file as the redline if that’s intended).',W,'tracked');
      if(f.comments>0&&!redline) add('fix','Clean Copy',f.comments+' comment'+(f.comments===1?' is':'s are')+' still in the document.','Resolve and delete comments before submitting.',W,'comments');
      // fonts
      const fl=Object.keys(f.fonts||{}).filter(x=>!/symbol|wingdings|cambria math/i.test(x));
      if(fl.length>2) add('recommend','Formatting','Uses '+fl.length+' fonts: '+fl.slice(0,6).join(', ')+'.','Use the template’s font throughout, unless a different font is intentional (a title or a feature).',W,'fonts');
      // logo
      if(isW&&!f.images) add('question','Branding','No images were found, so the MISMO logo may be missing.','Is the current MISMO logo on the title page? (MISMO Logos)',W,'logo');
      // stance and trademarks
      const st=[]; body.forEach(p=>{ (p.t.match(RV_STANCE)||[]).forEach(m=>st.push([m,p.t])); });
      st.slice(0,6).forEach(([m,p])=>add('recommend','MISMO Voice','MISMO doesn’t mandate or advocate: '+rvQ(m)+'.','Reword so the document describes rather than directs (for example “Implementers may…” or “The standard supports…”).',rvQ(p),'stance'));
      const nb=body.filter(p=>!RV_BOILER.draft.concat(RV_BOILER.comment).some(b=>rvSim(b,p.t)>0.6));
      const bodyT=nb.map(p=>p.t).join('\n');
      if(/\bMISMO\b/.test(bodyT)&&!/MISMO®/.test(text)) add('recommend','Trademarks','“MISMO” never appears with ®.','Use MISMO® at least at the first mention in the body (per the MISMO Style Sheet).',W,'tm-mismo');
      if(/\bMERS\b(?!®)/.test(bodyT)&&!/MERS®/.test(bodyT)) add('fix','Trademarks','“MERS” appears without ®.','Use MERS® (a registered trademark of MERSCORP Holdings).',W,'tm-mers');
      // acronyms defined at first use
      const firstUse={}, defAt={}; let pos=0;
      nb.forEach(p=>{ const s=p.t; if(s===s.toUpperCase()&&s.length<80) { pos+=s.length; return; }
        (s.match(/\b[A-Z][A-Z0-9&]{1,6}s?\b/g)||[]).forEach(a=>{ const k=a.replace(/s$/,''); if(RV_ACR_OK.has(k)||/^\d/.test(k)) return; if(firstUse[k]==null) firstUse[k]={pos:pos+s.indexOf(a),p:s}; });
        (s.match(/\(([A-Z][A-Z0-9&]{1,6})s?\)/g)||[]).forEach(m=>{ const k=m.replace(/[()]/g,'').replace(/s$/,''); if(defAt[k]==null) defAt[k]=pos+s.indexOf(m); });
        pos+=s.length; });
      const never=[], late=[]; Object.entries(firstUse).forEach(([k,u])=>{ if(defAt[k]==null) never.push(k); else if(defAt[k]>u.pos+60) late.push(k); });
      if(late.length) add('fix','Acronyms','Defined after their first use: '+late.slice(0,12).join(', ')+'.','Spell each one out the first time it’s used, followed by the acronym in parentheses.',W,'acr-late');
      if(never.length){ const ex=never.map(a=>[a,rvExpand(a)]).filter(x=>x[1]).slice(0,8); add('recommend','Acronyms','Never spelled out: '+never.slice(0,16).join(', ')+(never.length>16?' and '+(never.length-16)+' more':'')+'.',ex.length?'Spell each out at first use, for example '+ex.map(([a,d])=>d+' ('+a+')').join('; ')+'.':'Spell out each acronym at first use, e.g. “government-sponsored enterprise (GSE)”.',W,'acr-never'); }
      // MISMO terms and product names
      rvTermChecks(bodyT,W,add);
      // accessibility (Word only: PDFs don’t carry this reliably)
      if(isW&&f.a11y){ const A=f.a11y; const noAlt=A.pics.filter(x=>!x.descr&&!x.deco);
        if(noAlt.length) add('fix','Accessibility',noAlt.length+' picture'+(noAlt.length===1?' has':'s have')+' no alt text'+(noAlt[0].name?' (for example '+rvQ(noAlt[0].name)+')':'')+'.','Right-click each picture → View Alt Text, and describe it (or mark it decorative). Screen readers read this text.',W,'a11y-alt');
        if(A.fakeHeads.length>=3) add('recommend','Accessibility',A.fakeHeads.length+' headings are bold text instead of heading styles (for example '+rvQ(A.fakeHeads[0])+').','Apply Heading 1, 2 or 3 so screen readers, the navigation pane and the table of contents see them.',W,'a11y-headings');
        if(A.tblNoHead) add('recommend','Accessibility',A.tblNoHead+' table'+(A.tblNoHead===1?'':'s')+' don’t mark a header row.','Select the first row → Table Properties → Row → “Repeat as header row at the top of each page”. Screen readers use it to name columns.',W,'a11y-table');
        const vague=A.links.filter(l=>/^(click here|here|link|this link|read more|more)$/i.test(l)||/^https?:\/\//i.test(l)); if(vague.length) add('recommend','Accessibility','Link text doesn’t say where it goes: '+vague.slice(0,3).map(rvQ).join(', ')+'.','Use descriptive link text, for example “MISMO Engineering Guidelines” instead of “click here” or a bare web address.',W,'a11y-links');
        if(!A.docTitle) add('recommend','Accessibility','The document has no title in its properties.','File → Info → Title: add the work product name (screen readers and PDF exports show it).',W,'a11y-title'); }
      // obvious typing slips
      const dbl=bodyT.match(/\b(\w+)\s+\1\b/gi)||[]; const dup=[...new Set(dbl.filter(x=>!/^(that that|had had)$/i.test(x)))];
      if(dup.length) add('fix','Spelling and Grammar','Repeated words: '+dup.slice(0,6).map(rvQ).join(', ')+'.','Remove the repeated word.',W,'dup-word');
      const ph=bodyT.match(/\b(TBD|TODO|TK|XXX+|lorem ipsum)\b|\[insert[^\]]*\]/gi)||[];
      if(ph.length) add('fix','Readiness','Placeholders are still in the text: '+[...new Set(ph)].slice(0,6).join(', ')+'.','Fill in or remove every placeholder before submitting.',W,'placeholder');
      if(/ {2,}\S/.test(bodyT)) add('recommend','Formatting','Some sentences have double spaces.','Use single spaces between words and sentences.',W,'dbl-space');
    }
    if(f.kind==='excel'){
      const S=f.sheets.filter(s=>s.state==='visible');
      const merged=S.filter(s=>s.merged>0); if(merged.length) add('fix','Excel Setup','Merged cells on '+merged.map(s=>s.name+' ('+s.merged+')').join(', ')+'.','Don’t use merged cells (they break sorting and filtering).',W,'xl-merged');
      const unnum=S.filter(s=>!/^\s*\d/.test(s.name)); if(unnum.length) add('recommend','Excel Setup','Tabs aren’t numbered: '+unnum.slice(0,6).map(s=>s.name).join(', ')+(unnum.length>6?'…':'')+'.','Number the tabs (for example “1. Overview”, “2. Mapping”).',W,'xl-tabnum');
      if(!S.some(s=>/read ?me|overview|instruction|about|description|introduction|contents|cover|notes|purpose/i.test(s.name))) add('recommend','Excel Setup','No tab describes what’s in the workbook.','Add a first tab that describes each worksheet.',W,'xl-describe');
      const off=S.filter(s=>s.textCells>10&&s.offAlign/s.textCells>0.25); if(off.length) add('recommend','Excel Setup','Text isn’t left- and top-aligned on '+off.map(s=>s.name).slice(0,5).join(', ')+'.','Set text to left and top alignment.',W,'xl-align');
      const noPrint=S.filter(s=>!s.orientation&&!s.fit&&!s.printArea); if(noPrint.length) add('recommend','Excel Setup','Not set up to print: '+noPrint.map(s=>s.name).slice(0,6).join(', ')+'.','Set the print area, orientation and fit-to-page where content allows.',W,'xl-print');
      const yr=RV_YEAR(); const bpSheet=S.find(s=>rvDetectBoiler(s.rows.map(r=>Object.values(r.c).join(' ')).join(' ')));
      if(!bpSheet) add('fix','Boilerplate','No tab carries the MISMO boilerplate language.','Put the '+RV_BP_LABEL[ctx.boiler]+' language on its own tab (Excel) up front.',W,'xl-boiler');
      else { const k=rvDetectBoiler(bpSheet.rows.map(r=>Object.values(r.c).join(' ')).join(' ')); if(k!==ctx.boiler) add('fix','Boilerplate','The “'+bpSheet.name+'” tab has the '+RV_BP_LABEL[k]+' language; this stage needs '+RV_BP_LABEL[ctx.boiler]+'.','Replace it with the right language from the Boilerplate Guidance.',W,'xl-boiler-wrong'); }
      const noCp=S.filter(s=>!/©|copyright/i.test(s.footer)&&!(s.rows.some(r=>Object.values(r.c).some(v=>/©\s?\d{4}\s*Mortgage/i.test(v))))); if(noCp.length) add('fix','Copyright','No copyright in the printed footer of: '+noCp.map(s=>s.name).slice(0,6).join(', ')+'.','Add “©'+yr+' Mortgage Industry Standards Maintenance Organization, Inc. All rights reserved.” to each sheet’s footer (Page Layout → Header & Footer).',W,'xl-cp');
      const oldCp=S.filter(s=>{ const m=(s.footer+' '+s.rows.map(r=>Object.values(r.c).join(' ')).join(' ')).match(/©\s?(\d{4})/); return m&&m[1]!==yr; }); if(oldCp.length) add('fix','Copyright','Copyright year isn’t '+yr+' on: '+oldCp.map(s=>s.name).slice(0,6).join(', ')+'.','Update the copyright year to '+yr+'.',W,'xl-cp-year');
      const noHead=S.filter(s=>!s.header.trim()&&!/cover|title/i.test(s.name)); if(noHead.length) add('recommend','Excel Setup','No printed header with the title on: '+noHead.map(s=>s.name).slice(0,6).join(', ')+'.','Print the artifact title in each sheet’s header (except a cover page that already has it).',W,'xl-header');
      const zooms=[...new Set(S.map(s=>s.zoom))]; if(zooms.length>1) add('recommend','Excel Setup','Tabs are saved at different zoom levels ('+zooms.join('%, ')+'%).','Save every tab at the same zoom.',W,'xl-zoom');
      rvTermChecks(f.text,W,add);
      const hid=f.sheets.filter(s=>s.state!=='visible'); if(hid.length) add('question','Excel Setup','Hidden tabs: '+hid.map(s=>s.name).join(', ')+'.','Should these be published, removed, or left hidden?',W,'xl-hidden');
    }
  });
  return out;
}

/* ---------- 2. IM Pre-Review: the checks software can settle ---------- */
const RV_TEMPLATES={Amount:/^the\b.*\b(amount|sum)\b/i,Count:/^the\b.*\bnumber of\b/i,Date:/^the date\b/i,Datetime:/^the date and time\b/i,Day:/^the day of the month\b/i,Description:/^a free-form text field\b/i,Identifier:/^an? unique alphanumeric string\b/i,Indicator:/^when true, indicates\b/i,Month:/^the month\b/i,Name:/^an unstructured name\b/i,Number:/^a numeric value\b/i,Percent:/^a portion of 100\b/i,Rate:/^a decimal value\b/i,Text:/^a free-form alphanumeric string\b/i,Time:/^the time of day\b/i,Type:/^a value from a mismo prescribed list\b/i,Value:/^the specific value of\b/i,Year:/^the calendar year\b/i,Code:/^an? .*(enumerated|coded) value\b/i};
const RV_TEMPLATE_TEXT={Amount:'The [qualifier] amount of [thing]…',Count:'The [qualifier] number of [thing counted]…',Date:'The date [event or action]…',Datetime:'The date and time [event or action]…',Day:'The day of the month [event]…',Description:'A free-form text field describing [thing]…',Identifier:'A unique alphanumeric string identifying [thing]…',Indicator:'When true, indicates [positive situation]…',Month:'The month in a year that [event]…',Name:'An unstructured name that identifies [person, entity, place or thing]…',Number:'A numeric value that specifies [thing]…',Percent:'A portion of 100 that represents [usage or calculation]…',Rate:'A decimal value representing a fraction of one…',Text:'A free-form alphanumeric string which contains [thing]…',Time:'The time of day [event]…',Type:'A value from a MISMO prescribed list that represents [thing enumerated]…',Value:'The specific value of [thing]…',Year:'The calendar year [event]…',Code:'An [length] enumerated or coded value identifying [thing]…'};
const RV_ABBR=/\b(amt|nbr|num|pct|info|desc|dt|ind|qty|acct|mgmt|condo|govt|dept|addr|tel|ph|cnt|yr|mo)\b/i;
const RV_FACE=[['wr','Work Request ID'],['name','Submission Name'],['cop','Primary Community of Practice'],['parent','Parent Community of Practice'],['parentOk','Parent CoP Approval'],['social','Socialized with Other Workgroups'],['chairs','Work Group Chair'],['facs','Work Group Facilitator'],['priority','Change Priority Category'],['category','Submission Category'],['summary','Submission Summary'],['files','Artifact File'],['artifacts','Artifacts are'],['size','Expected Package Review Size'],['ndocs','Number of Documents']];
// which fields each Change Type + Change Target Type needs (from the form's own instructions tab)
const RV_NEED={'add and define':{acronym:['dt','def','ac'],attribute:['at','dt','def'],container:['xp','pc','cn','dt','def'],'data point':['pc','dp','dt','def'],enumeration:['dp','en','dt','def'],relationship:['dt','def']},
  'deprecate':{acronym:['ac'],attribute:['at'],container:['pc','cn'],'data point':['pc','dp'],enumeration:['dp','en']},
  'modify definition':{acronym:['old','dt','def','ac'],attribute:['old','dt','def'],container:['old','cn','dt','def'],'data point':['old','dp','dt','def'],enumeration:['old','en','dt','def']},
  'move':{container:['old','pc','cn'],'data point':['old','pc','cn','dp']},'rename':{acronym:['old','ac'],attribute:['old','at'],container:['old','cn'],'data point':['old','dp'],enumeration:['old','dp','en']},
  'reuse':{container:['pc','cn'],'data point':['pc','dp']}};
const RV_FIELD={item:'Item #',xp:'XPATH',pc:'Parent CONTAINER Name',cn:'CONTAINER Name',dp:'Data Point Name',at:'Attribute Name',en:'Enumeration Name',dt:'Definition Type',def:'Definition',ac:'Acronym Name',old:'Original/Old Value',ct:'Change Type',tt:'Change Target Type'};
function rvColMap(hdr){ const m={}; Object.entries(hdr).forEach(([k,v])=>{ const s=String(v).toLowerCase().replace(/\s+/g,' ').trim();
  if(/review decision/.test(s)) m.dec=k; else if(/review comments/.test(s)) m.com=k; else if(/^item/.test(s)) m.item=k; else if(/^change type/.test(s)) m.ct=k; else if(/change target type/.test(s)) m.tt=k; else if(/original\/old value/.test(s)) m.old=k; else if(/xpath/.test(s)) m.xp=k; else if(/^parent container/.test(s)) m.pc=k; else if(/^container name/.test(s)) m.cn=k; else if(/^alias container/.test(s)) m.alias=k; else if(/^data point name/.test(s)) m.dp=k; else if(/^attribute name/.test(s)) m.at=k; else if(/enumeration name/.test(s)) m.en=k; else if(/definition type template/.test(s)) m.dtt=k; else if(/^definition type/.test(s)) m.dt=k; else if(/^definition$/.test(s)) m.def=k; else if(/^acronym/.test(s)) m.ac=k; else if(/verb phrase/.test(s)) m.vp=k; else if(/submitter comments/.test(s)) m.sc=k; }); return m; }
function rvParseForm(x){
  const face=x.sheets.find(s=>/^face page$/i.test(s.name.trim()));
  const rm=x.sheets.find(s=>/^reference model changes$/i.test(s.name.trim()));
  const ps=x.sheets.find(s=>/^proposed structure$/i.test(s.name.trim()));
  const F={}; if(face) face.rows.forEach(r=>{ const cells=Object.entries(r.c).sort((a,b)=>a[0].length-b[0].length||a[0].localeCompare(b[0])); if(!cells.length) return; const label=String(cells[0][1]); const val=cells.slice(1).map(c=>c[1]).filter(v=>!/^(mm\/dd\/yyyy|select|choose)/i.test(String(v))).join(' ').trim();
    RV_FACE.forEach(([k,l])=>{ if(F[k]==null&&label.toLowerCase().startsWith(l.toLowerCase())) F[k]=val; });
    if(/^resubmission date/i.test(label)) F.resubDate=val; if(/^resubmission number/i.test(label)) F.resubN=val; if(/^resubmission reason:?$/i.test(label.trim())) F.resubWhy=val; if(/reference model changes:\s*number of rows/i.test(label)) F.rmRows=val; });
  let rows=[]; if(rm){ const h=rm.rows.find(r=>Object.values(r.c).some(v=>/change type/i.test(v))); if(h){ const m=rvColMap(h.c); rows=rm.rows.filter(r=>r.n>h.n).map(r=>{ const o={_row:r.n}; for(const k in m){ const v=r.c[m[k]]; if(v!=null&&String(v).trim()!==''&&!/^#N\/A$/.test(String(v).trim())) o[k]=String(v).trim(); } return o; }).filter(o=>o.ct||o.tt||o.def||o.dp||o.en||o.cn); } }
  const psFilled=ps?ps.rows.filter(r=>Object.values(r.c).some(v=>/^[A-Z][A-Z0-9_]{3,}$/.test(String(v).trim()))).length:0;
  return {F,rows,hasFace:!!face,hasRM:!!rm,psFilled,hasPS:!!ps};
}
function rvImChecks(file,ctx){
  const out=[]; const add=(sev,area,issue,suggestion,where,rule,item)=>out.push({sev,area,issue,suggestion:suggestion||'',where:where||'',rule:rule||'',item:item||'',src:'check'});
  const P=rvParseForm(file), W=file.name;
  if(!P.hasFace||!P.hasRM){ add('fix','Submission Form','This doesn’t look like the IM/AWG Submission Form (no '+(!P.hasFace?'Face Page':'Reference Model Changes')+' tab).','Use the current MISMO Submission Review Form (July 2026) from the IM community page.',W,'form'); return {out,P}; }
  // file name
  if(!/^(IM|AWG)Sub\d*_WR\d{4}[._]\d{1,2}_.+_\d{6}/i.test(W.replace(/\.xls[xm]$/i,''))) add('recommend','Submission Form','The file name doesn’t follow the IM naming convention.','Name it IMSub_WR#_SubmissionName_MMDDYY (IMSub2_… for a resubmission). Example: IMSub_WR2024.99_iLAD v3.01_052324.',W,'filename');
  // face page
  const miss=RV_FACE.filter(([k])=>!P.F[k]).map(([,l])=>l); if(miss.length) add('fix','Face Page','Required fields are empty: '+miss.join('; ')+'.','Fill in every yellow field on the Face Page.','Face Page','face');
  if(P.F.wr&&ctx.t&&!new RegExp(String(ctx.t.wr||'').replace(/^WR/,'').replace(/[_.]/,'[_.]')).test(P.F.wr)) add('fix','Face Page','The Work Request ID says '+rvQ(P.F.wr)+', but this is '+ctx.t.wr+'.','Correct the Work Request ID.','Face Page','face-wr');
  const isResub=/IMSub[2-9]|resub/i.test(W)||!!P.F.resubDate; if(isResub&&!(P.F.resubDate&&P.F.resubN&&P.F.resubWhy)) add('fix','Face Page','This is a resubmission, but the resubmission date, number or reason is blank.','Fill in rows 13–16 (the green rows) on the Face Page.','Face Page','face-resub');
  if(P.F.rmRows&&+P.F.rmRows&&Math.abs(+P.F.rmRows-P.rows.length)>0) add('recommend','Face Page','The Face Page says '+P.F.rmRows+' Reference Model rows; the tab has '+P.rows.length+'.','Update the row count so IM sizes the review correctly.','Face Page','face-count');
  if(/^(no|n)$/i.test(String(P.F.parentOk||''))) add('question','Face Page','Parent CoP approval is marked No.','Has the parent CoP accepted this submission?','Face Page','face-parent');
  // rows
  const seen={}; let needPS=false;
  P.rows.forEach(r=>{ const it=r.item||('row '+r._row), ct=String(r.ct||'').toLowerCase().replace(/&/,'and').trim(), tt=String(r.tt||'').toLowerCase().replace(/^data point.*/,'data point').trim();
    const nm=r.en||r.dp||r.at||r.cn||r.ac||''; const where='Item '+it+(nm?' · '+nm:'');
    if(!ct||!tt){ add('fix','Reference Model Changes','Change Type or Change Target Type is blank.','Pick both from the dropdowns.',where,'ct',it); return; }
    if(/container|data point|attribute/.test(tt)&&/add|move|rename|reuse/.test(ct)) needPS=true;
    const need=((RV_NEED[ct]||{})[tt])||[]; const blank=need.filter(k=>!r[k]); if(blank.length) add('fix','Reference Model Changes','This '+r.ct+' · '+r.tt+' row is missing: '+blank.map(k=>RV_FIELD[k]).join(', ')+'.','Fill in the columns this change needs (see the form’s instructions tab).',where,'need',it);
    // normal English names, no abbreviations
    [['cn','CONTAINER Name'],['dp','Data Point Name'],['en','Enumeration Name'],['pc','Parent CONTAINER Name']].forEach(([k,l])=>{ const v=r[k]; if(!v) return; if(/_/.test(v)||(/[a-z][A-Z]/.test(v)&&!/\s/.test(v)&&k!=='en')) add('fix','Names',l+' '+rvQ(v)+' isn’t in normal English.','Use spaces between words; no underscores or upper camel case (only the XPATH uses those).',where,'normal-english',it); if(RV_ABBR.test(v)) add('fix','Names',l+' '+rvQ(v)+' uses an abbreviation.','Spell out the word (IM sends back abbreviations such as Condo, Amt, Info).',where,'abbr',it); });
    // definition basics
    const def=String(r.def||'');
    if(def){ if(!/[.)]\s*$/.test(def)) add('fix','Definitions','The definition doesn’t end with a period.','End the definition with a period.',where,'def-period',it);
      if(/\b(must|shall|should)\b|\bsystem will\b|\bscreen\b|\bdrop-?down\b|\bfield on\b/i.test(def)) add('recommend','Definitions','The definition reads like implementation guidance ('+rvQ((def.match(/\b(must|shall|should)\b|\bsystem will\b|\bscreen\b|\bdrop-?down\b|\bfield on\b/i)||[''])[0])+').','IM removes process and implementation language from definitions; say what the data is, not how a system uses it.',where,'def-impl',it);
      (def.match(/\b[A-Z]{2,6}\b/g)||[]).filter(a=>!/^(MISMO|LDD|ID|US|LLC|UPB)$/.test(a)&&!new RegExp('\\('+a+'\\)').test(def)).slice(0,1).forEach(a=>add('recommend','Definitions','The acronym '+a+' isn’t spelled out in the definition.','Spell it out, then give the acronym in parentheses.',where,'def-acr',it));
      if(/^(a|an|the)\s/i.test(nm)===false&&rvNorm(def).replace(/[.]/g,'')===rvNorm(nm)) add('fix','Definitions','The definition only repeats the name.','Describe what the data means.',where,'def-repeat',it); }
    else if(/add|modify/.test(ct)&&tt!=='relationship') add('fix','Definitions','No definition.','Every added or modified '+r.tt+' needs a definition (IM approves fewer rows that arrive without one).',where,'def-missing',it);
    // class word templates
    if(tt==='data point'&&r.dp&&def&&/add|modify/.test(ct)){ const cw=Object.keys(RV_TEMPLATES).find(k=>new RegExp('\\b'+k+'$','i').test(r.dp.trim().replace(/Other Description$/i,'Description'))); if(!cw&&!/Other Description$/i.test(r.dp)) add('fix','Names','The data point name '+rvQ(r.dp)+' doesn’t end with a class word.','End it with a MISMO class word (Amount, Date, Indicator, Type, Description…) per MEG 0007.',where,'classword',it);
      else if(cw&&!RV_TEMPLATES[cw].test(def.trim())) add('fix','Definitions',(/^[AEIOU]/.test(cw)?'An ':'A ')+cw+' data point should follow the '+cw+' definition template.','Start with: '+RV_TEMPLATE_TEXT[cw],where,'template',it);
      if(/Indicator$/i.test(r.dp)&&/\bnot\b|\bno\b|\bnon\b/i.test(r.dp)) add('recommend','Names','A negative indicator name: '+rvQ(r.dp)+'.','IM prefers indicators where true means the positive situation.',where,'neg-ind',it); }
    if(tt==='enumeration'&&r.en&&/add/.test(ct)&&/^other$/i.test(r.en.trim())&&!P.rows.some(x=>/other description$/i.test(x.dp||''))) add('fix','Enumerations','“Other” is added, but no matching Type Other Description data point is added or reused.','Add or reuse the [Data Point] Other Description that goes with this Type.',where,'other-desc',it);
    // duplicates inside the submission
    const key=(tt+'|'+(r.pc||'')+'|'+nm).toLowerCase(); if(nm&&/add/.test(ct)){ if(seen[key]) add('recommend','Reference Model Changes','Added twice in this submission ('+seen[key]+' and '+it+').','Add and define it once, then reuse it at other XPaths.',where,'dup',it); else seen[key]=it; }
    // XPATH
    if(r.xp&&!/^MESSAGE\/([A-Z0-9_]+\/)+$/.test(r.xp.replace(/\s+/g,''))) add('fix','XPATH','The XPATH isn’t in the expected form.','Use upper-case container names separated by slashes, starting with MESSAGE/ and ending with /.',where,'xpath',it);
  });
  if(needPS&&P.psFilled<1) add('fix','Proposed Structure','Containers, data points or attributes change, but the Proposed Structure tab is empty.','Complete the Proposed Structure tab so IM sees the changes in the context of the Reference Model.','Proposed Structure','ps');
  if(!P.rows.length) add('question','Reference Model Changes','No Reference Model changes are listed.','Is this a documents-only submission? If so, say so in the Submission Summary.','Reference Model Changes','no-rows');
  return {out,P};
}

/* ---------- what IM has sent back (from 3,709 decided rows, 2021–2026) ---------- */
const RV_IM_LEARNED={decided:3709,asSubmitted:2486,withMod:695,withdrawn:435,returned:46,denied:36,
  themes:[['Definition wording and clarity',136],['Structure, container or XPATH',66],['Already in the model / reuse instead',62],['Naming and class words',62],['Enumerations',54],['Spelling, typos and grammar',38],['Missing definitions, enums or examples',37],['Coordinate with other groups',37],['Breaking changes and deprecations',19],['Submission form format',17]],
  examples:[
    ['Data Point','The amount of all recurring expenses incurred by the borrower(s)…','The dollar amount of all recurring expenses incurred by the borrower(s)…','Amount definitions start “The dollar amount of”.'],
    ['Data Point','A free-form text field describing the name of the person or entity that estimated the repair.','An unstructured name that identifies the person or entity that estimated the repair.','Name data points use the Name template.'],
    ['Enumeration','Indicates the client has opted in for contact by telephone.','Indicates the party has opted out of contact by text.','Use the general role (party), not a specific one.'],
    ['Data Point','…the type of Closing Protection Letter the requestor wants to price…','…the type of Closing Protection Letter (CPL) the requestor wants to price…','Spell out the acronym, then give it in parentheses.'],
    ['Data Point','The date associated with the specified Property Vacancy Registration Status Type.','The date associated with the specified PropertyVacancyRegistrationStatusType.','Refer to other data points by their LDD name.'],
    ['Enumeration','site condo','site condominium','Names use full words, not abbreviations.'],
    ['Data Point','…that this item applies to.','…to which this item applies.','Grammar clean-up.'],
    ['Data Point','The date on which SCRA benefits … expire.','The date on which SCRA benefits … end.','Plain, precise verbs.'],
    ['Enumeration','Equifax credit score model based on the Fair Isaac FICO 10T scoring algorithm.','(rewritten to be unique to the enumeration)','Each enumeration needs its own unique definition.'],
    ['Data Point','(new data point)','(denied: “Already in model … use Escrow Account Initial Balance Amount”)','Check the Reference Model for an existing data point first.']],
  comments:['Improve enum and data point definition.','Enumerations need definitions.','Already in model; reuse the existing data point.','Correct the XPATH and provide a definition.','Pls double-check existing enums to see if one would work.','Ensure data points are organized in alpha order within the container.','Deleted implementation-oriented phrase.','Add acronym after the spelled-out words in the definition.','Recommend making the change consistent with other enums.','Please provide examples.','Do not have a true response result in a negative; change the name.','Breaking change: deprecations must be done together and can’t be approved piecemeal.']};

/* ---------- Claude's part ---------- */
const RV_EDITOR_PERSONA='You are a meticulous senior editor for MISMO (Mortgage Industry Standards Maintenance Organization) work products. You review draft, comment-period, candidate recommendation, recommendation and final work products for editorial quality, consistency, branding, formatting, boilerplate language, copyright, trademarks and publication readiness. You identify spelling, grammar, punctuation, terminology, acronym, template, logo, header, footer, pagination and accessibility issues while preserving the author\'s technical meaning. You compare the work product against the MISMO Editor Process and Guidance and the MISMO Work Product Boilerplate Language and Guidance. You do not validate XPath mappings, data-point mappings, XML schemas, YAML files or technical implementation logic. You never invent legal language, classifications, dates, approvals or licensing decisions; when something like that is unclear you ask the facilitator.';
const RV_EDITOR_RULES='Rules:\n- Never rewrite the work product. Report what to change; the facilitator decides. Editor review is subjective: label taste-level suggestions as recommendations, not corrections.\n- Quote the exact text in "where" (15 words or fewer) so the facilitator can find it.\n- Corrections are clear errors: spelling, grammar, punctuation, wrong or inconsistent terms, inconsistent capitalization of MISMO terms, undefined acronyms, broken numbering, mismatched cross-references, inconsistent names or versions of MISMO products.\n- MISMO voice: MISMO does not mandate, require or advocate. Flag “MISMO strongly believes”, “MISMO thinks the industry should”, “must use”.\n- Use American spelling. Use registered trademarks where they apply (MISMO®, MERS®).\n- Accessibility: descriptive link text, meaning not carried by color alone, tables with header rows, alt text for images if mentioned.\n- Software already checked boilerplate wording, copyright year, page numbers, tracked changes, comments and fonts. Don’t repeat those.\n- Don’t comment on XPaths, mappings, schemas or technical logic.';
/* Claude answers through the save relay, which caps each answer at about a page.
   So the work goes in small pieces, a few at a time, in a compact answer format,
   and an answer that runs long is repaired rather than thrown away. */
function rvRepairJson(t){
  t=String(t||''); const a=t.indexOf('{'); if(a<0) return null; t=t.slice(a);
  try{ return JSON.parse(t.slice(0,t.lastIndexOf('}')+1)); }catch(e){}
  const st=[]; let inS=false, esc2=false, lastSafe=-1, safeStack=null;
  for(let i=0;i<t.length;i++){ const c=t[i];
    if(inS){ if(esc2) esc2=false; else if(c==='\\') esc2=true; else if(c==='"') inS=false; continue; }
    if(c==='"'){ inS=true; continue; }
    if(c==='{'||c==='[') st.push(c==='{'?'}':']');
    else if(c==='}'||c===']'){ st.pop(); if(st.length){ lastSafe=i; safeStack=st.slice(); } } }
  if(lastSafe<0) return null;
  try{ return JSON.parse(t.slice(0,lastSafe+1)+safeStack.reverse().join('')); }catch(e){ return null; }
}
async function rvAsk(prompt){
  let txt='';
  if(typeof S.sample==='function'){ const r=await S.sample(prompt,{modelTier:'complex'}); txt=typeof r==='string'?r:(r&&(r.text||r.content))||''; }
  else if(S.sample&&typeof S.sample.text==='function'){ const r=await S.sample.text(prompt,{modelTier:'complex'}); txt=typeof r==='string'?r:(r&&(r.text||r.content))||''; }
  else return await S.sample.json(prompt,{modelTier:'complex'});
  const j=rvRepairJson(txt); if(!j) throw new Error('Claude’s answer couldn’t be read'); return j; }
async function rvPool(items,n,fn){ const out=new Array(items.length); let k=0; await Promise.all(Array.from({length:Math.min(n,items.length)},async()=>{ while(k<items.length){ const i=k++; try{ out[i]=await fn(items[i],i); }catch(e){ out[i]={__err:(e&&e.message)||'failed'}; } } })); return out; }
function rvChunks(text,max){ const out=[]; let cur=''; String(text).split(/\n/).forEach(l=>{ while(l.length>max){ out.push(l.slice(0,max)); l=l.slice(max); } if((cur+l).length>max&&cur){ out.push(cur); cur=''; } cur+=l+'\n'; }); if(cur.trim()) out.push(cur); return out; }
async function rvAiEditor(files,ctx,progress){
  if(!S.sample) return {skipped:'Claude isn’t reachable from here, so only the software checks ran.'};
  const all=files.map(f=>'# FILE: '+f.name+' ('+(f.kind==='excel'?'Excel workbook':f.kind==='pdf'?'PDF':'Word document')+')\n'+f.text).join('\n\n');
  const parts=rvChunks(all,5000), use=parts.slice(0,30); let done=0;
  const res={corrections:[],recommendations:[],questions:[],summaries:[],readiness:[]};
  const got=await rvPool(use,4,async(part,i)=>{
    const prompt=RV_EDITOR_PERSONA+'\n\n'+RV_EDITOR_RULES+(typeof rvEditorExtra==='function'?rvEditorExtra():'')+(typeof rvFbAvoid==='function'&&rvFbAvoid('editor').length?'\n- MISMO staff marked these past notes wrong; don’t make notes like them: '+rvFbAvoid('editor').join(' | '):'')+'\n\nWork request: '+ctx.t.wr+' '+ctx.t.name+'\nWorkgroup: '+(ctx.t.workgroup||'')+'\nStage: '+stageDef(ctx.t.stage).name+'\nFacilitator note: '+(ctx.note||'none')+'\nThis is part '+(i+1)+' of '+use.length+'.\n'+
      '\nAnswer in this compact JSON only (no other text): {"s":"one sentence on this part","r":"ready|minor|needs","c":[["exact short quote","what is wrong","the fix","category"]],"m":[["where","recommendation","suggestion"]],"q":["question for the facilitator"]}. At most 6 items in c, 2 in m, 1 in q; most important first; each string under 20 words. Answer right away.\n\nTEXT:\n'+part;
    const r=await rvAsk(prompt); done++; progress&&progress('Claude has read '+done+' of '+use.length+' part'+(use.length===1?'':'s')+'…'); return r; });
  let errs=0;
  got.forEach(r=>{ if(!r||r.__err){ errs++; return; }
    (r.c||[]).forEach(x=>Array.isArray(x)?res.corrections.push({where:x[0],issue:x[1],suggestion:x[2],category:x[3]}):res.corrections.push(x));
    (r.m||[]).forEach(x=>Array.isArray(x)?res.recommendations.push({where:x[0],issue:x[1],suggestion:x[2]}):res.recommendations.push(x));
    (r.q||[]).forEach(q=>res.questions.push(q)); if(r.s) res.summaries.push(r.s); if(r.r) res.readiness.push(r.r==='needs'?'needs-updates':r.r); });
  const seen=new Set(); res.corrections=res.corrections.filter(c=>{ const k=rvNorm(c.where)+'|'+rvNorm(c.issue).slice(0,30); if(seen.has(k)) return false; seen.add(k); return true; });
  res.summaries=res.summaries.slice(0,3);
  if(errs) res.error=errs+' of '+use.length+' parts didn’t come back from Claude; the rest are below.';
  if(parts.length>use.length) res.note='Claude read the first '+use.length+' of '+parts.length+' parts; the software checks covered everything.';
  return res;
}
async function rvAiIm(P,ctx,progress){
  if(!S.sample) return {skipped:'Claude isn’t reachable from here, so only the software checks ran.'};
  const rows=P.rows.filter(r=>/add|modify|rename/i.test(r.ct||'')).map(r=>[String(r.item||r._row),(r.ct||'')+' '+(r.tt||''),r.cn||r.pc||'',r.dp||r.en||r.at||r.ac||r.cn||'',r.def||'',(typeof rmFactsFor==='function'?rmFactsFor(r):'')]);
  if(!rows.length) return {rows:[]};
  const L=RV_IM_LEARNED; const guide='What IM has done with '+L.decided.toLocaleString()+' decided rows (2021–2026): '+Math.round(L.asSubmitted/L.decided*100)+'% approved as submitted, '+Math.round(L.withMod/L.decided*100)+'% approved with modification, '+Math.round(L.withdrawn/L.decided*100)+'% withdrawn, the rest returned or denied. Most common reasons: '+L.themes.map(t=>t[0]).join('; ')+'.\nTypical IM edits (before → after, why):\n'+L.examples.map(e=>'- ['+e[0]+'] '+e[1]+' → '+e[2]+' ('+e[3]+')').join('\n')+'\nTypical IM comments: '+L.comments.join(' | ')+'\nDefinition templates: '+Object.entries(RV_TEMPLATE_TEXT).map(([k,v])=>k+': '+v).join('; ')+'.';
  const parts=[]; for(let i=0;i<rows.length;i+=12) parts.push(rows.slice(i,i+12)); let done=0;
  const got=await rvPool(parts,4,async part=>{
    const prompt='You are pre-reviewing a MISMO Information Management (IM) submission the way the IM workgroup reviews it, so the facilitator can fix rows before IM sees them. IM checks proposed Reference Model changes for uniqueness, MISMO Engineering Guidelines (MEG 0007 class words), clear well-formed definitions, consistency with existing enumerations, and correct structure.\n\n'+guide+'\n\nRules: never change the submission; suggest. Don’t invent facts about the existing Reference Model: if something may already exist, say “may already exist; check the Reference Model for …”. List only rows IM would likely question. Plain, short notes in IM’s voice.'+(typeof rvFbAvoid==='function'&&rvFbAvoid('im').length?' MISMO staff marked these past notes wrong; don’t make notes like them: '+rvFbAvoid('im').join(' | ')+'.':'')+'\n\nWork request: '+ctx.t.wr+' '+ctx.t.name+'\nRows as [item, change, container, name, definition, facts from the '+(ctx.rm||'Reference Model (not loaded)')+']. When facts say EXISTS, the item is already in the model: IM would deny the add and ask to reuse it. When facts list similar items, judge whether one could be reused. Existing values are the Type’s current enumerations: '+JSON.stringify(part)+'\n\nAnswer in this compact JSON only: {"s":"one sentence","r":[["item","as submitted|with modification|returned|denied","what IM would say","suggested definition or empty","suggested name or empty"]]}. At most 6 rows; each string under 25 words. Answer right away.';
    const r=await rvAsk(prompt); done++; progress&&progress('Claude has read '+Math.min(rows.length,done*12)+' of '+rows.length+' rows…'); return r; });
  const out=[], sums=[]; let errs=0;
  got.forEach(r=>{ if(!r||r.__err){ errs++; return; } (r.r||[]).forEach(x=>Array.isArray(x)?out.push({item:x[0],likely:x[1],note:x[2],suggestedDefinition:x[3],suggestedName:x[4]}):out.push(x)); if(r.s) sums.push(r.s); });
  return {rows:out,summaries:sums.slice(0,2),error:errs?errs+' of '+parts.length+' groups of rows didn’t come back from Claude; the rest are below.':''};
}
/* ---------- the report ---------- */
function rvReadiness(findings,ai){
  const fix=findings.filter(f=>f.sev==='fix').length, ai3=(ai&&ai.readiness)||[];
  if(fix>=5||ai3.includes('needs-updates')) return ['needs','Needs Updates'];
  if(fix>0||ai3.includes('minor')||((ai&&ai.corrections)||[]).length>3) return ['minor','Ready With Minor Edits'];
  return ['ready','Ready'];
}
function rvImReadiness(findings,ai){ const fix=findings.filter(f=>f.sev==='fix').length; const risky=((ai&&ai.rows)||[]).filter(r=>/returned|denied/.test(r.likely||'')).length;
  if(fix>=5||risky>=3) return ['needs','Needs Updates Before IM']; if(fix>0||risky>0||((ai&&ai.rows)||[]).length>5) return ['minor','Ready With Minor Edits']; return ['ready','Ready for IM']; }
function rvTrim(s,n){ s=String(s==null?'':s); return s.length>n?s.slice(0,n-1)+'…':s; }
function rvBuildReport(kind,t,files,findings,ai,ctx){
  const [rk,rl]=kind==='im'?rvImReadiness(findings,ai):rvReadiness(findings,ai);
  const rep={id:kind+'-'+t.id+'-'+Date.now().toString(36),kind,ticket:t.id,wr:t.wr,name:t.name,at:new Date().toISOString(),by:S.me.name||'',files:files.map(f=>f.name),boiler:ctx.boiler,
    readiness:rk,readinessLabel:rl,summary:((ai&&ai.summaries)||[]).join(' ')||'',aiNote:(ai&&(ai.skipped||ai.error||ai.note))||'',
    findings:findings.slice(0,160).map(f=>({sev:f.sev,area:f.area,issue:rvTrim(f.issue,400),suggestion:rvTrim(f.suggestion,400),where:rvTrim(f.where,180),item:f.item||'',src:f.src,rule:f.rule||'',fb:f.fb||''}))};
  if(kind==='editor'){ rep.corrections=((ai&&ai.corrections)||[]).slice(0,80).map(c=>({where:rvTrim(c.where,180),issue:rvTrim(c.issue,300),suggestion:rvTrim(c.suggestion,300),category:rvTrim(c.category,30)}));
    rep.recommendations=((ai&&ai.recommendations)||[]).slice(0,24).map(c=>({where:rvTrim(c.where,180),issue:rvTrim(c.issue,300),suggestion:rvTrim(c.suggestion,300)}));
    rep.questions=[...findings.filter(f=>f.sev==='question').map(f=>f.issue+' '+f.suggestion),...((ai&&ai.questions)||[])].slice(0,20).map(q=>rvTrim(q,300)); }
  else { rep.rows=((ai&&ai.rows)||[]).slice(0,150).map(r=>({item:String(r.item||''),likely:rvTrim(r.likely,24),note:rvTrim(r.note,300),def:rvTrim(r.suggestedDefinition,400),name:rvTrim(r.suggestedName,120)}));
    rep.questions=findings.filter(f=>f.sev==='question').map(f=>rvTrim(f.issue+' '+f.suggestion,300)); rep.form=ctx.formStats||null; rep.rm=ctx.rm||''; if(!ctx.rm) rep.aiNote=[rep.aiNote,'The Reference Model couldn’t be loaded here, so “already exists” and XPATH checks didn’t run. Run the review on the live MMS at resources.mismo.org.'].filter(Boolean).join(' '); }
  return rep;
}
function rvReportHtml(rep,forWord){
  const e=esc; const sevL={fix:'Must Fix',recommend:'Recommended',question:'Question'};
  // rows carry a key so people can mark each note right or wrong (not in the Word copy)
  const fbOn=!forWord&&typeof rvFbCell==='function';
  const tbl=(head,rows)=>rows.length?'<table class="rvt"><thead><tr>'+head.map(h=>'<th>'+e(h)+'</th>').join('')+(fbOn?'<th class="rv-fbh">Right?</th>':'')+'</tr></thead><tbody>'+rows.map(r=>{ const k=r.key; const cells=r.cells||r; return '<tr>'+cells.map(c=>'<td>'+c+'</td>').join('')+(fbOn?'<td class="rv-fbc">'+(k?rvFbCell(rep,k):'')+'</td>':'')+'</tr>'; }).join('')+'</tbody></table>':'';
  const F=(rep.findings||[]).map((f,i)=>Object.assign({_k:'f'+i},f)), fx=F.filter(f=>f.sev==='fix'), rc=F.filter(f=>f.sev==='recommend');
  const title=rep.kind==='im'?'IM Pre-Review Report':'Editor and Readiness Review Report';
  let h='<div class="rvr"><div class="rvr-h"><div class="rvr-k">'+e(title)+'</div><h2>'+e(rep.wr+' '+rep.name)+'</h2><div class="rvr-m">'+e(fmt(rep.at.slice(0,10)))+' · '+e(rep.by||'')+' · '+e((rep.files||[]).join(', '))+(rep.kind==='editor'?' · Boilerplate checked against: '+e(RV_BP_LABEL[rep.boiler]||''):(rep.rm?' · Checked against the '+e(rep.rm):''))+'</div>'+
    '<div class="rvr-score rv-'+e(rep.readiness)+'"><b>'+e(rep.readinessLabel)+'</b><span>'+fx.length+' must fix · '+(rc.length+(rep.recommendations||[]).length)+' recommended'+(rep.kind==='editor'?' · '+(rep.corrections||[]).length+' editorial corrections':' · '+(rep.rows||[]).length+' rows IM may question')+'</span></div>'+
    (rep.summary?'<p class="rvr-sum">'+e(rep.summary)+'</p>':'')+(rep.aiNote?'<p class="rvr-note">'+e(rep.aiNote)+'</p>':'')+
    '<p class="rvr-note">This report recommends; it doesn’t change the work product. '+(rep.kind==='editor'?'Editorial suggestions are judgment calls: the facilitator and workgroup decide.':'IM makes the final decision on every row.')+'</p></div>';
  const sec=(t2,body)=>body?'<h3>'+e(t2)+'</h3>'+body:'';
  h+=sec('Must Fix Before Submitting',tbl(['Area','Where','What’s Wrong','What to Do'],fx.map(f=>({key:f._k,cells:[e(f.area),e(f.where),e(f.issue)+(f.fb?'<div class="rv-fbnote">'+e(f.fb)+'</div>':''),e(f.suggestion)]}))));
  if(rep.kind==='editor') h+=sec('Editorial Corrections',tbl(['Category','Where','Issue','Suggestion'],(rep.corrections||[]).map((c,i)=>({key:'c'+i,cells:[e(c.category||''),e(c.where),e(c.issue),e(c.suggestion)]}))));
  if(rep.kind==='im') h+=sec('Rows IM May Question',tbl(['Item','Likely Outcome','What IM Would Say','Suggested Definition or Name'],(rep.rows||[]).map((r,i)=>({key:'r'+i,cells:[e(r.item),e(r.likely),e(r.note),e([r.name,r.def].filter(Boolean).join(' — '))]}))));
  h+=sec('Recommended',tbl(['Area','Where','Recommendation','Suggestion'],[...rc.map(f=>({key:f._k,cells:[e(f.area),e(f.where),e(f.issue)+(f.fb?'<div class="rv-fbnote">'+e(f.fb)+'</div>':''),e(f.suggestion)]})),...(rep.recommendations||[]).map((c,i)=>({key:'m'+i,cells:['Editorial',e(c.where),e(c.issue),e(c.suggestion)]}))]));
  h+=sec('Questions for the Facilitator',(rep.questions||[]).length?'<ol>'+rep.questions.map(q=>'<li>'+e(q)+'</li>').join('')+'</ol>':'');
  if(rep.kind==='im'&&rep.form) h+=sec('What IM Has Done Before','<p>Across '+RV_IM_LEARNED.decided.toLocaleString()+' decided rows since 2021, '+Math.round(RV_IM_LEARNED.asSubmitted/RV_IM_LEARNED.decided*100)+'% were approved as submitted and '+Math.round(RV_IM_LEARNED.withMod/RV_IM_LEARNED.decided*100)+'% with modification. The most common reasons for changes: '+RV_IM_LEARNED.themes.slice(0,5).map(t=>t[0].toLowerCase()).join(', ')+'.</p>');
  h+='</div>';
  if(!forWord) return h;
  return '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>'+e(title)+'</title><style>body{font-family:Calibri,Arial,sans-serif;font-size:11pt;color:#0d314c}h2{font-size:16pt;margin:4pt 0}h3{font-size:13pt;margin:14pt 0 4pt;color:#0d314c}.rvr-k{font-size:9pt;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#456179}.rvr-m,.rvr-note{font-size:9.5pt;color:#456179}.rvr-score b{font-size:13pt}table{border-collapse:collapse;width:100%}th,td{border:1px solid #adc4d6;padding:4pt;vertical-align:top;font-size:9.5pt;text-align:left}th{background:#e4f2fb}</style></head><body>'+h+'<p class="rvr-note">©'+RV_YEAR()+' Mortgage Industry Standards Maintenance Organization, Inc. Prepared by the MISMO Manufacturing System.</p></body></html>';
}
function rvDownload(rep){ const html=rvReportHtml(rep,true); const blob=new Blob(['\ufeff',html],{type:'application/msword'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=(rep.kind==='im'?'IM Pre-Review':'Editor and Readiness Review')+' - '+rep.wr+' - '+rep.at.slice(0,10)+'.doc'; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },500); }
/* ============================================================================
   The MISMO Reference Model (Logical Data Dictionary) for the IM Pre-Review.
   Loaded from the private mms-data repo (rm-meta + rm-dp1..n), which holds a
   compact copy of the current LDD taken from the Resource Library package.
   ============================================================================ */
let RM=null, rmLoading=null;
const rmKey=s=>String(s==null?'':s).toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]/g,'');
async function rmLoad(){
  if(RM) return RM; if(rmLoading) return rmLoading;
  rmLoading=(async()=>{
    if(S.mode!=='relay'||typeof rGet!=='function') return null;
    const docOf=f=>f&&f.data&&f.data.docs&&f.data.docs.data;
    const meta=docOf(await rGet('mms','rm-meta')); if(!meta||!meta.s) return null;
    const M=Object.assign({},meta,JSON.parse(meta.s)); delete M.s;
    const parts=await Promise.all(Array.from({length:M.dpParts||0},(_, i)=>rGet('mms','rm-dp'+(i+1))));
    const dp=[]; parts.forEach(p=>{ const d=docOf(p); if(d&&d.s) JSON.parse(d.s).forEach(x=>dp.push(x)); });
    if(!dp.length) return null;
    RM=rmBuild(M,dp); return RM;
  })().catch(e=>{ console.warn('Reference Model not loaded',e); return null; }).finally(()=>{ rmLoading=null; });
  return rmLoading;
}
function rmBuild(M,dp){
    const R={meta:M,dp:new Map(),cn:new Map(),ac:new Map(),depDp:new Set((M.depDp||[]).map(rmKey)),depCn:new Set((M.depCn||[]).map(rmKey)),byClass:new Map(),inCn:new Map()};
    dp.forEach(x=>{ const e={name:x[0],def:x[1],type:x[2],cns:x[3]||[],enums:x[4]||[],partial:!!x[5]}; R.dp.set(rmKey(x[0]),e);
      const cw=(x[0].match(/[A-Z][a-z0-9]*$/)||[''])[0]; if(cw){ if(!R.byClass.has(cw)) R.byClass.set(cw,[]); R.byClass.get(cw).push(e); }
      e.cns.forEach(c=>{ const k=rmKey(c); if(!R.inCn.has(k)) R.inCn.set(k,new Set()); R.inCn.get(k).add(rmKey(x[0])); }); });
    (M.cn||[]).forEach(x=>R.cn.set(rmKey(x[0]),{name:x[0],def:x[1],parents:(x[2]||[]).map(rmKey)}));
    (M.ac||[]).forEach(x=>R.ac.set(String(x[0]).toUpperCase(),x[1]));
    R.label='MISMO Reference Model '+rmVersion(M);
    return R;
}
function rmVersion(M){ const vh=(M.versionHistory||[]).slice(-1)[0]; const fromFile=(String(M.ldd||'').match(/v(\d+\.\d+\.\d+)_?(B\d+)?/i)||[]); return fromFile[1]?('v'+fromFile[1]+(fromFile[2]?' '+fromFile[2]:'')):(vh?String(vh[1]):''); }
/* names in the form are normal English ("Loan Amount"); the LDD uses upper camel case and UPPER_SNAKE containers */
function rmCamel(s){ return String(s||'').replace(/[^A-Za-z0-9 ]/g,' ').split(/\s+/).filter(Boolean).map(w=>w[0].toUpperCase()+w.slice(1)).join(''); }
function rmWordsOf(s){ return String(s||'').toLowerCase().replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(w=>w.length>2&&!RM_STOP.has(w)); }
const RM_STOP=new Set('the and for that this with which from are was were has have its his her their into upon when true indicates value mismo prescribed list represents identifies identifying field free form text describing amount dollar date number specified specific associated used being been not any all per one two other'.split(' '));
function rmSim(a,b){ const A=new Set(a), B=new Set(b); if(!A.size||!B.size) return 0; let n=0; A.forEach(w=>{ if(B.has(w)) n++; }); return n/Math.min(A.size,B.size); }
/* existing data points that look like this proposed one: same class word, overlapping name and definition words */
function rmSimilar(name,def,n){
  if(!RM) return []; const nm=rmCamel(name); const cw=(nm.match(/[A-Z][a-z0-9]*$/)||[''])[0]; const pool=RM.byClass.get(cw)||[];
  const nw=rmWordsOf(String(name).replace(/([a-z])([A-Z])/g,'$1 $2')), dw=rmWordsOf(def); const self=rmKey(name);
  return pool.map(e=>{ if(rmKey(e.name)===self) return null; if(!e._w){ e._nw=rmWordsOf(e.name.replace(/([a-z])([A-Z])/g,'$1 $2')); e._dw=rmWordsOf(e.def); e._w=1; }
      const s=0.55*rmSim(nw,e._nw)+0.45*(dw.length?rmSim(dw,e._dw):rmSim(nw,e._nw)); return s>=0.6?{e,s}:null; })
    .filter(Boolean).sort((a,b)=>b.s-a.s).slice(0,n||3).map(x=>x.e);
}
function rmDescribe(e){ return e.name+(e.def?' — '+rvTrim(e.def,160):''); }

/* ---------- the checks ---------- */
function rvRmChecks(P){
  const out=[]; if(!RM) return out;
  const add=(sev,issue,suggestion,where,rule,item)=>out.push({sev,area:'Reference Model',issue,suggestion:suggestion||'',where:where||'',rule:rule||'',item:item||'',src:'rm'});
  const V=RM.label;
  // what this submission itself adds, so later rows can rely on it
  const newCn=new Set(), newDp=new Set(), newEn={};
  P.rows.forEach(r=>{ const ct=String(r.ct||'').toLowerCase(), tt=String(r.tt||'').toLowerCase(); if(!/add/.test(ct)) return;
    if(/container/.test(tt)&&r.cn) newCn.add(rmKey(r.cn)); if(/data point/.test(tt)&&r.dp) newDp.add(rmKey(r.dp)); if(/enumeration/.test(tt)&&r.dp&&r.en){ (newEn[rmKey(r.dp)]=newEn[rmKey(r.dp)]||[]).push(r.en); } });
  const cnKnown=k=>RM.cn.has(k)||newCn.has(k), dpKnown=k=>RM.dp.has(k)||newDp.has(k);
  const typeAdds=new Set();
  P.rows.forEach(r=>{
    const it=r.item||('row '+r._row), ct=String(r.ct||'').toLowerCase().replace(/&/,'and').trim(), tt=String(r.tt||'').toLowerCase().replace(/^data point.*/,'data point').trim();
    const nm=r.en||r.dp||r.at||r.cn||r.ac||''; const where='Item '+it+(nm?' · '+nm:'');
    const dpk=rmKey(r.dp), cnk=rmKey(r.cn), pck=rmKey(r.pc), enk=rmKey(r.en);
    const dpE=RM.dp.get(dpk), cnE=RM.cn.get(cnk);
    if(tt==='data point'&&r.dp){
      if(/add/.test(ct)){
        if(dpE&&RM.depDp.has(dpk)) add('question',rvQ(r.dp)+' is in the '+V+' but deprecated ('+dpE.name+').','Is bringing it back intended? Say why in the Submitter Comments, or reuse its replacement.',where,'rm-deprecated',it);
        else if(dpE) add('fix',rvQ(r.dp)+' is already in the '+V+' ('+dpE.name+').','Reuse the existing data point instead of adding it again'+(dpE.cns.length?' (it’s in '+dpE.cns.slice(0,4).join(', ')+(dpE.cns.length>4?' and '+(dpE.cns.length-4)+' more':'')+')':'')+'. Its definition: '+rvTrim(dpE.def,200),where,'rm-exists',it);
        else if(RM.depDp.has(dpk)) add('question',rvQ(r.dp)+' was deprecated in an earlier version of the Reference Model.','Is bringing it back intended? Say why in the Submitter Comments.',where,'rm-deprecated',it);
        else { const sim=rmSimilar(r.dp,r.def,2); if(sim.length) add('recommend','Similar data point'+(sim.length>1?'s are':' is')+' already in the '+V+'.','Check whether one can be reused before adding '+rvQ(r.dp)+': '+sim.map(rmDescribe).join(' | '),where,'rm-similar',it); }
        if(/Type$/.test(rmCamel(r.dp))&&!dpE) typeAdds.add(dpk);
      }
      if(/reuse|move/.test(ct)&&!dpE&&!newDp.has(dpk)) add('fix','There’s no data point named '+rvQ(r.dp)+' in the '+V+' to '+(/move/.test(ct)?'move':'reuse')+'.','Check the spelling against the LDD, or change the row to Add and Define.',where,'rm-missing',it);
      if(/reuse/.test(ct)&&dpE&&r.pc&&(RM.inCn.get(pck)||new Set()).has(dpk)) add('recommend',rvQ(r.dp)+' is already in '+rvQ(r.pc)+'.','No change is needed for this row; remove it or pick a different container.',where,'rm-already-there',it);
      if(/modify|rename|deprecate/.test(ct)){ const old=/rename/.test(ct)?RM.dp.get(rmKey(r.old)):dpE; if(!old) add('fix','The data point '+rvQ(/rename/.test(ct)?r.old:r.dp)+' isn’t in the '+V+'.','Use the exact LDD name of the data point you are changing.',where,'rm-missing',it);
        else if(/deprecate/.test(ct)&&RM.depDp.has(dpk)) add('recommend',rvQ(r.dp)+' is already deprecated.','Remove this row.',where,'rm-dep-already',it);
        if(/rename/.test(ct)&&dpE) add('fix','The new name '+rvQ(r.dp)+' is already used in the '+V+'.','Pick a name that isn’t already in the LDD.',where,'rm-rename-taken',it);
        if(/modify definition/.test(ct)&&old&&r.old&&rmKey(r.old)!==rmKey(old.def)&&rvSim(r.old,old.def)<0.85) add('recommend','The Original/Old Value doesn’t match the current definition in the '+V+'.','Paste the current definition: '+rvTrim(old.def,220),where,'rm-old-def',it); }
    }
    if(tt==='container'&&r.cn){
      if(/add/.test(ct)&&cnE) add('fix','The container '+rvQ(r.cn)+' is already in the '+V+' ('+cnE.name+').','Reuse the existing container instead of adding it again.',where,'rm-cn-exists',it);
      if(/reuse|move|modify|rename|deprecate/.test(ct)&&!/rename/.test(ct)&&!cnE&&!newCn.has(cnk)) add('fix','There’s no container named '+rvQ(r.cn)+' in the '+V+'.','Check the spelling against the LDD (the container list), or change the row to Add and Define.',where,'rm-cn-missing',it);
      if(/rename/.test(ct)){ if(!RM.cn.has(rmKey(r.old))) add('fix','The container '+rvQ(r.old)+' isn’t in the '+V+'.','Use the exact LDD name of the container you are renaming.',where,'rm-cn-missing',it); if(cnE) add('fix','The new container name '+rvQ(r.cn)+' is already used.','Pick a name that isn’t already in the LDD.',where,'rm-rename-taken',it); }
    }
    if(r.pc&&/container|data point/.test(tt)&&/add|reuse|move/.test(ct)&&!cnKnown(pck)) add('fix','The parent container '+rvQ(r.pc)+' isn’t in the '+V+' or added by this submission.','Check the spelling against the LDD, or add the parent container first.',where,'rm-parent',it);
    if(tt==='enumeration'&&r.en&&r.dp){
      if(!dpKnown(dpk)) add('fix','The enumeration is for '+rvQ(r.dp)+', which isn’t in the '+V+' or added by this submission.','Use the exact LDD name of the Type data point.',where,'rm-enum-dp',it);
      else if(dpE&&/add/.test(ct)){
        const have=dpE.enums.map(rmKey);
        if(have.includes(enk)) add('fix',rvQ(r.en)+' is already a value of '+dpE.name+'.','Remove this row; the value already exists.',where,'rm-enum-exists',it);
        else if(!dpE.partial){ const near=dpE.enums.filter(v=>{ const k=rmKey(v); return k.length>3&&enk.length>3&&(k.startsWith(enk)||enk.startsWith(k)||rmSim(rmWordsOf(v.replace(/([a-z])([A-Z])/g,'$1 $2')),rmWordsOf(r.en))>=0.75); }).slice(0,3);
          if(near.length) add('recommend','Close to existing value'+(near.length>1?'s':'')+' of '+dpE.name+': '+near.join(', ')+'.','Check whether an existing value already covers '+rvQ(r.en)+' (IM asks submitters to double-check existing enumerations).',where,'rm-enum-near',it); }
      }
      if(dpE&&/modify|rename|deprecate/.test(ct)&&!dpE.partial){ const tgt=/rename/.test(ct)?r.old:r.en; if(tgt&&!dpE.enums.map(rmKey).includes(rmKey(tgt))) add('fix',rvQ(tgt)+' isn’t a value of '+dpE.name+' in the '+V+'.','Use the exact LDD enumeration value you are changing.',where,'rm-enum-missing',it); }
    }
    if(tt==='acronym'&&r.ac&&/add/.test(ct)&&RM.ac.has(String(r.ac).toUpperCase())) add('fix','The acronym '+rvQ(r.ac)+' is already in the LDD ('+RM.ac.get(String(r.ac).toUpperCase())+').','Remove this row.',where,'rm-ac-exists',it);
    // XPATH: every container must exist, and each step must be a parent → child pair in the model
    if(r.xp){ const seg=r.xp.replace(/\s+/g,'').replace(/^\/+|\/+$/g,'').split('/').filter(Boolean); const bad=[];
      seg.forEach((s,i)=>{ const k=rmKey(s); if(i===0&&k==='message') return; if(!cnKnown(k)){ bad.push(s+' isn’t a container'); return; }
        const e=RM.cn.get(k), pk=i>0?rmKey(seg[i-1]):''; if(e&&pk&&pk!=='message'&&e.parents.length&&!e.parents.includes(pk)&&!newCn.has(k)) bad.push(seg[i-1]+'/'+s+' isn’t a parent/child pair'); });
      if(bad.length) add('fix','The XPATH doesn’t match the '+V+': '+bad.slice(0,3).join('; ')+(bad.length>3?'; and '+(bad.length-3)+' more':'')+'.','Copy the XPATH from the LDD for the parent container, then add the new container at the end.',where,'rm-xpath',it); }
  });
  typeAdds.forEach(k=>{ if(!(newEn[k]||[]).length){ const r=P.rows.find(x=>rmKey(x.dp)===k&&/add/i.test(x.ct||'')); add('fix','A new Type data point is added without any enumerations.','List each enumeration value as its own Add and Define row, each with a unique definition.',r?'Item '+(r.item||r._row)+' · '+r.dp:'','rm-type-enums',r&&r.item); } });
  return out;
}
/* short facts about each row for Claude, so it judges reuse against the real model instead of guessing */
function rmFactsFor(r){
  if(!RM) return ''; const tt=String(r.tt||'').toLowerCase(); const f=[];
  if(/data point/.test(tt)&&r.dp){ const e=RM.dp.get(rmKey(r.dp)); if(e) f.push('EXISTS: '+rvTrim(e.def,120)); else { const s=rmSimilar(r.dp,r.def,2); if(s.length) f.push('similar: '+s.map(x=>x.name+' = '+rvTrim(x.def,90)).join(' | ')); } }
  if(/enumeration/.test(tt)&&r.dp){ const e=RM.dp.get(rmKey(r.dp)); if(e) f.push('existing values: '+e.enums.slice(0,25).join(', ')+(e.enums.length>25?'…':'')); }
  if(/container/.test(tt)&&r.cn){ const e=RM.cn.get(rmKey(r.cn)); if(e) f.push('EXISTS: '+rvTrim(e.def,120)); }
  return f.join(' ; ');
}

window.__calibRm={use:(M,dp)=>{ RM=rmBuild(M,dp); return RM.label; },checks:P=>rvRmChecks(P),facts:r=>rmFactsFor(r),similar:(n,d)=>rmSimilar(n,d,3).map(e=>e.name),parse:x=>rvParseForm(x),load:()=>rmLoad().then(R=>R&&R.label),im:(x,t)=>{ const r=rvImChecks(x,{t:t||{wr:''}}); return r.out.concat(rvRmChecks(r.P)); }};

window.__calib={rvReadXlsx,rvReadDocx,rvParseForm,rvImChecks,rvRmChecks,rvEditorChecks,rvTermChecks:typeof rvTermChecks!=='undefined'?rvTermChecks:null};
})();
