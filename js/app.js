const C=window.WINE_DATA;
updated='2 September 2026';
const totalSelections=C.reduce((total,category)=>total+category.sections.reduce((sum,section)=>sum+section.items.length,0),0);let current=C[0].id;const nav=document.querySelector('#nav'),main=document.querySelector('#main'),q=document.querySelector('#q'),st=document.querySelector('#st'),meta=document.querySelector('#meta');const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));const n=c=>c.sections.reduce((a,s)=>a+s.items.length,0);
// Navigation intentionally begins hierarchical browsing only after Sommelier Selection.
const PRE_SOMMELIER_IDS=new Set(['c0','c1','c3','c4','c5']);
const GROUPS={

c2:[
  {name:'Champagne & Sparkling',sections:['Champagne','Sparkling']},
  {name:'White',sections:['White']},
  {name:'Rose',sections:['Rose']},
  {name:'Red',sections:['Red']},
  {name:'Dessert',sections:['Dessert']},
  {name:'Chinese Baijiu & Huadiaojiu',sections:['Chinese Baijiu & Huadiaojiu']},
  {name:'Alcohol-removed Wine',sections:['Alcohol-removed Wine']}
],

c6:[
  {name:'Vintage Champagne',sections:['Vintage Champagne']},
  {name:'White Burgundy & Bordeaux',sections:['White']},
  {name:'Dessert Wines',sections:['Dessert']},
  {name:'Bordeaux Red',sections:['Red']},
  {name:'Domaine de la Romanee-Conti',sections:['Domaine de la Romanee-Conti']}
],

c7:[
  {name:'Champagne',sections:['Champagne']},
  {name:'White Burgundy',sections:['Bourgogne Blanc']},
  {name:'Red Burgundy',sections:['Bourgogne Rouge']},
  {name:'Bordeaux',sections:['Bordeaux Rouge']}
],

 c14:[
  {name:'Alsace',sections:['Alsace','Famille Hugel','Trimbach']},
  {name:'Bordeaux',sections:['Bordeaux']},
  {name:'Burgundy',sections:['Chablis','Cote de Nuits','Cote de Beaune','Cote de Beaune, Grand Cru','Meursault','Puligny Montrachet','Chassagne Montrachet','Maconnais']},
  {name:'Loire',sections:['Loire Valley']},
  {name:'Rhône',sections:['Rhone Valley']}
 ],
 c20:[
  {name:'Bordeaux',sections:['Graves','Haut Medoc','Margaux','Chateau Margaux','Chateau Palmer','Pauillac','Chateau Lafite Rothschild','Chateau Latour','Chateau Mouton Rothschild','St. Estephe','St. Julien','Pomerol','Petrus','St. Emilion','Chateau Angelus']},
  {name:'Burgundy',sections:['Marsannay','Gevrey Chambertin','Morey St Denis','Chambolle Musigny','Vougeot','Vosne Romanee','Nuits St Georges','Domaine de la Romanee-Conti','Aloxe-Corton','Pommard','Volnay','Santenay']},
  {name:'Beaujolais',sections:['Beaujolais']},
  {name:'Loire',sections:['Loire Valley']},
  {name:'Rhône',sections:['Northern Rhone','M. Chapoutier','E. Guigal','Southern Rhone','Chateau de Beaucastel']}
 ],
 c19:[
  {name:'Sicily',sections:['Sicilia','Etna Rosso']},
  {name:'Piedmont',sections:['Piemonte','Barbaresco','Barolo']},
  {name:'Lombardy',sections:['Lombardia']},
  {name:'Veneto',sections:['Veneto','Amarone della Valpolicella']},
  {name:'Friuli-Venezia Giulia',sections:['Friuli Venezia Giulia']},
  {name:'Tuscany',sections:['Super Toscana','Antinori','Tenuta San Guido','Brunello di Montalcino','Biondi Santi','Gaja','Mastrojanni','Soldera','Vino Nobile di Montepulciano','Chianti']},
  {name:'Central & Southern Italy',sections:['Umbria','Marche','Lazio','Abruzzo','Campania','Basilicata','Sardegna']},
  {name:'Northern Italy',sections:['Trentino Alto Adige',"Valle D' Aosta"]}
 ],
 c21:[
  {name:'Spain',sections:['Rioja','Priorat','Ribera del Duero','Costers del Segre','Catalunya','Ribeira Sacra','Navarra','Valencia']},
  {name:'Austria',sections:['Austria']},
  {name:'Bulgaria',sections:['Bulgaria']}
 ],
 c17:[
  {name:'Champagne',sections:['Champagne']},
  {name:'White Wines',sections:['White Wines']},
  {name:'Red Wines',sections:['Red Wines']}
 ],
 c18:[
  {name:'Champagne & Sparkling',sections:['Champagne & Sparkling']},
  {name:'White Wines',sections:['White Wines']},
  {name:'France',sections:['France']},
  {name:'Italy',sections:['Italy']},
  {name:'Spain',sections:['Spain']},
  {name:'USA',sections:['USA']}
 ],
 c13:[
  {name:'Germany',sections:['Mosel','Rheingau','Rheinhessen']},
  {name:'Spain',sections:['Rias Baixas','Rioja','Rueda','Central Pyrenees']},
  {name:'Austria',sections:['Kamptal']}
 ]
};
function navChildren(c){
 if(PRE_SOMMELIER_IDS.has(c.id))return [];
 if(GROUPS[c.id])return GROUPS[c.id];
 // After Sommelier Selection, a page unfolds only when it genuinely has multiple sections.
 if(c.sections.length>1)return c.sections.map(s=>({name:s.name,sections:[s.name]}));
 return [];
}
let openCat='',activeGroup=null;
function navR(){

 const navOrder = [
   'c0', // Wine of the Month
   'c1', // Wines of Asia
   'c2', // Wine by the Glass
   'c6', // Premium Fine Wine Collection
   'c7', // Sommelier Selection
   'c3', // Cocktails, Aperitifs & Digestives
   'c4', // Whiskies
   'c5'  // Beers & Beverages
 ];

 const orderedC = [
   ...navOrder.map(id => C.find(c => c.id === id)),
   ...C.filter(c => !navOrder.includes(c.id))
 ];

 nav.innerHTML=orderedC.map(c=>{const kids=navChildren(c),has=kids.length>0,open=has&&c.id===openCat;
  return `<div class="navgroup"><button data-cat="${c.id}" class="navcat ${c.id===current&&!activeGroup?'active':''}" ${has?`aria-expanded="${open}"`:''}><span>${
  ['Wine of the Month',
   'Wines of Asia',
   'Wine by the Glass',
   'Premium Collection',
   'Sommelier Selection'
  ].includes(c.title)
    ? '<span class="featured-star">★</span>' + esc(c.title)
    : esc(c.title)
}</span>${has?`<span class="chev">${open?'−':'+'}</span>`:''}</button>${has?`<div class="subnav ${open?'show':''}">${kids.map(g=>`<button class="navsub ${c.id===current&&activeGroup===g.name?'active':''}" data-cat="${c.id}" data-group="${esc(g.name)}">${esc(g.name)}</button>`).join('')}</div>`:''}</div>`
 }).join('');
 nav.querySelectorAll('.navcat').forEach(btn=>btn.onclick=()=>{const id=btn.dataset.cat,c=C.find(x=>x.id===id),has=navChildren(c).length>0;current=id;activeGroup=null;q.value='';openCat=has?(openCat===id?'':id):'';navR();render();scrollTo({top:0,behavior:'smooth'})});
 nav.querySelectorAll('.navsub').forEach(btn=>btn.onclick=()=>{
    current = btn.dataset.cat;
    openCat = current;
    activeGroup = btn.dataset.group;
    q.value='';
    navR();
    render();
    scrollTo({top:0,behavior:'smooth'});
});
}
function card(x){
  return `<article class="wine">
    <button class="row" aria-expanded="false">
      <span class="v">${esc(x.v)}</span>
      <span class="name">${esc(x.name)}</span>
      <span class="price">${esc(x.price)}</span>
      <span class="plus">+</span>
    </button>
    <div class="inside">${esc(x.note)}</div>
  </article>`
}function bind(){main.querySelectorAll('.row').forEach(b=>b.onclick=()=>{const a=b.closest('.wine'),o=a.classList.toggle('open');b.setAttribute('aria-expanded',o)})}function render(){const query=q.value.trim().toLowerCase();if(query){let groups=[];C.forEach(c=>c.sections.forEach(s=>{let items=s.items.filter(x=>(c.title+' '+s.name+' '+x.v+' '+x.name+' '+x.price+' '+x.note).toLowerCase().includes(query));if(items.length)groups.push({title:c.title+' · '+s.name,items})}));let count=groups.reduce((a,g)=>a+g.items.length,0);st.textContent='Search results';meta.textContent=totalSelections+' selections · Updated '+updated;main.innerHTML=`<section class="hero"><div class="kicker">Search</div><h2>${esc(q.value)}</h2><p>${count} matching selections</p></section>`+(groups.length?groups.map(g=>`<section class="section"><h3>${esc(g.title)}</h3>${g.items.map(card).join('')}</section>`).join(''):'<div class="empty">No matching selection found.</div>');bind();return}let c=C.find(x=>x.id===current)||C[0];st.textContent=c.title;meta.textContent=totalSelections+' selections · Updated '+updated;let group=activeGroup?navChildren(c).find(g=>g.name===activeGroup):null;let sections=group?c.sections.filter(s=>group.sections.includes(s.name)):c.sections;main.innerHTML=`<section class="hero"><div class="kicker">Tin Lung Heen${group?' · '+esc(c.title):''}</div><h2>${esc(group?group.name:c.title)}</h2></section>`+sections.map(s=>`<section class="section"><h3>${esc(s.name)}</h3>${s.items.map(card).join('')}</section>`).join('')+`<div class="legal">All prices are in HK$ and subject to 10% service charge. All wines are inspected for quality. Wines priced over HK$10,000 are sold "AS-IS"; no return or refund after the wine is opened.</div>`;bind()}q.oninput=render;navR();render();
