(function(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var d=document,h=d.querySelector('header'),sp=d.createElement('div');sp.id='sp';d.body.appendChild(sp);
d.querySelectorAll('.kick').forEach(function(k){k.classList.add('rv')});
d.querySelectorAll('h2.t').forEach(function(k){k.classList.add('rv')});
d.querySelectorAll('.reveal').forEach(function(el){var p=el.parentElement,i=[].indexOf.call(p.children,el);el.style.transitionDelay=(i*80)+'ms';
if(el.classList.contains('stat'))el.classList.add('fx-l');else if(el.tagName==='IMG')el.classList.add('fx-s')});
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.15});
d.querySelectorAll('.kick.rv,.t.rv').forEach(function(e){io.observe(e)});
var cu=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;cu.unobserve(e.target);var n=e.target.firstChild,m=n.nodeValue.match(/^([^\d]*)([\d.]+)(.*)$/);if(!m)return;var to=parseFloat(m[2]),dec=(m[2].split('.')[1]||'').length,t0=performance.now(),dur=900;(function f(t){var k=Math.min(1,(t-t0)/dur),v=to*(1-Math.pow(1-k,3));n.nodeValue=m[1]+v.toFixed(dec)+m[3];if(k<1)requestAnimationFrame(f)})(t0)})},{threshold:.6});
d.querySelectorAll('.plan .p').forEach(function(e){if(e.firstChild&&e.firstChild.nodeType===3)cu.observe(e)});
var st=d.querySelector('.stage'),tk=0;function u(){tk=0;var y=scrollY,mx=d.documentElement.scrollHeight-innerHeight;sp.style.transform='scaleX('+(mx>0?y/mx:0)+')';h.classList.toggle('sc',y>10);if(st&&y<900&&innerWidth>900)st.style.transform='translate3d(0,'+(y*-.06).toFixed(1)+'px,0)'}
addEventListener('scroll',function(){if(!tk){tk=1;requestAnimationFrame(u)}},{passive:true});u();
var c=d.getElementById('conv');if(c){new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(function(n){if(n.classList&&n.classList.contains('l')){n.style.display='none';var t=d.createElement('div');t.className='typing';t.innerHTML='<i></i><i></i><i></i>';c.insertBefore(t,n);setTimeout(function(){},0);var w=0;(function chk(){var pv=t.previousElementSibling;t.style.display=(pv&&pv.classList.contains('show'))?'flex':'none';if(n.classList.contains('show')||++w>40){t.remove();n.style.display=''}else setTimeout(chk,80)})()}})})}).observe(c,{childList:true})}
})();
