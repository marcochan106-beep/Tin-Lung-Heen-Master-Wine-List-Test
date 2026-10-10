const C=window.WINE_DATA;
updated='7 October 2026';
const totalSelections=C.reduce((total,category)=>total+category.sections.reduce((sum,section)=>sum+section.items.length,0),0);let current=C[0].id;const nav=document.querySelector('#nav'),main=document.querySelector('#main'),q=document.querySelector('#q'),st=document.querySelector('#st'),meta=document.querySelector('#meta');const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));const n=c=>c.sections.reduce((a,s)=>a+s.items.length,0);
let lang=localStorage.getItem('wineListLanguage')==='zh'?'zh':'en';
let fontSize=localStorage.getItem('wineListFontSize')||'normal';
if(!['normal','large'].includes(fontSize))fontSize='normal';
const pick=(obj,key)=>lang==='zh'&&obj&&obj[key+'Zh']?obj[key+'Zh']:(obj?.[key]??'');
const ui=()=>lang==='zh'?{search:'搜尋酒款',selections:'款精選',updated:'更新於',featured:'重點推介',heroTitle:'每月精選佳釀',heroSub:'精選珍稀佳釀，細味酒莊與年份故事',legal:'所有價格均以港幣計算，另收加一服務費。售價超過港幣10,000元的酒款均按現況出售，開瓶後恕不退換。',noFeature:'暫未有精選酒款。'}:{search:'Search wines',selections:'selections',updated:'Updated',featured:'Featured selection',heroTitle:'Wine of the Month',heroSub:'A rare bottle selected for a closer look',legal:'All prices are in HK$ and subject to 10% service charge. Wines priced over HK$10,000 are sold "AS-IS"; no return or refund after the wine is opened.',noFeature:'No featured wine found.'};
const langToggle=document.createElement('button');langToggle.type='button';langToggle.className='lang-toggle';meta.insertAdjacentElement('afterend',langToggle);
const fontControls=document.createElement('div');fontControls.className='font-controls';fontControls.setAttribute('role','group');fontControls.setAttribute('aria-label','Text size');fontControls.innerHTML='<button type="button" class="font-btn" data-size="normal" aria-label="Normal text">A</button><button type="button" class="font-btn" data-size="large" aria-label="Large text">A+</button>';langToggle.insertAdjacentElement('afterend',fontControls);
function updateLanguageUI(){
  langToggle.innerHTML=
    lang==='zh'
      ? '<span class="active">繁</span><span>/</span><span>EN</span>'
      : '<span>繁</span><span>/</span><span class="active">EN</span>';langToggle.setAttribute('aria-label',lang==='zh'?'切換至英文':'Switch to Traditional Chinese');document.documentElement.lang=lang==='zh'?'zh-Hant-HK':'en-GB';q.placeholder=ui().search;}
langToggle.onclick=()=>{lang=lang==='zh'?'en':'zh';localStorage.setItem('wineListLanguage',lang);updateLanguageUI();navR();render();};updateLanguageUI();
function updateFontUI(){document.documentElement.dataset.fontSize=fontSize;fontControls.querySelectorAll('.font-btn').forEach(btn=>{const active=btn.dataset.size===fontSize;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active));});}
fontControls.querySelectorAll('.font-btn').forEach(btn=>btn.onclick=()=>{fontSize=btn.dataset.size;localStorage.setItem('wineListFontSize',fontSize);updateFontUI();});updateFontUI();
let markedWines=[];
let pendingJumpKey='';
const markerStatus=document.createElement('div');markerStatus.className='marker-status';markerStatus.hidden=true;document.querySelector('.status').appendChild(markerStatus);
function wineKey(x){return [x.v,x.name,x.price].join('|');}
function markerText(x){return (x.v?x.v+' · ':'')+x.name;}
function wineType(sectionName,categoryTitle,x){const text=(sectionName+' '+categoryTitle+' '+(x.style||'')+' '+(x.name||'')).toLowerCase();if(/champagne|sparkling|prosecco|cava|franciacorta|sekt/.test(text))return'sparkling';if(/dessert|sauternes|barsac|tokaji|moscato|sweet|port|madeira|sherry/.test(text))return'dessert';if(/rosé|rose/.test(text))return'rose';if(/red|rouge|rosso|tinto|barolo|barbaresco|burgundy rouge/.test(text))return'red';if(/white|blanc|bianco|chablis|riesling|sauvignon|chardonnay/.test(text))return'white';return'other';}
function typeIcon(type){return{sparkling:'✦',white:'●',red:'●',rose:'●',dessert:'◆',other:'○'}[type]||'○';}
function findWineLocation(key){for(const category of C){for(const section of category.sections){const item=section.items.find(x=>wineKey(x)===key);if(item)return{category,section,item};}}return null;}
function isByTheGlass(price){return /\bglass\b/i.test(String(price||''));}
function servingChoices(x){if(x.categoryId==='c0')return[{id:'bottle',label:'Bottle (1.5L)'},{id:'glass',label:'Glass (100ml)'},{id:'carafe',label:'Carafe (375ml)'}];if(x.byGlass)return[{id:'bottle',label:lang==='zh'?'原瓶':'Bottle'},{id:'glass',label:lang==='zh'?'杯裝':'Glass'}];return[];}
function serviceControlsHtml(x,index){const choices=servingChoices(x);if(!choices.length)return'';const formats=`<div class="format-controls">${choices.map(choice=>`<button type="button" class="format-btn ${x.format===choice.id?'active':''}" data-index="${index}" data-format="${choice.id}">${choice.label}</button>`).join('')}</div>`;if(x.format!=='glass')return `<div class="service-controls">${formats}</div>`;const seats=Array.from({length:6},(_,i)=>`<button type="button" class="seat-btn ${x.seats.includes(i+1)?'active':''}" data-index="${index}" data-seat="${i+1}">S${i+1}</button>`).join('');return `<div class="service-controls">${formats}<div class="glass-controls"><div class="glass-quantity"><button type="button" class="glass-step" data-index="${index}" data-step="-1" aria-label="Decrease glasses">−</button><span>${x.glasses} ${x.glasses===1?(lang==='zh'?'杯':'glass'):(lang==='zh'?'杯':'glasses')}</span><button type="button" class="glass-step" data-index="${index}" data-step="1" aria-label="Increase glasses">+</button></div><div class="seat-controls-wrapper"><span class="seat-label">${lang==='zh'?'內部使用':'For Internal Use'}</span><div class="seat-controls" aria-label="Seat codes">${seats}</div></div></div></div>`;}
function markedEntryHtml(x,index){return `<div class="marker-row" data-key="${esc(x.key)}"><div class="marker-row-main"><button type="button" class="marker-jump" data-index="${index}" title="${lang==='zh'?'前往此酒':'Jump to this wine'}"><span class="wine-type type-${esc(x.type)}" aria-hidden="true">${typeIcon(x.type)}</span><span class="marker-status-label">${esc(markerText(x))}</span></button><button type="button" class="marker-remove" data-index="${index}" aria-label="${lang==='zh'?'移除此酒':'Remove this wine'}">×</button></div>${serviceControlsHtml(x,index)}</div>`;}
function updateMarkerUI(){const has=markedWines.length>0;document.querySelector('.status').classList.toggle('has-marker',has);markerStatus.hidden=!has;if(has){markerStatus.innerHTML=`<div class="marker-toolbar"><b>${lang==='zh'?'已選酒款':'Selected wine'}</b><button type="button" class="marker-clear-all">${lang==='zh'?'清除':'Clear'}</button></div><div class="marker-list">${markedWines.map(markedEntryHtml).join('')}</div>`;markerStatus.querySelector('.marker-clear-all').onclick=()=>{markedWines=[];updateMarkerUI();};markerStatus.querySelectorAll('.marker-remove').forEach(btn=>btn.onclick=e=>{e.stopPropagation();markedWines.splice(Number(btn.dataset.index),1);updateMarkerUI();});markerStatus.querySelectorAll('.marker-jump').forEach(btn=>btn.onclick=()=>jumpToMarked(Number(btn.dataset.index)));markerStatus.querySelectorAll('.format-btn').forEach(btn=>btn.onclick=e=>{e.stopPropagation();const x=markedWines[Number(btn.dataset.index)];if(!x)return;x.format=btn.dataset.format;updateMarkerUI();});markerStatus.querySelectorAll('.glass-step').forEach(btn=>btn.onclick=e=>{e.stopPropagation();const x=markedWines[Number(btn.dataset.index)];if(!x)return;x.glasses=Math.max(1,Math.min(5,x.glasses+Number(btn.dataset.step)));if(x.seats.length>x.glasses){x.seats=x.seats.slice(0,x.glasses);}updateMarkerUI();});markerStatus.querySelectorAll('.seat-btn').forEach(btn=>btn.onclick=e=>{e.stopPropagation();const x=markedWines[Number(btn.dataset.index)],seat=Number(btn.dataset.seat);if(!x)return;x.seats=x.seats.includes(seat)?x.seats.filter(n=>n!==seat):(x.seats.length<x.glasses?[...x.seats,seat].sort((a,b)=>a-b):x.seats);updateMarkerUI();});}const keys=new Set(markedWines.map(x=>x.key));document.querySelectorAll('.wine,.wotm-feature').forEach(el=>el.classList.toggle('marked',keys.has(el.dataset.wineKey)));}
function addMarkedWine(data){if(markedWines[0]?.key===data.key)return;markedWines=[data];updateMarkerUI();}
function jumpToMarked(index){const selected=markedWines[index];if(!selected)return;current=selected.categoryId;openCat='';activeGroup=null;q.value='';pendingJumpKey=selected.key;navR();render();requestAnimationFrame(()=>requestAnimationFrame(()=>{const target=[...document.querySelectorAll('.wine,.wotm-feature')].find(el=>el.dataset.wineKey===pendingJumpKey);if(target){target.classList.add('jump-pulse');target.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>target.classList.remove('jump-pulse'),1600);}pendingJumpKey='';}));}
function bindMarkButtons(){main.querySelectorAll('.mark-wine').forEach(btn=>{let timer=null,done=false;const stop=()=>{if(timer)clearTimeout(timer);timer=null;btn.classList.remove('holding');};const start=e=>{e.preventDefault();done=false;stop();btn.classList.add('holding');timer=setTimeout(()=>{const key=btn.dataset.key;addMarkedWine({key,v:btn.dataset.v,name:btn.dataset.name,price:btn.dataset.price,type:btn.dataset.type,categoryId:btn.dataset.category,byGlass:isByTheGlass(btn.dataset.price),format:'bottle',glasses:1,seats:[]});done=true;btn.classList.remove('holding');},800);};btn.addEventListener('pointerdown',start);btn.addEventListener('pointerup',stop);btn.addEventListener('pointercancel',stop);btn.addEventListener('pointerleave',stop);btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(!done)btn.classList.remove('holding');});});updateMarkerUI();}
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
  {name:'Red Bordeaux',sections:['Red']},
  {name:'Domaine de la Romanee-Conti',sections:['Domaine de la Romanee-Conti']}
],

c7:[
  {name:'Champagne',sections:['Champagne']},
  {name:'White Burgundy',sections:['Bourgogne Blanc']},
  {name:'Red Burgundy',sections:['Bourgogne Rouge']},
  {name:'Red Bordeaux',sections:['Red Bordeaux','Bordeaux Rouge']}
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
    ? '<span class="featured-star">★</span>' + esc(pick(c,'title'))
    : esc(pick(c,'title'))
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
function card(x,category,section){
  return `<article class="wine" data-wine-key="${esc(wineKey(x))}">
    <button class="row" aria-expanded="false">
      <span class="v">${x.v}</span>
      <span class="name">${esc(x.name)}</span>
      <span class="price">
${esc(x.price).replace(/ · /g,'<br>')}
</span>
      <span class="plus">+</span>
    </button>
    <div class="inside"><div>${esc(x.note).replace(/\n/g,'<br>')}</div><button type="button" class="mark-wine" data-key="${esc(wineKey(x))}" data-category="${esc(category.id)}" data-type="${esc(wineType(section.name,category.title,x))}" data-v="${esc(x.v)}" data-name="${esc(x.name)}" data-price="${esc(x.price)}">☆ <span>${lang==='zh'?'按住以標記此酒':'Hold to mark this wine'}</span></button></div>
  </article>`
}
function featureNote(note){
  return String(note??'').split(/\n\s*\n/).filter(Boolean).map(p=>`<p>${esc(p)}</p>`).join('');
}
function featureCard(x,category,section){
  const image=x.image?`<div class="feature-media"><img src="${esc(x.image)}" alt="${esc(lang==='zh'?(x.imageAltZh||x.imageAlt||pick(x,'name')):(x.imageAlt||x.name))}" loading="eager" onerror="this.closest('.feature-media').classList.add('image-error');this.remove()"><div class="feature-image-fallback">1982<br>Château Cos d’Estournel</div></div>`:'';
  return `<section class="wotm-feature" data-wine-key="${esc(wineKey(x))}">
    <div class="wotm-ribbon">${esc(ui().featured)}</div>
    <div class="wotm-grid">
      ${image}
      <div class="wotm-summary">
        <div class="wotm-vintage">${esc(x.v)}</div>
        <h2>${esc(pick(x,'name'))}</h2>
        <div class="wotm-prices">${String(pick(x,'price')??'').split(/\s*·\s*/).filter(Boolean).map(price=>`<div class="wotm-price-line">${esc(price)}</div>`).join('')}</div>
      </div>
    </div>
    <div class="wotm-copy">${featureNote(pick(x,'note'))}</div>
    <button type="button" class="mark-wine feature-mark" data-key="${esc(wineKey(x))}" data-category="${esc(category.id)}" data-type="${esc(wineType(section.name,category.title,x))}" data-v="${esc(x.v)}" data-name="${esc(x.name)}" data-price="${esc(x.price)}">☆ <span>${lang==='zh'?'按住以標記此酒':'Hold to mark this wine'}</span></button>
  </section>`;
}
function bind(){main.querySelectorAll('.row').forEach(b=>b.onclick=()=>{const a=b.closest('.wine'),o=a.classList.toggle('open');b.setAttribute('aria-expanded',o)});bindMarkButtons();}function render(){const query=q.value.trim().toLowerCase();if(query){let groups=[];C.forEach(c=>c.sections.forEach(s=>{let items=s.items.filter(x=>(c.title+' '+s.name+' '+x.v+' '+x.name+' '+x.price+' '+x.note).toLowerCase().includes(query));if(items.length)groups.push({title:c.title+' · '+s.name,items,category:c,section:s})}));let count=groups.reduce((a,g)=>a+g.items.length,0);st.textContent='Search results';meta.textContent=totalSelections+' selections · Updated '+updated;main.innerHTML=`<section class="hero"><div class="kicker">Search</div><h2>${esc(q.value)}</h2><p>${count} matching selections</p></section>`+(groups.length?groups.map(g=>`<section class="section"><h3>${esc(g.title)}</h3>${g.items.map(x=>card(x,g.category,g.section)).join('')}</section>`).join(''):'<div class="empty">No matching selection found.</div>');bind();return}let c=C.find(x=>x.id===current)||C[0];st.textContent='';meta.textContent=totalSelections+' '+ui().selections+' · '+ui().updated+' '+updated;const sectionKey=value=>String(value??'')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'')
  .toLowerCase()
  .replace(/&/g,' and ')
  .replace(/\bsaint\b/g,'st')
  .replace(/[^a-z0-9]+/g,' ')
  .trim();
let group=activeGroup?navChildren(c).find(g=>g.name===activeGroup):null;
let sections=group
  ?c.sections.filter(s=>group.sections.some(name=>sectionKey(name)===sectionKey(s.name)))
  :c.sections;
if(c.id==='c0'&&!group){
  const item=c.sections[0]?.items?.[0];
  main.innerHTML=`<section class="hero hero-wotm"><div class="kicker">Tin Lung Heen</div><h2>${esc(ui().heroTitle)}</h2><p>${esc(ui().heroSub)}</p></section>`+(item?featureCard(item,c,c.sections[0]):`<div class="empty">${esc(ui().noFeature)}</div>`)+`<div class="legal">${esc(ui().legal)}</div>`;
  bindMarkButtons();
  return;
}
main.innerHTML=`<section class="hero"><div class="kicker">Tin Lung Heen${group?' · '+esc(c.title):''}</div><h2>${esc(group?group.name:c.title)}</h2></section>`+sections.map(s=>`<section class="section"><h3>${esc(s.name)}</h3>${s.items.map(x=>card(x,c,s)).join('')}</section>`).join('')+`<div class="legal">All prices are in HK$ and subject to 10% service charge. All wines are inspected for quality. Wines priced over HK$10,000 are sold "AS-IS"; no return or refund after the wine is opened.</div>`;bind()}q.oninput=render;navR();render();
