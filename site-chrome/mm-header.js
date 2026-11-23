/* MISMO shared site header for pages outside Higher Logic (forms and tools on resources.mismo.org).
   One file, so every form matches www.mismo.org. Owned by the website's Claude. Do not copy it into a page:
   load it with  <script src="https://resources.mismo.org/site-chrome/mm-header.js"></script>  placed right after <body>.
   It replaces any old header.mm-header on the page. No Log in button, by Jonna's decision. Version 2026-11-22. */
(function () {
  if (window.__mmSiteHeader) return;
  window.__mmSiteHeader = '2026-11-22';
  var SITE = 'https://www.mismo.org';
  var LOGO = 'https://higherlogicdownload.s3.amazonaws.com/MISMO/LogoImages/6e07790a-6fc9-43dc-b9d6-9178e00c3342_mismo-reverse-nav-logo.png';
  var NAV = [
    ['Membership', '/membership', 'Benefits, levels and how to join', [
      ['MISMO Members', '/membership/member-directory'],
      ['Our MISMO Lender Members', '/membership/lender-champions'],
      ['Our MISMO Industry Members', '/membership/industry-champions'],
      ['Innovation Investment Fund', '/membership/iif']]],
    ['Standards & Resources', '/standards-resources', 'Standards, tools and work products', [
      ['Business Glossary', '/glossary'],
      ['Life of Loan', '/standards-resources/life-of-loan'],
      ['Certifications', '/standards-resources/certification'],
      ['MISMO Link', '/standards-resources/mismo-link'],
      ['Digital Mortgage Resource Center', '/standards-resources/digital-mortgage-resource-center']]],
    ['Get Involved', '/get-involved', 'Workgroups, meetings and communities', [
      ['Communities & Workgroups', '/get-involved/workgroups'],
      ['MISMO Connect (Members Only)', '/home/memberhome']]],
    ['Events', '/events', 'Summit, webinars and education', [
      ['MISMO Summit', '/events/summit'],
      ['Education', '/events/education']]],
    ['About MISMO', '/about-mismo', 'Who we are and how we work', [
      ['MISMO Matters', '/about-mismo/mismo-matters'],
      ['News', '/about-mismo/news'],
      ['Contributor Awards', '/about-mismo/contributor-awards']]]
  ];

  var P = '#mmsh';
  var css = [
    'header.mm-header,.mm-header-spacer{display:none!important}',
    P + '{position:relative;z-index:1000;background:#071d2e;font-family:"IBM Plex Sans","Segoe UI",-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;line-height:1.4;margin:0}',
    P + ' *{box-sizing:border-box}',
    P + ' a{text-decoration:none}',
    P + ' .mmsh-bar{display:flex;align-items:center;height:70px;padding:0 50px}',
    P + ' .mmsh-logo{display:block;flex:0 0 auto;line-height:0}',
    P + ' .mmsh-logo img{display:block;width:192px;height:36px;object-fit:contain;border:0}',
    P + ' .mmsh-nav{display:flex;align-items:center;margin:1px 0 0 38px;padding:0;list-style:none}',
    P + ' .mmsh-nav>li{position:relative;margin:0;padding:0;list-style:none}',
    P + ' .mmsh-top{display:block;padding:8px 11px;color:#fff;font-size:clamp(15px,1.02vw,17px);font-weight:500;line-height:21px;white-space:nowrap}',
    P + ' .mmsh-top:hover,' + P + ' .mmsh-top:focus,' + P + ' .mmsh-nav>li:hover>.mmsh-top{color:#74bfeb}',
    P + ' .mmsh-car{display:inline-block;width:18px;height:15px;margin-left:6px;vertical-align:middle}',
    P + ' .mmsh-car svg{display:none;width:14px;height:14px}',
    P + ' .mmsh-dd{display:none;position:absolute;left:calc(50% - 12px);transform:translateX(-50%);top:100%;margin:16px 0 0;min-width:250px;padding:8px 0;list-style:none;background:#0b2740;border:1px solid rgba(116,191,235,.28);border-top:2px solid #1a8fe3;border-radius:0 0 8px 8px;box-shadow:0 18px 40px -14px rgba(0,0,0,.6)}',
    P + ' .mmsh-dd:after{content:"";position:absolute;left:50%;top:-11px;margin-left:-9px;border:0 solid transparent;border-width:0 9px 9px;border-bottom-color:#1a8fe3}',
    P + ' .mmsh-dd:before{content:"";position:absolute;left:0;right:0;top:-16px;height:16px}',
    P + ' .mmsh-nav>li:hover>.mmsh-dd,' + P + ' .mmsh-nav>li:focus-within>.mmsh-dd{display:block}',
    P + ' .mmsh-dd li{margin:0;padding:0;list-style:none}',
    P + ' .mmsh-dd a{display:block;padding:10px 18px 10px 16px;border-left:2px solid transparent;color:#e6eef5;font-size:15px;font-weight:500;line-height:19.5px;white-space:nowrap}',
    P + ' .mmsh-dd a:hover,' + P + ' .mmsh-dd a:focus{color:#fff;background:rgba(86,180,242,.12);border-left-color:#56b4f2}',
    P + ' .mmsh-dd li.mmsh-ov{border-bottom:1px solid rgba(255,255,255,.14);margin:0 0 6px;padding:0 0 6px}',
    P + ' .mmsh-dd li.mmsh-ov a{font-weight:700;color:#fff;background:rgba(86,180,242,.18);border-left:3px solid #56b4f2;padding:12px 18px 12px 17px}',
    P + ' .mmsh-dd small{display:block;font-weight:400;font-size:12px;line-height:1.35;color:#a9d8f3;margin-top:3px;white-space:normal}',
    P + ' .mmsh-right{display:flex;align-items:center;gap:4px;margin-left:auto}',
    P + ' .mmsh-sbtn{display:flex;align-items:center;justify-content:center;width:30px;height:30px;padding:0;border:0;border-radius:50%;background:transparent;color:#fff;cursor:pointer}',
    P + ' .mmsh-sbtn:hover{color:#74bfeb}',
    P + ' .mmsh-sbtn svg{width:19px;height:19px}',
    P + ' .mmsh-sform{display:none;position:absolute;right:50px;top:70px;z-index:2;padding:10px;background:#0b2740;border-radius:0 0 8px 8px;box-shadow:0 18px 40px -14px rgba(0,0,0,.6)}',
    P + '.mmsh-s-open .mmsh-sform{display:block}',
    P + ' .mmsh-sform input,' + P + ' .mmsh-msearch input{width:280px;height:36px;padding:0 16px 0 38px;border:0;border-radius:50px;background:#fff url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%236b8197%27 stroke-width=%272.4%27 stroke-linecap=%27round%27%3E%3Ccircle cx=%2711%27 cy=%2711%27 r=%277%27/%3E%3Cpath d=%27m20 20-4-4%27/%3E%3C/svg%3E") no-repeat 14px center/15px;color:#0d314c;font:400 15px "IBM Plex Sans",Arial,sans-serif;outline:none}',
    P + ' .mmsh-burger{display:none;width:40px;height:32px;padding:9px 10px;border:0;background:transparent;color:#e6eef5;cursor:pointer}',
    P + ' .mmsh-burger span{display:block;height:2px;margin:0 0 5px;background:currentColor;border-radius:1px}',
    P + ' .mmsh-burger span:last-child{margin:0}',
    P + ' .mmsh-msearch,' + P + ' .mmsh-panel{display:none}',
    '@media (max-width:1340px){' + P + ' .mmsh-top{font-size:clamp(12.4px,1.17vw,15px)}}',
    '@media (min-width:1342px){' + P + ' .mmsh-nav{margin-left:calc(.23 * (100vw - 1341px) + 38px)}}',
    '@media (min-width:1400px){' + P + ' .mmsh-top{padding:8px 16px}}',
    '@media (min-width:1500px){' + P + ' .mmsh-bar{padding-left:0}' + P + ' .mmsh-logo img{width:199px}' + P + ' .mmsh-nav{margin-left:calc(.49 * (100vw - 1341px) + 38px)}}',
    '@media (max-width:1299px){' + P + ' .mmsh-bar{padding:0 25px}' + P + ' .mmsh-sform{right:25px}' + P + ' .mmsh-logo img{width:190px}}',
    '@media (max-width:1299px){' + P + ' .mmsh-top{padding:8px 5px}}',
    '@media (max-width:1149px){' + P + ' .mmsh-nav{margin-left:6px}}',
    '@media (max-width:1050px){' + P + ' .mmsh-logo img{width:128px;height:20px}' + P + ' .mmsh-nav{margin-left:4px}' + P + ' .mmsh-top{padding:8px 4px}' + P + ' .mmsh-car{width:15px}}',
    '@media (max-width:992px){' +
      P + ' .mmsh-bar{padding:0 36px 0 38px;flex-wrap:wrap}' +
      P + ' .mmsh-logo img{width:228px;height:36px}' +
      P + ' .mmsh-nav,' + P + ' .mmsh-sbtn{display:none}' +
      P + ' .mmsh-burger{display:block;margin-left:10px}' +
      P + ' .mmsh-right{gap:0}' +
      P + '.mmsh-open .mmsh-panel{display:block}' +
      P + ' .mmsh-panel{display:none;padding:0 30px 28px;border-top:1px solid rgba(255,255,255,.1)}' +
      P + ' .mmsh-panel .mmsh-nav{display:block;margin:0}' +
      P + ' .mmsh-panel .mmsh-nav>li{margin:0 0 16px}' +
      P + ' .mmsh-panel .mmsh-top{display:inline-flex;align-items:center;padding:8px 16px;font-size:15px}' +
      P + ' .mmsh-panel .mmsh-car{width:auto;height:auto;margin-left:6px}' +
      P + ' .mmsh-panel .mmsh-car svg{display:block}' +
      P + ' .mmsh-panel .mmsh-dd{position:static;display:none;transform:none;margin:4px 0 0 16px;min-width:0;box-shadow:none;border:0;border-left:2px solid rgba(116,191,235,.28);border-radius:0}' +
      P + ' .mmsh-panel .mmsh-dd:after{display:none}' +
      P + ' .mmsh-panel .mmsh-nav>li:hover>.mmsh-dd{display:none}' +
      P + ' .mmsh-panel .mmsh-nav>li.mmsh-x>.mmsh-dd{display:block}' +
      P + ' .mmsh-panel .mmsh-dd a{white-space:normal}' +
      P + ' .mmsh-msearch{display:block;margin:8px 5px 0}' +
      P + ' .mmsh-msearch input{width:100%}' +
      P + ' .mmsh-sform{display:none!important}' +
      P + '.mmsh-open .mmsh-burger span:nth-child(1){transform:translateY(7px) rotate(45deg)}' +
      P + '.mmsh-open .mmsh-burger span:nth-child(2){opacity:0}' +
      P + '.mmsh-open .mmsh-burger span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}' +
    '}',
    '@media (max-width:420px){' + P + ' .mmsh-logo img{width:146px}' + P + ' .mmsh-bar{padding:0 33px 0 38px}}'
  ].join('\n');

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  var chev = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  function navHtml() {
    return '<ul class="mmsh-nav">' + NAV.map(function (n) {
      var sub = '<li class="mmsh-ov"><a href="' + SITE + n[1] + '">' + esc(n[0]) + ' Overview<small>' + esc(n[2]) + '</small></a></li>' +
        n[3].map(function (s) { return '<li><a href="' + SITE + s[1] + '">' + esc(s[0]) + '</a></li>'; }).join('');
      return '<li><a class="mmsh-top" href="' + SITE + n[1] + '">' + esc(n[0]) + '<span class="mmsh-car">' + chev + '</span></a><ul class="mmsh-dd">' + sub + '</ul></li>';
    }).join('') + '</ul>';
  }
  var searchForm = function (cls) {
    return '<form class="' + cls + '" action="' + SITE + '/search" method="get" role="search">' +
      '<input type="hidden" name="executeSearch" value="true"><input type="search" name="SearchTerm" placeholder="Search MISMO" aria-label="Search MISMO"></form>';
  };
  var html =
    '<div class="mmsh-bar">' +
      '<a class="mmsh-logo" href="' + SITE + '/home"><img src="' + LOGO + '" alt="MISMO logo. This will take you to the homepage"></a>' +
      navHtml() +
      '<div class="mmsh-right">' +
        '<button type="button" class="mmsh-sbtn" aria-label="Search" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg></button>' +
        '<button type="button" class="mmsh-burger" aria-label="Toggle navigation" aria-expanded="false"><span></span><span></span><span></span></button>' +
      '</div>' +
    '</div>' +
    searchForm('mmsh-sform') +
    '<div class="mmsh-panel">' + navHtml() + searchForm('mmsh-msearch') + '</div>';

  function fonts() {
    if (document.querySelector('link[href*="IBM+Plex+Sans"]')) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap';
    (document.head || document.documentElement).appendChild(l);
  }
  function build() {
    if (document.getElementById('mmsh')) return;
    var st = document.createElement('style');
    st.id = 'mmsh-css';
    st.textContent = css;
    (document.head || document.documentElement).appendChild(st);
    fonts();
    var h = document.createElement('header');
    h.id = 'mmsh';
    h.setAttribute('data-version', window.__mmSiteHeader);
    h.innerHTML = html;
    var me = document.currentScript;
    if (me && me.parentNode && document.body && document.body.contains(me)) me.parentNode.insertBefore(h, me);
    else if (document.body) document.body.insertBefore(h, document.body.firstChild);
    else return;
    var sb = h.querySelector('.mmsh-sbtn');
    sb.addEventListener('click', function () {
      var open = h.classList.toggle('mmsh-s-open');
      sb.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) h.querySelector('.mmsh-sform input[type=search]').focus();
    });
    var bg = h.querySelector('.mmsh-burger');
    bg.addEventListener('click', function () {
      var open = h.classList.toggle('mmsh-open');
      bg.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    [].forEach.call(h.querySelectorAll('.mmsh-panel .mmsh-car'), function (c) {
      c.addEventListener('click', function (e) {
        e.preventDefault();
        c.parentNode.parentNode.classList.toggle('mmsh-x');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { h.classList.remove('mmsh-s-open'); h.classList.remove('mmsh-open'); }
    });
  }
  function removeOld() {
    [].forEach.call(document.querySelectorAll('header.mm-header'), function (o) { if (o.id !== 'mmsh') o.parentNode.removeChild(o); });
  }
  if (document.body) build();
  else document.addEventListener('DOMContentLoaded', build);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', removeOld);
  else removeOld();
})();
