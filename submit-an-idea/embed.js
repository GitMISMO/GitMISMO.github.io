/* MISMO Submit an Idea: the loader (Perry, 13 Nov 2026, as for the Business Glossary). Its address never changes:
 *   https://resources.mismo.org/submit-an-idea/embed.js
 * It reads version.json beside it on every load, so whatever is published shows at once, then loads the current
 * app-<fingerprint>.css and .js and mounts the form. The page gets one global, window.MISMO_SUBMIT_IDEA:
 *   MISMO_SUBMIT_IDEA.mount(element, {base, headerOffset, embedded})   returns a promise, settled once the form is drawn
 *   MISMO_SUBMIT_IDEA.version                                          version.json's contents, once read
 * It also mounts itself on <div id="mm-submit-idea"> when it finds one that nothing has mounted, with any options the
 * page set beforehand in window.MISMO_SUBMIT_IDEA = {options: {...}}. */
(function(){
  'use strict';
  var G = window.MISMO_SUBMIT_IDEA = window.MISMO_SUBMIT_IDEA || {};
  if(G.mount) return;   // loaded twice: the first copy stands
  var me = document.currentScript;
  var BASE = me && me.src ? me.src.replace(/[?#].*$/, '').replace(/[^\/]*$/, '') : 'https://resources.mismo.org/submit-an-idea/';
  var loading = null;

  function json(url){
    return fetch(url, {cache: 'no-cache'}).then(function(r){ if(!r.ok) throw new Error(url + ' returned ' + r.status); return r.json(); });
  }
  function add(tag, url){
    return new Promise(function(ok, no){
      var e = document.createElement(tag);
      if(tag === 'link'){ e.rel = 'stylesheet'; e.href = url; } else { e.src = url; e.async = false; }
      e.setAttribute('data-mm-submit-idea', '');
      e.onload = function(){ ok(e); };
      e.onerror = function(){ e.remove(); no(new Error(url + ' did not load')); };
      document.head.appendChild(e);
    });
  }
  function load(fresh){
    return json(BASE + 'version.json' + (fresh ? '?t=' + Date.now() : '')).then(function(v){
      G.version = v;
      return Promise.all([add('link', BASE + v.css), add('script', BASE + v.js)]);
    });
  }
  /* A publish replaces the app files. A page that read version.json just before one finds its files gone: it asks again. */
  function ready(){
    if(!loading) loading = load(false).catch(function(){ return load(true); }).then(function(){
      if(!G.app || !G.app.mount) throw new Error('the form\u2019s app file did not start');
    });
    return loading;
  }

  function mount(el, opts){
    el = el || document.getElementById('mm-submit-idea');
    if(!el) return Promise.reject(new Error('MISMO_SUBMIT_IDEA.mount: no element to draw the form in'));
    el.setAttribute('data-si', '');   // claimed, so the automatic mount leaves it alone
    var o = Object.assign({base: BASE, embedded: true}, G.options || {}, opts || {});
    return ready().then(function(){ return G.app.mount(el, o); }, function(e){
      if(!el.firstChild) el.innerHTML = '<p style="margin:40px 0;font:inherit">The Submit an Idea form couldn\u2019t be loaded. Reload the page to try again.</p>';
      throw e;
    });
  }
  G.mount = mount;

  function auto(){
    var el = document.getElementById('mm-submit-idea');
    if(el && !el.hasAttribute('data-si')) mount(el).catch(function(e){ console.error('MISMO_SUBMIT_IDEA:', e && e.message); });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', auto); else setTimeout(auto, 0);
})();
