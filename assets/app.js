// === Config ===
const FORMSPREE_ENDPOINT = ""; // ex: "https://formspree.io/f/xxxxabcd" (lasă gol pentru fallback mailto)

// === Helpers ===
async function loadJSON(path){
  const res = await fetch(path + "?v=" + Date.now());
  if(!res.ok) throw new Error("Nu pot încărca " + path);
  return await res.json();
}
function el(tag, cls){ const e=document.createElement(tag); if(cls) e.className=cls; return e; }

// === Company / Home ===
async function hydrateCompany(){
  try{
    const data = await loadJSON("content/company.json");
    const h1 = document.getElementById("home-h1");
    const lead = document.getElementById("home-lead");
    const bullets = document.getElementById("home-bullets");
    const email = document.getElementById("company-email");
    const loc = document.getElementById("company-location");
    const tagline = document.getElementById("company-tagline");
    if(h1 && data.home?.h1) h1.textContent = data.home.h1;
    if(lead && data.home?.lead) lead.textContent = data.home.lead;
    if(bullets && Array.isArray(data.home?.bullets)){
      bullets.innerHTML = "";
      data.home.bullets.forEach(b => { const li=el("li"); li.textContent=b; bullets.appendChild(li); });
    }
    if(email){ email.textContent = data.email; email.href = "mailto:" + data.email; }
    if(loc) loc.textContent = data.location;
    if(tagline) tagline.textContent = data.tagline;
  }catch(e){ console.warn(e); }
}

// === Services ===
async function hydrateServices(){
  try{
    const data = await loadJSON("content/services.json");
    function render(into, items){
      into.innerHTML = "";
      items.forEach(s=>{
        const art = el("article","card");
        const h3 = el("h3"); h3.textContent = s.title;
        const p = el("p"); p.textContent = s.description;
        const ul = el("ul","bullets");
        (s.bullets||[]).forEach(b=>{ const li=el("li"); li.textContent=b; ul.appendChild(li); });
        art.append(h3,p,ul);
        into.appendChild(art);
      });
    }
    const list = document.getElementById("services-list");
    const home = document.getElementById("services-home");
    if(list) render(list, data.items||[]);
    if(home) render(home, (data.items||[]).slice(0,3));
  }catch(e){ console.warn(e); }
}

// === Projects ===
async function hydrateProjects(){
  try{
    const data = await loadJSON("content/projects.json");
    function card(pj){
      const art = el("article","card project");
      const thumb = el("div","thumb placeholder");
      const h3 = el("h3"); h3.textContent = pj.title;
      const p = el("p"); p.textContent = pj.summary || "";
      art.append(thumb,h3,p);
      if(pj.image){
        const img = new Image(); img.src = pj.image; img.alt = pj.title;
        img.style.width="100%"; img.style.height="140px"; img.style.objectFit="cover"; img.style.borderRadius="12px";
        art.replaceChild(img, thumb);
      }
      return art;
    }
    function render(into, items){ into.innerHTML=""; (items||[]).forEach(p=>into.appendChild(card(p))); }
    const list = document.getElementById("projects-list");
    const home = document.getElementById("projects-home");
    if(list) render(list, data.items||[]);
    if(home) render(home, (data.items||[]).slice(0,3));
  }catch(e){ console.warn(e); }
}

// === Contact form ===
function setupContact(){
  const f = document.getElementById("contact-form");
  if(!f) return;
  if(FORMSPREE_ENDPOINT){
    f.action = FORMSPREE_ENDPOINT;
    f.method = "POST";
  }else{
    f.addEventListener("submit",(e)=>{
      e.preventDefault();
      const data = new FormData(f);
      const mail = (document.getElementById("company-email")?.textContent)||"hello@fussioncomm.example";
      const subject = encodeURIComponent("Cerere ofertă — FussionComm ICT");
      const body = encodeURIComponent(`Nume: ${data.get("name")}
Email: ${data.get("email")}
Mesaj:
${data.get("message")}`);
      location.href = `mailto:${mail}?subject=${subject}&body=${body}`;
    });
  }
}

// === Init ===
document.addEventListener("DOMContentLoaded", async ()=>{
  await hydrateCompany();
  await Promise.all([hydrateServices(), hydrateProjects()]);
  setupContact();
});
