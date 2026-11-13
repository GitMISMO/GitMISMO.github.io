/* Submit an Idea: the public form as one piece that mounts into a box (Perry, 13 Nov 2026, as for the Business Glossary).
   One source for both places it appears: the Submit an Idea page on mismo.org, which loads embed.js and mounts it into
   <div id="mm-submit-idea"> with {base, headerOffset, embedded: true}, and the standalone page at
   resources.mismo.org/submit-an-idea, which mounts it with {embedded: false} and draws its own copy of the website's
   header and footer. Jonna's rules for sharing the page, as for the glossary: no global name but window.MISMO_SUBMIT_IDEA,
   every element id starts si-, the styles are scoped to #mm-submit-idea when built (_build/build.py), layers stay below
   z-index 1030. It sends to the relay's /hub-requests/ideas/submit and /ideas/attach, as before; from mismo.org that
   needs relay request 11 and "formOrigins" on hub-requests. */
(function(){
var G = window.MISMO_SUBMIT_IDEA = window.MISMO_SUBMIT_IDEA || {};
if(G.app) return;   // loaded twice: the first copy stands
function headerOffset(OPT){ var h = OPT && OPT.headerOffset; try{ h = typeof h === 'function' ? h() : h; }catch(e){ h = 0; } h = Number(h); return h > 0 ? h : 0; }

/* The form and the Talk to Us First panel: drawn in both places. */
var PAGE = `<main>
  <div style="position: relative; overflow: hidden; background: #071d2e; min-height: clamp(380px,37vw,520px); display: flex; align-items: center; padding: clamp(34px,3.8vw,50px) clamp(20px,5vw,48px);"><!-- built-in Pathway artwork (shows until a photo is added) --> <svg viewBox="0 0 1200 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; width: 100%; height: 100%;"> <defs> <linearGradient id="si-skyhm" x1="0" y1="0" x2="0" y2="1"> <stop offset="0%" stop-color="#0d314c" stop-opacity="0"></stop> </linearGradient> <linearGradient id="si-gndhm" x1="0" y1="0" x2="0" y2="1"> <stop offset="0%" stop-color="#0e3a5c"></stop><stop offset="100%" stop-color="#071d2e"></stop> </linearGradient> <radialGradient id="si-glowhm" cx="50%" cy="50%" r="50%"> <stop offset="0%" stop-color="#74bfeb" stop-opacity=".42"></stop> <stop offset="100%" stop-color="#74bfeb" stop-opacity="0"></stop> </radialGradient> <linearGradient id="si-trailhm" x1="0" y1="0" x2="1" y2="0"> <stop offset="0%" stop-color="#74bfeb" stop-opacity="0"></stop> <stop offset="45%" stop-color="#9ad4f4" stop-opacity=".95"></stop> <stop offset="100%" stop-color="#ffffff" stop-opacity=".55"></stop> </linearGradient> </defs> <rect x="0" y="0" width="1200" height="560" fill="url(#si-gndhm)"></rect> <ellipse cx="930" cy="360" rx="420" ry="250" fill="url(#si-glowhm)"></ellipse> <g fill="#0a2740" opacity="1"> <rect x="640" y="300" width="52" height="260"></rect><rect x="698" y="236" width="40" height="324"></rect> <rect x="744" y="318" width="60" height="242"></rect><rect x="810" y="186" width="48" height="374"></rect> <rect x="864" y="268" width="68" height="292"></rect><rect x="938" y="214" width="42" height="346"></rect> <rect x="986" y="296" width="56" height="264"></rect><rect x="1048" y="238" width="50" height="322"></rect> <rect x="1104" y="310" width="64" height="250"></rect><rect x="1174" y="258" width="44" height="302"></rect> </g> <rect x="560" y="548" width="660" height="12" fill="#0a2740"></rect> <g fill="#74bfeb" opacity=".30"> <rect x="684" y="222" width="5" height="7"></rect><rect x="696" y="246" width="5" height="7"></rect> <rect x="800" y="184" width="5" height="7"></rect><rect x="814" y="216" width="5" height="7"></rect> <rect x="860" y="258" width="5" height="7"></rect><rect x="884" y="290" width="5" height="7"></rect> <rect x="932" y="214" width="5" height="7"></rect><rect x="988" y="292" width="5" height="7"></rect> <rect x="1050" y="240" width="5" height="7"></rect><rect x="1108" y="312" width="5" height="7"></rect> </g> <g fill="none" stroke="url(#si-trailhm)" stroke-linecap="round"> <path d="M470,620 C690,540 880,470 1250,398" stroke-width="13" opacity=".15"></path> <path d="M470,620 C690,540 880,470 1250,398" stroke-width="3"></path> <path d="M450,654 C680,572 890,500 1258,428" stroke-width="1.4" opacity=".7"></path> <path d="M520,684 C740,604 940,534 1264,464" stroke-width="7" opacity=".2"></path> <path d="M520,684 C740,604 940,534 1264,464" stroke-width="2" opacity=".85"></path> <path d="M580,712 C800,636 990,570 1272,500" stroke-width="1.2" opacity=".55"></path> </g> </svg> <!-- PHOTO LAYER -->
<div style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; background-image: none; background-size: cover; background-position: center right; background-repeat: no-repeat;"></div>
<!-- scrim: keeps the copy readable over any photo -->
<div style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; background: linear-gradient(90deg,#071d2e 0%,rgba(7,29,46,.96) 30%,rgba(7,29,46,.80) 50%,rgba(7,29,46,.42) 72%,rgba(7,29,46,.22) 100%);"></div>
<div style="position: relative; z-index: 2; width: 100%; max-width: 1120px; margin: 0 auto; display: flex; flex-wrap: wrap; gap: 30px; align-items: center;">
<div style="flex: 1 1 440px; min-width: 0; max-width: 620px; margin-right: auto;">
<p style="margin: 0 0 14px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .14em; color: #74bfeb; font-family: inherit; line-height: 1.5;">Get Involved</p>
<h1 style="margin: 0 0 18px; font-family: inherit; font-size: clamp(33px,5.3vw,53px); font-weight: bold; line-height: 1.04; letter-spacing: -.027em; color: #ffffff; text-shadow: 0 2px 18px rgba(7,29,46,.6);">Share Your Idea<span style="display: block; color: #56b4f2;">Shape What Comes Next</span></h1>
<p style="margin: 0 0 12px; font-family: inherit; font-size: clamp(16.5px,1.8vw,19px); font-weight: 500; line-height: 1.5; color: #ffffff; max-width: 40ch;">Have an idea that could help the mortgage industry work better together? Tell MISMO about it.</p>
<p style="margin: 0; font-family: inherit; font-size: 15px; line-height: 1.6; color: #a9d8f3; max-width: 52ch;">No account needed. The more detail you share, the sooner we can help move it forward.</p>
<div style="margin-top: 24px; display: flex; flex-wrap: wrap; gap: 12px; max-width: 560px;"><a href="#si-tell"  style="flex: 1 1 190px; min-width: max-content; box-sizing: border-box; display: block; text-align: center; white-space: nowrap; padding: 14px 22px; border-radius: 8px; background: linear-gradient(180deg,#2e9dee 0%,#1a8fe3 100%); box-shadow: 0 5px 16px -4px rgba(26,143,227,.55); color: #ffffff; font-family: inherit; font-size: 15px; font-weight: 600; line-height: 1.2; text-decoration: none; border: 1.5px solid #1a8fe3;">Share Your Idea&nbsp;&darr;</a> <button type="button" id="si-talk" aria-haspopup="dialog" style="flex: 1 1 190px; min-width: max-content; box-sizing: border-box; display: block; text-align: center; white-space: nowrap; padding: 14px 22px; border-radius: 8px; background: rgba(255,255,255,.12); box-shadow: inset 0 1px 0 rgba(255,255,255,.18); color: #ffffff; font-family: inherit; font-size: 15px; font-weight: 600; line-height: 1.2; text-decoration: none; border: 1.5px solid rgba(255,255,255,.6); cursor: pointer;">Talk to Us First</button></div>
</div>
<div style="flex: 0 1 200px; box-sizing: border-box; min-width: 170px; border-left: 1px solid rgba(116,191,235,.35); padding-left: 26px;">
<div style="font-family: inherit; font-size: 13px; font-weight: 600; letter-spacing: .17em; text-transform: uppercase; color: #56b4f2; line-height: 2.15; text-shadow: 0 1px 10px rgba(7,29,46,.9);">Share</div>
<div style="font-family: inherit; font-size: 13px; font-weight: 600; letter-spacing: .17em; text-transform: uppercase; color: #56b4f2; line-height: 2.15; text-shadow: 0 1px 10px rgba(7,29,46,.9);">Discuss</div>
<div style="font-family: inherit; font-size: 13px; font-weight: 600; letter-spacing: .17em; text-transform: uppercase; color: #56b4f2; line-height: 2.15; text-shadow: 0 1px 10px rgba(7,29,46,.9);">Develop</div>
<div style="font-family: inherit; font-size: 13px; font-weight: 600; letter-spacing: .17em; text-transform: uppercase; color: #56b4f2; line-height: 2.15; text-shadow: 0 1px 10px rgba(7,29,46,.9);">Adopt</div>
<div style="width: 44px; height: 1px; background: rgba(255,255,255,.4); margin: 18px 0;"></div>
<div style="font-family: inherit; font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.85); line-height: 1.75; text-shadow: 0 1px 10px rgba(7,29,46,.9);">A More Efficient</div>
<div style="font-family: inherit; font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.85); line-height: 1.75; text-shadow: 0 1px 10px rgba(7,29,46,.9);">Mortgage Industry</div>
</div>
</div>
</div>
  <section class="sec" id="si-tell"><p class="mm-eyebrow">Partner with MISMO</p><h2 class="h2">Tell Us About Your Idea</h2><p class="secsub">Share as much detail as you can. A MISMO staff member will reach out within two business days.</p>
    <div class="grid">
      <div><div class="steps"><div class="stp"><b>You Submit</b><span>Your idea, with as much detail as you can, and any documents that help explain it. You&rsquo;ll get a receipt by email.</span><span class="n" aria-hidden="true">01</span></div>
        <div class="stp"><b>We Reach Out</b><span>A MISMO staff member contacts you within two business days.</span><span class="n" aria-hidden="true">02</span></div>
        <div class="stp"><b>We Plan the Next Steps</b><span>Together we decide how to move it forward: a new work request, an existing workgroup, or a MISMO community.</span><span class="n" aria-hidden="true">03</span></div></div>
        <div class="talk"><b>Rather talk first?</b> Perry Williams, Standards Program Manager: <a href="mailto:pwilliams@mismo.org">pwilliams@mismo.org</a></div></div>
      <div>
        <form class="card" id="si-form" novalidate>
          <div class="ftitle">Your Idea</div>
          <div class="msg" id="si-msg" role="alert" hidden></div>
          <div class="fld"><label for="si-title">What Should We Call Your Idea?</label><input type="text" id="si-title" maxlength="150" autocomplete="off"></div>
          <div class="fld"><label for="si-idea">The Idea or Opportunity</label><p class="hint" id="si-idea-hint">Give us enough to understand it: the problem or opportunity, how things work today, what would change, and who it would affect.</p><textarea id="si-idea" maxlength="4000" aria-describedby="si-idea-hint" style="min-height:140px"></textarea></div>
          <fieldset class="fld"><legend>Who Should Be Involved, or Would Benefit? <span class="opt">Choose any</span></legend>
            <div class="chips" id="si-who"></div>
            <label for="si-whoOther" class="hint" id="si-whoOther-l" hidden style="font-weight:700;color:var(--ink)">Who Else?</label><input type="text" id="si-whoOther" maxlength="200" hidden></fieldset>
          <div class="fld"><label for="si-why">Why It Matters</label><p class="hint" id="si-why-hint">What makes it important now: costs, risks, regulation, timing, or work already under way.</p><textarea id="si-why" maxlength="4000" aria-describedby="si-why-hint" aria-required="true"></textarea></div>
          <div class="fld"><span class="flabel" id="si-files-l">Attachments <span class="opt">(optional)</span></span><p class="hint" id="si-files-hint">Anything that helps explain the idea: a write-up, an example, a diagram. Up to 5 files, 4&nbsp;MB each: PDF, Word, Excel, PowerPoint, PNG or JPEG images, text or CSV.</p>
            <div class="filebox"><label class="q pick" for="si-files">Choose Files</label><input type="file" id="si-files" class="vh" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.txt,.csv" aria-describedby="si-files-hint"><ul class="flist" id="si-flist" aria-live="polite"></ul></div></div>
          <div class="about"><h3>About You</h3>
            <div class="two"><div class="fld"><label for="si-name">Your Name</label><input type="text" id="si-name" maxlength="100" autocomplete="name"></div>
              <div class="fld"><label for="si-company">Company</label><input type="text" id="si-company" maxlength="150" autocomplete="organization"></div>
              <div class="fld"><label for="si-email">Email</label><input type="email" id="si-email" maxlength="200" autocomplete="email"></div>
              <div class="fld"><label for="si-phone">Phone <span class="opt">(optional)</span></label><input type="tel" id="si-phone" maxlength="40" autocomplete="tel"></div></div>
            <fieldset class="fld"><legend>Is Your Company a MISMO Member? <span class="opt">(optional)</span></legend>
              <div class="radio"><label><input type="radio" name="member" value="yes">Yes</label><label><input type="radio" name="member" value="no">No</label><label><input type="radio" name="member" value="unsure">Not sure</label></div></fieldset></div>
          <div class="hp" aria-hidden="true"><label for="si-website">Leave this empty</label><input type="text" id="si-website" tabindex="-1" autocomplete="off"></div>
          <div class="send"><button type="submit" class="bp" id="si-go">Submit Your Idea &rarr;</button><span class="fine">No account needed. We use your details only to follow up on this idea.</span></div>
        </form>
        <section class="done" id="si-done" hidden aria-live="polite">
          <span class="ok">&#10003; Submitted</span>
          <h3 id="si-thanks" tabindex="-1">Thank you. Your idea is with MISMO.</h3>
          <p class="secsub" id="si-next"></p>
          <dl class="kv" id="si-sum"></dl>
          <div class="acts"><button type="button" class="q" id="si-again">Submit Another Idea</button><a class="q" href="https://collaborate.mismo.org/mismowebsite/get-involved">Back to Get Involved</a></div>
        </section>
      </div>
    </div>
  </section>
</main>
<dialog class="talkd" id="si-talkd" aria-labelledby="si-talkd-h">
  <button type="button" class="x" id="si-talkx" aria-label="Close">&times;</button>
  <h2 id="si-talkd-h">Talk to Perry First</h2>
  <p>Not sure your idea is ready, or where it fits? He&rsquo;s glad to talk it through before you submit it.</p>
  <div class="tk"><span class="pw" aria-hidden="true">PW</span><div><b>Perry Williams</b><span class="t">Standards Program Manager, MISMO</span><a href="mailto:pwilliams@mismo.org">pwilliams@mismo.org</a></div></div>
  <div class="acts"><a class="bp" id="si-talkmail" href="mailto:pwilliams@mismo.org?subject=An%20idea%20I%E2%80%99d%20like%20to%20talk%20through">Email Perry</a><button type="button" class="copy" id="si-talkcopy">Copy Address</button></div>
</dialog>`;
/* The copy of the website's header and footer: drawn only on the standalone page. */
var TOP = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<symbol id="mismo-logo" viewBox="0 0 708 108"><g transform="translate(0.000000,108.000000) scale(0.100000,-0.100000)" fill="var(--logo-body, #0f314c)"><path d="M5917 1065 c-169 -46 -279 -153 -335 -323 -21 -65 -25 -96 -25 -197
0 -101 4 -132 25 -197 57 -172 168 -280 335 -323 84 -22 723 -22 808 0 222 58
355 253 355 520 0 270 -132 459 -361 520 -74 20 -730 20 -802 0z m692 -320
c57 -33 76 -84 76 -200 0 -116 -19 -167 -76 -200 -32 -19 -52 -20 -294 -20
-297 0 -307 2 -346 83 -30 61 -31 198 -2 262 41 93 68 100 368 97 219 -2 243
-4 274 -22z M0 545 l0 -515 225 0 225 0 2 296 3 296 116 -294 116 -293 197 0 198
0 119 295 118 295 1 -297 0 -298 225 0 225 0 0 515 0 515 -337 -2 -338 -3
-104 -264 c-80 -204 -107 -260 -113 -245 -5 10 -52 129 -106 264 l-98 245
-337 3 -337 2 0 -515z M1892 1044 l-22 -15 0 -483 c0 -455 1 -484 18 -499 16 -15 48 -17
246 -17 128 0 235 4 246 10 32 17 34 57 4 95 -33 44 -64 143 -64 206 l0 49
203 0 c191 0 205 -1 222 -20 10 -11 34 -24 54 -30 49 -13 586 -13 612 0 22 12
26 62 7 78 -8 6 -174 15 -413 21 -502 15 -549 23 -628 110 -43 48 -57 93 -57
187 0 82 19 156 55 208 30 44 32 77 7 99 -27 25 -456 25 -490 1z M3716 1044 c-23 -22 -20 -31 19 -77 43 -49 78 -155 73 -218 l-3 -44
-204 -3 c-194 -2 -205 -1 -218 17 -24 35 -78 41 -355 41 -255 0 -269 -1 -288
-20 -27 -27 -26 -58 3 -70 12 -5 202 -14 422 -19 421 -12 476 -18 555 -62 92
-51 132 -159 111 -299 -12 -77 -34 -129 -77 -179 -23 -28 -25 -36 -16 -57 l12
-24 215 0 215 0 2 306 3 306 120 -303 120 -304 197 -3 196 -2 118 296 119 297
3 -296 2 -297 225 0 225 0 0 515 0 515 -338 0 -337 0 -104 -265 c-58 -146
-106 -263 -108 -261 -2 2 -50 120 -107 262 l-104 259 -340 3 c-300 2 -342 0
-356 -14z"/></g><g transform="translate(0.000000,108.000000) scale(0.100000,-0.100000)" fill="var(--logo-s, #50a4db)"><path d="M2485 1046 c-44 -20 -111 -94 -136 -151 -27 -60 -37 -198 -20 -263
13 -48 68 -115 114 -138 64 -34 162 -43 562 -55 239 -6 405 -15 413 -21 19
-16 15 -66 -7 -78 -26 -13 -563 -13 -612 0 -20 6 -44 19 -54 30 -17 19 -31 20
-222 20 l-203 0 0 -49 c0 -81 34 -172 86 -230 78 -87 31 -81 672 -81 l568 0
46 29 c79 50 122 121 139 231 21 140 -19 248 -111 299 -79 44 -134 50 -555 62
-220 5 -410 14 -422 19 -29 12 -30 43 -3 70 19 19 33 20 288 20 277 0 331 -6
355 -41 13 -18 24 -19 218 -17 l204 3 3 44 c4 60 -31 168 -70 215 -17 21 -52
52 -77 67 l-45 29 -550 0 c-440 -1 -557 -3 -581 -14z"/></g></symbol>
</defs></svg>
<header class="mm-header">
  <a class="mm-logo" href="https://collaborate.mismo.org/mismowebsite/home"><img src="https://higherlogicdownload.s3.amazonaws.com/MISMO/LogoImages/6e07790a-6fc9-43dc-b9d6-9178e00c3342_mismo-reverse-nav-logo.png" alt="MISMO logo. This will take you to the homepage"></a>
  <nav aria-label="Main">
  <ul class="mm-nav" id="mm-nav">
    <li><a class="mm-nav-link" href="https://collaborate.mismo.org/mismowebsite/membership" aria-haspopup="true">Membership <svg class="mm-chev" viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
      <ul class="mm-dd">
        <li><a href="https://collaborate.mismo.org/mismowebsite/membership/member-directory">MISMO Members</a></li>
        <li><a href="https://collaborate.mismo.org/mismowebsite/membership/lender-champions">Our Lender Champions</a></li>
        <li><a href="https://collaborate.mismo.org/mismowebsite/membership/industry-champions">Our Industry Champions</a></li>
        <li><a href="https://collaborate.mismo.org/mismowebsite/membership/iif">Innovation Investment Fund</a></li>
      </ul>
    </li>
    <li><a class="mm-nav-link" href="https://collaborate.mismo.org/mismowebsite/standards-resources" aria-haspopup="true">Standards &amp; Resources <svg class="mm-chev" viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
      <ul class="mm-dd">
        <li><a href="https://collaborate.mismo.org/mismowebsite/standards-resources/business-glossary">Business Glossary</a></li>
        <li><a href="https://collaborate.mismo.org/mismowebsite/standards-resources/certification">Certifications</a></li>
        <li><a href="https://collaborate.mismo.org/mismowebsite/standards-resources/mismo-link">MISMO Link</a></li>
        <li><a href="https://collaborate.mismo.org/mismowebsite/standards-resources/digital-mortgage-resource-center">Digital Mortgage Resource Center</a></li>
      </ul>
    </li>
    <li><a class="mm-nav-link" href="https://collaborate.mismo.org/mismowebsite/get-involved" aria-haspopup="true">Get Involved <svg class="mm-chev" viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
      <ul class="mm-dd">
        <li><a href="https://collaborate.mismo.org/mismowebsite/get-involved/workgroups">Communities &amp; Workgroups</a></li>
        <li><a href="https://collaborate.mismo.org/mismowebsite/get-involved/communities">Collaborate (Members Only)</a></li>
      </ul>
    </li>
    <li><a class="mm-nav-link" href="https://collaborate.mismo.org/mismowebsite/events" aria-haspopup="true">Events <svg class="mm-chev" viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
      <ul class="mm-dd">
        <li><a href="https://collaborate.mismo.org/mismowebsite/events/summit">MISMO Summit</a></li>
        <li><a href="https://collaborate.mismo.org/mismowebsite/events/education">Education</a></li>
      </ul>
    </li>
    <li><a class="mm-nav-link" href="https://collaborate.mismo.org/mismowebsite/about-mismo" aria-haspopup="true">About MISMO <svg class="mm-chev" viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
      <ul class="mm-dd">
        <li><a href="https://collaborate.mismo.org/mismowebsite/about-mismo/news">News</a></li>
        <li><a href="https://collaborate.mismo.org/mismowebsite/about-mismo/contributor-awards">Contributor Awards</a></li>
      </ul>
    </li>
  </ul>
  </nav>
  <a class="mm-login" href="https://identity.mba.org/connect/authorize?client_id=Mba.HigherLogic.MismoMigration&amp;scope=openid+profile+email+id&amp;response_type=code&amp;redirect_uri=https%3A%2F%2Fcollaborate.mismo.org&amp;state=https%3a%2f%2fcollaborate.mismo.org%2fmismowebsite%2fhome">Log In</a>
  <button type="button" class="mm-burger" aria-label="Open menu" aria-expanded="false" aria-controls="mm-nav"><span></span><span></span><span></span></button>
</header>`;
var BOTTOM = `<footer class="mm-footer"><div class="mm-footer-in"><span>MISMO &middot; 1919 M Street NW, 5th Floor, Washington, DC 20036 &middot; <a href="mailto:info@mismo.org">info@mismo.org</a></span><span>&copy; 2026 MISMO. All rights reserved.</span></div></footer>`;

function main(ROOT, OPT){
  var $ = function (id) { return document.getElementById('si-' + id); };
  if(!OPT.embedded) (function(){
/* Phone and tablet menu: the hamburger opens the same menu as a panel under the header bar. */
(function(){var h=document.querySelector(".mm-header"),b=h.querySelector(".mm-burger");b.addEventListener("click",function(){var o=h.classList.toggle("is-open");b.setAttribute("aria-expanded",o?"true":"false");b.setAttribute("aria-label",o?"Close menu":"Open menu");});document.addEventListener("keydown",function(e){if(e.key==="Escape"&&h.classList.contains("is-open")){h.classList.remove("is-open");b.setAttribute("aria-expanded","false");b.focus();}});})();
  })();
  /* Share Your Idea scrolls down to the form, clear of the website's sticky header when embedded (Perry, 13 Nov 2026);
     an old link ending #tell still lands on the form. */
  function toForm(smooth){ var f = $('tell'); if(!f) return; var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: f.getBoundingClientRect().top + window.scrollY - headerOffset(OPT) - 20, behavior: smooth && !still ? 'smooth' : 'auto' }); }
  /* Brings el into view clear of the website's sticky header when embedded, with 20 pixels' room at the top as the
     standalone page always had: an error to read, the first field to fix, the thank-you after sending. */
  function show(el, smooth){ if(!el) return; var r = el.getBoundingClientRect(), room = headerOffset(OPT) + 20, y = null;
    if(r.top < room) y = window.scrollY + r.top - room;
    else if(r.bottom > window.innerHeight) y = window.scrollY + Math.min(r.top - room, r.bottom - window.innerHeight);
    if(y !== null) window.scrollTo({ top: y, behavior: smooth ? 'smooth' : 'auto' }); }
  function focusShow(el){ if(!el) return; el.focus({ preventScroll: true }); show(el, false); }
  ROOT.addEventListener('click', function(e){ var a = e.target.closest && e.target.closest('a[href="#si-tell"]'); if(!a) return; e.preventDefault(); toForm(true); });
  if(location.hash === '#tell') setTimeout(function(){ toForm(false); }, 0);
/* The website's menu: each item opens its list from its arrow (and on hover); on a phone, the menu button opens the menu.
   Talk to Us First opens a panel with Perry's details: email him, or copy his address (Perry, 18 Oct 2026). */
(function () {
  var dlg = $('talkd'), copy = $('talkcopy');
  $('talk').addEventListener('click', function () { copy.textContent = 'Copy Address'; dlg.showModal(); $('talkmail').focus(); });
  $('talkx').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });   /* outside the panel */
  dlg.addEventListener('close', function () { $('talk').focus(); });
  copy.addEventListener('click', function () { var done = function () { copy.textContent = 'Copied'; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText('pwilliams@mismo.org').then(done, fallback); else fallback();
    function fallback() { var t = document.createElement('textarea'); t.value = 'pwilliams@mismo.org'; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0'; dlg.appendChild(t); t.select();
      try { document.execCommand('copy'); done(); } catch (e) { copy.textContent = 'pwilliams@mismo.org'; } t.remove(); } });
})();
(function () {
  var SUBMIT = 'https://rgvdi67cg27o5kcmiytcqbqnrm0hmztx.lambda-url.us-east-1.on.aws/hub-requests/ideas/submit';
  var WHO = ['Lenders', 'Servicers', 'Investors and GSEs', 'Technology providers', 'Settlement and title', 'Appraisal and valuation', 'Government agencies', 'Consumers'];
  /* $ is main's: it adds the si- prefix, so the ids below are written as they always were. */
  var startedAt = Date.now(), chosen = {}, other = false, busy = false;
  function chips() {
    $('who').innerHTML = WHO.map(function (w) { return '<button type="button" class="chip" data-who="' + w + '" aria-pressed="' + !!chosen[w] + '">' + w + '</button>'; }).join('') +
      '<button type="button" class="chip" data-who="" aria-pressed="' + other + '">Other</button>';
    $('whoOther').hidden = !other; $('whoOther-l').hidden = !other;
  }
  $('who').addEventListener('click', function (e) { var b = e.target.closest('[data-who]'); if (!b) return; var w = b.dataset.who;
    if (w) chosen[w] = !chosen[w]; else { other = !other; if (other) setTimeout(function () { $('whoOther').focus(); }, 0); }
    chips(); var again = $('who').querySelector('[data-who="' + w + '"]'); if (again && w) again.focus(); });
  chips();
  function val(id) { return ($(id).value || '').trim(); }
  function oneLine(s) { return s.replace(/\s+/g, ' ').trim(); }
  function member() { var r = ROOT.querySelector('input[name=member]:checked'); return r ? r.value : ''; }
  function say(html) { var m = $('msg'); m.innerHTML = html; m.hidden = false; show(m, true); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  /* The same checks the relay makes, so most problems are caught here, in the same words. */
  function check() {
    var bad = [], mark = function (id, wrong, text) { $(id).setAttribute('aria-invalid', wrong ? 'true' : 'false'); if (wrong) bad.push([id, text]); };
    mark('title', oneLine(val('title')).length < 3, 'Give your idea a short name.');
    mark('idea', val('idea').length < 40, val('idea') ? 'Tell us a little more about the idea: a few sentences, with enough detail for us to understand it.' : 'Describe the idea.');
    mark('why', oneLine(val('why')).length < 10, val('why').trim() ? 'Say a little more about why it matters.' : 'Say why it matters.');
    mark('name', oneLine(val('name')).length < 2, 'Add your name.');
    mark('company', oneLine(val('company')).length < 2, 'Add your company.');
    mark('email', !/^[^\s@]{1,64}@[^\s@]+\.[A-Za-z]{2,}$/.test(val('email')), 'Add an email address we can reply to.');
    return bad;
  }
  /* Attachments (Perry, 18 Oct 2026): checked here as they're chosen (the relay checks again), sent one by one after the idea,
     each with the ticket the idea's answer carries. */
  var ATTACH = SUBMIT.replace(/submit$/, 'attach'), files = [], MAXF = 5, MAXB = 4 * 1024 * 1024;
  var KINDS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'png', 'jpg', 'jpeg', 'txt', 'csv'];
  function size(n) { return n < 1024 * 1024 ? Math.max(1, Math.round(n / 1024)) + ' KB' : (n / 1024 / 1024).toFixed(1) + ' MB'; }
  function drawFiles() { $('flist').innerHTML = files.map(function (f, i) { return '<li><span>' + esc(f.name) + '</span><span class="sz">' + size(f.size) + '</span><button type="button" data-rmfile="' + i + '" aria-label="Remove ' + esc(f.name) + '">&times;</button></li>'; }).join(''); }
  $('files').addEventListener('change', function () {
    var refused = [];
    Array.prototype.forEach.call($('files').files, function (f) {
      var ext = ((f.name.match(/\.([A-Za-z0-9]{1,5})$/) || [])[1] || '').toLowerCase();
      if (KINDS.indexOf(ext) < 0) refused.push(f.name + ': that kind of file can\u2019t be attached');
      else if (f.size > MAXB) refused.push(f.name + ': over 4 MB (email it to MISMO after you submit)');
      else if (!f.size) refused.push(f.name + ': the file is empty');
      else if (files.length >= MAXF) refused.push(f.name + ': up to 5 files');
      else files.push(f);
    });
    $('files').value = ''; drawFiles();
    if (refused.length) say('<b>Not added:</b><ul>' + refused.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul>'); else $('msg').hidden = true;
  });
  $('flist').addEventListener('click', function (e) { var b = e.target.closest('[data-rmfile]'); if (!b) return; files.splice(+b.dataset.rmfile, 1); drawFiles(); $('files').focus(); });
  function asBase64(f) { return new Promise(function (ok, no) { var r = new FileReader(); r.onload = function () { ok(String(r.result).split(',')[1] || ''); }; r.onerror = no; r.readAsDataURL(f); }); }
  function sendFiles(j) {
    var res = { sent: [], failed: [] }; if (!j.attach || !j.reference || !files.length) return Promise.resolve(res);
    return files.reduce(function (p, f, i) { return p.then(function () {
      $('go').textContent = 'Sending attachments (' + (i + 1) + ' of ' + files.length + ')\u2026';
      return asBase64(f).then(function (data) { return fetch(ATTACH, { method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store', body: JSON.stringify({ ticket: j.attach, name: f.name, data: data }) }); })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (x) { if (r.ok && x.ok) res.sent.push(x.name || f.name); else res.failed.push([f.name, x.message || 'it couldn\u2019t be sent']); }); },
              function () { res.failed.push([f.name, 'MISMO couldn\u2019t be reached']); });
    }); }, Promise.resolve()).then(function () { return res; });
  }
  $('form').addEventListener('submit', function (e) {
    e.preventDefault(); if (busy) return;
    var bad = check();
    if (bad.length) { say('<b>A few things to finish:</b><ul>' + bad.map(function (b) { return '<li>' + esc(b[1]) + '</li>'; }).join('') + '</ul>'); focusShow($(bad[0][0])); return; }
    var body = { title: oneLine(val('title')), idea: val('idea'), who: WHO.filter(function (w) { return chosen[w]; }), whoOther: other ? oneLine(val('whoOther')) : '',
      why: val('why'), name: oneLine(val('name')), company: oneLine(val('company')), email: val('email'), phone: oneLine(val('phone')), member: member(),
      website: $('website').value, startedAt: startedAt };
    busy = true; $('go').disabled = true; $('go').textContent = 'Sending\u2026'; $('msg').hidden = true;
    fetch(SUBMIT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store', body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { r: r, j: j }; }); })
      .then(function (x) {
        if (x.r.ok && x.j.ok) return sendFiles(x.j).then(function (res) { thanks(body, x.j, res); });
        if (x.r.status === 400 && x.j.problems) return say('<b>A few things to finish:</b><ul>' + x.j.problems.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>');
        if (x.r.status === 404) return say('The idea form isn\u2019t switched on yet. Please try again in a few days, or email your idea to <a href="mailto:pwilliams@mismo.org">pwilliams@mismo.org</a>. Your answers are still here.');
        say(esc(x.j.message || 'Your idea couldn\u2019t be sent just now (' + x.r.status + '). Your answers are still here: please try again in a minute.'));
      }, function () { say('MISMO couldn\u2019t be reached just now. Check your connection and try again; your answers are still here.'); })
      .then(function () { busy = false; $('go').disabled = false; $('go').innerHTML = 'Submit Your Idea &rarr;'; });
  });
  function day(ymd) { var d = new Date(ymd + 'T12:00:00Z'); return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' }); }
  function thanks(b, j, res) {
    res = res || { sent: [], failed: [] };
    var first = b.name.split(' ')[0];
    $('thanks').textContent = 'Thank you, ' + first + '. Your idea is with MISMO.';
    $('next').innerHTML = 'A MISMO staff member will reach out to <b>' + esc(b.email) + '</b> within two business days' + (j.replyBy ? ', by <b>' + esc(day(j.replyBy)) + '</b>' : '') + '. A receipt is on its way to that address.';
    var who = b.who.concat(b.whoOther ? [b.whoOther] : []).join(', ');
    $('sum').innerHTML = (j.reference ? '<dt>Reference</dt><dd>' + esc(j.reference) + '</dd>' : '') + '<dt>Your idea</dt><dd>' + esc(b.title) + '</dd>' + (who ? '<dt>Who&rsquo;s involved</dt><dd>' + esc(who) + '</dd>' : '');
    if (res.sent.length) $('sum').innerHTML += '<dt>Attachments</dt><dd>' + res.sent.map(esc).join('<br>') + '</dd>';
    if (res.failed.length) $('sum').insertAdjacentHTML('afterend', '<div class="msg" id="si-notattached"><b>Not attached:</b><ul>' + res.failed.map(function (f) { return '<li>' + esc(f[0]) + ': ' + esc(f[1]) + '</li>'; }).join('') + '</ul>Email ' + (res.failed.length === 1 ? 'it' : 'them') + ' to <a href="mailto:pwilliams@mismo.org?subject=' + encodeURIComponent('Attachments for ' + (j.reference || 'my idea')) + '">pwilliams@mismo.org</a>' + (j.reference ? ', mentioning ' + esc(j.reference) : '') + '.</div>');
    $('form').hidden = true; $('done').hidden = false; focusShow($('thanks'));
  }
  $('again').addEventListener('click', function () {
    ['title', 'idea', 'why', 'whoOther'].forEach(function (id) { $(id).value = ''; $(id).removeAttribute('aria-invalid'); });   /* the sender's own details stay */
    files = []; drawFiles(); var na = $('notattached'); if (na) na.remove();
    chosen = {}; other = false; chips(); startedAt = Date.now(); $('done').hidden = true; $('form').hidden = false; $('msg').hidden = true; focusShow($('title'));
  });
})();
}

function mount(el, opts){
  if(!el) throw new Error('MISMO_SUBMIT_IDEA.mount needs the element to draw the form in');
  if(el.__mmSubmitIdea) return el.__mmSubmitIdea;   // mounted already: the first mount stands
  var OPT = Object.assign({ base: '', embedded: false, headerOffset: 0 }, opts || {});
  if(!el.id) el.id = 'mm-submit-idea';
  if(el.id !== 'mm-submit-idea') console.warn('MISMO_SUBMIT_IDEA: the form\u2019s styles apply only inside id="mm-submit-idea"');
  el.innerHTML = OPT.embedded ? PAGE : TOP + PAGE + BOTTOM;
  if(OPT.embedded){
    el.classList.add('embedded');
    /* The website's own font: the form's font settings take whatever the page around it uses. */
    var ff = el.parentNode && el.parentNode.nodeType === 1 ? getComputedStyle(el.parentNode).fontFamily : '';
    if(ff) ['--font', '--mm-font'].forEach(function(k){ el.style.setProperty(k, ff); });
  }
  main(el, OPT);
  el.__mmSubmitIdea = Promise.resolve();
  return el.__mmSubmitIdea;
}
G.app = { mount: mount };
})();
