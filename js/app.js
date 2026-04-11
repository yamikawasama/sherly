/* ============================================
   🐰 Sherly Panty - Main Application v3
   ============================================ */
const App = {
  currentPage:'home', cart:[], adminLoggedIn:false, adminTab:'shop',
  _uploadedImages:{}, _slipDataUrl:null, _slipVerified:false,
  _calcMode:'budget', _lastCalcCombo:null, _faqId:null, _promoId:null,
  _selectedRentalId:null, _selectedDate:null, _selectedSlots:[], _selectedPayMethod:0,
  _mobilePreview:false, _guideShown:{},  // track dismissed guides per session

  async init() {
    this.setupLoading(); // Start loading timer immediately
    // Wait for Firebase data to load
    await Store.init();
    document.documentElement.setAttribute('data-theme',Store.getTheme());
    this.applyLoadingImg();
    this.updateMarquee(); this.updateShopStatus(); this.updateMascot(); this.updateChatbotImg(); this.applyChatbotSize(); this.applyMascotSize(); this.applyChatbotBottom();
    this.setupNav(); this.setupTheme(); this.setupChatbot(); this.updateAuthUI(); this.setupMobile(); this.setupSidebarToggle();
    const hash=window.location.hash.slice(1)||'home'; this.navigate(hash);
    window.addEventListener('hashchange',()=>this.navigate(window.location.hash.slice(1)||'home'));
  },

  setupLoading(){setTimeout(()=>{const l=document.getElementById('loadingScreen');if(l)l.classList.add('hidden');},2200);},
  updateMarquee(){const e=document.getElementById('marqueeText');if(e)e.textContent=Store.getMarquee();},
  updateShopStatus(){const s=Store.getShopStatus();const e=document.getElementById('shopStatus');if(e){e.className=`shop-status ${s.open?'open':'closed'}`;e.innerHTML=`<span class="status-dot"></span>${s.open?'เปิดร้าน':'ปิดร้าน'}`;}},
  updateMascot(){const m=Store.getMascot();const logo=document.getElementById('sidebarLogo');if(m&&logo)logo.innerHTML=`<img src="${m}" alt="Mascot" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;},
  updateChatbotImg(){const img=Store.getChatbotImg();const t=document.getElementById('chatbotTriggerImg');const h=document.getElementById('chatHeaderImg');if(img&&t)t.src=img;if(img&&h)h.innerHTML=`<img src="${img}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
  },
  applyChatbotSize(){const size=Store.getChatbotSize();const trigger=document.querySelector('.chatbot-trigger');if(trigger){trigger.style.width=size+'px';trigger.style.height=Math.round(size*1.4)+'px';}},
  applyMascotSize(){const size=Store.getMascotSize();const logo=document.getElementById('sidebarLogo');if(logo){logo.style.width=size+'px';logo.style.height=size+'px';}},
  applyChatbotBottom(){const bottom=Store.getChatbotBottom();const container=document.querySelector('.chatbot-container');if(container)container.style.bottom=bottom+'px';},
  applyLoadingImg(){const imgUrl=Store.getLoadingImg();const size=Store.getLoadingImgSize();const l=document.getElementById('loadingImgContainer')||document.querySelector('.bunny-loader');if(l){if(imgUrl){l.innerHTML=`<img src="${imgUrl}" style="max-width:${Math.round(200*(size/100))}px;max-height:${Math.round(200*(size/100))}px;object-fit:contain;border-radius:12px;">`;l.style.width='auto';l.style.height='auto';}else{l.innerHTML=`<div style="font-size:4rem;">🐰</div>`;}}},
  openLightbox(src){const lb=document.getElementById('lightbox');const img=document.getElementById('lightboxImg');if(lb&&img){img.src=src;lb.classList.add('active');}},

  // ========== NAV ==========
  setupNav(){document.querySelectorAll('.nav-item[data-page]').forEach(item=>{item.addEventListener('click',e=>{e.preventDefault();window.location.hash=item.dataset.page;});});},
  navigate(page){
    if((page==='order'||page==='gift'||page==='myorders')&&!Store.getCurrentUser()&&!this.adminLoggedIn){this.showAuthModal('login');this.showToast('กรุณาเข้าสู่ระบบก่อนค่ะ 🐰','warning');return;}
    if(page==='admin'&&!this.adminLoggedIn){this.showAuthModal('login');this.showToast('กรุณาเข้าสู่ระบบแอดมินค่ะ','warning');return;}
    this.currentPage=page;
    document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
    const nav=document.querySelector(`.nav-item[data-page="${page}"]`);if(nav)nav.classList.add('active');
    document.querySelectorAll('.page-view').forEach(p=>p.classList.remove('active'));
    const pe=document.getElementById(`page-${page}`);if(pe){pe.classList.add('active');this.renderPage(page);}
    document.querySelector('.sidebar')?.classList.remove('open');document.querySelector('.sidebar-overlay')?.classList.remove('active');
    // Show guide popup for order/gift/rental (once per login session)
    if(['order','gift','rental'].includes(page)&&!this._guideShown[page]&&!this.adminLoggedIn){
      const guide=Store.getGuide(page);if(guide&&guide.active!==false&&(guide.title||guide.content)){this._showGuidePopup(page,guide);}
    }
  },
  renderPage(page){const fn={home:'renderHome',order:'renderOrder',gift:'renderGift',rental:'renderRental',admin:'renderAdmin',myorders:'renderMyOrders',faqdetail:'renderFAQDetail',promodetail:'renderPromoDetail'};if(fn[page])this[fn[page]]();},

  // ========== GUIDE POPUP ==========
  _showGuidePopup(page,guide){
    const overlay=document.getElementById('guideOverlay');
    const body=document.getElementById('guidePopupBody');
    if(!overlay||!body)return;
    const contentLines=(guide.content||'').split('\n').map(line=>`<p>${line}</p>`).join('');
    const imagesHtml=(guide.images&&guide.images.length>0)?`<div class="guide-popup-images">${guide.images.map(img=>`<img src="${img}" alt="" onclick="App.openLightbox('${img}')">`).join('')}</div>`:'';
    body.innerHTML=`<div class="guide-popup-title">${guide.title||''}</div>
      <div class="guide-popup-content">${contentLines}</div>
      ${imagesHtml}
      <hr class="guide-popup-divider">
      <div class="guide-popup-close-area">
        <button class="guide-popup-close" onclick="App._closeGuidePopup('${page}')">${guide.closeEmoji||'❌'}</button>
      </div>`;
    overlay.classList.add('active');
    // Scroll to top
    const scrollArea=document.getElementById('guideScrollArea');
    if(scrollArea)scrollArea.scrollTop=0;
  },
  _closeGuidePopup(page){
    this._guideShown[page]=true;
    const overlay=document.getElementById('guideOverlay');
    if(overlay)overlay.classList.remove('active');
  },

  // ========== HOME ==========
  renderHome(){
    const c=document.getElementById('page-home');
    const status=Store.getShopStatus();const banner=Store.getBanner();const btns=Store.getButtons().filter(b=>b.active);
    const orders=Store.getOrders();const topupQ=orders.filter(o=>o.type==='topup'&&o.status!=='done');const sendQ=orders.filter(o=>o.type==='send'&&o.status!=='done');
    const faqs=Store.getFAQ().filter(f=>f.active);const promos=Store.getPromos().filter(p=>p.active);
    c.innerHTML=`<div class="animate-fade-in-up">
      <div class="promo-banner" style="max-height:${Math.round(220*(Store.getBannerSize()/100))}px;min-height:${Math.round(120*(Store.getBannerSize()/100))}px;">${banner?`<img src="${banner}" alt="โปรโมชั่น" style="max-height:${Math.round(220*(Store.getBannerSize()/100))}px;">`:'<div style="font-size:3rem;padding:30px;">🐰✨🎮</div>'}</div>
      <div class="shop-header"><div class="shop-name">୧ ‧:₊˚꒰ 𝐒𝐡𝐞𝐫ƴ𝐥 𝐏𝐚ñ𝐭ƴ ꒱ ⋅ ☆ ˖°</div><div class="shop-tag">#IDVMarket103 ꒱ ˎˊ˗ รับเติม/ส่งของขวัญ Identity V แบบ Official</div></div>
      <div class="status-row">
        <div class="shop-status ${status.open?'open':'closed'}" style="font-size:0.9rem;padding:8px 20px;"><span class="status-dot"></span>${status.open?'🟢 เปิดให้บริการค่ะ~':'🔴 ปิดร้านชั่วคราวค่ะ'}</div>
        <div class="mini-queue">📋 คิวเติม: <strong>${topupQ.length}</strong></div>
        <div class="mini-queue">🎁 คิวส่ง: <strong>${sendQ.length}</strong></div>
      </div>
      <div class="service-grid">${btns.map(b=>`<div class="service-btn" onclick="${b.action==='link'?`window.open('${b.target}','_blank')`:`App.navigate('${b.target}')`}">
        <div class="svc-icon">${b.image?`<img src="${b.image}" alt="${b.name}">`:b.icon}</div><div class="svc-name">${b.name}</div></div>`).join('')}</div>
      ${promos.length>0?`<div style="margin-top:28px;"><h2 style="margin-bottom:16px;">📣 ข่าวสาร & โปรโมชั่น</h2>
      <div class="promo-slider">
        <div class="promo-slides" id="promoSlides">
          ${promos.map(p=>`<div class="promo-slide-item">
            <div class="post-card" style="cursor:pointer; margin-bottom:0;" onclick="App._promoId=${p.id};App.navigate('promodetail');">
              ${(p.images&&p.images.length>0)?`<div class="post-image"><img src="${p.images[0]}" alt="${p.title}"></div>`:''}
              <div class="post-content"><div class="post-title">${p.title}</div><div class="post-desc">${p.description}</div><div style="color:var(--primary);font-size:0.85rem;margin-top:6px;font-weight:600;">อ่านเพิ่มเติม →</div></div>
            </div>
          </div>`).join('')}
        </div>
      </div>
      ${promos.length>1?`<div class="promo-dots">${promos.map((_,i)=>`<div class="promo-dot ${i===0?'active':''}" onclick="App.setPromoSlide(${i})"></div>`).join('')}</div>`:''}
      </div>`:''}
      ${faqs.length>0?`<div style="margin-top:24px;"><h2 style="margin-bottom:16px;">📢 ตอบคำถามที่พบบ่อย</h2>${faqs.map(f=>`
      <div class="faq-card" onclick="App._faqId=${f.id};App.navigate('faqdetail');"><div class="faq-q">❓ ${f.question}</div><div class="faq-a">${f.shortAnswer}</div><div class="faq-more">...อ่านต่อ →</div></div>`).join('')}</div>`:''}
      <div class="contact-row"><a href="https://www.facebook.com/share/16RiyzPHqX/" target="_blank" class="contact-card"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="var(--primary)" style="margin-right:4px;"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.312h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg> <span>Facebook</span></a><a href="https://www.facebook.com/share/1E5GKvtGQi/" target="_blank" class="contact-card">💳 <span>เช็คเครดิต</span></a></div>
    </div>`;
    setTimeout(()=>this.setupPromoSlider(promos.length),0);
  },

  _promoCurrentSlide: 0,
  _promoInterval: null,
  setupPromoSlider(count) {
    clearInterval(this._promoInterval);
    if(count <= 1) return;
    this._promoCurrentSlide = 0;
    this._promoInterval = setInterval(() => this.nextPromoSlide(), 5000);
    const slides = document.getElementById('promoSlides');
    if(!slides) return;
    let startX = 0, currentTranslate = 0, isDragging = false;
    slides.addEventListener('touchstart', e => { startX = e.touches[0].clientX; isDragging = true; clearInterval(this._promoInterval); slides.style.transition = 'none'; }, {passive:true});
    slides.addEventListener('touchmove', e => { if(!isDragging) return; const walk = e.touches[0].clientX - startX; currentTranslate = -(this._promoCurrentSlide * 100) + (walk/slides.offsetWidth)*100; slides.style.transform = `translateX(${currentTranslate}%)`; }, {passive:true});
    slides.addEventListener('touchend', e => { isDragging = false; slides.style.transition = 'transform 0.5s ease'; const changed = e.changedTouches[0].clientX - startX; if(changed < -50) this.nextPromoSlide(); else if(changed > 50) this.prevPromoSlide(); else this.updatePromoSlide(); this._promoInterval = setInterval(() => this.nextPromoSlide(), 5000); });
  },
  nextPromoSlide() { const p = Store.getPromos().filter(x=>x.active); if(!p.length)return; this._promoCurrentSlide = (this._promoCurrentSlide + 1) % p.length; this.updatePromoSlide(); },
  prevPromoSlide() { const p = Store.getPromos().filter(x=>x.active); if(!p.length)return; this._promoCurrentSlide = (this._promoCurrentSlide - 1 + p.length) % p.length; this.updatePromoSlide(); },
  updatePromoSlide() { const slides = document.getElementById('promoSlides'); if(slides) slides.style.transform = `translateX(-${this._promoCurrentSlide * 100}%)`; document.querySelectorAll('.promo-dot').forEach((d, i) => d.className = `promo-dot ${i === this._promoCurrentSlide ? 'active' : ''}`); },
  setPromoSlide(idx) { this._promoCurrentSlide = idx; this.updatePromoSlide(); clearInterval(this._promoInterval); this._promoInterval = setInterval(() => this.nextPromoSlide(), 5000); },

  renderFAQDetail(){const c=document.getElementById('page-faqdetail');const f=Store.getFAQ().find(q=>q.id===this._faqId);if(!f){this.navigate('home');return;}c.innerHTML=`<div class="animate-fade-in-up"><button class="btn btn-ghost" onclick="App.navigate('home')" style="margin-bottom:16px;">← กลับ</button><div class="card"><h2 style="margin-bottom:16px;">❓ ${f.question}</h2><p style="line-height:1.8;white-space:pre-wrap;">${f.fullAnswer}</p></div></div>`;},

  renderPromoDetail(){
    const c=document.getElementById('page-promodetail');const p=Store.getPromos().find(x=>x.id===this._promoId);
    if(!p){this.navigate('home');return;}
    c.innerHTML=`<div class="animate-fade-in-up">
      <button class="btn btn-ghost" onclick="App.navigate('home')" style="margin-bottom:16px;">← กลับ</button>
      <div class="card"><h2 style="margin-bottom:16px;">${p.title}</h2>
        ${(p.images&&p.images.length>0)?p.images.map(img=>`<div style="margin-bottom:12px;"><img src="${img}" alt="" style="width:100%;border-radius:12px;cursor:pointer;object-fit:contain;" onclick="App.openLightbox('${img}')"></div>`).join(''):''}
        <div style="line-height:1.8;white-space:pre-wrap;margin-top:16px;font-size:0.95rem;">${p.content||p.description}</div>
      </div></div>`;
  },

  // ========== ORDER ==========
  renderOrder(){
    const c=document.getElementById('page-order'); const products=Store.getProducts(); const skins=Store.getSkinPacks().filter(s=>s.active);
    const orderBanner=Store.getOrderBanner();const obSize=Store.getOrderBannerSize();
    c.innerHTML=`${orderBanner?`<div class="promo-banner animate-fade-in-up" style="margin-bottom:20px;max-height:${Math.round(180*(obSize/100))}px;min-height:${Math.round(80*(obSize/100))}px;"><img src="${orderBanner}" alt="" style="max-height:${Math.round(180*(obSize/100))}px;border-radius:var(--radius-lg);"></div>`:''}
      <div class="page-header animate-fade-in-up"><h1 class="page-title">📋 สั่งสินค้า</h1><p class="page-description">เลือกแพ็คเติมกระดุม Identity V</p></div>
      ${(Store.getOrderNotes()||[]).map(n=>`<div class="note-box animate-fade-in-up" style="margin-bottom:10px;">${n.text}</div>`).join('')}
      <div class="animate-fade-in-up">
        <div class="form-group"><label class="form-label">🧮 เครื่องคำนวณ</label>
        <select class="form-select" id="calcSelector" onchange="App._calcMode=this.value;App._renderCalcPanel();" style="max-width:350px;">
          <option value="budget">💰 มีงบเท่านี้ได้กี่กระดุม?</option>
          <option value="marble">🔮 เติมลูกแก้ว</option>
          <option value="echo">🎯 ต้องการกระดุมเท่านี้กี่บาท?</option>
          <option value="topup">📊 คำนวณราคายอดเติม</option>
        </select></div>
        <div id="calcPanelArea"></div>
      </div>
      <div class="discount-section animate-fade-in-up">
        <h4>🎫 บัตรส่วนลด Official</h4>
        <div class="form-checkbox" style="margin-bottom:12px;"><input type="checkbox" id="hasOfficialDisc" onchange="App.toggleOfficialDisc()"><span>มีบัตรส่วนลด Official</span></div>
        <div id="officialDiscOptions" style="display:none;">
          <div class="discount-row"><label>📌 10%</label><input class="discount-input" type="number" id="disc10Count" min="0" value="0" onchange="App.recalcCart()"> ใบ
          <label style="margin-left:20px;">📌 3%</label><input class="discount-input" type="number" id="disc3Count" min="0" value="0" onchange="App.recalcCart()"> ใบ</div>
        </div>
      </div>
      <div class="discount-section animate-fade-in-up" id="skinDiscSection" style="display:none;">
        <h4>✨ บัตรส่วนลดในเกม (สกิน)</h4>
        <div class="discount-row"><label><input type="radio" name="skinDisc" value="" checked onchange="App.recalcCart()"> ไม่ใช้</label>
          <label><input type="radio" name="skinDisc" value="50" onchange="App.recalcCart()"> 50%</label>
          <label><input type="radio" name="skinDisc" value="40" onchange="App.recalcCart()"> 40%</label>
          <label><input type="radio" name="skinDisc" value="388" onchange="App.recalcCart()"> 388 กระดุม</label></div>
      </div>
      <h3 style="margin:20px 0 12px;" class="animate-fade-in-up"><img src="assets/images/MiniEcho.webp" alt="echo" style="width:22px;height:22px;display:inline-block;vertical-align:-4px;margin-right:4px;"> แพ็คกระดุม</h3>
      <div class="grid-4 animate-fade-in-up">${products.map(p=>{
        const vd=p.volumeDiscount?p.volumeDiscount.map(v=>`<div style="font-size:0.7rem;color:var(--secondary-dark);">${v.minQty}แพ็ค↑ = ${v.price}฿</div>`).join(''):'';
        return`<div class="echo-pack" id="pack-${p.id}">
          <div class="echo-icon">${p.image?`<img src="${p.image}" alt="${p.name}">`:p.emoji}</div>
          <div class="echo-total">${p.totalEcho} กระดุม</div>
          <div class="echo-detail">${p.echoes} กระดุม +โบนัส${p.bonus}</div>${vd}
          <div class="qty-row"><button class="qty-btn" onclick="App.changeQty(${p.id},-1)">−</button><input class="qty-input" type="number" min="1" value="1" id="qty-${p.id}"><button class="qty-btn" onclick="App.changeQty(${p.id},1)">+</button></div>
          <div class="echo-btns">
            <button class="btn btn-sm ${p.normalEnabled?'btn-outline':'btn-disabled'}" style="width:100%;" ${p.normalEnabled?`onclick="App.addPack(${p.id},'normal')"`:'disabled'}>ปกติ${p.normalEnabled?' '+p.normalPrice+'฿':'(งดรับ)'}</button>
            <button class="btn btn-sm btn-primary" style="width:100%;" onclick="App.addPack(${p.id},'private')">พรีไว ${p.privatePrice}฿</button>
          </div></div>`;}).join('')}</div>
      ${skins.length>0?`<h3 style="margin:24px 0 12px;" class="animate-fade-in-up">✨ แนะนำ</h3>
      <div class="grid-2 animate-fade-in-up">${skins.map(s=>{
        const calc=this._autoCalcSkinPack(s.targetEcho);
        let pvPrice=calc.privatePrice;
        // If admin set custom formula, calculate price from that formula
        if(s.customPrivateFormula){
          const parsed=this._parseFormula(s.customPrivateFormula);
          if(parsed&&parsed.packs.length>0) pvPrice=parsed.totalPrice;
        } else if(s.customPrivatePrice){
          pvPrice=s.customPrivatePrice;
        }
        const nmPrice=s.customNormalPrice?s.customNormalPrice:calc.normalPrice;
        return`<div class="card" style="text-align:center;">
          <div style="font-size:2.5rem;margin-bottom:8px;">${s.image?`<img src="${s.image}" style="width:80px;height:80px;border-radius:12px;margin:0 auto;object-fit:cover;">`:s.emoji}</div>
          <h4>${s.name}</h4>
          <div style="font-size:0.85rem;color:var(--text-secondary);margin:6px 0;">
            ต้องใช้: ${typeof s.targetEcho==='string'&&s.targetEcho.includes('+')?s.targetEcho:Number(s.targetEcho||0).toLocaleString()} กระดุม
          </div>
          <div style="display:flex;gap:8px;justify-content:center;margin-top:12px;flex-wrap:wrap;">
            <button class="btn btn-sm ${s.normalEnabled?'btn-outline':'btn-disabled'}" ${s.normalEnabled?`onclick="App.addSkinPack(${s.id},'normal')"`:'disabled'}>ปกติ${s.normalEnabled?' ฿'+nmPrice.toLocaleString():'(งดรับ)'}</button>
            <button class="btn btn-sm btn-primary" onclick="App.addSkinPack(${s.id},'private')">พรีไว ฿${pvPrice.toLocaleString()}</button>
          </div></div>`;}).join('')}</div>`:''}
      <div class="card animate-fade-in-up" style="margin-top:24px;" id="cartSection"><h3 style="margin-bottom:16px;">🛒 ตะกร้าสินค้า</h3><div id="cartContent"><div style="text-align:center;padding:20px;color:var(--text-light);">ยังไม่มีสินค้าในตะกร้า</div></div></div>`;
    this._renderCalcPanel();this.recalcCart();
  },

  _autoCalcSkinPack(targetEchoStr){
    const storeProducts=Store.getProducts();
    let packsMap={},totalEcho=0,topupEcho=0,pvP=0,nmP=0;
    
    if(typeof targetEchoStr==='string' && targetEchoStr.includes('+')){
      const parts=targetEchoStr.split('+').map(x=>parseInt(x.trim())).filter(x=>!isNaN(x));
      for(const val of parts){
        const p=storeProducts.find(x=>x.totalEcho===val);
        if(p){if(!packsMap[p.id])packsMap[p.id]={pid:p.id,qty:0,totalEcho:p.totalEcho,echoes:p.echoes,pvP:p.privatePrice,nmP:p.normalPrice};packsMap[p.id].qty++;totalEcho+=p.totalEcho;topupEcho+=p.echoes;pvP+=p.privatePrice;nmP+=p.normalPrice;}
      }
    }else{
      let target=parseInt(targetEchoStr)||0;if(target<=0)return{packs:[],totalEcho:0,topupEcho:0,privatePrice:0,normalPrice:0,breakdownText:'0'};
      if(target>50000)target=50000;const products=[...storeProducts].sort((a,b)=>b.totalEcho-a.totalEcho);
      const MAX_VAL=target+Math.max(...products.map(p=>p.totalEcho));
      const dp=new Array(MAX_VAL+1).fill(Infinity);const parent=new Array(MAX_VAL+1).fill(null);const choice=new Array(MAX_VAL+1).fill(null);
      dp[0]=0;
      for(let i=0;i<=MAX_VAL;i++){
        if(dp[i]===Infinity)continue;
        for(const p of products){
          let nxt=i+p.totalEcho;
          if(nxt<=MAX_VAL){
             let cost=dp[i]+p.privatePrice;
             if(cost<dp[nxt] || (cost===dp[nxt] && dp[nxt]!==Infinity && choice[nxt] && p.totalEcho > choice[nxt].totalEcho)){
               dp[nxt]=cost;parent[nxt]=i;choice[nxt]=p;
             }
          }
        }
      }
      let minPrice=Infinity;let bestTotalEcho=-1;
      for(let i=target;i<=MAX_VAL;i++){
        if(dp[i]<minPrice){minPrice=dp[i];bestTotalEcho=i;}
        else if(dp[i]===minPrice&&i>bestTotalEcho){bestTotalEcho=i;}
      }
      let curr=bestTotalEcho;
      while(curr>0&&parent[curr]!==null){
        const p=choice[curr];if(!packsMap[p.id])packsMap[p.id]={pid:p.id,qty:0,totalEcho:p.totalEcho,echoes:p.echoes,pvP:p.privatePrice,nmP:p.normalPrice};
        packsMap[p.id].qty++;totalEcho+=p.totalEcho;topupEcho+=p.echoes;pvP+=p.privatePrice;nmP+=p.normalPrice;curr=parent[curr];
      }
    }
    const packs=Object.values(packsMap).sort((a,b)=>b.totalEcho-a.totalEcho);
    const breakdownText=packs.map(p=>p.qty>1?`${p.totalEcho}×${p.qty}`:`${p.totalEcho}`).join('+');
    return{packs,totalEcho,topupEcho,privatePrice:pvP,normalPrice:nmP,breakdownText};
  },

  _renderCalcPanel(){
    const area=document.getElementById('calcPanelArea');if(!area)return;const m=this._calcMode;
    if(m==='budget')area.innerHTML=`<div class="card"><h4>💰 มีงบเท่านี้ได้กี่กระดุม?</h4><div class="form-group" style="margin-top:12px;"><input class="form-input" type="number" id="budgetInput" placeholder="ใส่งบ (บาท)..." oninput="App.calcBudget()"></div><div id="budgetResult"></div></div>`;
    else if(m==='marble')area.innerHTML=`<div class="card"><h4>🔮 เติมลูกแก้ว (1 ลูก = 96 กระดุม)</h4><div style="display:flex;align-items:center;gap:16px;margin-top:12px;"><input type="range" class="range-slider" id="marbleSlider" min="1" max="250" value="1" oninput="App.calcMarble()"><input class="form-input" type="number" id="marbleInput" min="1" max="250" value="1" style="width:80px;" oninput="App.calcMarbleFromInput()"><span style="font-weight:600;white-space:nowrap;" id="marbleLabel">1 ลูก</span></div><div id="marbleResult" style="margin-top:12px;"></div></div>`;
    else if(m==='echo')area.innerHTML=`<div class="card"><h4>🎯 ต้องการกระดุมเท่านี้กี่บาท?</h4><div class="form-group" style="margin-top:12px;"><input class="form-input" type="number" id="echoNeedInput" placeholder="ใส่จำนวนกระดุม (รวมโบนัส)..." oninput="App.calcEchoNeed()"></div><div id="echoNeedResult"></div></div>`;
    else area.innerHTML=`<div class="card"><h4>📊 คำนวณราคายอดเติม (ไม่รวมโบนัส)</h4><p style="font-size:0.8rem;color:var(--text-secondary);margin:4px 0 12px;">ใส่จำนวนกระดุมที่ต้องการเป็นยอดเติม (echoes ไม่รวมโบนัส)</p><div class="form-group"><input class="form-input" type="number" id="topupCalcInput" placeholder="ใส่ยอดเติมที่ต้องการ..." oninput="App.calcTopup()"></div><div id="topupCalcResult"></div></div>`;
  },

  _calcSummaryHTML(combo,extraRows=''){
    let d10=parseInt(document.getElementById('disc10Count')?.value)||0;let d3=parseInt(document.getElementById('disc3Count')?.value)||0;
    let discountedPrice=this._applyDiscountsToPacks(combo.packs,d10,d3);
    this._lastCalcCombo=combo;
    return`<div class="summary-box" style="margin-top:12px;">
      ${combo.packs.map(p=>`<div class="summary-row"><span>${p.totalEcho} กระดุม x${p.qty}</span><span>${p.price}฿ x${p.qty}</span></div>`).join('')}${extraRows}
      <div class="summary-row"><span>ยอดเติม (ไม่รวมโบนัส)</span><span style="font-weight:700;">${combo.topupEcho.toLocaleString()} กระดุม</span></div>
      <div class="summary-row"><span>กระดุมรวม (รวมโบนัส)</span><span style="font-weight:700;">${combo.totalEcho.toLocaleString()} กระดุม</span></div>
      <div class="summary-row total"><span>💰 ราคา</span><span class="sr-val">฿${discountedPrice.toLocaleString()}</span></div>
      <button class="btn btn-primary" style="width:100%;margin-top:12px;" onclick="App._addCalcToCart()">🛒 เพิ่มลงตะกร้า</button></div>`;
  },

  _applyDiscountsToPacks(packs,d10,d3){
    let allPacks=[];packs.forEach(p=>{for(let i=0;i<p.qty;i++)allPacks.push({...p,qty:1});});
    allPacks.sort((a,b)=>b.price-a.price);let total=0;
    allPacks.forEach(p=>{let fp=p.price;if(d10>0){fp=Math.round(fp*0.9);d10--;}else if(d3>0){fp=Math.round(fp*0.97);d3--;}total+=fp;});
    return total;
  },

  // matchField: 'totalEcho' or 'echoes'
  _calcOptimalPacks(echoNeed,budgetMax,matchField='totalEcho'){
    const products=[...Store.getProducts()].sort((a,b)=>b[matchField]-a[matchField]);
    let remaining=echoNeed||999999;let budget=budgetMax||999999;
    let packs=[],totalPrice=0,totalEcho=0,topupEcho=0;
    for(const p of products){
      if(echoNeed){
        const count=Math.floor(remaining/p[matchField]);
        if(count>0&&totalPrice+p.privatePrice*count<=budget){
          let unitPrice=p.privatePrice;
          if(p.volumeDiscount){const vd=p.volumeDiscount.slice().sort((a,b)=>b.minQty-a.minQty).find(v=>count>=v.minQty);if(vd)unitPrice=vd.price;}
          packs.push({...p,qty:count,price:unitPrice});remaining-=count*p[matchField];totalPrice+=unitPrice*count;totalEcho+=p.totalEcho*count;topupEcho+=p.echoes*count;
        }
      }else{
        const count=Math.floor(budget/p.privatePrice);
        if(count>0){
          let unitPrice=p.privatePrice;
          if(p.volumeDiscount){const vd=p.volumeDiscount.slice().sort((a,b)=>b.minQty-a.minQty).find(v=>count>=v.minQty);if(vd)unitPrice=vd.price;}
          packs.push({...p,qty:count,price:unitPrice});budget-=unitPrice*count;totalPrice+=unitPrice*count;totalEcho+=p.totalEcho*count;topupEcho+=p.echoes*count;
        }
      }
    }
    if(echoNeed&&remaining>0&&products.length>0){const sm=products[products.length-1];const count=Math.ceil(remaining/sm[matchField]);let unitPrice=sm.privatePrice;const ex=packs.find(p=>p.id===sm.id);if(ex){ex.qty+=count;if(sm.volumeDiscount){const vd=sm.volumeDiscount.slice().sort((a,b)=>b.minQty-a.minQty).find(v=>ex.qty>=v.minQty);if(vd){unitPrice=vd.price;ex.price=vd.price;}}}else{if(sm.volumeDiscount){const vd=sm.volumeDiscount.slice().sort((a,b)=>b.minQty-a.minQty).find(v=>count>=v.minQty);if(vd)unitPrice=vd.price;}packs.push({...sm,qty:count,price:unitPrice});}totalPrice+=unitPrice*count;totalEcho+=sm.totalEcho*count;topupEcho+=sm.echoes*count;}
    // Recalculate totalPrice with correct volume prices
    totalPrice=0;packs.forEach(p=>{totalPrice+=p.price*p.qty;});
    return{packs,totalPrice,totalEcho,topupEcho};
  },

  calcBudget(){const b=parseFloat(document.getElementById('budgetInput')?.value)||0;const r=document.getElementById('budgetResult');if(b<=0){r.innerHTML='';return;}const combo=this._calcOptimalPacks(null,b);r.innerHTML=this._calcSummaryHTML(combo,`<div class="summary-row" style="color:var(--primary);"><span>💰 งบ</span><span>${b.toLocaleString()} บาท</span></div>`);},

  calcMarble(){const s=document.getElementById('marbleSlider');const i=document.getElementById('marbleInput');const l=document.getElementById('marbleLabel');const c=parseInt(s.value)||1;i.value=c;l.textContent=`${c} ลูก`;this._doMarbleCalc(c);},
  calcMarbleFromInput(){const i=document.getElementById('marbleInput');const s=document.getElementById('marbleSlider');const l=document.getElementById('marbleLabel');let c=parseInt(i.value)||1;if(c>250)c=250;if(c<1)c=1;s.value=c;l.textContent=`${c} ลูก`;this._doMarbleCalc(c);},
  _doMarbleCalc(count){const echoNeed=count*96;const combo=this._calcOptimalPacks(echoNeed);const r=document.getElementById('marbleResult');r.innerHTML=this._calcSummaryHTML(combo,`<div class="summary-row"><span>🔮 ลูกแก้ว</span><span>${count} ลูก (${echoNeed.toLocaleString()} กระดุม)</span></div>`);},

  calcEchoNeed(){const need=parseInt(document.getElementById('echoNeedInput')?.value)||0;const r=document.getElementById('echoNeedResult');if(need<=0){r.innerHTML='';return;}const combo=this._calcOptimalPacks(need);r.innerHTML=this._calcSummaryHTML(combo);},

  // Topup calc: match on echoes (without bonus) so ยอดเติม matches customer's request
  calcTopup(){const need=parseInt(document.getElementById('topupCalcInput')?.value)||0;const r=document.getElementById('topupCalcResult');if(need<=0){r.innerHTML='';return;}const combo=this._calcOptimalPacks(need,null,'echoes');r.innerHTML=this._calcSummaryHTML(combo,`<div class="summary-row" style="color:var(--primary);"><span>🎯 ยอดเติมที่ต้องการ</span><span>${need.toLocaleString()} กระดุม</span></div>`);},

  _addCalcToCart(){if(!this._lastCalcCombo||this._lastCalcCombo.packs.length===0)return;this._lastCalcCombo.packs.forEach(p=>{const key=`${p.id}-private`;const product=Store.getProducts().find(x=>x.id===p.id);const ex=this.cart.find(c=>c.key===key);if(ex){ex.qty+=p.qty;if(product&&product.volumeDiscount){const vd=product.volumeDiscount.slice().sort((a,b)=>b.minQty-a.minQty).find(v=>ex.qty>=v.minQty);if(vd)ex.price=vd.price;}}else this.cart.push({key,id:p.id,name:p.name,type:'private',echoes:p.echoes,bonus:p.bonus,totalEcho:p.totalEcho,price:p.price,cost:p.cost||0,qty:p.qty,isSkin:false,volumeDiscount:product?.volumeDiscount||null});});this.updateCartBadge();this.recalcCart();this.showToast('🛒 เพิ่มลงตะกร้าแล้ว!','success');},

  changeQty(packId,delta){const input=document.getElementById(`qty-${packId}`);if(!input)return;let v=parseInt(input.value)||1;v+=delta;if(v<1)v=1;input.value=v;},

  addPack(productId,type){
    const p=Store.getProducts().find(x=>x.id===productId);if(!p)return;const qty=parseInt(document.getElementById(`qty-${productId}`)?.value)||1;
    let price=type==='normal'?p.normalPrice:p.privatePrice;
    if(p.volumeDiscount){const totalInCart=(this.cart.find(c=>c.id===p.id&&c.type===type)?.qty||0)+qty;const vd=p.volumeDiscount.slice().sort((a,b)=>b.minQty-a.minQty).find(v=>totalInCart>=v.minQty);if(vd&&type==='private')price=vd.price;}
    const key=`${productId}-${type}`;const existing=this.cart.find(c=>c.key===key);
    if(existing){existing.qty+=qty;if(p.volumeDiscount&&type==='private'){const vd2=p.volumeDiscount.slice().sort((a,b)=>b.minQty-a.minQty).find(v=>existing.qty>=v.minQty);if(vd2)existing.price=vd2.price;}}
    else this.cart.push({key,id:p.id,name:p.name,type,echoes:p.echoes,bonus:p.bonus,totalEcho:p.totalEcho,price,cost:p.cost||0,qty,isSkin:false,volumeDiscount:p.volumeDiscount||null});
    this.updateCartBadge();this.recalcCart();this.showToast(`🛒 เพิ่ม ${p.name} x${qty} (${type==='private'?'พรีไว':'ปกติ'})`,'success');
  },

  addSkinPack(skinId,type){
    const s=Store.getSkinPacks().find(x=>x.id===skinId);if(!s)return;
    // If admin set a custom formula for private price, use that formula's packs
    let calcPacks;
    if(type==='private'&&s.customPrivateFormula){
      const parsed=this._parseFormula(s.customPrivateFormula);
      if(parsed&&parsed.packs.length>0)calcPacks=parsed.packs;
    }
    if(!calcPacks){const calc=this._autoCalcSkinPack(s.targetEcho);calcPacks=calc.packs;}
    const products=Store.getProducts();
    // Add each pack unit individually so cart shows separate items (like screenshot)
    calcPacks.forEach(pack=>{
      const product=products.find(p=>p.id===pack.pid);
      if(!product)return;
      let price=type==='private'?product.privatePrice:product.normalPrice;
      // Add each unit of this pack as separate cart entries
      for(let i=0;i<pack.qty;i++){
        const key=`${product.id}-${type}`;
        const existing=this.cart.find(c=>c.key===key);
        if(existing){
          existing.qty+=1;
          if(product.volumeDiscount&&type==='private'){
            const vd=product.volumeDiscount.slice().sort((a,b)=>b.minQty-a.minQty).find(v=>existing.qty>=v.minQty);
            if(vd)existing.price=vd.price;
          }
        } else {
          this.cart.push({key,id:product.id,name:product.name,type,echoes:product.echoes,bonus:product.bonus,totalEcho:product.totalEcho,price,cost:product.cost||0,qty:1,isSkin:false,volumeDiscount:product.volumeDiscount||null,skinPackName:s.name});
        }
      }
    });
    this.updateCartBadge();this.recalcCart();
    const sd=document.getElementById('skinDiscSection');if(sd)sd.style.display='block';
    this.showToast(`🛒 เพิ่มแพ็คกระดุมสำหรับ ${s.name}`,'success');
  },

  removeCartItem(key){this.cart=this.cart.filter(c=>c.key!==key);this.updateCartBadge();this.recalcCart();if(!this.cart.some(c=>c.isSkin)){const sd=document.getElementById('skinDiscSection');if(sd)sd.style.display='none';}},
  removeOneFromCart(key){const item=this.cart.find(c=>c.key===key);if(!item)return;if(item.qty>1){item.qty--;if(item.volumeDiscount&&item.type==='private'){let basePrice=Store.getProducts().find(p=>p.id===item.id)?.privatePrice||item.price;const vd=item.volumeDiscount.slice().sort((a,b)=>b.minQty-a.minQty).find(v=>item.qty>=v.minQty);item.price=vd?vd.price:basePrice;}}else{this.cart=this.cart.filter(c=>c.key!==key);}this.updateCartBadge();this.recalcCart();if(!this.cart.some(c=>c.isSkin)){const sd=document.getElementById('skinDiscSection');if(sd)sd.style.display='none';}},
  clearCart(){if(this.cart.length===0)return;this.cart=[];this.updateCartBadge();this.recalcCart();const sd=document.getElementById('skinDiscSection');if(sd)sd.style.display='none';this.showToast('🗑️ ล้างตะกร้าแล้ว!');},
  updateCartBadge(){const badge=document.getElementById('cartBadge');const total=this.cart.reduce((s,c)=>s+c.qty,0);if(badge){badge.textContent=total;badge.style.display=total>0?'inline':'none';}},
  toggleOfficialDisc(){const checked=document.getElementById('hasOfficialDisc')?.checked;const opts=document.getElementById('officialDiscOptions');if(opts)opts.style.display=checked?'block':'none';if(!checked){document.getElementById('disc10Count').value=0;document.getElementById('disc3Count').value=0;}this.recalcCart();},

  recalcCart(){
    const cc=document.getElementById('cartContent');if(!cc)return;
    if(this.cart.length===0){cc.innerHTML='<div style="text-align:center;padding:20px;color:var(--text-light);">ยังไม่มีสินค้าในตะกร้า</div>';return;}
    this.cart.forEach(item=>{if(item.volumeDiscount&&item.type==='private'){let basePrice=Store.getProducts().find(p=>p.id===item.id)?.privatePrice||item.price;const vd=item.volumeDiscount.slice().sort((a,b)=>b.minQty-a.minQty).find(v=>item.qty>=v.minQty);item.price=vd?vd.price:basePrice;}});
    let disc10=parseInt(document.getElementById('disc10Count')?.value)||0;let disc3=parseInt(document.getElementById('disc3Count')?.value)||0;
    const sorted=[...this.cart].map(c=>{let items=[];for(let i=0;i<c.qty;i++)items.push({...c,qty:1});return items;}).flat().sort((a,b)=>b.price-a.price);
    let totalPrice=0,totalEcho=0,topupEcho=0;let rows=[];
    sorted.forEach(item=>{let finalPrice=item.price;let discLabel='';if(disc10>0){finalPrice-=Math.round(finalPrice*0.1);disc10--;discLabel+=' [ลด10%]';}else if(disc3>0){finalPrice-=Math.round(finalPrice*0.03);disc3--;discLabel+=' [ลด3%]';}totalPrice+=finalPrice;totalEcho+=item.totalEcho;topupEcho+=item.echoes;rows.push({...item,finalPrice,discLabel});});
    cc.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><span style="font-weight:600;">สินค้า ${this.cart.reduce((s,c)=>s+c.qty,0)} ชิ้น</span><button class="btn btn-sm btn-outline" style="color:#F44336;border-color:#F44336;" onclick="App.clearCart()">🗑️ ล้างตะกร้า</button></div>
    ${rows.map(r=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border-color);">
      <div><div style="font-weight:600;">${r.isSkin?'✨':'<img src="assets/images/MiniEcho.webp" alt="echo" style="width:22px;height:22px;display:inline-block;vertical-align:-4px;margin-right:4px;">'} ${r.name} (${r.type==='private'?'พรีไว':r.type==='send'?'ส่ง':'ปกติ'})${r.discLabel}</div><div style="font-size:0.8rem;color:var(--text-secondary);">${r.totalEcho} กระดุม${r.breakdownText?' (สรุป: '+r.breakdownText+')':''}</div></div>
      <div style="display:flex;align-items:center;gap:8px;"><span style="font-weight:700;color:var(--primary);">฿${r.finalPrice.toLocaleString()}</span><button class="btn-copy" onclick="App.removeOneFromCart('${r.key}')" title="ลบ 1 ชิ้น">➖</button></div></div>`).join('')}
    <div class="summary-box" style="margin-top:16px;">
      <div class="summary-row"><span>ยอดเติม (ไม่รวมโบนัส)</span><span style="font-weight:700;">${topupEcho.toLocaleString()} กระดุม</span></div>
      <div class="summary-row"><span>กระดุมรวมที่ได้</span><span style="font-weight:700;">${totalEcho.toLocaleString()} กระดุม</span></div>
      <div class="summary-row total"><span>💰 รวมราคา</span><span class="sr-val">฿${totalPrice.toLocaleString()}</span></div>
    </div><button class="btn btn-primary btn-lg" style="width:100%;margin-top:16px;" onclick="App.proceedCheckout()">📋 สั่งซื้อ</button>`;
  },

  // ========== CHECKOUT ==========
  proceedCheckout(){if(this.cart.length===0){this.showToast('ยังไม่มีสินค้าค่ะ','warning');return;}if(!Store.getCurrentUser()){this.showAuthModal('login');return;}this._showPaymentModal('topup');},
  _showPaymentModal(orderType){
    const bank=Store.getBank();const user=Store.getCurrentUser();const methods=bank.methods?bank.methods.filter(m=>m.active):[{name:'PromptPay',accountName:'ตัวอย่าง',accountNumber:'XXX',noteText:'เติมกับ sherly panty',icon:'💳'}];
    const modal=document.getElementById('genericModalContent');this._selectedPayMethod=0;
    modal.innerHTML=`<button class="modal-close" onclick="App.hideGenericModal()">✕</button>
      <h2 class="modal-title">💰 ชำระเงิน</h2>
      <div class="form-group"><label class="form-label">ชื่อในเกม</label><input class="form-input" id="payGameName" value="${user?.gameName||''}" placeholder="ชื่อในเกม"></div>
      <div class="grid-2"><div class="form-group"><label class="form-label">UID</label><input class="form-input" id="payUID" value="${user?.uid||''}" placeholder="User ID"></div>
      <div class="form-group"><label class="form-label">Server</label><select class="form-select" id="payServer"><option value="Asia">Asia</option><option value="NA/EU">NA/EU</option></select></div></div>
      <label class="form-label">📱 ช่องทางชำระเงิน</label>
      <div class="pay-method">${methods.map((m,i)=>`<div class="pay-method-btn ${i===0?'selected':''}" onclick="App._selectPayMethod(${i})"><div class="pm-icon">${m.icon||'💳'}</div><div class="pm-name">${m.name}</div></div>`).join('')}</div>
      <div id="payMethodInfo"></div>
      <div class="form-group"><label class="form-label">📸 อัปโหลดสลิป</label>
        <div class="slip-upload" onclick="document.getElementById('slipFile').click()"><div style="font-size:2rem;margin-bottom:8px;">📄</div><p style="color:var(--text-secondary);font-size:0.85rem;">คลิกเพื่อเลือกรูปสลิป</p><input type="file" id="slipFile" accept="image/*" style="display:none;" onchange="App.handleSlipUpload(event)"></div>
        <div id="slipPreviewArea"></div></div>
      <button class="btn btn-primary btn-lg" style="width:100%;" onclick="App.submitOrderWithSlip('${orderType}')">✅ ยืนยันสั่งซื้อ</button>`;
    this._renderPayMethodInfo(methods,0);document.getElementById('genericModal').classList.add('active');
  },
  _selectPayMethod(idx){this._selectedPayMethod=idx;document.querySelectorAll('.pay-method-btn').forEach((b,i)=>b.classList.toggle('selected',i===idx));const bank=Store.getBank();const methods=bank.methods?bank.methods.filter(m=>m.active):[];this._renderPayMethodInfo(methods,idx);},
  _renderPayMethodInfo(methods,idx){const m=methods[idx];if(!m)return;const info=document.getElementById('payMethodInfo');if(info)info.innerHTML=`<div class="card" style="margin:12px 0;text-align:center;"><h4 style="margin-bottom:8px;">${m.icon} ${m.name}</h4><div style="font-size:0.85rem;color:var(--text-secondary);">ชื่อบัญชี</div><div style="font-weight:700;font-size:1.1rem;">${m.accountName}</div><div style="display:flex;align-items:center;justify-content:center;gap:8px;margin:8px 0;"><span style="font-weight:700;font-size:1.2rem;letter-spacing:2px;">${m.accountNumber}</span><button class="btn-copy" onclick="App.copyText('${m.accountNumber}')">📋</button></div><div style="font-size:0.85rem;color:var(--text-secondary);">โน๊ตข้อความ:</div><div style="display:flex;align-items:center;justify-content:center;gap:8px;"><span style="font-weight:600;color:var(--primary);">${m.noteText}</span><button class="btn-copy" onclick="App.copyText('${m.noteText}')">📋</button></div></div>`;},

  handleSlipUpload(event){const file=event.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=(e)=>{this._slipDataUrl=e.target.result;document.getElementById('slipPreviewArea').innerHTML=`<img src="${e.target.result}" class="slip-preview" alt="slip">`;document.querySelector('.slip-upload')?.classList.add('has-file');this._verifySlip(e.target.result);};reader.readAsDataURL(file);},
  _verifySlip(dataUrl){const img=new Image();img.onload=()=>{const canvas=document.createElement('canvas');canvas.width=img.width;canvas.height=img.height;const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0);const imageData=ctx.getImageData(0,0,canvas.width,canvas.height);let verified=false;if(typeof jsQR!=='undefined'){const code=jsQR(imageData.data,imageData.width,imageData.height);if(code&&code.data)verified=true;}if(img.width>=200&&img.height>=300)verified=true;this._slipVerified=verified;const area=document.getElementById('slipPreviewArea');if(verified)area.innerHTML+=`<div class="note-box success" style="margin-top:8px;">✅ ตรวจสอบสลิปผ่าน</div>`;else area.innerHTML+=`<div class="note-box danger" style="margin-top:8px;">⚠️ สลิปปลอมรึปล่าวน้า</div>`;};img.src=dataUrl;},

  submitOrderWithSlip(orderType){
    const gameName=document.getElementById('payGameName')?.value;const uid=document.getElementById('payUID')?.value;const server=document.getElementById('payServer')?.value;
    if(!gameName||!uid){this.showToast('กรอกข้อมูลให้ครบค่ะ','warning');return;}if(!this._slipDataUrl){this.showToast('กรุณาอัปโหลดสลิปค่ะ','warning');return;}
    const user=Store.getCurrentUser();
    if(orderType==='rental'){
      const pending=this._pendingRental;if(!pending)return;
      const order=Store.addOrder({type:'rental',userId:user?.id,gameName,uid,server,items:[{name:pending.name,price:pending.price,qty:pending.qty,isSkin:false}],totalEcho:0,topupEcho:0,totalPrice:pending.price*pending.qty,totalCost:0,slipImage:this._slipDataUrl,slipVerified:this._slipVerified});
      Store.addBooking({orderId:order.id,rentalId:pending.rentalId,userId:user.id,userName:gameName||user.gameName,date:pending.date,startHour:pending.startHour,endHour:pending.endHour,totalHours:pending.qty,totalPrice:pending.price*pending.qty,slipImage:this._slipDataUrl,status:'booked'});
      this._pendingRental=null;this._selectedSlots=[];
    }else{
      let d10=parseInt(document.getElementById('disc10Count')?.value)||0;let d3=parseInt(document.getElementById('disc3Count')?.value)||0;
      const sorted=[...this.cart].map(c=>{let items=[];for(let i=0;i<c.qty;i++)items.push({...c,qty:1});return items;}).flat().sort((a,b)=>b.price-a.price);
      let totalPrice=0;sorted.forEach(item=>{let fp=item.price;if(d10>0){fp-=Math.round(fp*0.1);d10--;}else if(d3>0){fp-=Math.round(fp*0.03);d3--;}totalPrice+=fp;});
      const totalEcho=this.cart.reduce((s,c)=>s+c.totalEcho*c.qty,0);const topupEcho=this.cart.reduce((s,c)=>s+c.echoes*c.qty,0);
      Store.addOrder({type:orderType,userId:user?.id,gameName,uid,server,items:this.cart.map(c=>({name:c.name,type:c.type,totalEcho:c.totalEcho,echoes:c.echoes,price:c.price,qty:c.qty,isSkin:c.isSkin})),totalEcho,topupEcho,totalPrice,totalCost:this.cart.reduce((s,c)=>s+(c.cost||0)*c.qty,0),slipImage:this._slipDataUrl,slipVerified:this._slipVerified});
      this.cart=[];this.updateCartBadge();
    }
    this._slipDataUrl=null;this._slipVerified=false;this.hideGenericModal();
    this.showToast('✅ สั่งซื้อสำเร็จ! รอแอดมินตรวจสอบค่ะ♡','success');
    // For receipt we get last order
    const o=Store.getOrders();
    this.showReceipt(o[o.length-1]);
  },

  showReceipt(order){const c=document.getElementById(`page-${this.currentPage}`);const now=new Date();const rNote=Store.getReceiptNote(order.type||'topup');c.innerHTML=`<div class="page-header animate-fade-in-up"><h1 class="page-title">🧾 ใบเสร็จ${order.type==='topup'?' (เติม)':order.type==='send'?' (ส่ง)':order.type==='rental'?' (เช่า)':''}</h1></div><div class="animate-bounce-in"><div class="receipt"><div class="receipt-header"><div style="font-size:2rem;">🐰</div><h2 style="font-size:1.2rem;margin:4px 0;">Sherly Panty</h2><div style="margin-top:8px;font-size:0.75rem;color:#aaa;">เลขที่: #${String(order.id).slice(-6)} | คิว${order.type==='topup'?'เติม':order.type==='send'?'ส่ง':'เช่า'}: ${order.queueNumber}</div></div><div style="margin:12px 0;"><div class="receipt-row"><span style="color:#999;">วันที่:</span><span>${now.toLocaleDateString('th-TH',{year:'numeric',month:'long',day:'numeric'})}</span></div><div class="receipt-row"><span style="color:#999;">ลูกค้า:</span><span>${order.gameName}</span></div><div class="receipt-row"><span style="color:#999;">UID:</span><span>${order.uid}</span></div></div><div style="border-top:2px dashed #ddd;padding-top:12px;">${(order.items||[]).map(i=>`<div class="receipt-row"><span>${i.isSkin?'✨':'<img src="assets/images/MiniEcho.webp" alt="echo" style="width:22px;height:22px;display:inline-block;vertical-align:-4px;margin-right:4px;">'} ${i.name} x${i.qty||1}</span><span>฿${((i.price||0)*(i.qty||1)).toLocaleString()}</span></div>`).join('')}</div><div class="receipt-total"><div class="receipt-row"><span style="font-size:1.1rem;">💰 ยอดรวม</span><span style="color:#F2A7B3;font-size:1.3rem;">฿${(order.totalPrice||0).toLocaleString()}</span></div></div><div class="receipt-footer"><p>สถานะ: ⏳ รอ</p><p style="margin-top:4px;">${rNote}</p></div></div></div><div style="display:flex;gap:12px;justify-content:center;margin-top:24px;"><a href="https://www.facebook.com/share/16RiyzPHqX/" target="_blank" class="btn btn-primary btn-lg">📞 ติดต่อแอดมิน</a><button class="btn btn-secondary btn-lg" onclick="App.navigate('home')">🏠 กลับ</button></div>`;},

  // ========== GIFT ==========
  renderGift(){
    const c=document.getElementById('page-gift');const skins=Store.getSkinPacks().filter(s=>s.active&&!s.topupOnly);
    const giftBanner=Store.getGiftBanner();const gbSize=Store.getGiftBannerSize();
    c.innerHTML=`${giftBanner?`<div class="promo-banner animate-fade-in-up" style="margin-bottom:20px;max-height:${Math.round(180*(gbSize/100))}px;min-height:${Math.round(80*(gbSize/100))}px;"><img src="${giftBanner}" alt="" style="max-height:${Math.round(180*(gbSize/100))}px;border-radius:var(--radius-lg);"></div>`:''}
      <div class="page-header animate-fade-in-up"><h1 class="page-title">🎁 ส่งของขวัญ</h1><p class="page-description">ส่งสกิน / ของขวัญ Identity V</p></div>
      <div class="note-box animate-fade-in-up">⚠️ <strong>หมายเหตุ</strong>: แอดเพื่อน 24 ชม. ก่อนถึงจะส่งได้ ไม่สามารถใช้บัตรส่วนลดได้ ไม่ได้ยอดเติม</div>
      <div class="grid-2 animate-fade-in-up" style="margin-top:20px;">${skins.map(s=>`<div class="card" style="text-align:center;">
        <div style="font-size:3rem;margin-bottom:8px;">${s.image?`<img src="${s.image}" style="width:80px;height:80px;border-radius:12px;margin:0 auto;object-fit:cover;">`:s.emoji}</div>
        <h4>${s.name}</h4><div style="font-size:0.85rem;color:var(--text-secondary);margin:8px 0;">${s.targetEcho.toLocaleString()} กระดุม</div>
        <button class="btn btn-primary" onclick="App.orderGift(${s.id})">🎁 ส่ง ${(s.sendPrice||0).toLocaleString()} บาท</button>
      </div>`).join('')}</div>`;
  },
  orderGift(skinId){const s=Store.getSkinPacks().find(x=>x.id===skinId);if(!s)return;const calc=this._autoCalcSkinPack(s.targetEcho);this.cart=[{key:`gift-skin-${skinId}`,id:s.id,name:s.name,type:'send',echoes:calc.topupEcho,bonus:calc.totalEcho-calc.topupEcho,totalEcho:calc.totalEcho,price:s.sendPrice||calc.privatePrice,cost:s.cost||0,qty:1,isSkin:true}];this.updateCartBadge();this._showPaymentModal('send');},

  // ========== RENTAL ==========
  renderRental(){
    const c=document.getElementById('page-rental');const rentals=Store.getRentals().filter(r=>r.active);this._selectedDate=this._selectedDate||new Date().toISOString().split('T')[0];
    const statusLabel=(s)=>s==='not_available'?'🔴 ไม่ปล่อยเช่า':s==='not_yet'?'🟡 ยังไม่ปล่อยเช่า':'🟢 ปล่อยเช่าปกติ';
    const statusColor=(s)=>s==='not_available'?'#F44336':s==='not_yet'?'#FF9800':'#4CAF50';
    c.innerHTML=`<div class="page-header animate-fade-in-up"><h1 class="page-title">🎮 ไอดีปล่อยเช่า</h1><p class="page-description">เลือกไอดีที่สนใจแล้วจองเวลาเช่าได้เลยค่ะ</p></div>
      <div class="grid-3 animate-fade-in-up">${rentals.map(r=>{const rs=r.rentalStatus||'available';const canBook=rs==='available';return`<div class="rental-card ${this._selectedRentalId===r.id?'selected':''} ${!canBook?'rental-unavailable':''}" onclick="${canBook?`App.selectRental(${r.id})`:''}">
        <div class="rental-card-img">${r.image?`<img src="${r.image}" alt="${r.name}">`:`<span class="rental-card-emoji">${r.emoji}</span>`}</div>
        <div class="rental-card-body">
          <h4>${r.name}</h4>
          <div style="font-size:0.8rem;font-weight:600;color:${statusColor(rs)};margin-bottom:4px;">${statusLabel(rs)}</div>
          <div class="rental-card-price">${r.pricePerHour} บาท/ชม.</div>
          <div class="rental-card-desc">${r.description||'กดเพื่อดูรายละเอียด'}</div>
          <div class="rental-card-btn"><button class="btn btn-sm ${canBook?'btn-primary':'btn-disabled'}" style="width:100%;" ${canBook?`onclick="event.stopPropagation();App.selectRental(${r.id});"`:' disabled'}>${canBook?'🎯 จอง':'ไม่สามารถจองได้'}</button></div>
        </div>
      </div>`;}).join('')}</div>
      ${this._selectedRentalId?this._renderRentalDetail():''}`;
  },
  selectRental(id){this._selectedRentalId=id;this._selectedSlots=[];this.renderRental();},
  _renderRentalDetail(){
    const rental=Store.getRentals().find(r=>r.id===this._selectedRentalId);if(!rental)return'';
    const bookings=Store.getBookings().filter(b=>b.rentalId===this._selectedRentalId&&b.date===this._selectedDate&&b.status!=='cancelled');
    const bookedHours=new Set();bookings.forEach(b=>{for(let h=b.startHour;h<b.endHour;h++)bookedHours.add(h);});
    return`<div class="card animate-fade-in-up" style="margin-top:24px;">
      ${rental.image?`<div style="margin-bottom:16px;"><img src="${rental.image}" alt="${rental.name}" style="width:100%;max-height:300px;object-fit:contain;border-radius:12px;cursor:pointer;" onclick="App.openLightbox('${rental.image}')"><p style="font-size:0.8rem;color:var(--text-light);text-align:center;margin-top:4px;">กดเพื่อดูรูปเต็ม</p></div>`:''}
      <h3 style="margin-bottom:8px;">${rental.emoji} ${rental.name}</h3><p style="color:var(--text-secondary);margin-bottom:4px;">${rental.description||''}</p>
      <div style="margin:8px 0;">${(rental.skins||[]).map(s=>`<span style="font-size:1.5rem;">${s}</span>`).join(' ')}</div>
      <div style="font-weight:700;color:var(--primary);margin-bottom:16px;">${rental.pricePerHour} บาท/ชม.</div>
      <h4 style="margin-bottom:8px;">📅 จองเวลาเช่า</h4>
      <div class="form-group"><input class="form-input" type="date" value="${this._selectedDate}" onchange="App._selectedDate=this.value;App._selectedSlots=[];App.renderRental();" style="max-width:250px;"></div>
      <p style="font-size:0.8rem;color:var(--text-light);margin-bottom:8px;">กดเลือกช่วงเวลา</p>
      <div class="rental-calendar">${Array.from({length:24},(_,i)=>{const booked=bookedHours.has(i);const selected=this._selectedSlots.includes(i);return`<div class="rental-slot ${booked?'booked':selected?'selected':''}" onclick="${!booked?`App.toggleSlot(${i})`:''}">${String(i).padStart(2,'0')}:00</div>`;}).join('')}</div>
      ${this._selectedSlots.length>0?`<div class="summary-box" style="margin-top:16px;"><div class="summary-row"><span>เวลา</span><span>${Math.min(...this._selectedSlots)}:00 - ${Math.max(...this._selectedSlots)+1}:00</span></div><div class="summary-row"><span>จำนวน</span><span>${this._selectedSlots.length} ชม.</span></div><div class="summary-row total"><span>💰 ราคารวม</span><span class="sr-val">฿${(this._selectedSlots.length*rental.pricePerHour).toLocaleString()}</span></div></div><button class="btn btn-primary btn-lg" style="width:100%;margin-top:12px;" onclick="App.bookRental()">📋 จองเลย</button>`:''}
    </div>`;
  },
  toggleSlot(hour){const idx=this._selectedSlots.indexOf(hour);if(idx>=0)this._selectedSlots.splice(idx,1);else this._selectedSlots.push(hour);this._selectedSlots.sort((a,b)=>a-b);this.renderRental();},
  bookRental(){if(!Store.getCurrentUser()){this.showAuthModal('login');return;}const rental=Store.getRentals().find(r=>r.id===this._selectedRentalId);if(!rental||this._selectedSlots.length===0)return;
    const start=Math.min(...this._selectedSlots);const end=Math.max(...this._selectedSlots)+1;const qty=this._selectedSlots.length;const price=rental.pricePerHour;
    this._pendingRental={rentalId:rental.id,name:`เช่าไอดี ${rental.name} (${start}:00-${end}:00)`,date:this._selectedDate,startHour:start,endHour:end,qty,price};
    this._showPaymentModal('rental');
  },

  // ========== MY ORDERS (Customer) ==========
  renderMyOrders(){
    const c=document.getElementById('page-myorders');
    const user=Store.getCurrentUser();
    if(!user){
      c.innerHTML=`<div class="animate-fade-in-up" style="display:flex;align-items:center;justify-content:center;min-height:60vh;">
        <div class="card" style="max-width:400px;width:100%;text-align:center;">
          <div style="font-size:3rem;margin-bottom:12px;">📦</div>
          <h2>ออเดอร์ของฉัน</h2>
          <p style="color:var(--text-light);margin:12px 0 20px;">กรุณาเข้าสู่ระบบเพื่อดูออเดอร์ค่ะ</p>
          <button class="btn btn-primary btn-lg" style="width:100%;" onclick="App.showAuthModal('login')">🔑 เข้าสู่ระบบ</button>
        </div>
      </div>`;
      return;
    }
    const allOrders=Store.getOrders();
    const myOrders=allOrders.filter(o=>(o.userId===user.id)||(o.username===user.username));
    const pendingAll=allOrders.filter(o=>o.status!=='done');

    c.innerHTML=`<div class="animate-fade-in-up">
      <div class="page-header"><h1 class="page-title">📦 ออเดอร์ของฉัน</h1></div>
      <div class="grid-3" style="gap:12px;margin-bottom:20px;">
        <div class="stat-card"><div class="stat-value">${myOrders.length}</div><div class="stat-label">ออเดอร์ทั้งหมด</div></div>
        <div class="stat-card"><div class="stat-value">${myOrders.filter(o=>o.status!=='done').length}</div><div class="stat-label">กำลังดำเนินการ</div></div>
        <div class="stat-card"><div class="stat-value">฿${myOrders.reduce((s,o)=>s+(o.totalPrice||0),0).toLocaleString()}</div><div class="stat-label">ยอดสั่งรวม</div></div>
      </div>
      ${myOrders.length>0?myOrders.slice().reverse().map(o=>{
        return`<div class="card" style="margin-bottom:12px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
            <div>
              <strong style="font-size:1.1rem;">ออเดอร์ #${o.queueNumber||'-'}</strong>
              <span class="badge" style="margin-left:8px;background:${o.type==='topup'?'var(--primary)':'var(--secondary)'};color:white;">${o.type==='topup'?'<img src="assets/images/MiniEcho.webp" alt="echo" style="width:22px;height:22px;display:inline-block;vertical-align:-4px;margin-right:4px;"> เติม':'🎁 ส่ง'}</span>
            </div>
            <span class="status-badge status-${o.status}" style="font-size:0.85rem;padding:6px 14px;">
              ${o.status==='waiting'?'⏳ รอดำเนินการ':o.status==='processing'?'🔄 กำลังดำเนินการ':'✅ เสร็จแล้ว'}
            </span>
          </div>
          <div class="table-container">
            <table class="table" style="margin-bottom:0;">
              <thead><tr><th>รายการ</th><th>ยอด</th><th>สลิป</th><th>สถานะ</th></tr></thead>
              <tbody>
                <tr>
                  <td>${(o.items||[]).map(i=>(i.isSkin?'✨':'<img src="assets/images/MiniEcho.webp" alt="echo" style="width:22px;height:22px;display:inline-block;vertical-align:-4px;margin-right:4px;">')+' '+i.name+(i.qty>1?' x'+i.qty:'')).join('<br>')}</td>
                  <td style="font-weight:700;color:var(--primary);font-size:1rem;">฿${(o.totalPrice||0).toLocaleString()}</td>
                  <td>${o.slipImage?`<img src="${o.slipImage}" style="width:50px;height:70px;object-fit:cover;border-radius:6px;cursor:pointer;" onclick="App.openLightbox('${o.slipImage}')">`:'-'}</td>
                  <td>
                    <div style="display:flex;flex-direction:column;gap:4px;align-items:center;">
                      <span class="status-badge status-${o.status}" style="font-size:0.75rem;">${o.status==='waiting'?'⏳ รอ':o.status==='processing'?'🔄 ทำ':'✅ เสร็จ'}</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          ${o.adminNote||((o.adminImages||[]).length>0)?`<div style="margin-top:12px;padding:12px;background:linear-gradient(135deg,#e8f5e9,#c8e6c9);border-radius:10px;">
            ${o.adminNote?`<div style="font-size:0.85rem;margin-bottom:${(o.adminImages||[]).length>0?'8':'0'}px;"><strong>📝 ข้อความจากร้าน:</strong> ${o.adminNote}</div>`:''}
            ${(o.adminImages&&o.adminImages.length>0)?`<div style="display:flex;gap:6px;flex-wrap:wrap;">${o.adminImages.map(img=>`<img src="${img}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;cursor:pointer;border:2px solid white;" onclick="App.openLightbox('${img}')">`).join('')}</div>`:''}
          </div>`:''}
          <div style="margin-top:8px;font-size:0.75rem;color:var(--text-light);text-align:right;">
            🕐 ${new Date(o.createdAt).toLocaleString('th-TH')} | UID: ${o.uid||'-'} | ชื่อ: ${o.gameName||'-'}
          </div>
        </div>`;
      }).join(''):'<div class="card" style="text-align:center;padding:40px;"><div style="font-size:3rem;margin-bottom:12px;">📭</div><h3>ยังไม่มีออเดอร์</h3><p style="color:var(--text-light);margin-top:8px;">ไปสั่งสินค้าได้เลยค่ะ~</p><button class="btn btn-primary" style="margin-top:16px;" onclick="App.navigate(\'order\')">📋 สั่งสินค้า</button></div>'}
    </div>`;
  },

  // ========== ADMIN ==========
  showAdminLogin(){this.currentPage='admin';document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));document.querySelector('.nav-item[data-page="admin"]')?.classList.add('active');document.querySelectorAll('.page-view').forEach(p=>p.classList.remove('active'));const pe=document.getElementById('page-admin');if(pe){pe.classList.add('active');pe.innerHTML=`<div style="display:flex;align-items:center;justify-content:center;min-height:60vh;"><div class="card animate-bounce-in" style="max-width:400px;width:100%;text-align:center;"><div style="font-size:3rem;margin-bottom:12px;">🔒</div><h2>เข้าสู่ระบบแอดมิน</h2><div class="form-group" style="text-align:left;margin-top:20px;"><label class="form-label">ชื่อผู้ใช้</label><input class="form-input" id="adminUserInput" placeholder="ชื่อผู้ใช้"></div><div class="form-group" style="text-align:left;"><label class="form-label">รหัสผ่าน</label><input class="form-input" type="password" id="adminPassInput" placeholder="รหัสผ่าน" onkeypress="if(event.key==='Enter')App.doAdminLogin()"></div><button class="btn btn-primary btn-lg" style="width:100%;" onclick="App.doAdminLogin()">🔑 เข้าสู่ระบบ</button></div></div>`;}},
  doAdminLogin(){const u=document.getElementById('adminUserInput')?.value;const p=document.getElementById('adminPassInput')?.value;if(u===Store.getAdminUser()&&p===Store.getAdminPass()){this.adminLoggedIn=true;this.showToast('✅ เข้าสู่ระบบแอดมิน!');this.renderAdmin();}else this.showToast('❌ รหัสไม่ถูกต้อง','error');},

  renderAdmin(){
    const c=document.getElementById('page-admin');
    c.innerHTML=`<div class="page-header animate-fade-in-up" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;"><h1 class="page-title">⚙️ แอดมิน</h1><button class="btn btn-sm ${this._mobilePreview?'btn-primary':'btn-outline'}" onclick="App.toggleMobilePreview()">📱 ${this._mobilePreview?'ปิดมือถือ':'ดูมือถือ'}</button></div>
      <div class="admin-tabs animate-fade-in-up">${[['shop','🏪 ร้าน'],['buttons','🔘 ปุ่ม'],['products','📦 สินค้า'],['skins','🎁 สกิน'],['queue','📋 คิว'],['rentals','🎮 เช่า'],['faq','❓ FAQ'],['promos','🎉 โปรฯ'],['guides','📖 คู่มือ'],['users','👥 ผู้ใช้'],['chatbot','🤖 Bot'],['profit','💰 กำไร'],['password','🔒 รหัส']].map(([k,l])=>`<button class="admin-tab ${this.adminTab===k?'active':''}" onclick="App.adminTab='${k}';App.renderAdmin();">${l}</button>`).join('')}</div>
      <div class="animate-fade-in-up" id="adminContent"></div>
      <div style="margin-top:24px;text-align:center;"><button class="btn btn-outline" onclick="App.adminLoggedIn=false;App.navigate('home');">🚪 ออกจากระบบ</button></div>`;
    this._renderAdminTab();
  },
  _renderAdminTab(){const ac=document.getElementById('adminContent');if(!ac)return;const fn={shop:'_adminShop',buttons:'_adminButtons',products:'_adminProducts',skins:'_adminSkins',queue:'_adminQueue',rentals:'_adminRentals',faq:'_adminFAQ',promos:'_adminPromos',guides:'_adminGuides',users:'_adminUsers',chatbot:'_adminChatbot',profit:'_adminProfit',password:'_adminPassword'};if(fn[this.adminTab])this[fn[this.adminTab]](ac);},

  _adminShop(ac){
    const status=Store.getShopStatus();const bank=Store.getBank();
    const bannerSize=Store.getBannerSize();const mascotSize=Store.getMascotSize();const chatbotSize=Store.getChatbotSize();
    ac.innerHTML=`<div class="card" style="margin-bottom:20px;"><h3 style="margin-bottom:16px;">🏪 ตั้งค่าร้าน</h3>
      <div class="form-checkbox" style="margin-bottom:16px;"><input type="checkbox" id="adShopOpen" ${status.open?'checked':''}><span>${status.open?'🟢 ร้านเปิด':'🔴 ร้านปิด'}</span></div>
      <div class="form-group"><label class="form-label">ข้อความ Marquee</label><textarea class="form-textarea" id="adMarquee" rows="2">${Store.getMarquee()}</textarea></div>
      <div class="form-group"><label class="form-label">🖼️ แบนเนอร์โปรโมชั่น</label><input type="file" accept="image/*" onchange="App._storeUpload(event,'banner')">
        <div style="margin-top:8px;"><label style="font-size:0.8rem;font-weight:600;">📐 ขนาดแบนเนอร์: <span id="bannerSizeVal">${bannerSize}%</span></label><input type="range" class="range-slider" min="30" max="200" value="${bannerSize}" oninput="document.getElementById('bannerSizeVal').textContent=this.value+'%';" id="bannerSizeSlider"></div>
        <div id="prevBanner" style="margin-top:8px;">${Store.getBanner()?`<img src="${Store.getBanner()}" style="max-width:${Math.round(300*(bannerSize/100))}px;border-radius:12px;">`:''}</div></div>
      <div class="form-group"><label class="form-label">🐰 มาสคอต</label><input type="file" accept="image/*" onchange="App._storeUpload(event,'mascot')">
        <div style="margin-top:8px;"><label style="font-size:0.8rem;font-weight:600;">📐 ขนาดมาสคอต: <span id="mascotSizeVal">${mascotSize}%</span></label><input type="range" class="range-slider" min="30" max="200" value="${mascotSize}" oninput="document.getElementById('mascotSizeVal').textContent=this.value+'%';" id="mascotSizeSlider"></div>
        <div id="prevMascot" style="margin-top:8px;">${Store.getMascot()?`<img src="${Store.getMascot()}" style="max-width:${Math.round(100*(mascotSize/100))}px;border-radius:50%;">`:''}</div></div>
      <div class="form-group"><label class="form-label">🐰 รูปภาพตอนโหลดเข้าเว็บ (แทนกระต่าย)</label><input type="file" accept="image/*" onchange="App._storeUpload(event,'loadingimg')">
        <div style="margin-top:8px;"><label style="font-size:0.8rem;font-weight:600;">📐 ขนาดภาพ: <span id="loadingImgSizeVal">${Store.getLoadingImgSize()}%</span></label><input type="range" class="range-slider" min="30" max="200" value="${Store.getLoadingImgSize()}" oninput="document.getElementById('loadingImgSizeVal').textContent=this.value+'%';" id="loadingImgSizeSlider"></div>
        <div id="prevLoadingimg" style="margin-top:8px;">${Store.getLoadingImg()?`<img src="${Store.getLoadingImg()}" style="max-width:${Math.round(100*(Store.getLoadingImgSize()/100))}px;border-radius:12px;">`:''}</div></div>
      <div class="form-group"><label class="form-label">💬 รูปบอทแชท</label><input type="file" accept="image/*" onchange="App._storeUpload(event,'chatbotimg')">
        <div style="margin-top:8px;"><label style="font-size:0.8rem;font-weight:600;">📐 ขนาดบอท: <span id="chatbotSizeVal">${chatbotSize}%</span></label><input type="range" class="range-slider" min="30" max="200" value="${chatbotSize}" oninput="document.getElementById('chatbotSizeVal').textContent=this.value+'%';" id="chatbotSizeSlider"></div>
        <div style="margin-top:8px;"><label style="font-size:0.8rem;font-weight:600;">⬆️⬇️ ตำแหน่งบอท (เลื่อนขึ้น/ลง): <span id="chatbotBottomVal">${Store.getChatbotBottom()}px</span></label><input type="range" class="range-slider" min="-50" max="200" value="${Store.getChatbotBottom()}" oninput="document.getElementById('chatbotBottomVal').textContent=this.value+'px';" id="chatbotBottomSlider"></div>
        <div id="prevChatbotimg" style="margin-top:8px;">${Store.getChatbotImg()?`<img src="${Store.getChatbotImg()}" style="max-width:${Math.round(80*(chatbotSize/100))}px;">`:''}</div></div>
      <button class="btn btn-primary" onclick="App._saveShopSettings()">💾 บันทึก</button></div>
      <div class="card" style="margin-bottom:20px;"><h3 style="margin-bottom:16px;">🖼️ แบนเนอร์หน้าสั่งซื้อ / ส่งของขวัญ</h3>
        <div class="form-group"><label class="form-label">📋 แบนเนอร์หน้าสั่งซื้อ</label><input type="file" accept="image/*" onchange="App._storeUpload(event,'orderbanner')">
          <div style="margin-top:8px;"><label style="font-size:0.8rem;font-weight:600;">📐 ขนาด: <span id="orderBannerSizeVal">${Store.getOrderBannerSize()}%</span></label><input type="range" class="range-slider" min="30" max="200" value="${Store.getOrderBannerSize()}" oninput="document.getElementById('orderBannerSizeVal').textContent=this.value+'%';" id="orderBannerSizeSlider"></div>
          <div id="prevOrderbanner" style="margin-top:8px;">${Store.getOrderBanner()?`<img src="${Store.getOrderBanner()}" style="max-width:250px;border-radius:12px;">`:'ยังไม่มีภาพ'}</div></div>
        <div class="form-group"><label class="form-label">🎁 แบนเนอร์หน้าส่งของขวัญ</label><input type="file" accept="image/*" onchange="App._storeUpload(event,'giftbanner')">
          <div style="margin-top:8px;"><label style="font-size:0.8rem;font-weight:600;">📐 ขนาด: <span id="giftBannerSizeVal">${Store.getGiftBannerSize()}%</span></label><input type="range" class="range-slider" min="30" max="200" value="${Store.getGiftBannerSize()}" oninput="document.getElementById('giftBannerSizeVal').textContent=this.value+'%';" id="giftBannerSizeSlider"></div>
        <div id="prevGiftbanner" style="margin-top:8px;">${Store.getGiftBanner()?`<img src="${Store.getGiftBanner()}" style="max-width:250px;border-radius:12px;">`:'ยังไม่มีภาพ'}</div></div>
        <button class="btn btn-primary" onclick="App._saveShopSettings()">💾 บันทึกแบนเนอร์</button>
      </div>
      <div class="card"><h3 style="margin-bottom:16px;">🏦 ข้อมูลบัญชี</h3><div class="note-box info">🔒 ต้องใส่รหัสแอดมินเพื่อบันทึก</div>
      ${(bank.methods||[]).map((m,i)=>`<div style="padding:12px;border:1px solid var(--border-color);border-radius:var(--radius-md);margin-bottom:8px;"><div style="font-weight:600;margin-bottom:8px;">${m.icon} ${m.name}</div><div class="grid-3" style="gap:8px;"><div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:0.75rem;">ชื่อบัญชี</label><input class="form-input" id="bName${i}" value="${m.accountName}" style="padding:8px;"></div><div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:0.75rem;">เลขบัญชี</label><input class="form-input" id="bNum${i}" value="${m.accountNumber}" style="padding:8px;"></div><div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:0.75rem;">ข้อความโน๊ต</label><input class="form-input" id="bNote${i}" value="${m.noteText}" style="padding:8px;"></div></div></div>`).join('')}
      <div class="form-group"><label class="form-label">รหัสแอดมิน (ยืนยัน)</label><input class="form-input" type="password" id="adBankPassConfirm" placeholder="ใส่รหัสแอดมิน"></div>
      <button class="btn btn-primary" onclick="App._saveBankInfo()">💾 บันทึกส่วนบัญชี</button></div>${this._renderReceiptNotes()}${this._renderOrderNotes()}`;
  },
  _storeUpload(event,key){
    const file=event.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=e=>{
      const img=new Image();
      img.onload=()=>{
        let w=img.width,h=img.height;const max=800;
        if(w>max){h=Math.round((h*max)/w);w=max;}
        const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
        const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,w,h);
        const dataUrl=canvas.toDataURL('image/webp',0.8);
        const prev=document.getElementById(`prev${key.charAt(0).toUpperCase()+key.slice(1)}`);
        if(prev)prev.innerHTML=`<img src="${dataUrl}" style="max-width:300px;border-radius:12px;margin-top:8px;">`;
        // Save directly to Firebase immediately for ALL image types
        if(key==='banner'){Store.setBanner(dataUrl);}
        else if(key==='mascot'){Store.setMascot(dataUrl);App.updateMascot();}
        else if(key==='chatbotimg'){Store.setChatbotImg(dataUrl);App.updateChatbotImg();}
        else if(key==='orderbanner'){Store.setOrderBanner(dataUrl);}
        else if(key==='giftbanner'){Store.setGiftBanner(dataUrl);}
        else if(key==='loadingimg'){Store.setLoadingImg(dataUrl);}
        // Button images: btn0, btn1, btn2...
        else if(key.startsWith('btn')){const idx=parseInt(key.replace('btn',''));const btns=Store.getButtons();if(btns[idx]){btns[idx].image=dataUrl;Store.setButtons(btns);}}
        // Product images: prod0, prod1, prod2...
        else if(key.startsWith('prod')){const idx=parseInt(key.replace('prod',''));const prods=Store.getProducts();if(prods[idx]){prods[idx].image=dataUrl;Store.setProducts(prods);}}
        // Skin images: skin0, skin1, skin2...
        else if(key.startsWith('skin')){const idx=parseInt(key.replace('skin',''));const skins=Store.getSkinPacks();if(skins[idx]){skins[idx].image=dataUrl;Store.setSkinPacks(skins);}}
        // Rental images: rental0, rental1, rental2...
        else if(key.startsWith('rental')){const idx=parseInt(key.replace('rental',''));const rentals=Store.getRentals();if(rentals[idx]){rentals[idx].image=dataUrl;Store.setRentals(rentals);}}
        // Promo images: promo0_0, promo0_1...
        else if(key.startsWith('promo')){
          const parts=key.replace('promo','').split('_');const pi=parseInt(parts[0]);const ii=parseInt(parts[1]||'0');
          const promos=Store.getPromos();if(promos[pi]){if(!promos[pi].images)promos[pi].images=[];promos[pi].images[ii]=dataUrl;Store.setPromos(promos);}
        }
        App.showToast('✅ อัปโหลดรูปสำเร็จ! ทุกเครื่องจะเห็นภาพใหม่ค่ะ');
      };
      img.src=e.target.result;
    };
    reader.readAsDataURL(file);
  },
  _saveShopSettings(){
    Store.setShopStatus({open:document.getElementById('adShopOpen')?.checked,message:''});
    Store.setMarquee(document.getElementById('adMarquee')?.value||'');
    // Save image sizes
    const bannerSize=parseInt(document.getElementById('bannerSizeSlider')?.value)||100;
    const mascotSize=parseInt(document.getElementById('mascotSizeSlider')?.value)||100;
    const chatbotSize=parseInt(document.getElementById('chatbotSizeSlider')?.value)||100;
    Store.setBannerSize(bannerSize);Store.setMascotSize(mascotSize);Store.setChatbotSize(chatbotSize);
    const chatbotBottom=parseInt(document.getElementById('chatbotBottomSlider')?.value)||0;
    Store.setChatbotBottom(chatbotBottom);
    
    // Page banners and loading sizes
    const obSize=parseInt(document.getElementById('orderBannerSizeSlider')?.value)||100;
    const gbSize=parseInt(document.getElementById('giftBannerSizeSlider')?.value)||100;
    const loadSize=parseInt(document.getElementById('loadingImgSizeSlider')?.value)||100;
    Store.setOrderBannerSize(obSize);Store.setGiftBannerSize(gbSize);
    Store.setLoadingImgSize(loadSize);

    // Images are now saved directly on upload, no need to save again here
    
    this._uploadedImages={};
    
    // Apply mascot size
    const logo=document.getElementById('sidebarLogo');
    if(logo){logo.style.width=Math.round(70*(mascotSize/100))+'px';logo.style.height=Math.round(70*(mascotSize/100))+'px';}
    // Apply chatbot size + position
    this.applyChatbotSize();
    this.applyChatbotBottom();
    this.updateShopStatus();this.updateMarquee();
    this.showToast('✅ บันทึกเรียบร้อย!');
    this.renderAdmin();
  },
  _saveBankInfo(){const pass=document.getElementById('adBankPassConfirm')?.value;if(pass!==Store.getAdminPass()){this.showToast('❌ รหัสไม่ถูกต้อง','error');return;}const bank=Store.getBank();(bank.methods||[]).forEach((m,i)=>{m.accountName=document.getElementById(`bName${i}`)?.value||m.accountName;m.accountNumber=document.getElementById(`bNum${i}`)?.value||m.accountNumber;m.noteText=document.getElementById(`bNote${i}`)?.value||m.noteText;});Store.setBank(bank);this.showToast('✅ บันทึกบัญชีเรียบร้อย!');},
  _renderReceiptNotes(){
    return`<div class="card" style="margin-top:20px;"><h3 style="margin-bottom:16px;">🧾 ข้อความใบเสร็จ</h3>
      <div class="note-box info" style="margin-bottom:12px;">ข้อความ "ขอบคุณที่ใช้บริการ" ในใบเสร็จแต่ละประเภท แก้ไขได้ค่ะ</div>
      <div class="form-group"><label class="form-label"><img src="assets/images/MiniEcho.webp" alt="echo" style="width:22px;height:22px;display:inline-block;vertical-align:-4px;margin-right:4px;"> ใบเสร็จเติม</label><input class="form-input" id="receiptNoteTopup" value="${Store.getReceiptNote('topup')}"></div>
      <div class="form-group"><label class="form-label">🎁 ใบเสร็จส่ง</label><input class="form-input" id="receiptNoteSend" value="${Store.getReceiptNote('send')}"></div>
      <div class="form-group"><label class="form-label">🎮 ใบเสร็จเช่า</label><input class="form-input" id="receiptNoteRental" value="${Store.getReceiptNote('rental')}"></div>
      <button class="btn btn-primary" onclick="App._saveReceiptNotes()">💾 บันทึกข้อความใบเสร็จ</button></div>`;
  },
  _saveReceiptNotes(){
    Store.setReceiptNote('topup',document.getElementById('receiptNoteTopup')?.value||'');
    Store.setReceiptNote('send',document.getElementById('receiptNoteSend')?.value||'');
    Store.setReceiptNote('rental',document.getElementById('receiptNoteRental')?.value||'');
    this.showToast('✅ บันทึกข้อความใบเสร็จ!');
  },
  _renderOrderNotes(){
    const notes=Store.getOrderNotes();
    return`<div class="card" style="margin-top:20px;"><h3 style="margin-bottom:16px;">📝 กล่องข้อความหน้าสั่งสินค้า</h3>
      <div class="note-box info" style="margin-bottom:12px;">ข้อความเหล่านี้จะแสดงที่หน้าสั่งสินค้าให้ลูกค้าอ่านก่อนสั่งซื้อค่ะ</div>
      ${notes.map((n,i)=>`<div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:8px;">
        <textarea class="form-textarea" id="orderNote${i}" rows="2" style="flex:1;font-size:0.85rem;">${n.text||''}</textarea>
        <button class="btn-copy" style="color:#e53e3e;font-size:1.2rem;" onclick="App._deleteOrderNote(${i})" title="ลบ">🗑️</button>
      </div>`).join('')}
      <div style="display:flex;gap:8px;margin-top:8px;">
        <button class="btn btn-primary" onclick="App._saveOrderNotes()">💾 บันทึก</button>
        <button class="btn btn-secondary" onclick="App._addOrderNote()">➕ เพิ่มกล่อง</button>
      </div></div>`;
  },
  _addOrderNote(){const n=Store.getOrderNotes();n.push({text:'ข้อความใหม่'});Store.setOrderNotes(n);this.renderAdmin();},
  _deleteOrderNote(i){const n=Store.getOrderNotes();n.splice(i,1);Store.setOrderNotes(n);this.renderAdmin();},
  _saveOrderNotes(){const n=Store.getOrderNotes();n.forEach((note,i)=>{note.text=document.getElementById(`orderNote${i}`)?.value||'';});Store.setOrderNotes(n);this.showToast('✅ บันทึกกล่องข้อความ!');},

  _adminButtons(ac){
    const btns=Store.getButtons();
    ac.innerHTML=`<div class="card"><h3 style="margin-bottom:16px;">🔘 ปุ่มบริการหน้าแรก</h3>
      ${btns.map((b,i)=>`<div style="padding:10px;border:1px solid var(--border-color);border-radius:var(--radius-md);margin-bottom:8px;">
        <div class="grid-4" style="gap:8px;align-items:end;"><div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:0.75rem;">ชื่อ</label><input class="form-input" id="btnN${i}" value="${b.name}" style="padding:8px;"></div><div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:0.75rem;">Emoji</label><input class="form-input" id="btnI${i}" value="${b.icon}" style="padding:8px;"></div><div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:0.75rem;">เป้าหมาย</label><input class="form-input" id="btnT${i}" value="${b.target}" style="padding:8px;"></div><div style="display:flex;gap:4px;align-items:center;"><button class="btn-copy" onclick="App._moveButton(${i},-1)" ${i===0?'disabled style="opacity:0.3;"':''}>⬆️</button><button class="btn-copy" onclick="App._moveButton(${i},1)" ${i===btns.length-1?'disabled style="opacity:0.3;"':''}>⬇️</button><span class="badge ${b.active?'badge-green':'badge-red'}">${b.active?'เปิด':'ปิด'}</span><button class="btn-copy" onclick="App._toggleButton(${i})">${b.active?'🔴':'🟢'}</button><button class="btn-copy" onclick="App._deleteButton(${i})">🗑️</button></div></div>
        <div style="margin-top:6px;"><label style="font-size:0.75rem;font-weight:600;">รูปภาพ (แทน emoji)</label><input type="file" accept="image/*" onchange="App._storeUpload(event,'btn${i}')" style="font-size:0.75rem;">${b.image?`<img src="${b.image}" style="width:40px;height:40px;border-radius:8px;margin-top:4px;object-fit:cover;">`:''}</div></div>`).join('')}
      <button class="btn btn-primary" style="margin-right:8px;" onclick="App._saveButtons()">💾 บันทึก</button>
      <div style="margin-top:16px;border-top:1px solid var(--border-color);padding-top:16px;"><h4 style="margin-bottom:12px;">➕ เพิ่มปุ่มใหม่</h4><div class="grid-3"><div class="form-group"><label class="form-label">ชื่อ</label><input class="form-input" id="newBtnName" placeholder="ชื่อปุ่ม"></div><div class="form-group"><label class="form-label">ไอคอน</label><input class="form-input" id="newBtnIcon" placeholder="🆕"></div><div class="form-group"><label class="form-label">เป้าหมาย</label><input class="form-input" id="newBtnTarget" placeholder="order / URL"></div></div><div class="form-group"><label class="form-label">ประเภท</label><select class="form-select" id="newBtnAction"><option value="navigate">ลิ้งค์ภายใน</option><option value="link">ลิ้งค์ภายนอก</option></select></div><button class="btn btn-secondary" onclick="App._addButton()">➕ เพิ่มปุ่ม</button></div></div>`;
  },
  _saveButtons(){const btns=Store.getButtons();btns.forEach((b,i)=>{b.name=document.getElementById(`btnN${i}`)?.value||b.name;b.icon=document.getElementById(`btnI${i}`)?.value||b.icon;b.target=document.getElementById(`btnT${i}`)?.value||b.target;if(this._uploadedImages[`btn${i}`])b.image=this._uploadedImages[`btn${i}`];});Store.setButtons(btns);this._uploadedImages={};this.showToast('✅ บันทึก!');this.renderAdmin();},
  _toggleButton(i){const b=Store.getButtons();b[i].active=!b[i].active;Store.setButtons(b);this.renderAdmin();},
  _deleteButton(i){if(!confirm('ลบปุ่มนี้?'))return;const b=Store.getButtons();b.splice(i,1);Store.setButtons(b);this.renderAdmin();},
  _addButton(){const name=document.getElementById('newBtnName')?.value;const icon=document.getElementById('newBtnIcon')?.value||'🆕';const action=document.getElementById('newBtnAction')?.value;const target=document.getElementById('newBtnTarget')?.value;if(!name||!target){this.showToast('กรอกข้อมูลค่ะ','warning');return;}const b=Store.getButtons();b.push({id:Date.now(),name,icon,image:'',action,target,active:true});Store.setButtons(b);this.showToast('✅ เพิ่มปุ่ม!');this.renderAdmin();},

  // ADMIN PRODUCTS (with add + reorder)
  _adminProducts(ac){
    const products=Store.getProducts();
    ac.innerHTML=`<div class="card"><h3 style="margin-bottom:16px;">📦 จัดการแพ็คกระดุม</h3>
      ${products.map((p,i)=>`<div style="padding:12px;border:1px solid var(--border-color);border-radius:var(--radius-md);margin-bottom:8px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><span style="font-size:1.5rem;">${p.image?`<img src="${p.image}" style="width:32px;height:32px;border-radius:6px;object-fit:cover;">`:p.emoji}</span><strong>${p.name}</strong>
          <div style="margin-left:auto;display:flex;gap:4px;"><button class="btn-copy" onclick="App._moveProduct(${i},-1)" ${i===0?'disabled style="opacity:0.3;"':''}>⬆️</button><button class="btn-copy" onclick="App._moveProduct(${i},1)" ${i===products.length-1?'disabled style="opacity:0.3;"':''}>⬇️</button><button class="btn-copy" onclick="App._deleteProduct(${i})">🗑️</button></div></div>
        <div class="grid-4" style="gap:8px;"><div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:0.75rem;">กระดุม</label><input class="form-input" type="number" id="pE${i}" value="${p.echoes}" style="padding:8px;"></div><div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:0.75rem;">โบนัส</label><input class="form-input" type="number" id="pB${i}" value="${p.bonus}" style="padding:8px;"></div><div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:0.75rem;">ราคาพรีไว</label><input class="form-input" type="number" id="pPP${i}" value="${p.privatePrice}" style="padding:8px;"></div><div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:0.75rem;">ราคาปกติ</label><input class="form-input" type="number" id="pNP${i}" value="${p.normalPrice}" style="padding:8px;"></div></div>
        <div style="display:flex;gap:12px;margin-top:8px;align-items:center;flex-wrap:wrap;"><label class="form-checkbox"><input type="checkbox" id="pON${i}" ${p.normalEnabled?'checked':''}><span>เปิดรับปกติ</span></label><div><label style="font-size:0.75rem;font-weight:600;">รูปสินค้า</label><input type="file" accept="image/*" onchange="App._storeUpload(event,'prod${i}')" style="font-size:0.75rem;"></div></div>
      </div>`).join('')}
      <button class="btn btn-primary" onclick="App._saveProducts()" style="margin-right:8px;">💾 บันทึก</button>
      <button class="btn btn-secondary" onclick="App._addProduct()">➕ เพิ่มสินค้า</button></div>`;
  },
  _saveProducts(){const products=Store.getProducts();products.forEach((p,i)=>{p.echoes=parseInt(document.getElementById(`pE${i}`)?.value)||p.echoes;p.bonus=parseInt(document.getElementById(`pB${i}`)?.value)||p.bonus;p.totalEcho=p.echoes+p.bonus;p.name=`${p.totalEcho} กระดุม`;p.privatePrice=parseInt(document.getElementById(`pPP${i}`)?.value)||p.privatePrice;p.normalPrice=parseInt(document.getElementById(`pNP${i}`)?.value)||p.normalPrice;p.normalEnabled=document.getElementById(`pON${i}`)?.checked||false;if(this._uploadedImages[`prod${i}`])p.image=this._uploadedImages[`prod${i}`];});Store.setProducts(products);this._uploadedImages={};this.showToast('✅ บันทึก!');this.renderAdmin();},
  _addProduct(){const products=Store.getProducts();products.push({id:Date.now(),name:'สินค้าใหม่',echoes:0,bonus:0,totalEcho:0,privatePrice:0,normalPrice:0,normalEnabled:false,cost:0,image:'',emoji:'<img src="assets/images/MiniEcho.webp" alt="echo" style="width:22px;height:22px;display:inline-block;vertical-align:-4px;margin-right:4px;">'});Store.setProducts(products);this.showToast('✅ เพิ่มสินค้า!');this.renderAdmin();},
  _moveProduct(idx,dir){const products=Store.getProducts();const ni=idx+dir;if(ni<0||ni>=products.length)return;[products[idx],products[ni]]=[products[ni],products[idx]];Store.setProducts(products);this.renderAdmin();},
  _deleteProduct(idx){if(!confirm('ลบสินค้านี้?'))return;const products=Store.getProducts();products.splice(idx,1);Store.setProducts(products);this.renderAdmin();},

  // ADMIN SKINS (auto-calc from targetEcho + image)
  _adminSkins(ac){
    const skins=Store.getSkinPacks();
    ac.innerHTML=`<div class="card"><h3 style="margin-bottom:16px;">🎁 จัดการแพ็คสกิน</h3>
      <div class="note-box info">ใส่จำนวนกระดุมที่ต้องใช้ ระบบจะคำนวณแพ็ค/ราคาให้อัตโนมัติ! หรือตั้งราคาเองได้</div>
      ${skins.map((s,i)=>{const calc=this._autoCalcSkinPack(s.targetEcho||0);
        return`<div style="padding:12px;border:1px solid var(--border-color);border-radius:var(--radius-md);margin-bottom:8px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><strong>${s.emoji} ${s.name}</strong><div style="display:flex;gap:4px;align-items:center;"><button class="btn-copy" onclick="App._moveSkin(${i},-1)" ${i===0?'disabled style="opacity:0.3;"':''}>⬆️</button><button class="btn-copy" onclick="App._moveSkin(${i},1)" ${i===skins.length-1?'disabled style="opacity:0.3;"':''}>⬇️</button><span class="badge ${s.topupOnly?'badge-yellow':'badge-blue'}">${s.topupOnly?'เติมเท่านั้น':'เติม+ส่ง'}</span><span class="badge ${s.active?'badge-green':'badge-red'}">${s.active?'เปิด':'ปิด'}</span><button class="btn-copy" onclick="App._toggleSkinTopup(${i})">${s.topupOnly?'🎁':'<img src="assets/images/MiniEcho.webp" alt="echo" style="width:22px;height:22px;display:inline-block;vertical-align:-4px;margin-right:4px;">'}</button><button class="btn-copy" onclick="App._toggleSkin(${i})">${s.active?'🔴':'🟢'}</button><button class="btn-copy" onclick="App._deleteSkin(${i})">🗑️</button></div></div>
        <div class="grid-3" style="gap:8px;"><div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:0.75rem;">ชื่อ</label><input class="form-input" id="sN${i}" value="${s.name}" style="padding:8px;"></div><div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:0.75rem;">กระดุมที่ต้องใช้</label><input class="form-input" type="text" id="sTE${i}" value="${typeof s.targetEcho==='number'?s.targetEcho:(s.targetEcho||'')}" style="padding:8px;" placeholder="ต.ย. 726 หรือ 759+66"></div><div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:0.75rem;">ราคาส่ง (กำหนดเอง)</label><input class="form-input" type="number" id="sSP${i}" value="${s.sendPrice||''}" style="padding:8px;"></div></div>
        <div style="margin-top:8px;background:var(--bg-primary);padding:10px;border-radius:8px;font-size:0.8rem;">
          <div>📦 สรุป: ${calc.breakdownText} = <strong>${calc.totalEcho}</strong> กระดุม</div>
          <div>📋 ยอดเติม: ${calc.topupEcho} กระดุม | 💰 พรีไว(อัตโนมัติ): <strong>฿${calc.privatePrice}</strong> | ปกติ(อัตโนมัติ): ฿${calc.normalPrice}</div>
        </div>
        <div style="margin-top:10px;padding:10px;border:1px dashed var(--border-color);border-radius:8px;">
          <div style="font-weight:600;font-size:0.8rem;margin-bottom:8px;">💰 ตั้งราคา</div>
          <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start;">
            <div>
              <label class="form-checkbox" style="margin-bottom:6px;"><input type="checkbox" id="sNE${i}" ${s.normalEnabled?'checked':''} onchange="App._toggleSkinNormal(${i})"><span>เปิดรับปกติ</span></label>
              <div id="skinNormalPriceArea${i}" style="display:${s.normalEnabled?'block':'none'};margin-top:4px;">
                <label class="form-checkbox" style="margin-bottom:4px;"><input type="checkbox" id="sCNP${i}" ${s.customNormalPrice?'checked':''} onchange="document.getElementById('skinNPInput${i}').style.display=this.checked?'block':'none'"><span style="font-size:0.8rem;">ตั้งราคาปกติเอง</span></label>
                <div id="skinNPInput${i}" style="display:${s.customNormalPrice?'block':'none'};margin-top:4px;"><input class="form-input" type="number" id="sNP${i}" value="${s.customNormalPrice||''}" placeholder="ราคาปกติ (฿)" style="padding:6px;width:120px;font-size:0.85rem;"></div>
              </div>
            </div>
            <div>
              <label class="form-checkbox" style="margin-bottom:4px;"><input type="checkbox" id="sCPP${i}" ${s.customPrivatePrice?'checked':''} onchange="document.getElementById('skinPPInput${i}').style.display=this.checked?'block':'none'"><span style="font-size:0.8rem;">พรีไวตั้งราคาเอง</span></label>
              <div id="skinPPInput${i}" style="display:${s.customPrivatePrice?'block':'none'};margin-top:4px;">
                <input class="form-input" type="text" id="sPP${i}" value="${s.customPrivateFormula||s.customPrivatePrice||''}" placeholder="สูตร เช่น 759+66 หรือ 759×2" style="padding:6px;width:200px;font-size:0.85rem;" oninput="App._previewCustomFormula(${i},this.value)">
                <div id="formulaPreview${i}" style="font-size:0.75rem;color:var(--text-secondary);margin-top:4px;"></div>
              </div>
            </div>
          </div>
        </div>
        <div style="margin-top:8px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;"><div><label style="font-size:0.75rem;font-weight:600;">🖼️ ภาพปก</label><input type="file" accept="image/*" onchange="App._storeUpload(event,'skin${i}')" style="font-size:0.75rem;">${s.image?`<img src="${s.image}" style="width:50px;height:50px;border-radius:8px;margin-top:4px;object-fit:cover;">`:''}</div></div></div>`;}).join('')}
      <button class="btn btn-primary" onclick="App._saveSkins()" style="margin-right:8px;">💾 บันทึก</button>
      <button class="btn btn-secondary" onclick="App._addSkinPack()">➕ เพิ่มแพ็คสกิน</button></div>`;
  },
  _toggleSkinNormal(i){const area=document.getElementById(`skinNormalPriceArea${i}`);const cb=document.getElementById(`sNE${i}`);if(area)area.style.display=cb?.checked?'block':'none';},
  _toggleSkin(i){const s=Store.getSkinPacks();s[i].active=!s[i].active;Store.setSkinPacks(s);this.renderAdmin();},
  _toggleSkinTopup(i){const s=Store.getSkinPacks();s[i].topupOnly=!s[i].topupOnly;Store.setSkinPacks(s);this.renderAdmin();},
  _moveSkin(idx,dir){const s=Store.getSkinPacks();const ni=idx+dir;if(ni<0||ni>=s.length)return;[s[idx],s[ni]]=[s[ni],s[idx]];Store.setSkinPacks(s);this.renderAdmin();},
  _deleteSkin(i){if(!confirm('ลบสกินนี้?'))return;const s=Store.getSkinPacks();s.splice(i,1);Store.setSkinPacks(s);this.renderAdmin();},
  _moveButton(idx,dir){const b=Store.getButtons();const ni=idx+dir;if(ni<0||ni>=b.length)return;[b[idx],b[ni]]=[b[ni],b[idx]];Store.setButtons(b);this.renderAdmin();},
  _moveRental(idx,dir){const r=Store.getRentals();const ni=idx+dir;if(ni<0||ni>=r.length)return;[r[idx],r[ni]]=[r[ni],r[idx]];Store.setRentals(r);this.renderAdmin();},
  _moveFAQ(idx,dir){const f=Store.getFAQ();const ni=idx+dir;if(ni<0||ni>=f.length)return;[f[idx],f[ni]]=[f[ni],f[idx]];Store.setFAQ(f);this.renderAdmin();},
  _movePromo(idx,dir){const p=Store.getPromos();const ni=idx+dir;if(ni<0||ni>=p.length)return;[p[idx],p[ni]]=[p[ni],p[idx]];Store.setPromos(p);this.renderAdmin();},
  _parseFormula(formula){
    if(!formula)return null;
    const str=String(formula).replace(/×/g,'*').replace(/x/gi,'*').replace(/\s/g,'');
    const products=Store.getProducts();
    // Expand multiplications like 759*2 → 759+759
    let expanded=str;
    expanded=expanded.replace(/(\d+)\*(\d+)/g,(m,a,b)=>{return Array(parseInt(b)).fill(a).join('+');});
    const parts=expanded.split('+').map(x=>parseInt(x)).filter(x=>!isNaN(x)&&x>0);
    if(parts.length===0)return null;
    let totalPrice=0,totalEcho=0,topupEcho=0,items=[];
    for(const val of parts){
      const p=products.find(x=>x.totalEcho===val);
      if(p){totalPrice+=p.privatePrice;totalEcho+=p.totalEcho;topupEcho+=p.echoes;items.push({pid:p.id,totalEcho:p.totalEcho,echoes:p.echoes,price:p.privatePrice,qty:1});}
    }
    // Merge same items
    const merged={};items.forEach(it=>{if(!merged[it.pid])merged[it.pid]={...it};else merged[it.pid].qty++;});
    const packs=Object.values(merged);
    return{packs,totalPrice,totalEcho,topupEcho,formula:str,breakdownText:packs.map(p=>p.qty>1?`${p.totalEcho}×${p.qty}`:`${p.totalEcho}`).join('+')};
  },
  _previewCustomFormula(i,val){
    const el=document.getElementById(`formulaPreview${i}`);if(!el)return;
    const result=this._parseFormula(val);
    if(!result||result.packs.length===0){el.innerHTML='';return;}
    el.innerHTML=`📦 ${result.breakdownText} = <strong>${result.totalEcho}</strong> กระดุม (เติม ${result.topupEcho}) | 💰 <strong>฿${result.totalPrice}</strong>`;
  },
  _saveSkins(){const skins=Store.getSkinPacks();skins.forEach((s,i)=>{s.name=document.getElementById(`sN${i}`)?.value||s.name;s.targetEcho=document.getElementById(`sTE${i}`)?.value||s.targetEcho;s.sendPrice=parseInt(document.getElementById(`sSP${i}`)?.value)||null;s.normalEnabled=document.getElementById(`sNE${i}`)?.checked||false;const hasCNP=document.getElementById(`sCNP${i}`)?.checked;s.customNormalPrice=hasCNP?parseInt(document.getElementById(`sNP${i}`)?.value)||null:null;const hasCPP=document.getElementById(`sCPP${i}`)?.checked;if(hasCPP){const formulaVal=document.getElementById(`sPP${i}`)?.value||'';s.customPrivateFormula=formulaVal;const parsed=this._parseFormula(formulaVal);s.customPrivatePrice=parsed?parsed.totalPrice:null;}else{s.customPrivatePrice=null;s.customPrivateFormula=null;}if(this._uploadedImages[`skin${i}`])s.image=this._uploadedImages[`skin${i}`];});Store.setSkinPacks(skins);this._uploadedImages={};this.showToast('✅ บันทึก!');this.renderAdmin();},
  _addSkinPack(){const skins=Store.getSkinPacks();skins.push({id:Date.now(),name:'แพ็คใหม่',targetEcho:0,sendPrice:0,normalEnabled:false,cost:0,image:'',emoji:'🎁',active:true,customNormalPrice:null,customPrivatePrice:null,topupOnly:false});Store.setSkinPacks(skins);this.showToast('✅ เพิ่มแพ็คสกิน!');this.renderAdmin();},

  _adminQueue(ac){const o=Store.getOrders();const topup=o.filter(x=>x.type==='topup');const send=o.filter(x=>x.type==='send');const bookings=Store.getBookings();const rentals=Store.getRentals();
  ac.innerHTML=`<div class="card" style="margin-bottom:20px;"><h3 style="margin-bottom:16px;">📋 คิวเติม (${topup.length})</h3>${this._renderQueueTable(topup)}</div>
    <div class="card" style="margin-bottom:20px;"><h3 style="margin-bottom:16px;">🎁 คิวส่ง (${send.length})</h3>${this._renderQueueTable(send)}</div>
    <div class="card"><h3 style="margin-bottom:16px;">🎮 คิวเช่า (${bookings.length})</h3>
    ${bookings.length>0?`<div class="table-container"><table class="table"><thead><tr><th>ไอดี</th><th>ผู้เช่า</th><th>วัน</th><th>เวลา</th><th>ราคา</th><th>สลิป</th><th>สถานะ</th><th></th></tr></thead><tbody>${bookings.slice().reverse().map(b=>{const r=rentals.find(x=>x.id===b.rentalId);return`<tr><td>${r?.name||'-'}</td><td>${b.userName}</td><td>${b.date}</td><td>${b.startHour}:00-${b.endHour}:00</td><td style="font-weight:600;color:var(--primary);">฿${b.totalPrice}</td><td>${b.slipImage?`<img src="${b.slipImage}" style="width:40px;height:60px;object-fit:cover;border-radius:4px;cursor:pointer;" onclick="App.openLightbox('${b.slipImage}')">`:'-'}</td><td><span class="status-badge status-${b.status==='done'?'done':b.status==='playing'?'processing':'waiting'}">${b.status==='booked'?'⏳ รอ':b.status==='playing'?'🎮 เล่นอยู่':b.status==='done'?'✅ เสร็จ':'❌ ยกเลิก'}</span></td><td><div style="display:flex;gap:4px;align-items:center;"><select class="form-select" style="padding:6px;font-size:0.8rem;width:auto;" onchange="App._updateBookingStatus(${b.id},this.value)"><option value="booked" ${b.status==='booked'?'selected':''}>⏳ รอ</option><option value="playing" ${b.status==='playing'?'selected':''}>🎮 เล่น</option><option value="done" ${b.status==='done'?'selected':''}>✅ เสร็จ</option><option value="cancelled" ${b.status==='cancelled'?'selected':''}>❌ ยกเลิก</option></select><button class="btn-copy" style="color:#e53e3e;" onclick="App._deleteBooking(${b.id})" title="ลบ">🗑️</button></div></td></tr>`;}).join('')}</tbody></table></div>`:'<p style="color:var(--text-light);">ไม่มีคิวเช่า</p>'}</div>`;},
  _renderQueueTable(orders){if(orders.length===0)return'<p style="color:var(--text-light);">ไม่มีคิว</p>';return`<div class="table-container"><table class="table"><thead><tr><th>คิว</th><th>ลูกค้า</th><th>รายการ</th><th>ยอด</th><th>สลิป</th><th>สถานะ</th><th></th></tr></thead><tbody>${orders.slice().reverse().map(o=>`<tr><td><strong>#${o.queueNumber}</strong></td><td>${o.gameName}<br><span style="font-size:0.7rem;color:var(--text-light);">UID:${o.uid}</span></td><td>${(o.items||[]).map(i=>`${i.isSkin?'✨':'<img src="assets/images/MiniEcho.webp" alt="echo" style="width:22px;height:22px;display:inline-block;vertical-align:-4px;margin-right:4px;">'}${i.name}`).join('<br>')}</td><td style="font-weight:600;color:var(--primary);">฿${(o.totalPrice||0).toLocaleString()}</td><td>${o.slipImage?`<img src="${o.slipImage}" style="width:40px;height:60px;object-fit:cover;border-radius:4px;cursor:pointer;" onclick="App.openLightbox('${o.slipImage}')">`:'-'}</td><td><span class="status-badge status-${o.status}">${o.status==='waiting'?'⏳ รอ':o.status==='processing'?'🔄 ทำ':'✅ เสร็จ'}</span>${o.adminNote?`<div style="font-size:0.65rem;color:var(--secondary);margin-top:2px;">📝 ${o.adminNote.substring(0,15)}</div>`:''}</td><td><div style="display:flex;gap:4px;align-items:center;flex-wrap:wrap;"><select class="form-select" style="padding:6px;font-size:0.8rem;width:auto;" onchange="App._updateOrderStatus(${o.id},this.value)"><option value="waiting" ${o.status==='waiting'?'selected':''}>⏳ รอ</option><option value="processing" ${o.status==='processing'?'selected':''}>🔄 ทำ</option><option value="done" ${o.status==='done'?'selected':''}>✅ เสร็จ</option></select><button class="btn-copy" title="แนบภาพ/โน้ต" onclick="event.stopPropagation();App._showAttachModal(${o.id})">📎</button><button class="btn-copy" style="color:#e53e3e;" onclick="event.stopPropagation();App._deleteOrder(${o.id})" title="ลบออเดอร์">🗑️</button></div></td></tr>`).join('')}</tbody></table></div>`;},
  _updateOrderStatus(id,status){Store.updateOrder(id,{status});this.showToast('✅ อัปเดต!');this.renderAdmin();},
  _deleteOrder(id){if(!confirm('⚠️ ต้องการลบออเดอร์นี้จริงหรือไม่?\n\nข้อมูลจะถูกลบออกถาวร ไม่สามารถกู้คืนได้!')){return;}const orders=Store.getOrders();const filtered=orders.filter(o=>o.id!==id);Store.setOrders(filtered);this.showToast('🗑️ ลบออเดอร์แล้ว!');this.renderAdmin();},
  _showAttachModal(orderId){
    const order=Store.getOrders().find(o=>o.id===orderId);if(!order)return;
    const overlay=document.getElementById('authModal');if(!overlay)return;
    overlay.classList.add('active');
    const modal=document.querySelector('#authModal .modal');if(!modal)return;
    modal.innerHTML=`<button class="modal-close" onclick="App.hideAuthModal()">✕</button>
      <h2 class="modal-title">📎 แนบภาพ/โน้ตถึงลูกค้า</h2>
      <p style="color:var(--text-light);margin-bottom:16px;">ออเดอร์ #${order.queueNumber} - ${order.gameName}</p>
      <div class="form-group"><label class="form-label">📝 ข้อความถึงลูกค้า</label>
        <textarea class="form-textarea" id="attachNote" rows="3" placeholder="เช่น: เติมเสร็จแล้วค่ะ ขอบคุณนะคะ~">${order.adminNote||''}</textarea>
      </div>
      <div class="form-group"><label class="form-label">🖼️ แนบรูปภาพ (เลือกได้หลายรูป)</label>
        <input type="file" accept="image/*" multiple id="attachImages" style="font-size:0.85rem;">
      </div>
      ${(order.adminImages&&order.adminImages.length>0)?`<div style="margin-bottom:12px;"><label style="font-size:0.8rem;font-weight:600;">ภาพที่แนบแล้ว:</label><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;">${order.adminImages.map(img=>`<img src="${img}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;cursor:pointer;" onclick="App.openLightbox('${img}')">`).join('')}</div></div>`:''}
      <div style="display:flex;gap:8px;">
        <button class="btn btn-primary" onclick="App._saveAttach(${orderId})" style="flex:1;">💾 บันทึก</button>
        <button class="btn btn-outline" onclick="App.hideAuthModal()">ยกเลิก</button>
      </div>`;
  },
  _saveAttach(orderId){
    const note=document.getElementById('attachNote')?.value||'';
    const fileInput=document.getElementById('attachImages');
    const files=fileInput?.files;
    const doSave=(images)=>{Store.updateOrder(orderId,{adminNote:note,adminImages:images});this.hideAuthModal();this.showToast('✅ บันทึกโน้ต/ภาพสำเร็จ!');this.renderAdmin();};
    if(files&&files.length>0){
      const promises=[];
      for(let f of files){promises.push(new Promise((resolve)=>{const reader=new FileReader();reader.onload=e=>{const img=new Image();img.onload=()=>{let w=img.width,h=img.height;const max=600;if(w>max){h=Math.round((h*max)/w);w=max;}const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(img,0,0,w,h);resolve(canvas.toDataURL('image/webp',0.7));};img.src=e.target.result;};reader.readAsDataURL(f);}));}
      Promise.all(promises).then(newImgs=>{const order=Store.getOrders().find(o=>o.id===orderId);doSave([...(order?.adminImages||[]),...newImgs]);});
    }else{const order=Store.getOrders().find(o=>o.id===orderId);doSave(order?.adminImages||[]);}
  },

  _adminRentals(ac){
    const rentals=Store.getRentals();const bookings=Store.getBookings();
    ac.innerHTML=`<div class="card" style="margin-bottom:20px;"><h3 style="margin-bottom:16px;">🎮 จัดการไอดีเช่า</h3>
      ${rentals.map((r,i)=>`<div style="padding:12px;border:1px solid var(--border-color);border-radius:var(--radius-md);margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><strong>${r.emoji} ${r.name}</strong><div style="display:flex;gap:4px;align-items:center;"><button class="btn-copy" onclick="App._moveRental(${i},-1)" ${i===0?'disabled style="opacity:0.3;"':''}>⬆️</button><button class="btn-copy" onclick="App._moveRental(${i},1)" ${i===rentals.length-1?'disabled style="opacity:0.3;"':''}>⬇️</button><span class="badge ${r.active?'badge-green':'badge-red'}">${r.active?'เปิด':'ปิด'}</span><button class="btn-copy" onclick="App._toggleRentalActive(${i})">${r.active?'🔴':'🟢'}</button><button class="btn-copy" onclick="App._deleteRental(${i})">🗑️</button></div></div>
        <div class="grid-3" style="gap:8px;"><div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:0.75rem;">ชื่อ</label><input class="form-input" id="rN${i}" value="${r.name}" style="padding:8px;"></div><div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:0.75rem;">ราคา/ชม.</label><input class="form-input" type="number" id="rP${i}" value="${r.pricePerHour}" style="padding:8px;"></div><div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:0.75rem;">Emoji</label><input class="form-input" id="rE${i}" value="${r.emoji}" style="padding:8px;"></div></div>
        <div class="form-group" style="margin-top:8px;margin-bottom:0;"><label class="form-label" style="font-size:0.75rem;">คำอธิบาย</label><textarea class="form-textarea" id="rD${i}" rows="2" style="padding:8px;">${r.description||''}</textarea></div>
        <div style="margin-top:8px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;"><div><label style="font-size:0.75rem;font-weight:600;">🖼️ ภาพปกไอดี</label><input type="file" accept="image/*" onchange="App._storeUpload(event,'rental${i}')" style="font-size:0.75rem;">${r.image?`<img src="${r.image}" style="width:80px;height:60px;border-radius:8px;margin-top:4px;object-fit:cover;cursor:pointer;" onclick="App.openLightbox('${r.image}')">`:''}</div>
          <div><label class="form-label" style="font-size:0.75rem;">📋 สถานะปล่อยเช่า</label><select class="form-select" id="rStatus${i}" style="padding:8px;font-size:0.85rem;"><option value="available" ${(r.rentalStatus||'available')==='available'?'selected':''}>🟢 ปล่อยเช่าปกติ</option><option value="not_available" ${r.rentalStatus==='not_available'?'selected':''}>🔴 ไม่ปล่อยเช่า</option><option value="not_yet" ${r.rentalStatus==='not_yet'?'selected':''}>🟡 ยังไม่ปล่อยเช่า</option></select></div>
        </div></div>`).join('')}
      <button class="btn btn-primary" onclick="App._saveRentals()" style="margin-right:8px;">💾 บันทึก</button>
      <button class="btn btn-secondary" onclick="App._addRental()">➕ เพิ่มไอดี</button></div>
      <div class="card"><h3 style="margin-bottom:16px;">📋 คิวเช่าไอดี (${bookings.length})</h3>
      ${bookings.length>0?`<div class="table-container"><table class="table"><thead><tr><th>ไอดี</th><th>ผู้เช่า</th><th>วัน</th><th>เวลา</th><th>ราคา</th><th>สถานะ</th><th></th></tr></thead><tbody>${bookings.slice().reverse().map(b=>{const r=rentals.find(x=>x.id===b.rentalId);return`<tr>
        <td>${r?.name||'-'}</td><td>${b.userName}</td><td>${b.date}</td><td>${b.startHour}:00-${b.endHour}:00</td>
        <td style="font-weight:600;color:var(--primary);">฿${b.totalPrice}</td>
        <td><span class="status-badge status-${b.status==='done'?'done':b.status==='playing'?'processing':'waiting'}">${b.status==='booked'?'⏳ รอ':b.status==='playing'?'🎮 เล่นอยู่':b.status==='done'?'✅ เสร็จ':'❌ ยกเลิก'}</span></td>
        <td><div style="display:flex;gap:4px;align-items:center;"><select class="form-select" style="padding:6px;font-size:0.8rem;width:auto;" onchange="App._updateBookingStatus(${b.id},this.value)"><option value="booked" ${b.status==='booked'?'selected':''}>⏳ รอ</option><option value="playing" ${b.status==='playing'?'selected':''}>🎮 เล่นอยู่</option><option value="done" ${b.status==='done'?'selected':''}>✅ เสร็จ</option><option value="cancelled" ${b.status==='cancelled'?'selected':''}>❌ ยกเลิก</option></select><button class="btn-copy" style="color:#e53e3e;" onclick="App._deleteBooking(${b.id})" title="ลบ">🗑️</button></div></td>
      </tr>`;}).join('')}</tbody></table></div>`:'<p style="color:var(--text-light);">ไม่มีการจอง</p>'}</div>`;
  },
  _updateBookingStatus(id,status){
    Store.updateBooking(id,{status});
    const b=Store.getBookings().find(x=>x.id===id);
    if(b&&b.orderId){const oStatus=status==='booked'?'waiting':status==='playing'?'processing':'done';Store.updateOrder(b.orderId,{status:oStatus});}
    this.showToast('✅ อัปเดตสถานะ!');this.renderAdmin();
  },
  _deleteBooking(id){
    if(!confirm('⚠️ ต้องการลบรายการเช่านี้?')){return;}
    const b=Store.getBookings().find(x=>x.id===id);
    if(b&&b.orderId){const orders=Store.getOrders().filter(o=>o.id!==b.orderId);Store.setOrders(orders);}
    const bookings=Store.getBookings().filter(x=>x.id!==id);Store._fbSet('bookings',bookings);
    this.showToast('🗑️ ลบรายการเช่าแล้ว!');this.renderAdmin();
  },
  _saveRentals(){const rentals=Store.getRentals();rentals.forEach((r,i)=>{r.name=document.getElementById(`rN${i}`)?.value||r.name;r.pricePerHour=parseInt(document.getElementById(`rP${i}`)?.value)||r.pricePerHour;r.emoji=document.getElementById(`rE${i}`)?.value||r.emoji;r.description=document.getElementById(`rD${i}`)?.value||r.description;r.rentalStatus=document.getElementById(`rStatus${i}`)?.value||'available';if(this._uploadedImages[`rental${i}`])r.image=this._uploadedImages[`rental${i}`];});Store.setRentals(rentals);this._uploadedImages={};this.showToast('✅ บันทึก!');this.renderAdmin();},
  _addRental(){const r=Store.getRentals();r.push({id:Date.now(),name:`ไอดีที่ ${r.length+1}`,pricePerHour:20,emoji:'🎭',skins:['🎭'],image:'',description:'ไอดีใหม่',active:true,rentalStatus:'available'});Store.setRentals(r);this.showToast('✅ เพิ่มไอดี!');this.renderAdmin();},
  _deleteRental(i){if(!confirm('ลบไอดีนี้?'))return;const r=Store.getRentals();r.splice(i,1);Store.setRentals(r);this.renderAdmin();},
  _toggleRentalActive(i){const r=Store.getRentals();r[i].active=!r[i].active;Store.setRentals(r);this.renderAdmin();},

  _adminFAQ(ac){const faqs=Store.getFAQ();ac.innerHTML=`<div class="card"><h3 style="margin-bottom:16px;">❓ จัดการ FAQ</h3>${faqs.map((f,i)=>`<div style="padding:12px;border:1px solid var(--border-color);border-radius:var(--radius-md);margin-bottom:8px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><span style="font-weight:600;font-size:0.85rem;">Q${i+1}</span><div style="display:flex;gap:4px;align-items:center;"><button class="btn-copy" onclick="App._moveFAQ(${i},-1)" ${i===0?'disabled style="opacity:0.3;"':''}>⬆️</button><button class="btn-copy" onclick="App._moveFAQ(${i},1)" ${i===faqs.length-1?'disabled style="opacity:0.3;"':''}>⬇️</button><button class="btn-copy" onclick="App._deleteFAQ(${i})">🗑️</button></div></div><div class="form-group" style="margin-bottom:8px;"><input class="form-input" id="fQ${i}" value="${f.question}" style="padding:8px;font-weight:600;"></div><div class="form-group" style="margin-bottom:8px;"><input class="form-input" id="fS${i}" value="${f.shortAnswer}" style="padding:8px;font-size:0.85rem;" placeholder="คำตอบสั้น"></div><div class="form-group" style="margin-bottom:4px;"><textarea class="form-textarea" id="fA${i}" rows="2" style="padding:8px;font-size:0.85rem;">${f.fullAnswer}</textarea></div></div>`).join('')}<button class="btn btn-primary" onclick="App._saveFAQ()" style="margin-right:8px;">💾 บันทึก</button><button class="btn btn-secondary" onclick="App._addFAQ()">➕ เพิ่ม</button></div>`;},
  _saveFAQ(){const faqs=Store.getFAQ();faqs.forEach((f,i)=>{f.question=document.getElementById(`fQ${i}`)?.value||f.question;f.shortAnswer=document.getElementById(`fS${i}`)?.value||f.shortAnswer;f.fullAnswer=document.getElementById(`fA${i}`)?.value||f.fullAnswer;});Store.setFAQ(faqs);this.showToast('✅ บันทึก!');},
  _addFAQ(){const f=Store.getFAQ();f.push({id:Date.now(),question:'คำถามใหม่',shortAnswer:'คำตอบสั้น...',fullAnswer:'คำตอบเต็ม',active:true});Store.setFAQ(f);this.renderAdmin();},
  _deleteFAQ(i){const f=Store.getFAQ();f.splice(i,1);Store.setFAQ(f);this.renderAdmin();},

  // ADMIN PROMOS (multiple images + content)
  _adminPromos(ac){
    const promos=Store.getPromos();
    ac.innerHTML=`<div class="card"><h3 style="margin-bottom:16px;">🎉 จัดการโปรโมชั่น (แสดงหน้าแรก)</h3>
      ${promos.map((p,i)=>`<div style="padding:10px;border:1px solid var(--border-color);border-radius:var(--radius-md);margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><strong>${p.title.substring(0,30)}...</strong><div style="display:flex;gap:4px;align-items:center;"><button class="btn-copy" onclick="App._movePromo(${i},-1)" ${i===0?'disabled style="opacity:0.3;"':''}>⬆️</button><button class="btn-copy" onclick="App._movePromo(${i},1)" ${i===promos.length-1?'disabled style="opacity:0.3;"':''}>⬇️</button><span class="badge ${p.active?'badge-green':'badge-red'}">${p.active?'เปิด':'ปิด'}</span><button class="btn-copy" onclick="App._togglePromo(${i})">${p.active?'🔴':'🟢'}</button><button class="btn-copy" onclick="App._deletePromo(${i})">🗑️</button></div></div>
        <div class="grid-2" style="gap:8px;"><div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:0.75rem;">ชื่อ</label><input class="form-input" id="prT${i}" value="${p.title}" style="padding:8px;"></div><div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:0.75rem;">รายละเอียดสั้น</label><input class="form-input" id="prD${i}" value="${p.description}" style="padding:8px;"></div></div>
        <div class="form-group" style="margin-top:8px;margin-bottom:0;"><label class="form-label" style="font-size:0.75rem;">เนื้อหาเต็ม (เห็นเมื่อกดเข้า)</label><textarea class="form-textarea" id="prC${i}" rows="3" style="padding:8px;font-size:0.85rem;">${p.content||''}</textarea></div>
        <div style="margin-top:8px;"><label style="font-size:0.75rem;font-weight:600;">🖼️ ภาพ (แนบได้หลายภาพ)</label><input type="file" accept="image/*" multiple onchange="App._handlePromoImages(event,${i})" style="font-size:0.75rem;">
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;">${(p.images||[]).map((img,j)=>`<div style="position:relative;"><img src="${img}" style="width:60px;height:60px;border-radius:8px;object-fit:cover;cursor:pointer;" onclick="App.openLightbox('${img}')"><button style="position:absolute;top:-4px;right:-4px;width:18px;height:18px;border-radius:50%;background:#F44336;color:white;font-size:10px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;" onclick="App._removePromoImage(${i},${j})">✕</button></div>`).join('')}</div></div>
      </div>`).join('')}
      <button class="btn btn-primary" onclick="App._savePromos()" style="margin-right:8px;">💾 บันทึก</button>
      <div style="margin-top:16px;border-top:1px solid var(--border-color);padding-top:16px;">
        <div class="form-group"><input class="form-input" id="newPromoTitle" placeholder="ชื่อโปรโมชั่น"></div>
        <div class="form-group"><textarea class="form-textarea" id="newPromoDesc" rows="2" placeholder="รายละเอียดสั้นๆ"></textarea></div>
        <div class="form-group"><textarea class="form-textarea" id="newPromoContent" rows="3" placeholder="เนื้อหาเต็ม (เห็นเมื่อกดเข้า)"></textarea></div>
        <div class="form-group"><label style="font-size:0.75rem;">ภาพ (หลายภาพ)</label><input type="file" accept="image/*" multiple onchange="App._handlePromoImages(event,'new')" style="font-size:0.75rem;"></div>
        <button class="btn btn-secondary" onclick="App._addPromo()">➕ เพิ่มโปรโมชั่น</button></div></div>`;
  },
  _handlePromoImages(event,idx){
    const files=event.target.files;if(!files.length)return;
    if(!this._uploadedImages[`promoImgs${idx}`])this._uploadedImages[`promoImgs${idx}`]=[];
    Array.from(files).forEach(file=>{const reader=new FileReader();reader.onload=e=>{this._uploadedImages[`promoImgs${idx}`].push(e.target.result);};reader.readAsDataURL(file);});
  },
  _removePromoImage(promoIdx,imgIdx){const promos=Store.getPromos();if(promos[promoIdx]&&promos[promoIdx].images){promos[promoIdx].images.splice(imgIdx,1);Store.setPromos(promos);this.renderAdmin();}},
  _togglePromo(i){const p=Store.getPromos();p[i].active=!p[i].active;Store.setPromos(p);this.renderAdmin();},
  _deletePromo(i){const p=Store.getPromos();p.splice(i,1);Store.setPromos(p);this.renderAdmin();},
  _savePromos(){const promos=Store.getPromos();promos.forEach((p,i)=>{p.title=document.getElementById(`prT${i}`)?.value||p.title;p.description=document.getElementById(`prD${i}`)?.value||p.description;p.content=document.getElementById(`prC${i}`)?.value||p.content;if(this._uploadedImages[`promoImgs${i}`]){if(!p.images)p.images=[];p.images.push(...this._uploadedImages[`promoImgs${i}`]);}});Store.setPromos(promos);this._uploadedImages={};this.showToast('✅ บันทึก!');this.renderAdmin();},
  _addPromo(){const title=document.getElementById('newPromoTitle')?.value;const desc=document.getElementById('newPromoDesc')?.value;const content=document.getElementById('newPromoContent')?.value;if(!title){this.showToast('กรอกชื่อค่ะ','warning');return;}const p=Store.getPromos();const imgs=this._uploadedImages['promoImgsnew']||[];p.push({id:Date.now(),title,description:desc||'',content:content||'',active:true,images:imgs});Store.setPromos(p);this._uploadedImages={};this.showToast('✅ เพิ่มโปรโมชั่น!');this.renderAdmin();},

  // ========== ADMIN GUIDES ==========
  _adminGuides(ac){
    const pages=[{key:'order',label:'📋 หน้าสั่งซื้อ (เติม)'},{key:'gift',label:'🎁 หน้าส่งของขวัญ'},{key:'rental',label:'🎮 หน้าเช่าไอดี'}];
    ac.innerHTML=`<div class="card"><h3 style="margin-bottom:16px;">📖 จัดการป๊อปอัพคู่มือ</h3>
      <div class="note-box info" style="margin-bottom:16px;">ข้อความแนะนำที่จะแสดงเป็นป๊อปอัพก่อนเข้าหน้าสั่งซื้อ / ส่งของ / เช่า ลูกค้าต้องเลื่อนลงและกดปิดก่อนจึงจะเข้าหน้านั้นได้ค่ะ</div>
      ${pages.map(p=>{
        const g=Store.getGuide(p.key);
        return`<div style="padding:16px;border:1px solid var(--border-color);border-radius:var(--radius-md);margin-bottom:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><strong>${p.label}</strong>
            <div style="display:flex;gap:6px;align-items:center;"><span class="badge ${g.active?'badge-green':'badge-red'}">${g.active?'เปิด':'ปิด'}</span>
              <button class="btn-copy" onclick="App._toggleGuide('${p.key}')">${g.active?'🔴':'🟢'}</button>
              <button class="btn btn-sm btn-outline" onclick="App._previewGuide('${p.key}')">👁️ ดูตัวอย่าง</button>
            </div>
          </div>
          <div class="form-group"><label class="form-label">📝 หัวข้อ (ตัวใหญ่)</label><input class="form-input" id="guideTitle_${p.key}" value="${g.title||''}" placeholder="ยินดีต้อนรับ..."></div>
          <div class="form-group"><label class="form-label">📄 เนื้อหา (แต่ละบรรทัดขึ้นบรรทัดใหม่)</label><textarea class="form-textarea" id="guideContent_${p.key}" rows="5" placeholder="วิธีใช้เว็บไซด์นี้...">${(g.content||'').replace(/\n/g,'\n')}</textarea></div>
          <div class="form-group"><label class="form-label">😊 อิโมจิปุ่มปิด</label><input class="form-input" id="guideEmoji_${p.key}" value="${g.closeEmoji||'❌'}" style="width:120px;"></div>
          <div class="form-group"><label class="form-label">🖼️ แทรกรูปภาพ (หลายรูปได้)</label><input type="file" accept="image/*" multiple onchange="App._handleGuideImages(event,'${p.key}')" style="font-size:0.85rem;">
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;">${(g.images||[]).map((img,j)=>`<div style="position:relative;"><img src="${img}" style="width:60px;height:60px;border-radius:8px;object-fit:cover;cursor:pointer;" onclick="App.openLightbox('${img}')"><button style="position:absolute;top:-4px;right:-4px;width:18px;height:18px;border-radius:50%;background:#F44336;color:white;font-size:10px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;" onclick="App._removeGuideImage('${p.key}',${j})">✕</button></div>`).join('')}</div>
          </div>
        </div>`;
      }).join('')}
      <button class="btn btn-primary" onclick="App._saveGuides()">💾 บันทึกคู่มือทั้งหมด</button>
    </div>`;
  },
  _toggleGuide(page){const g=Store.getGuide(page);g.active=!g.active;Store.setGuide(page,g);this.renderAdmin();},
  _previewGuide(page){const g=Store.getGuide(page);this._showGuidePopup(page,g);},
  _handleGuideImages(event,page){
    const files=event.target.files;if(!files.length)return;
    Array.from(files).forEach(file=>{
      const reader=new FileReader();
      reader.onload=e=>{
        const img=new Image();
        img.onload=()=>{
          let w=img.width,h=img.height;const max=600;
          if(w>max){h=Math.round((h*max)/w);w=max;}
          const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
          canvas.getContext('2d').drawImage(img,0,0,w,h);
          const dataUrl=canvas.toDataURL('image/webp',0.8);
          const g=Store.getGuide(page);
          if(!g.images)g.images=[];
          g.images.push(dataUrl);
          Store.setGuide(page,g);
          this.showToast('✅ เพิ่มรูปสำเร็จ!');
          this.renderAdmin();
        };
        img.src=e.target.result;
      };
      reader.readAsDataURL(file);
    });
  },
  _removeGuideImage(page,idx){const g=Store.getGuide(page);if(g.images){g.images.splice(idx,1);Store.setGuide(page,g);this.renderAdmin();}},
  _saveGuides(){
    ['order','gift','rental'].forEach(page=>{
      const g=Store.getGuide(page);
      g.title=document.getElementById(`guideTitle_${page}`)?.value||'';
      g.content=document.getElementById(`guideContent_${page}`)?.value||'';
      g.closeEmoji=document.getElementById(`guideEmoji_${page}`)?.value||'❌';
      Store.setGuide(page,g);
    });
    this.showToast('✅ บันทึกคู่มือเรียบร้อย!');
  },

  _adminUsers(ac){
    const users=Store.getUsers();const orders=Store.getOrders();
    // Calculate totals across all users
    const allDoneOrders=orders.filter(o=>o.status==='done');
    const totalAllRevenue=allDoneOrders.reduce((s,o)=>s+(o.totalPrice||0),0);
    const totalAllEchoes=allDoneOrders.reduce((s,o)=>s+(o.items||[]).reduce((es,it)=>es+(it.totalEcho||it.echoes||0)*(it.qty||1),0),0);

    ac.innerHTML=`<div class="card" style="margin-bottom:20px;">
      <h3 style="margin-bottom:16px;">👥 ภาพรวมผู้ใช้</h3>
      <div class="grid-4" style="gap:12px;">
        <div class="stat-card"><div class="stat-value">${users.length}</div><div class="stat-label">สมาชิกทั้งหมด</div></div>
        <div class="stat-card"><div class="stat-value">${allDoneOrders.length}</div><div class="stat-label">ออเดอร์สำเร็จ</div></div>
        <div class="stat-card"><div class="stat-value">฿${totalAllRevenue.toLocaleString()}</div><div class="stat-label">ยอดขายรวม</div></div>
        <div class="stat-card"><div class="stat-value">${totalAllEchoes.toLocaleString()}</div><div class="stat-label">กระดุมเติมรวม</div></div>
      </div>
    </div>
    <div class="card">
      <h3 style="margin-bottom:16px;">📋 รายชื่อสมาชิก (${users.length} คน)</h3>
      ${users.length>0?users.map(u=>{
        const uo=orders.filter(o=>(o.userId===u.id)||(o.username===u.username));
        const uoDone=uo.filter(o=>o.status==='done');
        const totalSpent=uoDone.reduce((s,o)=>s+(o.totalPrice||0),0);
        const totalEchoes=uoDone.reduce((s,o)=>s+(o.items||[]).reduce((es,it)=>es+(it.totalEcho||it.echoes||0)*(it.qty||1),0),0);
        return`<div style="padding:14px;border:1px solid var(--border-color);border-radius:var(--radius-md);margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;" onclick="this.parentElement.querySelector('.user-detail').style.display=this.parentElement.querySelector('.user-detail').style.display==='none'?'block':'none'">
            <div>
              <strong style="font-size:1rem;">${u.username}</strong>
              <span style="font-size:0.8rem;color:var(--text-light);margin-left:8px;">${u.gameName||''}</span>
              <span class="badge ${u.banned?'badge-red':'badge-green'}" style="margin-left:6px;">${u.banned?'แบน':'ปกติ'}</span>
            </div>
            <div style="display:flex;gap:6px;align-items:center;">
              <span style="font-size:0.8rem;color:var(--text-light);">฿${totalSpent.toLocaleString()}</span>
              <span style="font-size:0.8rem;">▼</span>
            </div>
          </div>
          <div class="user-detail" style="display:none;margin-top:14px;padding-top:14px;border-top:1px solid var(--border-color);">
            <div class="grid-3" style="gap:10px;margin-bottom:14px;">
              <div style="background:var(--bg-main);padding:10px;border-radius:8px;text-align:center;">
                <div style="font-size:0.75rem;color:var(--text-light);">UID</div>
                <div style="font-weight:600;">${u.uid||'-'}</div>
              </div>
              <div style="background:var(--bg-main);padding:10px;border-radius:8px;text-align:center;">
                <div style="font-size:0.75rem;color:var(--text-light);">Server</div>
                <div style="font-weight:600;">${u.server||'-'}</div>
              </div>
              <div style="background:var(--bg-main);padding:10px;border-radius:8px;text-align:center;">
                <div style="font-size:0.75rem;color:var(--text-light);">Facebook/Discord</div>
                <div style="font-weight:600;font-size:0.85rem;">${u.contact||'-'}</div>
              </div>
            </div>
            <div class="grid-4" style="gap:8px;margin-bottom:14px;">
              <div style="background:var(--bg-main);padding:8px;border-radius:8px;text-align:center;">
                <div style="font-size:0.7rem;color:var(--text-light);">วันสมัคร</div>
                <div style="font-weight:600;font-size:0.8rem;">${new Date(u.createdAt).toLocaleDateString('th-TH')}</div>
              </div>
              <div style="background:var(--bg-main);padding:8px;border-radius:8px;text-align:center;">
                <div style="font-size:0.7rem;color:var(--text-light);">ออเดอร์</div>
                <div style="font-weight:600;">${uo.length} รายการ</div>
              </div>
              <div style="background:var(--bg-main);padding:8px;border-radius:8px;text-align:center;">
                <div style="font-size:0.7rem;color:var(--text-light);">เงินรวม</div>
                <div style="font-weight:600;color:var(--primary);">฿${totalSpent.toLocaleString()}</div>
              </div>
              <div style="background:var(--bg-main);padding:8px;border-radius:8px;text-align:center;">
                <div style="font-size:0.7rem;color:var(--text-light);">กระดุมรวม</div>
                <div style="font-weight:600;color:var(--secondary);">${totalEchoes.toLocaleString()}</div>
              </div>
            </div>

            <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;">
              <button class="btn btn-sm ${u.banned?'btn-secondary':'btn-outline'}" style="${u.banned?'':'color:#e53e3e;border-color:#e53e3e;'}" onclick="event.stopPropagation();App._banUser(${u.id},${!u.banned})">${u.banned?'🟢 ปลดแบน':'🔴 แบนผู้ใช้'}</button>
              <button class="btn btn-sm btn-outline" style="color:#e53e3e;border-color:#e53e3e;" onclick="event.stopPropagation();App._deleteUser(${u.id})">🗑️ ลบแอคเคาท์</button>
            </div>

            <div style="padding:12px;background:var(--bg-main);border-radius:8px;margin-bottom:14px;">
              <label style="font-size:0.8rem;font-weight:600;">🔑 เปลี่ยนรหัสผ่าน</label>
              <div style="display:flex;gap:8px;margin-top:6px;align-items:center;">
                <input class="form-input" type="text" id="userNewPass${u.id}" placeholder="รหัสผ่านใหม่" style="padding:8px;flex:1;" onclick="event.stopPropagation()">
                <button class="btn btn-sm btn-primary" onclick="event.stopPropagation();App._changeUserPass(${u.id})">💾 เปลี่ยน</button>
              </div>
            </div>

            ${uo.length>0?`<div style="border-top:1px dashed var(--border-color);padding-top:12px;">
              <h4 style="margin-bottom:10px;">📋 ประวัติออเดอร์ทั้งหมด (${uo.length} รายการ)</h4>
              <div style="max-height:400px;overflow-y:auto;">
                ${uo.slice().reverse().map(o=>`<div style="padding:8px 10px;border:1px solid var(--border-color);border-radius:8px;margin-bottom:6px;font-size:0.8rem;">
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                      <span class="status-badge status-${o.status}" style="font-size:0.7rem;">${o.status==='waiting'?'⏳ รอ':o.status==='processing'?'🔄 ทำ':'✅ เสร็จ'}</span>
                      <strong style="margin-left:6px;">#${o.queueNumber||'-'}</strong>
                      <span style="margin-left:6px;color:var(--text-light);">${new Date(o.createdAt).toLocaleString('th-TH')}</span>
                    </div>
                    <strong style="color:var(--primary);">฿${(o.totalPrice||0).toLocaleString()}</strong>
                  </div>
                  <div style="margin-top:4px;color:var(--text-light);">${(o.items||[]).map(i=>'${i.isSkin?"✨":"<img src="assets/images/MiniEcho.webp" alt="echo" style="width:22px;height:22px;display:inline-block;vertical-align:-4px;margin-right:4px;">"}'+i.name+(i.qty>1?' x'+i.qty:'')).join(', ')}</div>
                </div>`).join('')}
              </div>
            </div>`:''}</div></div>`;}).join(''):'<p style="color:var(--text-light);">ยังไม่มีผู้ใช้สมัครสมาชิก</p>'}</div>`;
  },
  _changeUserPass(userId){const input=document.getElementById(`userNewPass${userId}`);const newPass=input?.value?.trim();if(!newPass||newPass.length<4){this.showToast('❌ รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร','error');return;}const users=Store.getUsers();const i=users.findIndex(u=>u.id===userId);if(i!==-1){users[i].password=newPass;Store.setUsers(users);this.showToast('✅ เปลี่ยนรหัสผ่านสำเร็จ!');input.value='';}},
  _deleteUser(userId){if(!confirm('⚠️ ต้องการลบแอคเคาท์นี้จริงหรือไม่?\n\nข้อมูลผู้ใช้จะถูกลบถาวร!')){return;}const users=Store.getUsers().filter(u=>u.id!==userId);Store.setUsers(users);this.showToast('🗑️ ลบแอคเคาท์แล้ว!');this.renderAdmin();},
  _banUser(userId,ban){Store.banUser(userId,ban);this.showToast(ban?'🔴 แบนแล้ว':'🟢 ปลดแบน');this.renderAdmin();},

  _adminChatbot(ac){const qa=Store.getChatbot();ac.innerHTML=`<div class="card"><h3 style="margin-bottom:16px;">🤖 Chatbot</h3>${qa.map((q,i)=>`<div style="padding:8px;border:1px solid var(--border-color);border-radius:var(--radius-md);margin-bottom:8px;"><div style="font-size:0.8rem;color:var(--text-light);">Keywords: ${q.keywords.join(', ')}</div><div style="font-size:0.85rem;margin-top:4px;">${q.answer.substring(0,60)}...</div></div>`).join('')}<div style="margin-top:12px;"><div class="form-group"><input class="form-input" id="newQAKeys" placeholder="Keywords (คั่นด้วย ,)"></div><div class="form-group"><textarea class="form-textarea" id="newQAAnswer" rows="2" placeholder="คำตอบ"></textarea></div><button class="btn btn-secondary" onclick="App._addChatbotQA()">➕ เพิ่ม</button></div></div>`;},
  _addChatbotQA(){const keys=document.getElementById('newQAKeys')?.value;const ans=document.getElementById('newQAAnswer')?.value;if(!keys||!ans){this.showToast('กรอกข้อมูลค่ะ','warning');return;}const qa=Store.getChatbot();qa.push({keywords:keys.split(',').map(k=>k.trim()),answer:ans});Store.setChatbot(qa);this.showToast('✅ เพิ่ม Q&A!');this.renderAdmin();},

  _adminProfit(ac){const p=Store.getProfitSummary();ac.innerHTML=`<div class="grid-4" style="margin-bottom:20px;"><div class="stat-card"><div class="stat-value">฿${p.todayRevenue.toLocaleString()}</div><div class="stat-label">รายได้วันนี้</div></div><div class="stat-card"><div class="stat-value" style="color:var(--secondary);">฿${p.todayProfit.toLocaleString()}</div><div class="stat-label">กำไรวันนี้</div></div><div class="stat-card"><div class="stat-value">฿${p.monthRevenue.toLocaleString()}</div><div class="stat-label">รายได้เดือน</div></div><div class="stat-card"><div class="stat-value" style="color:var(--secondary);">฿${p.monthProfit.toLocaleString()}</div><div class="stat-label">กำไรเดือน</div></div></div><div class="grid-2"><div class="stat-card"><div class="stat-value">฿${p.totalRevenue.toLocaleString()}</div><div class="stat-label">รายได้ทั้งหมด</div></div><div class="stat-card"><div class="stat-value" style="color:var(--secondary);">฿${p.totalProfit.toLocaleString()}</div><div class="stat-label">กำไรทั้งหมด (${p.totalOrders} ออเดอร์)</div></div></div>`;},
  _adminPassword(ac){ac.innerHTML=`<div class="card" style="max-width:400px;"><h3 style="margin-bottom:16px;">🔒 เปลี่ยนรหัส</h3><div class="form-group"><label class="form-label">รหัสเดิม</label><input class="form-input" type="password" id="adOldPass"></div><div class="form-group"><label class="form-label">รหัสใหม่</label><input class="form-input" type="password" id="adNewPass"></div><button class="btn btn-primary" onclick="App._changeAdminPass()">🔑 เปลี่ยน</button></div>`;},
  _changeAdminPass(){const old=document.getElementById('adOldPass')?.value;const newP=document.getElementById('adNewPass')?.value;if(old!==Store.getAdminPass()){this.showToast('❌ รหัสเดิมไม่ถูกต้อง','error');return;}if(!newP||newP.length<4){this.showToast('❌ รหัสสั้นเกินไป','error');return;}Store.setAdminPass(newP);this.showToast('✅ เปลี่ยนรหัสเรียบร้อย!');},

  // ========== THEME ==========
  setupTheme(){const toggle=document.getElementById('themeToggle');if(toggle)toggle.addEventListener('click',()=>{const cur=document.documentElement.getAttribute('data-theme');const next=cur==='dark'?'light':'dark';document.documentElement.setAttribute('data-theme',next);Store.setTheme(next);const thumb=toggle.querySelector('.toggle-thumb');if(thumb)thumb.textContent=next==='dark'?'🌙':'☀️';});},

  // ========== CHATBOT ==========
  setupChatbot(){
    const wrapper=document.getElementById('chatBounceWrapper');const win=document.getElementById('chatbotWindow');const bubble=document.getElementById('askBubble');
    if(wrapper)wrapper.addEventListener('click',()=>{win?.classList.toggle('open');if(bubble)bubble.style.display=win?.classList.contains('open')?'none':'block';});
    const sendBtn=document.getElementById('chatSend');const input=document.getElementById('chatInput');
    if(sendBtn)sendBtn.addEventListener('click',()=>this.sendChat());if(input)input.addEventListener('keypress',e=>{if(e.key==='Enter')this.sendChat();});
    this.addChatMsg('bot','สวัสดีค่ะ~ 🐰 ยินดีต้อนรับสู่ร้าน Sherly Panty!\nมีอะไรให้ช่วยคะ? 💕');
  },
  sendChat(){const input=document.getElementById('chatInput');const text=input?.value.trim();if(!text)return;this.addChatMsg('user',text);input.value='';const qa=Store.getChatbot();const lower=text.toLowerCase();let answer=null;for(const q of qa){if(q.keywords.some(k=>lower.includes(k.toLowerCase()))){answer=q.answer;break;}}setTimeout(()=>{this.addChatMsg('bot',answer||'ขอโทษนะคะ ไม่เข้าใจค่ะ 🙏\nลองถามเรื่อง ราคา, กระดุม, สกิน, พรีไว ดูนะคะ');},500);},
  addChatMsg(type,text){const container=document.getElementById('chatMessages');if(!container)return;const msg=document.createElement('div');msg.className=`chat-msg ${type}`;msg.textContent=text;container.appendChild(msg);container.scrollTop=container.scrollHeight;},

  // ========== AUTH ==========
  showAuthModal(mode='login'){const overlay=document.getElementById('authModal');if(overlay){overlay.classList.add('active');this.renderAuthForm(mode);}},
  hideAuthModal(){document.getElementById('authModal')?.classList.remove('active');},
  renderAuthForm(mode){
    const modal=document.querySelector('#authModal .modal');if(!modal)return;
    if(mode==='login'){modal.innerHTML=`<button class="modal-close" onclick="App.hideAuthModal()">✕</button><h2 class="modal-title">🐰 เข้าสู่ระบบ</h2><div class="form-group"><label class="form-label">ชื่อผู้ใช้</label><input class="form-input" id="loginUser" placeholder="username"></div><div class="form-group"><label class="form-label">รหัสผ่าน</label><input class="form-input" type="password" id="loginPass" placeholder="password" onkeypress="if(event.key==='Enter')App.doLogin()"></div><button class="btn btn-primary btn-lg" style="width:100%;margin-bottom:12px;" onclick="App.doLogin()">เข้าสู่ระบบ</button><p style="text-align:center;font-size:0.85rem;">ยังไม่มีบัญชี? <a href="#" style="color:var(--primary);font-weight:600;" onclick="App.renderAuthForm('register')">สมัครสมาชิก</a></p><p style="text-align:center;margin-top:8px;"><a href="#" style="color:var(--text-light);font-size:0.8rem;" onclick="App.forgotPassword()">ลืมรหัสผ่าน?</a></p>`;}
    else{modal.innerHTML=`<button class="modal-close" onclick="App.hideAuthModal()">✕</button><h2 class="modal-title">🐰 สมัครสมาชิก</h2><div class="form-group"><label class="form-label">ชื่อผู้ใช้</label><input class="form-input" id="regUser" placeholder="username"></div><div class="form-group"><label class="form-label">รหัสผ่าน</label><input class="form-input" type="password" id="regPass" placeholder="password"></div><div class="form-group"><label class="form-label">Facebook/Discord</label><input class="form-input" id="regContact" placeholder="ชื่อ Facebook"></div><div class="form-group"><label class="form-label">ชื่อในเกม</label><input class="form-input" id="regGameName" placeholder="ชื่อในเกม"></div><div class="grid-2"><div class="form-group"><label class="form-label">UID</label><input class="form-input" id="regUID" placeholder="User ID"></div><div class="form-group"><label class="form-label">Server</label><select class="form-select" id="regServer"><option value="Asia">Asia</option><option value="NA/EU">NA/EU</option></select></div></div><button class="btn btn-primary btn-lg" style="width:100%;margin-bottom:12px;" onclick="App.doRegister()">สมัครสมาชิก</button><p style="text-align:center;font-size:0.85rem;"><a href="#" style="color:var(--primary);font-weight:600;" onclick="App.renderAuthForm('login')">มีบัญชีแล้ว? เข้าสู่ระบบ</a></p>`;}
  },
  doLogin(){const u=document.getElementById('loginUser')?.value;const p=document.getElementById('loginPass')?.value;if(!u||!p){this.showToast('กรอกข้อมูลค่ะ','warning');return;}if(u===Store.getAdminUser()&&p===Store.getAdminPass()){this.adminLoggedIn=true;this._guideShown={};this.hideAuthModal();this.updateAuthUI();this.showToast('🔑 เข้าสู่ระบบแอดมินสำเร็จ!');return;}const r=Store.login(u,p);if(r.success){this._guideShown={};this.hideAuthModal();this.updateAuthUI();this.showToast(`🐰 สวัสดีค่ะ ${r.user.gameName||r.user.username}!💕`);}else this.showToast(r.error,'error');},
  doRegister(){const username=document.getElementById('regUser')?.value;const password=document.getElementById('regPass')?.value;const contact=document.getElementById('regContact')?.value;const gameName=document.getElementById('regGameName')?.value;const uid=document.getElementById('regUID')?.value;const server=document.getElementById('regServer')?.value;if(!username||!password){this.showToast('กรอก username/password ค่ะ','warning');return;}const r=Store.register({username,password,contact,gameName,uid,server});if(r.success){this._guideShown={};this.hideAuthModal();this.updateAuthUI();this.showToast(`🐰 สมัครสำเร็จ!💕`);}else this.showToast(r.error,'error');},
  forgotPassword(){const modal=document.querySelector('#authModal .modal');if(modal)modal.innerHTML=`<button class="modal-close" onclick="App.hideAuthModal()">✕</button><div style="text-align:center;padding:20px;"><div style="font-size:3rem;margin-bottom:16px;">🔑</div><h2 style="margin-bottom:12px;">ลืมรหัสผ่าน?</h2><p style="color:var(--text-secondary);margin-bottom:20px;">ติดต่อแก้ไขรหัสผ่านกับแอดมินได้เลยค่ะ</p><a href="https://www.facebook.com/share/16RiyzPHqX/" target="_blank" class="btn btn-primary btn-lg">📘 ติดต่อ Facebook</a><p style="margin-top:16px;"><a href="#" style="color:var(--primary);font-size:0.85rem;" onclick="App.renderAuthForm('login')">← กลับ</a></p></div>`;},
  updateAuthUI(){
    const user=Store.getCurrentUser();const btn=document.getElementById('userButton');const avatar=document.getElementById('userAvatar');const name=document.getElementById('userName');
    const adminNav=document.getElementById('adminNavItem');const myordersNav=document.getElementById('myordersNavItem');
    if(this.adminLoggedIn){
      if(adminNav)adminNav.style.display='';
      if(myordersNav)myordersNav.style.display='';
      if(avatar)avatar.textContent='👑';if(name)name.textContent='แอดมิน';
      if(btn)btn.onclick=()=>{if(confirm('ออกจากระบบแอดมิน?')){this.adminLoggedIn=false;this._guideShown={};Store.logout();this.updateAuthUI();this.showToast('👋 ออกจากระบบแล้ว');this.navigate('home');}};
    }else if(user){
      if(adminNav)adminNav.style.display='none';
      if(myordersNav)myordersNav.style.display='';
      if(avatar)avatar.textContent='🐰';if(name)name.textContent=user.gameName||user.username;
      if(btn)btn.onclick=()=>{if(confirm('ออกจากระบบ?')){this._guideShown={};Store.logout();this.updateAuthUI();this.showToast('👋 ออกจากระบบแล้ว');}};
    }else{
      if(adminNav)adminNav.style.display='none';
      if(myordersNav)myordersNav.style.display='none';
      if(avatar)avatar.textContent='👤';if(name)name.textContent='เข้าสู่ระบบ';
      if(btn)btn.onclick=()=>this.showAuthModal('login');
    }
  },

  setupMobile(){const toggle=document.getElementById('mobileToggle');const sidebar=document.querySelector('.sidebar');const overlay=document.querySelector('.sidebar-overlay');if(toggle)toggle.addEventListener('click',()=>{sidebar?.classList.toggle('open');overlay?.classList.toggle('active');});if(overlay)overlay.addEventListener('click',()=>{sidebar?.classList.remove('open');overlay?.classList.remove('active');});},
  setupSidebarToggle(){
    const sidebar=document.getElementById('sidebar');
    if(!sidebar||window.innerWidth<=768)return;
    // Add collapse button to sidebar
    const collapseBtn=document.createElement('button');
    collapseBtn.className='sidebar-collapse-btn';
    collapseBtn.id='sidebarCollapseBtn';
    collapseBtn.textContent='◀';
    collapseBtn.onclick=(e)=>{e.stopPropagation();this.toggleSidebar();};
    sidebar.appendChild(collapseBtn);
  },
  toggleSidebar(){
    const sidebar=document.getElementById('sidebar');
    if(!sidebar)return;
    const collapsed=sidebar.classList.toggle('collapsed');
    const btn=document.getElementById('sidebarCollapseBtn');
    if(collapsed){
      if(btn)btn.style.display='none';
      let expandBtn=document.getElementById('sidebarExpandBtn');
      if(!expandBtn){expandBtn=document.createElement('button');expandBtn.id='sidebarExpandBtn';expandBtn.className='sidebar-expand-btn';expandBtn.textContent='☰';expandBtn.onclick=()=>this.toggleSidebar();document.body.appendChild(expandBtn);}
    }else{
      if(btn)btn.style.display='';
      const expandBtn=document.getElementById('sidebarExpandBtn');
      if(expandBtn)expandBtn.remove();
    }
  },
  toggleMobilePreview(){
    this._mobilePreview=!this._mobilePreview;
    if(this._mobilePreview){
      document.body.classList.add('mobile-preview-active');
      // Add exit button
      let exitBtn=document.getElementById('mobileExitBtn');
      if(!exitBtn){exitBtn=document.createElement('button');exitBtn.id='mobileExitBtn';exitBtn.className='mobile-preview-exit';exitBtn.textContent='✕ ปิดมือถือ';exitBtn.onclick=()=>this.toggleMobilePreview();document.body.appendChild(exitBtn);}
    }else{
      document.body.classList.remove('mobile-preview-active');
      const exitBtn=document.getElementById('mobileExitBtn');
      if(exitBtn)exitBtn.remove();
    }
    this.renderAdmin();
  },
  hideGenericModal(){document.getElementById('genericModal')?.classList.remove('active');},
  copyText(text){navigator.clipboard.writeText(text).then(()=>this.showToast('📋 คัดลอกแล้ว!')).catch(()=>{const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();this.showToast('📋 คัดลอกแล้ว!');});},
  showToast(message,type='success'){let container=document.getElementById('toastContainer');if(!container){container=document.createElement('div');container.id='toastContainer';container.style.cssText='position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;max-width:380px;';document.body.appendChild(container);}const toast=document.createElement('div');toast.style.cssText=`padding:12px 20px;border-radius:12px;font-size:0.9rem;box-shadow:0 4px 20px rgba(0,0,0,0.15);animation:fadeInUp 0.3s ease;backdrop-filter:blur(10px);line-height:1.4;${type==='error'?'background:#FFEBEE;color:#C62828;border:1px solid #FFCDD2;':type==='warning'?'background:#FFF8E1;color:#F57F17;border:1px solid #FFECB3;':'background:#E8F5E9;color:#2E7D32;border:1px solid #C8E6C9;'}`;toast.textContent=message;container.appendChild(toast);setTimeout(()=>{toast.style.opacity='0';toast.style.transition='opacity 0.3s';setTimeout(()=>toast.remove(),300);},4000);}
};
document.addEventListener('DOMContentLoaded',()=>App.init());
