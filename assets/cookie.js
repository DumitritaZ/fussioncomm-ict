(function(){
  const KEY='fc_cookie_ok';
  if (localStorage.getItem(KEY)) return;

  const bar=document.createElement('div');
  bar.style.cssText='position:fixed;left:12px;right:12px;bottom:12px;background:#111826;border:1px solid #23304a;border-radius:12px;padding:12px;z-index:9999;display:flex;gap:10px;align-items:center;justify-content:space-between;color:#e6ebf5;font:14px/1.4 Inter,system-ui,sans-serif';
  bar.innerHTML=`<span>We use cookies for analytics.</span>
  <span style="display:flex;gap:8px">
    <a href="privacy.html" style="color:#9cc7ff">Privacy Policy</a>
    <button id="ck-accept" style="padding:.4rem .8rem;border-radius:8px;border:0;background:#3B82F6;color:#071225;font-weight:700;cursor:pointer">Accept</button>
  </span>`;
  document.body.appendChild(bar);

  document.getElementById('ck-accept').onclick=()=>{
    localStorage.setItem(KEY,'1');
    bar.remove();
    // start GA/Hotjar here if you want
  };
})();
