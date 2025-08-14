
// Minimal enhancements
document.addEventListener('click', (e) => {
  // smooth scroll for same-page anchors
  const a = e.target.closest('a[href^="#"]');
  if(a){
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if(target){ e.preventDefault(); target.scrollIntoView({behavior:'smooth'}); }
  }
});
