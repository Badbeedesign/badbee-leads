const KEY='badbee_leads_v2';let leads=[];let found=[];
const $=s=>document.querySelector(s);const save=()=>{localStorage.setItem(KEY,JSON.stringify(leads));if(window.bbPersistLeads)window.bbPersistLeads();};
function score(l){const s=l.signals||{};return(s.needsDesigner?30:0)+(s.activeLaunch?20:0)+(s.weakSite?15:0)+(s.activeSocial?15:0)+(s.hasContacts?10:0)+(s.goodNiche?10:0)}
function recommendation(l){
  const n=(l.niche||'').toLowerCase(),a=l.siteAnalysis||{},issues=a.issues||[],sg=l.signals||{};
  const has=x=>issues.some(i=>i.toLowerCase().includes(x));
  let primary='Презентация',reason='подходит для упаковки услуг и продаж',hook='презентацию услуг и визуальную подачу';
  if(sg.weakSite||has('viewport')||has('description')||has('title')||has('https')){primary='Сайт';reason='на сайте обнаружены конкретные технические точки роста';hook='сайт и то, как он презентует компанию';}
  else if(/каф|ресторан/.test(n)){primary='Меню / соцсети';reason='в этой нише особенно важна визуальная подача продукта';hook='визуальную подачу меню и коммуникаций';}
  else if(/красот|салон|магаз|бренд/.test(n)){primary='Айдентика / соцсети';reason='ниша сильно зависит от узнаваемой визуальной системы';hook='визуальную систему бренда';}
  else if(/стро|недвиж|клиник|стомат|образ|b2b|отел/.test(n)){primary='Презентация';reason='услуги удобно продавать через презентацию или коммерческое предложение';hook='презентацию услуг и коммерческие материалы';}
  const evidence=[]; if(a.ok&&issues.length)evidence.push(...issues.slice(0,3)); if(sg.activeLaunch)evidence.push('есть сигнал запуска или роста'); if(sg.hasContacts)evidence.push('есть публичный канал для первого контакта');
  return {primary,reason,hook,evidence};
}
function service(l){return recommendation(l).primary}
function message(l){
  const r=recommendation(l),a=l.siteAnalysis||{}; let observation='Посмотрела, как у вас сейчас оформлена подача компании.';
  if(a.ok&&a.issues?.length){const nice=a.issues.slice(0,2).map(x=>x.replace('не найден viewport для мобильных','на главной не определяется стандартная мобильная настройка').replace('нет полноценного meta description','не заполнено полноценное описание страницы').replace('слабый или отсутствующий title','можно усилить заголовок страницы').replace('нет HTTPS','сайт открывается без HTTPS')).join(' и '); observation=`Посмотрела ваш сайт: заметила, что ${nice}.`;}
  else if(l.notes&&!l.notes.startsWith('Найдено автоматически')) observation=l.notes;
  return `Здравствуйте! Посмотрела ${l.company}. ${observation}\n\nЯ дизайнер и вижу здесь возможность усилить ${r.hook}. Могу бесплатно набросать 2–3 конкретные идеи, что я бы улучшила в первую очередь. Если откликнется — обсудим формат работы.`;
}
function whyLead(l){const r=recommendation(l);return r.evidence.length?r.evidence.map(x=>'• '+x).join('\n'):'Пока мало объективных сигналов. Перед контактом лучше проверить сайт и компанию вручную.'}
function refresh(){const statuses=['Новый','В работу','Написала','Ответил','Переговоры','Клиент','Отказ'],hot=leads.filter(l=>score(l)>=70).length,replied=leads.filter(l=>['Ответил','Переговоры','Клиент'].includes(l.status)).length,clients=leads.filter(l=>l.status==='Клиент').length;$('#stats').innerHTML=[['Всего',leads.length],['Горячих',hot],['Ответили',replied],['Клиенты',clients]].map(x=>`<div class="stat"><b>${x[1]}</b><span>${x[0]}</span></div>`).join('');$('#hotLeads').innerHTML=[...leads].sort((a,b)=>score(b)-score(a)).slice(0,6).map(l=>`<div class="leadrow" onclick="openLead('${l.id}')"><div><b>${esc(l.company)}</b><div class="muted small">${esc(l.niche||'Без ниши')} · ${service(l)}</div></div><div class="score ${score(l)>=70?'hot':''}">${score(l)}</div></div>`).join('')||'<p class="muted">Пока нет лидов</p>';$('#funnel').innerHTML=statuses.map(st=>{let n=leads.filter(l=>l.status===st).length,p=leads.length?Math.round(n/leads.length*100):0;return`<div class="funnelrow"><span>${st}</span><div class="bar"><i style="width:${p}%"></i></div><b>${n}</b></div>`}).join('');renderTable()}
function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function siteLabel(l){if(!l.website)return '<span class="muted">нет</span>';if(!l.siteAnalysis)return '<span class="muted">не проверен</span>';return l.siteAnalysis.ok?(l.siteAnalysis.needs_attention?'<span class="warn">есть сигналы</span>':'<span class="good">норма</span>'):'<span class="muted">ошибка</span>'}
function renderTable(){let q=$('#searchInput').value.toLowerCase(),st=$('#statusFilter').value,sf=$('#serviceFilter').value,rows=leads.filter(l=>(!q||[l.company,l.city,l.niche,l.source].join(' ').toLowerCase().includes(q))&&(!st||l.status===st)&&(!sf||service(l)===sf));$('#leadsTable').innerHTML=rows.map(l=>`<tr><td><b>${esc(l.company)}</b><div class="muted small">${esc(l.source||'')}</div></td><td>${esc(l.city||'—')}</td><td>${esc(l.niche||'—')}</td><td>${service(l)}</td><td><b>${score(l)}</b></td><td>${siteLabel(l)}</td><td>${l.status}</td><td><button class="linkbtn" onclick="openLead('${l.id}')">Открыть</button></td></tr>`).join('')||'<tr><td colspan="8" class="muted">Ничего не найдено</td></tr>'}
function showView(v){document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));$('#'+v+'View').classList.add('active');document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x.dataset.view===v));$('#viewTitle').textContent={dashboard:'Обзор',finder:'Найти клиентов',leads:'Лиды',add:'Добавить лид',campaign:'Тестовая кампания',signals:'Сигналы спроса',research:'Инфоповоды',outreach:'Сообщения',results:'Результаты'}[v]}
document.querySelectorAll('.nav').forEach(b=>b.onclick=()=>showView(b.dataset.view));$('#quickAdd').onclick=()=>{clearForm();showView('add')};['searchInput','statusFilter','serviceFilter'].forEach(id=>$('#'+id).addEventListener('input',renderTable));
function openLead(id){const l=leads.find(x=>x.id===id);if(!l)return;let sm={needsDesigner:'Ищет дизайнера',activeLaunch:'Запуск/рост',weakSite:'Слабый сайт',activeSocial:'Активные соцсети',hasContacts:'Есть контакты',goodNiche:'Хороший чек'};let tags=Object.entries(l.signals||{}).filter(x=>x[1]).map(x=>sm[x[0]]).filter(Boolean);$('#drawerContent').innerHTML=`<h2>${esc(l.company)}</h2><div class="muted">${esc(l.city||'')} · ${esc(l.niche||'')} · ${esc(l.source||'')}</div><div class="detailgrid"><div class="detailbox"><span class="muted small">Lead Score</span><h2>${score(l)}/100</h2></div><div class="detailbox"><span class="muted small">Предложить</span><h2>${service(l)}</h2></div></div><div>${tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div><h3 style="margin-top:20px">Рекомендация BADBEE</h3><div class="analysisbox"><b>${esc(recommendation(l).primary)}</b><p>${esc(recommendation(l).reason)}</p><p class="muted small" style="white-space:pre-line">${esc(whyLead(l))}</p></div><h3>Заметки</h3><p>${esc(l.notes||'Пока нет заметок.')}</p><h3>Контакты</h3><p>${l.website?`Сайт: ${esc(l.website)}<br>`:''}${l.social?`Соцсеть: ${esc(l.social)}<br>`:''}${l.contact?`Контакт: ${esc(l.contact)}`:'Публичный контакт не добавлен'}</p>${siteAnalysisHtml(l)}<h3>Первое сообщение</h3><div class="message">${esc(message(l))}</div><div class="actions">${l.website?`<button class="primary" onclick="analyzeLead('${l.id}')">Проверить сайт</button>`:''}<button class="primary" onclick="copyMsg('${l.id}')">Скопировать</button><button class="ghost dark" onclick="editLead('${l.id}')">Редактировать</button><button class="ghost dark" onclick="deleteLead('${l.id}')">Удалить</button></div>`;$('#drawer').classList.remove('hidden')}
function siteAnalysisHtml(l){let a=l.siteAnalysis;if(!a)return l.website?'<h3>Проверка сайта</h3><p class="muted">Сайт ещё не проверен.</p>':'';if(!a.ok)return `<h3>Проверка сайта</h3><p class="muted">Не удалось проверить: ${esc(a.error||'ошибка')}</p>`;return `<h3>Проверка сайта</h3><div class="analysisbox"><div><b>${a.needs_attention?'Есть сигналы для внимания':'Базовые технические признаки в норме'}</b></div>${a.issues?.length?`<p><b>Что обнаружено:</b><br>${a.issues.map(x=>'• '+esc(x)).join('<br>')}</p>`:''}${a.positives?.length?`<p class="muted"><b>Плюсы:</b> ${a.positives.map(esc).join(', ')}</p>`:''}<p class="muted small">Это техническая эвристика, а не оценка красоты дизайна.</p></div>`}
async function analyzeLead(id,silent=false){if(!silent)alert('Автопроверка сайтов в веб-версии пока отключена: браузер не может безопасно читать чужие сайты напрямую. Лиды, общая база, поиск, статусы, инфоповоды, сообщения и результаты работают.');return false;}
function clearForm(){$('#leadForm').reset();$('#leadId').value='';$('#formTitle').textContent='Новый лид'}$('#cancelEdit').onclick=()=>{clearForm();showView('leads')};$('#leadForm').onsubmit=e=>{e.preventDefault();let id=$('#leadId').value||crypto.randomUUID(),l={id,company:$('#company').value.trim(),city:$('#city').value.trim(),niche:$('#niche').value.trim(),source:$('#source').value,website:$('#website').value.trim(),social:$('#social').value.trim(),contact:$('#contact').value.trim(),status:$('#status').value,notes:$('#notes').value.trim(),signals:{needsDesigner:$('#needsDesigner').checked,activeLaunch:$('#activeLaunch').checked,weakSite:$('#weakSite').checked,activeSocial:$('#activeSocial').checked,hasContacts:$('#hasContacts').checked,goodNiche:$('#goodNiche').checked}};let i=leads.findIndex(x=>x.id===id);if(i>=0)leads[i]=l;else leads.unshift(l);save();clearForm();showView('leads');refresh()};
$('#exportBtn').onclick=()=>{let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(leads,null,2)],{type:'application/json'}));a.download='badbee-leads.json';a.click()};$('#importInput').onchange=async e=>{try{let d=JSON.parse(await e.target.files[0].text());if(!Array.isArray(d))throw 0;leads=d;save();refresh();alert('Импортировано')}catch{alert('Ошибка JSON')}};
const catNames={cafe:'Кафе / ресторан',dental:'Стоматология',clinic:'Клиника',beauty:'Салон красоты',fitness:'Фитнес',hotel:'Отель',education:'Образование',realestate:'Недвижимость',shop:'Магазин'};
$('#runSearch').onclick=async()=>{let btn=$('#runSearch'),city=$('#findCity').value.trim(),category=$('#findCategory').value,limit=+$('#findLimit').value;if(!city)return alert('Укажи город');btn.disabled=true;btn.innerHTML='<span class="loading"></span>Ищу';$('#searchNotice').textContent='Ищу компании в открытых данных OpenStreetMap…';try{const cats={cafe:['["amenity"~"restaurant|cafe|fast_food"]'],dental:['["amenity"="dentist"]','["healthcare"="dentist"]'],clinic:['["amenity"~"clinic|doctors"]','["healthcare"~"clinic|doctor"]'],beauty:['["shop"~"beauty|hairdresser"]'],fitness:['["leisure"="fitness_centre"]','["sport"="fitness"]'],hotel:['["tourism"~"hotel|guest_house|hostel"]'],education:['["amenity"~"school|college|university|language_school|music_school|training"]'],realestate:['["office"="estate_agent"]'],shop:['["shop"]']};const clauses=(cats[category]||cats.cafe).map(f=>`nwr${f}(area.searchArea);`).join('');const q=`[out:json][timeout:25];area["name"="${city.replace(/"/g,'')}"]["boundary"="administrative"]->.searchArea;(${clauses});out center tags ${limit};`;let r=await fetch('https://overpass-api.de/api/interpreter?data='+encodeURIComponent(q)),d=await r.json();if(!r.ok)throw new Error('OpenStreetMap временно не ответил');found=(d.elements||[]).map(el=>{const t=el.tags||{};return{name:t.name||t.brand||'',website:t.website||t['contact:website']||'',phone:t.phone||t['contact:phone']||'',email:t.email||t['contact:email']||'',address:[t['addr:street'],t['addr:housenumber']].filter(Boolean).join(', ')}}).filter(x=>x.name).slice(0,limit);renderResults();$('#resultsPanel').classList.remove('hidden');$('#searchNotice').textContent=`Найдено ${found.length}. Поиск работает напрямую через открытые данные OpenStreetMap.`;}catch(err){$('#searchNotice').textContent='Не удалось выполнить поиск: '+err.message+'. Попробуй ещё раз через минуту.'}finally{btn.disabled=false;btn.textContent='Найти компании'}};
function renderResults(){let existing=new Set(leads.map(l=>norm(l.company)+'|'+norm(l.website)));$('#resultsCount').textContent='· '+found.length;$('#results').innerHTML=found.map((r,i)=>{let dup=existing.has(norm(r.name)+'|'+norm(r.website));return`<div class="result"><input class="pick" type="checkbox" data-i="${i}" ${dup?'disabled':''}><div><div class="rtitle">${esc(r.name)}</div><div class="rmeta">${esc(r.address||'Адрес не указан')} ${dup?'· уже в базе':''}</div></div><div class="rcontact">${r.website?esc(r.website):'<span class="muted">сайт не указан</span>'}</div><div class="rcontact">${esc(r.phone||r.email||'контакт не указан')}</div></div>`}).join('')||'<p class="muted">В этой категории ничего не найдено.</p>'}
const norm=s=>(s||'').toLowerCase().replace(/^https?:\/\/(www\.)?/,'').replace(/\/$/,'').trim();$('#analyzeAll').onclick=()=>alert('Автопроверку сайтов подключим отдельной серверной функцией. В GitHub Pages она не выполняется напрямую из браузера.');
$('#selectAll').onclick=()=>document.querySelectorAll('.pick:not(:disabled)').forEach(x=>x.checked=true);$('#saveSelected').onclick=()=>{let inds=[...document.querySelectorAll('.pick:checked')].map(x=>+x.dataset.i),category=$('#findCategory').value,city=$('#findCity').value.trim();let added=0;for(let i of inds){let r=found[i],l={id:crypto.randomUUID(),company:r.name,city,niche:catNames[category],source:'OpenStreetMap',website:r.website||'',social:'',contact:r.phone||r.email||'',status:'Новый',notes:'Найдено автоматически. Требуется проверить сайт и визуальную подачу.',signals:{needsDesigner:false,activeLaunch:false,weakSite:false,activeSocial:false,hasContacts:!!(r.phone||r.email||r.website),goodNiche:['dental','clinic','realestate','hotel'].includes(category)}};if(!leads.some(x=>norm(x.company)===norm(l.company)&&norm(x.website)===norm(l.website))){leads.unshift(l);added++}}save();refresh();renderResults();alert(`Добавлено лидов: ${added}`)};
refresh();


// ===== BADBEE LEADS 0.5: test campaign =====
const CAMPAIGN_KEY='badbee_campaign_v1';
let campaign = JSON.parse(localStorage.getItem(CAMPAIGN_KEY)||'null') || {leadIds:[], touches:{}};

function saveCampaign(){ localStorage.setItem(CAMPAIGN_KEY, JSON.stringify(campaign)); }

function campaignLeads(){
  return campaign.leadIds.map(id=>leads.find(l=>l.id===id)).filter(Boolean);
}

function buildCampaign(){
  campaign.leadIds=[...leads]
    .filter(l=>l.status!=='Отказ')
    .sort((a,b)=>score(b)-score(a))
    .slice(0,20)
    .map(l=>l.id);
  saveCampaign(); renderCampaign();
}

function markTouch(id){
  campaign.touches[id]=new Date().toISOString();
  const l=leads.find(x=>x.id===id);
  if(l && l.status==='Новый') l.status='Написала';
  save(); saveCampaign(); refresh();
}

function fmtTouch(id){
  const d=campaign.touches[id];
  if(!d) return '—';
  return new Date(d).toLocaleDateString('ru-RU');
}

function renderCampaign(){
  const statsEl=document.querySelector('#campaignStats');
  if(!statsEl) return;
  const cls=campaignLeads();
  const sent=cls.filter(l=>['Написала','Ответил','Переговоры','Клиент'].includes(l.status)).length;
  const replied=cls.filter(l=>['Ответил','Переговоры','Клиент'].includes(l.status)).length;
  const talks=cls.filter(l=>['Переговоры','Клиент'].includes(l.status)).length;
  const clients=cls.filter(l=>l.status==='Клиент').length;

  statsEl.innerHTML=[
    ['В кампании',cls.length],['Написали',sent],['Ответили',replied],['Переговоры',talks],['Клиенты',clients]
  ].map(([a,b])=>`<div class="stat"><b>${b}</b><span>${a}</span></div>`).join('');

  const queue=cls
    .filter(l=>!campaign.touches[l.id] && !['Отказ','Клиент'].includes(l.status))
    .sort((a,b)=>score(b)-score(a))
    .slice(0,5);

  document.querySelector('#todayQueue').innerHTML=queue.length?queue.map(l=>`
    <div class="lead-row">
      <div onclick="openLead('${l.id}')" style="cursor:pointer">
        <b>${l.company}</b>
        <div class="muted small">${service(l)} · Score ${score(l)}</div>
      </div>
      <button class="primary mini" onclick="markTouch('${l.id}')">Написала</button>
    </div>`).join(''):'<p class="muted">Очередь на сегодня пуста. Можно собрать новую кампанию или обновить статусы.</p>';

  document.querySelector('#campaignTable').innerHTML=cls.length?cls.map((l,i)=>`
    <tr>
      <td>${i+1}</td><td><b>${l.company}</b></td><td><b>${score(l)}</b></td>
      <td>${service(l)}</td><td>${l.status}</td><td>${fmtTouch(l.id)}</td>
      <td><button class="linkbtn" onclick="openLead('${l.id}')">Открыть</button></td>
    </tr>`).join(''):'<tr><td colspan="7" class="muted">Кампания ещё не собрана.</td></tr>';

  const responseRate=sent?Math.round(replied/sent*100):0;
  const clientRate=sent?Math.round(clients/sent*100):0;
  let verdict='Сначала соберите TOP-20 и начните касания.';
  if(sent>=5 && replied===0) verdict='Пока ответов нет. Не масштабируем расходы: сначала проверяем оффер и тексты.';
  if(replied>0 && clients===0) verdict='Есть подтверждение интереса: ответы уже появились. Продолжаем тест до переговоров/клиента.';
  if(talks>0 && clients===0) verdict='Сильный сигнал: агент довёл лиды до переговоров. Продолжаем без платного масштабирования до первого клиента.';
  if(clients>0) verdict='Гипотеза подтверждена: есть первый клиент. Теперь можно считать окупаемость и решать, подключать ли платные API.';
  document.querySelector('#testResult').innerHTML=`
    <div class="result-big">${responseRate}%</div><div class="muted">ответов от отправленных</div>
    <div class="result-big" style="margin-top:16px">${clientRate}%</div><div class="muted">конверсия в клиента</div>
    <p style="margin-top:18px"><b>${verdict}</b></p>`;
}

window.markTouch=markTouch;

document.querySelector('#buildCampaign')?.addEventListener('click', buildCampaign);
document.querySelector('#clearCampaign')?.addEventListener('click', ()=>{
  if(confirm('Сбросить текущую тестовую кампанию?')){
    campaign={leadIds:[],touches:{}}; saveCampaign(); renderCampaign();
  }
});


// ===== BADBEE LEADS 0.6: demand-signal engine =====
const NICHE_RULES = [
  {rx:/кафе|ресторан|coffee|cafe|bar|бар/i, label:'Кафе / ресторан', bonus:10, services:['Соцсети','Айдентика'], reasons:['визуальная ниша','регулярные акции/меню/контент']},
  {rx:/стомат|dental/i, label:'Стоматология', bonus:15, services:['Сайт','Презентация'], reasons:['высокий средний чек','важно доверие и упаковка услуг']},
  {rx:/клиник|medical|медиц/i, label:'Клиника', bonus:15, services:['Сайт','Презентация'], reasons:['высокий средний чек','много услуг для упаковки']},
  {rx:/салон|beauty|космет/i, label:'Салон красоты', bonus:12, services:['Соцсети','Айдентика'], reasons:['визуальная ниша','частая потребность в контенте']},
  {rx:/фитнес|fitness|спорт/i, label:'Фитнес', bonus:10, services:['Соцсети','Презентация'], reasons:['акции и абонементы','визуальный маркетинг']},
  {rx:/отел|hotel|гостин/i, label:'Отель', bonus:15, services:['Сайт','Презентация'], reasons:['визуальная продажа услуги','нужны презентационные материалы']},
  {rx:/образ|school|школ|курс|academy/i, label:'Образование', bonus:15, services:['Презентация','Сайт'], reasons:['программы и продукты требуют упаковки','регулярные запуски']},
  {rx:/недвиж|real estate|застрой/i, label:'Недвижимость', bonus:20, services:['Презентация','Сайт'], reasons:['высокий чек','презентации объектов и проектов']},
  {rx:/строит|construction/i, label:'Строительство', bonus:20, services:['Презентация','Каталог'], reasons:['B2B-продажи','КП, каталоги и тендерные материалы']},
  {rx:/производ|factory|manufact/i, label:'Производство', bonus:20, services:['Каталог','Презентация'], reasons:['каталоги продукции','B2B-презентации']},
  {rx:/event|мероприят|ивент/i, label:'Event', bonus:15, services:['Презентация','Соцсети'], reasons:['частые проекты','нужна быстрая визуальная упаковка']},
  {rx:/тур|travel|путеше/i, label:'Туризм', bonus:12, services:['Соцсети','Презентация'], reasons:['визуальная продажа','сезонные предложения']},
  {rx:/консалт|consult/i, label:'Консалтинг', bonus:20, services:['Презентация','Сайт'], reasons:['презентация экспертизы','B2B-продажи']},
  {rx:/it|saas|software|технолог/i, label:'IT / SaaS', bonus:20, services:['Презентация','Сайт'], reasons:['pitch/sales decks','упаковка продукта']},
  {rx:/магаз|shop|retail/i, label:'Магазин', bonus:8, services:['Соцсети','Айдентика'], reasons:['визуальные акции','контент и оформление']}
];

function nicheInfo(l){
  const text=(l.niche||'')+' '+(l.company||'');
  return NICHE_RULES.find(r=>r.rx.test(text)) || {label:l.niche||'Другое',bonus:0,services:[service(l)],reasons:[]};
}

function demandSignals(l){
  const s=l.signals||{}, n=nicheInfo(l);
  const out=[];
  if(s.needsDesigner) out.push({w:30,t:'Прямой спрос',d:'Есть явный сигнал поиска дизайнера.'});
  if(s.activeLaunch) out.push({w:20,t:'Запуск / рост',d:'Запуск, новый продукт или филиал повышает вероятность заказа.'});
  if(s.weakSite) out.push({w:15,t:'Сайт требует внимания',d:'Обнаружены объективные проблемы в текущей веб-упаковке.'});
  if(s.activeSocial) out.push({w:15,t:'Активный маркетинг',d:'Компания активно использует соцсети — дизайн нужен регулярно.'});
  if(s.hasContacts) out.push({w:10,t:'Можно связаться',d:'Есть публичный контакт для первого касания.'});
  if(n.bonus>=15) out.push({w:n.bonus,t:'Перспективная ниша',d:n.reasons.join(' · ')});
  if(l.website && s.weakSite) out.push({w:8,t:'Конкретный повод написать',d:'Можно заходить не с общей продажей, а с конкретным наблюдением по сайту.'});
  if((l.social||'') && !s.activeSocial) out.push({w:4,t:'Есть соцсеть',d:'Можно вручную проверить актуальные запуски и визуал перед сообщением.'});
  return out.sort((a,b)=>b.w-a.w);
}

function demandScore(l){
  const base=score(l);
  const n=nicheInfo(l);
  let extra=0;
  if(l.website && l.signals?.weakSite) extra+=8;
  if(l.social && !l.signals?.activeSocial) extra+=4;
  extra+=Math.max(0,n.bonus-(l.signals?.goodNiche?10:0));
  return Math.min(100,base+extra);
}

function bestOffer(l){
  const n=nicheInfo(l), current=service(l);
  if(l.signals?.weakSite) return 'Сайт';
  if(n.services.includes(current)) return current;
  return n.services[0]||current;
}

function renderSignals(){
  const root=document.querySelector('#signalCards'); if(!root) return;
  const niche=document.querySelector('#signalNiche')?.value||'';
  const min=Number(document.querySelector('#signalMinScore')?.value||0);
  const srv=document.querySelector('#signalService')?.value||'';
  const rows=[...leads].filter(l=>{
    const n=nicheInfo(l);
    return (!niche||n.label===niche) && demandScore(l)>=min && (!srv||bestOffer(l)===srv) && l.status!=='Отказ';
  }).sort((a,b)=>demandScore(b)-demandScore(a));

  document.querySelector('#signalCount').textContent=`${rows.length} лидов`;
  root.innerHTML=rows.length?rows.map(l=>{
    const sig=demandSignals(l).slice(0,4);
    return `<article class="signal-card">
      <div class="signal-top">
        <div><div class="muted small">${nicheInfo(l).label} · ${l.city||'город не указан'}</div><h3>${l.company}</h3></div>
        <div class="demand-score">${demandScore(l)}</div>
      </div>
      <div class="offer-line"><span>Предложить</span><b>${bestOffer(l)}</b></div>
      <div class="signal-tags">${sig.map(x=>`<span class="tag strong">${x.t} +${x.w}</span>`).join('')}</div>
      <p class="muted small">${sig.map(x=>x.d).join(' ') || 'Нужно больше данных для оценки спроса.'}</p>
      <div class="actions">
        <button class="primary" onclick="openLead('${l.id}')">Открыть лид</button>
        <button class="ghost" onclick="addToCampaign('${l.id}')">В TOP-20</button>
      </div>
    </article>`
  }).join(''):'<p class="muted">По этим условиям пока нет лидов. Уменьшите минимальный приоритет или добавьте новые компании.</p>';
}

window.addToCampaign=function(id){
  if(!campaign.leadIds.includes(id)){
    campaign.leadIds.push(id);
    campaign.leadIds=[...campaign.leadIds].sort((a,b)=>{
      const A=leads.find(x=>x.id===a), B=leads.find(x=>x.id===b);
      return (B?demandScore(B):0)-(A?demandScore(A):0);
    }).slice(0,20);
    saveCampaign(); renderCampaign(); renderSignals();
  }
};

document.querySelector('#scanSignals')?.addEventListener('click',()=>{
  leads.forEach(l=>{
    const n=nicheInfo(l);
    if(n.bonus>=15) l.signals={...(l.signals||{}),goodNiche:true};
  });
  save(); refresh(); renderSignals();
});
['signalNiche','signalMinScore','signalService'].forEach(id=>document.querySelector('#'+id)?.addEventListener('input',renderSignals));

// Extend refresh without breaking prior version
const _refresh06=refresh;
refresh=function(){ _refresh06(); renderSignals(); };
renderSignals();


const EVIDENCE_KEY='badbee_evidence_v1';
let evidences=[];
const evidenceLabels={launch:'Запуск / новая услуга',branch:'Открытие / новый филиал',event:'Мероприятие / выставка',rebrand:'Ребрендинг / обновление',hiring:'Вакансия дизайнера / маркетолога',designer:'Прямо ищут дизайнера'};
function saveEvidence(){localStorage.setItem(EVIDENCE_KEY,JSON.stringify(evidences));if(window.bbPersistEvidence)window.bbPersistEvidence();}
function researchLeadList(){const el=document.querySelector('#researchLead');if(!el)return;const current=el.value;el.innerHTML=[...leads].sort((a,b)=>(typeof demandScore==='function'?demandScore(b):score(b))-(typeof demandScore==='function'?demandScore(a):score(a))).map(l=>`<option value="${l.id}">${l.company} · ${l.city||'без города'} · ${typeof demandScore==='function'?demandScore(l):score(l)}</option>`).join('');if([...el.options].some(o=>o.value===current))el.value=current;}
function getResearchQueries(l,type='all'){const company=`"${l.company}"`,city=l.city?` "${l.city}"`:'';const q={launch:[`${company}${city} запуск новая услуга новый продукт`,`${company}${city} запустили открыли новый проект`],branch:[`${company}${city} новый филиал открытие`,`${company}${city} новый офис открылись`],event:[`${company}${city} мероприятие форум выставка`,`${company}${city} конференция участие`],rebrand:[`${company}${city} ребрендинг новый фирменный стиль`,`${company}${city} новый сайт обновление бренда`],hiring:[`${company}${city} вакансия дизайнер маркетолог`,`${company}${city} ищет дизайнера маркетолога`],designer:[`${company}${city} "нужен дизайнер"`,`${company}${city} "ищем дизайнера"`]};return type==='all'?Object.entries(q).flatMap(([kind,items])=>items.map(text=>({kind,text}))):q[type].map(text=>({kind:type,text}));}
function renderResearchQueries(){const lead=leads.find(x=>x.id===document.querySelector('#researchLead')?.value);const root=document.querySelector('#queryList');if(!lead||!root)return;const type=document.querySelector('#researchType')?.value||'all';const rows=getResearchQueries(lead,type);root.innerHTML=rows.map(r=>{const encoded=encodeURIComponent(r.text),google='https://www.google.com/search?q='+encoded;return `<div class="query-item"><div><b>${evidenceLabels[r.kind]}</b><div class="muted small">${r.text}</div></div><div class="actions compact"><button class="ghost dark" onclick="copyResearchQuery('${encoded}')">Копировать</button><button class="primary" onclick="window.open('${google}','_blank','noopener')">Искать</button></div></div>`}).join('');}
window.copyResearchQuery=function(encoded){navigator.clipboard.writeText(decodeURIComponent(encoded));};
function renderEvidence(){researchLeadList();const root=document.querySelector('#evidenceList');if(!root)return;const selected=document.querySelector('#researchLead')?.value||'',rows=evidences.filter(e=>!selected||e.leadId===selected);document.querySelector('#evidenceCount').textContent=rows.length;root.innerHTML=rows.length?rows.map(e=>{const l=leads.find(x=>x.id===e.leadId);return `<div class="evidence-item"><div><b>${evidenceLabels[e.type]}</b><div>${l?.company||'Лид удалён'}</div><div class="muted small">${e.note}</div><div class="muted tiny">${new Date(e.createdAt).toLocaleDateString('ru-RU')}</div></div><div class="actions compact"><button class="ghost dark" onclick="window.open('${String(e.url).replace(/'/g,'%27')}','_blank','noopener')">Источник</button><button class="ghost dark" onclick="removeEvidence('${e.id}')">Удалить</button></div></div>`}).join(''):'<p class="muted">Подтверждённых инфоповодов пока нет.</p>';}
window.removeEvidence=function(id){evidences=evidences.filter(e=>e.id!==id);if(window.bbDeleteEvidence)window.bbDeleteEvidence(id);saveEvidence();renderEvidence();};
document.querySelector('#makeQueries')?.addEventListener('click',renderResearchQueries);document.querySelector('#researchLead')?.addEventListener('change',()=>{renderResearchQueries();renderEvidence();});document.querySelector('#researchType')?.addEventListener('change',renderResearchQueries);
document.querySelector('#evidenceForm')?.addEventListener('submit',e=>{e.preventDefault();const leadId=document.querySelector('#researchLead').value,lead=leads.find(x=>x.id===leadId);if(!lead)return;const type=document.querySelector('#evidenceType').value,note=document.querySelector('#evidenceNote').value.trim(),url=document.querySelector('#evidenceUrl').value.trim();evidences.unshift({id:crypto.randomUUID(),leadId,type,note,url,createdAt:new Date().toISOString()});lead.signals={...(lead.signals||{})};if(['launch','branch','event','rebrand'].includes(type))lead.signals.activeLaunch=true;if(type==='designer')lead.signals.needsDesigner=true;if(type==='hiring')lead.signals.goodNiche=true;const line=`Подтверждено: ${evidenceLabels[type]} — ${note}`;if(!(lead.notes||'').includes(line))lead.notes=((lead.notes||'').trim()+(lead.notes?'\n':'')+line).trim();save();saveEvidence();document.querySelector('#evidenceUrl').value='';document.querySelector('#evidenceNote').value='';if(typeof refresh==='function')refresh();renderEvidence();});
const _refreshResearch=typeof refresh==='function'?refresh:null;if(_refreshResearch){refresh=function(){_refreshResearch();renderEvidence();};}renderEvidence();


// ===== BADBEE LEADS 0.8: evidence-based outreach =====
function getOutreachEvidence(leadId){
  return (typeof evidences!=='undefined'?evidences:[]).filter(e=>e.leadId===leadId);
}
function fillOutreachLeads(){
  const el=document.querySelector('#outreachLead'); if(!el)return;
  const cur=el.value;
  el.innerHTML=[...leads].filter(l=>l.status!=='Отказ')
    .sort((a,b)=>(typeof demandScore==='function'?demandScore(b):score(b))-(typeof demandScore==='function'?demandScore(a):score(a)))
    .map(l=>`<option value="${l.id}">${l.company} · ${typeof demandScore==='function'?demandScore(l):score(l)}</option>`).join('');
  if([...el.options].some(o=>o.value===cur))el.value=cur;
}
function getOutreachOffer(l){
  return typeof bestOffer==='function'?bestOffer(l):service(l);
}
function getOutreachReasons(l){
  const ev=getOutreachEvidence(l.id), out=[];
  ev.slice(0,2).forEach(e=>out.push(`${(typeof evidenceLabels!=='undefined'&&evidenceLabels[e.type])||'Инфоповод'}: ${e.note}`));
  if(l.signals?.weakSite) out.push('Есть объективные точки для улучшения текущей веб-упаковки.');
  if(l.signals?.activeLaunch && !ev.length) out.push('В карточке отмечен подтверждённый запуск или рост.');
  if(l.signals?.needsDesigner && !ev.some(e=>e.type==='designer')) out.push('В карточке отмечен прямой спрос на дизайнера.');
  if(!out.length && l.notes) out.push(l.notes.split('\n')[0]);
  return out.slice(0,3);
}
function outreachTextFor(l,channel){
  const offer=getOutreachOffer(l), ev=getOutreachEvidence(l.id), strongest=ev[0];
  let hook;
  if(strongest){
    let n=(strongest.note||'').replace(/\s+/g,' ').trim();
    hook=n?`Увидела, что ${n.charAt(0).toLowerCase()+n.slice(1)}`:'Посмотрела ваш проект.';
  }else if(l.signals?.weakSite){
    hook='Посмотрела вашу текущую онлайн-упаковку и увидела несколько точек, которые можно усилить визуально.';
  }else{
    hook='Посмотрела, как сейчас представлен ваш проект.';
  }
  const value={
    'Сайт':'Могу показать 2–3 конкретные точки, как сделать сайт визуально сильнее и понятнее для клиента.',
    'Презентация':'Могу предложить структуру и визуальную подачу презентации, которая лучше раскрывает продукт или услуги.',
    'Каталог':'Могу показать, как собрать каталог так, чтобы ассортимент было проще смотреть и выбирать.',
    'Айдентика':'Могу предложить направление, как сделать визуальный образ бренда более цельным и узнаваемым.',
    'Соцсети':'Могу показать направление оформления, чтобы контент выглядел цельнее и сильнее работал на продажу.'
  }[offer]||`Могу показать, как усилить ${String(offer).toLowerCase()} с точки зрения дизайна.`;

  if(channel==='short') return `Здравствуйте! ${hook} ${value} Если актуально — пришлю короткую идею без обязательств.`;
  if(channel==='email') return `Здравствуйте!\n\n${hook}\n\nЯ занимаюсь дизайном для бизнеса. ${value}\n\nНе хочу отправлять шаблонное коммерческое предложение — если задача сейчас актуальна, могу сначала прислать короткую идею именно по вашему проекту.\n\nНастя\nBADBEE DESIGN`;
  return `Здравствуйте! ${hook}\n\nЯ занимаюсь дизайном для бизнеса. ${value}\n\nЕсли сейчас это актуально, могу сначала прислать короткую идею именно по вашему проекту — без длинной презентации и шаблонного предложения.`;
}
function renderOutreach(){
  fillOutreachLeads();
  const l=leads.find(x=>x.id===document.querySelector('#outreachLead')?.value); if(!l)return;
  const sc=typeof demandScore==='function'?demandScore(l):score(l);
  document.querySelector('#outreachScore').textContent=`${sc}/100`;
  const rs=getOutreachReasons(l);
  document.querySelector('#outreachReasons').innerHTML=rs.length?rs.map(r=>`<div class="reason-card">${r}</div>`).join(''):'<p class="muted">Сначала лучше проверить инфоповоды компании.</p>';
  const offer=getOutreachOffer(l);
  document.querySelector('#outreachOffer').innerHTML=`<div class="offer-big">${offer}</div><p class="muted">Выбрано по нише, сайту и подтверждённым сигналам.</p>`;
  document.querySelector('#outreachText').value=outreachTextFor(l,document.querySelector('#outreachChannel')?.value||'dm');
}
document.querySelector('#generateOutreach')?.addEventListener('click',renderOutreach);
document.querySelector('#outreachLead')?.addEventListener('change',renderOutreach);
document.querySelector('#outreachChannel')?.addEventListener('change',renderOutreach);
document.querySelector('#copyOutreach')?.addEventListener('click',()=>navigator.clipboard.writeText(document.querySelector('#outreachText').value));
document.querySelector('#markOutreachSent')?.addEventListener('click',()=>{
  const l=leads.find(x=>x.id===document.querySelector('#outreachLead')?.value); if(!l)return;
  l.status='Написала';
  if(typeof campaign!=='undefined'){
    campaign.touches=campaign.touches||{};
    campaign.touches[l.id]=new Date().toISOString();
    if(!campaign.leadIds.includes(l.id))campaign.leadIds.push(l.id);
    if(typeof saveCampaign==='function')saveCampaign();
  }
  save(); if(typeof refresh==='function')refresh(); renderOutreach();
});
const _refresh08=typeof refresh==='function'?refresh:null;
if(_refresh08){refresh=function(){_refresh08();fillOutreachLeads();};}
fillOutreachLeads(); renderOutreach();


// ===== BADBEE LEADS 0.9: outcome analytics =====
const RESULT_KEY='badbee_results_v1';
let leadResults=[];
function saveResults(){localStorage.setItem(RESULT_KEY,JSON.stringify(leadResults));if(window.bbPersistResults)window.bbPersistResults();}
function fillResultLeads(){
 const el=document.querySelector('#resultLead');if(!el)return;const cur=el.value;
 el.innerHTML=[...leads].sort((a,b)=>(typeof demandScore==='function'?demandScore(b):score(b))-(typeof demandScore==='function'?demandScore(a):score(a))).map(l=>`<option value="${l.id}">${l.company} · ${l.status}</option>`).join('');
 if([...el.options].some(o=>o.value===cur))el.value=cur;
}
function latestByLead(){
 const m={};[...leadResults].sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach(r=>m[r.leadId]=r);return m;
}
function renderResults(){
 fillResultLeads();const latest=latestByLead(), vals=Object.values(latest);
 const sent=vals.filter(r=>['Написала','Ответил','Переговоры','Клиент','Отказ'].includes(r.status)).length;
 const replies=vals.filter(r=>['Ответил','Переговоры','Клиент'].includes(r.status)).length;
 const talks=vals.filter(r=>['Переговоры','Клиент'].includes(r.status)).length;
 const clients=vals.filter(r=>r.status==='Клиент').length;
 const revenue=vals.filter(r=>r.status==='Клиент').reduce((s,r)=>s+(Number(r.value)||0),0);
 const potential=vals.filter(r=>['Ответил','Переговоры'].includes(r.status)).reduce((s,r)=>s+(Number(r.value)||0),0);
 const rr=sent?Math.round(replies/sent*100):0, cr=sent?Math.round(clients/sent*100):0;
 document.querySelector('#resultStats').innerHTML=[
 ['Написали',sent],['Ответили',`${rr}%`],['Переговоры',talks],['Клиенты',clients],['Конверсия',`${cr}%`],['Выручка',`${revenue.toLocaleString('ru-RU')} ₽`],['Потенциал',`${potential.toLocaleString('ru-RU')} ₽`]
 ].map(([a,b])=>`<div class="stat"><b>${b}</b><span>${a}</span></div>`).join('');

 const seg={};
 vals.forEach(r=>{const l=leads.find(x=>x.id===r.leadId);if(!l)return;const k=(l.niche||'Без ниши')+' · '+(typeof getOutreachOffer==='function'?getOutreachOffer(l):service(l));seg[k]=seg[k]||{sent:0,replies:0,clients:0};seg[k].sent++;if(['Ответил','Переговоры','Клиент'].includes(r.status))seg[k].replies++;if(r.status==='Клиент')seg[k].clients++});
 const top=Object.entries(seg).sort((a,b)=>(b[1].clients*100+b[1].replies)-(a[1].clients*100+a[1].replies)).slice(0,6);
 document.querySelector('#bestSegments').innerHTML=top.length?top.map(([k,v])=>`<div class="metric-row"><div><b>${k}</b><div class="muted small">${v.replies}/${v.sent} ответов · ${v.clients} клиентов</div></div><b>${v.sent?Math.round(v.replies/v.sent*100):0}%</b></div>`).join(''):'<p class="muted">Пока мало данных.</p>';

 const rej={};vals.filter(r=>r.status==='Отказ').forEach(r=>{const k=r.rejectReason||'Не указано';rej[k]=(rej[k]||0)+1});
 document.querySelector('#rejectionStats').innerHTML=Object.keys(rej).length?Object.entries(rej).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="metric-row"><span>${k}</span><b>${v}</b></div>`).join(''):'<p class="muted">Отказов пока нет.</p>';

 document.querySelector('#resultHistory').innerHTML=[...leadResults].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(r=>{const l=leads.find(x=>x.id===r.leadId);return `<tr><td>${new Date(r.date).toLocaleDateString('ru-RU')}</td><td><b>${l?.company||'Удалён'}</b></td><td>${l?.niche||'—'}</td><td>${l?(typeof getOutreachOffer==='function'?getOutreachOffer(l):service(l)):'—'}</td><td>${r.status}</td><td>${r.value?Number(r.value).toLocaleString('ru-RU')+' ₽':'—'}</td><td>${r.note||r.rejectReason||'—'}</td></tr>`}).join('')||'<tr><td colspan="7" class="muted">История пока пуста.</td></tr>';
}
document.querySelector('#resultForm')?.addEventListener('submit',e=>{e.preventDefault();const id=document.querySelector('#resultLead').value,l=leads.find(x=>x.id===id);if(!l)return;const status=document.querySelector('#resultStatus').value;l.status=status;leadResults.push({id:crypto.randomUUID(),leadId:id,status,value:Number(document.querySelector('#resultValue').value)||0,rejectReason:status==='Отказ'?document.querySelector('#rejectReason').value:'',note:document.querySelector('#resultNote').value.trim(),date:new Date().toISOString()});save();saveResults();document.querySelector('#resultValue').value='';document.querySelector('#resultNote').value='';if(typeof refresh==='function')refresh();renderResults()});
document.querySelector('#exportResults')?.addEventListener('click',()=>{const head=['date','company','niche','service','status','value','reject_reason','note'];const rows=leadResults.map(r=>{const l=leads.find(x=>x.id===r.leadId);return [r.date,l?.company||'',l?.niche||'',l?(typeof getOutreachOffer==='function'?getOutreachOffer(l):service(l)):'',r.status,r.value||'',r.rejectReason||'',r.note||'']});const esc=v=>`"${String(v).replace(/"/g,'""')}"`;const csv='\uFEFF'+[head,...rows].map(row=>row.map(esc).join(';')).join('\n');const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='badbee-results.csv';a.click();URL.revokeObjectURL(a.href)});
const _refresh09=typeof refresh==='function'?refresh:null;if(_refresh09){refresh=function(){_refresh09();renderResults();}}renderResults();

window.addEventListener('load',()=>window.bbBootstrap&&window.bbBootstrap());
