/* ============================================
   🐰 Sherly Panty - Data Store v4 (Firebase)
   ============================================ */
const Store = {
  _cache: {},
  _ready: false,
  _readyCallbacks: [],

  // ─── Firebase helpers ───
  _ref(path){ return db.ref(path); },

  async _fbGet(path, defaultVal){
    // check cache first
    if(this._cache[path] !== undefined) return this._cache[path];
    try {
      const snap = await this._ref(path).once('value');
      const val = snap.val();
      if(val !== null && val !== undefined){
        this._cache[path] = val;
        return val;
      }
      return defaultVal;
    } catch(e){
      console.warn('Firebase read error:', path, e);
      return defaultVal;
    }
  },

  async _fbSet(path, value){
    try {
      await this._ref(path).set(value);
      this._cache[path] = value;
    } catch(e){
      console.warn('Firebase write error:', path, e.message);
    }
  },

  // Listen for real-time changes and update cache
  _listen(path, callback){
    this._ref(path).on('value', snap => {
      const val = snap.val();
      this._cache[path] = val;
      if(callback) callback(val);
    });
  },

  // ─── Default values ───
  _defaults: {
    shop_status: {open:true,message:''},
    marquee: '🐰 ยินดีต้อนรับสู่ร้าน Sherly Panty! 🎮 รับเติม/ส่งของขวัญ Identity V แบบ Official ✨ สมัครสมาชิกรับส่วนลดพิเศษ 💕',
    banner: 'assets/images/banner.png',
    mascot: 'assets/images/mascot.png',
    chatbot_img: 'assets/images/chatbot.png',
    products: null, skin_packs: null,
    orders: [], users: [],
    admin_user: 'PlengloveKB',
    admin_pass: '4t.4{@],EzUkq~L_PKBxJEsJsMYLOVEISKB@LC+5z%Q',
    buttons: null, promos: null, faq: null, rentals: null,
    bookings: [], bank: null, chatbot: null, theme: 'light',
    banner_size: 100, mascot_size: 100, chatbot_size: 100, chatbot_bottom: 0,
    order_banner: '', gift_banner: '',
    order_banner_size: 100, gift_banner_size: 100,
    loading_img: '', loading_img_size: 100
  },

  _getDefault(key){
    const d = this._defaults[key];
    if(d !== null && d !== undefined) return d;
    // Fallback to DEFAULT_ constants
    const map = {products:DEFAULT_PRODUCTS,skin_packs:DEFAULT_SKIN_PACKS,buttons:DEFAULT_BUTTONS,promos:DEFAULT_PROMOS,faq:DEFAULT_FAQ,rentals:DEFAULT_RENTALS,bank:DEFAULT_BANK,chatbot:DEFAULT_CHATBOT};
    return map[key] || null;
  },

  // ─── Initialize: load all data from Firebase (with timeout) ───
  async init(){
    const paths = [
      'shop_status','marquee','banner','mascot','chatbot_img',
      'products','skin_packs','orders','users','admin_user','admin_pass',
      'buttons','promos','faq','rentals','bookings','bank','chatbot',
      'banner_size','mascot_size','chatbot_size','chatbot_bottom',
      'order_banner','gift_banner','order_banner_size','gift_banner_size',
      'loading_img','loading_img_size'
    ];

    // Fill cache with defaults first (so page can render immediately if Firebase is slow)
    paths.forEach(p => { this._cache[p] = this._getDefault(p); });

    try {
      // Race Firebase load vs 8-second timeout
      await Promise.race([
        this._loadFromFirebase(paths),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000))
      ]);
    } catch(e) {
      console.warn('⚠️ Firebase load timeout/error, using defaults:', e.message);
    }

    this._ready = true;
    this._readyCallbacks.forEach(cb => cb());
    this._readyCallbacks = [];
    console.log('✅ Store ready!');

    // Setup listeners in background (non-blocking)
    this._setupListeners();
  },

  async _loadFromFirebase(paths){
    // Check if DB has data, seed if empty
    const rootSnap = await db.ref().once('value');
    if(!rootSnap.exists()){
      console.log('🌱 Seeding defaults to Firebase...');
      const seedData = {};
      paths.forEach(p => { seedData[p] = this._getDefault(p); });
      await db.ref().set(seedData);
    }

    // Load all into cache in parallel
    await Promise.all(paths.map(async p => {
      const val = await this._fbGet(p, this._getDefault(p));
      if(val !== null && val !== undefined) this._cache[p] = val;
    }));
    console.log('✅ Firebase data loaded!');
  },

  _setupListeners(){
    // Simple listeners (just cache update)
    const simplePaths = ['products','skin_packs','buttons','promos','faq','rentals',
      'bank','chatbot','orders','bookings','admin_user','admin_pass',
      'order_banner_size','gift_banner_size','loading_img_size',
      'banner_size','chatbot_bottom'];
    simplePaths.forEach(p => this._listen(p));

    // Auto-refresh UI function
    const refreshUI = () => {
      if(typeof App === 'undefined') return;
      App.updateMascot(); App.updateChatbotImg(); App.applyChatbotSize();
      App.applyMascotSize(); App.applyChatbotBottom(); App.applyLoadingImg();
      App.updateMarquee(); App.updateShopStatus();
      // Re-render current page to show new images
      App.navigate(App.currentPage);
    };

    // Image/visual listeners - trigger full UI refresh
    const visualPaths = ['banner','mascot','mascot_size','chatbot_img','chatbot_size',
      'loading_img','order_banner','gift_banner','shop_status','marquee'];
    visualPaths.forEach(p => {
      this._listen(p, () => { setTimeout(refreshUI, 300); });
    });
  },

  onReady(cb){
    if(this._ready) cb();
    else this._readyCallbacks.push(cb);
  },

  // ─── Synchronous getters (read from cache) ───
  sanitize(str){if(!str)return'';const d=document.createElement('div');d.textContent=str;return d.innerHTML;},

  getShopStatus(){ return this._cache['shop_status'] || {open:true,message:''}; },
  setShopStatus(s){ this._fbSet('shop_status', s); },

  getMarquee(){ return this._cache['marquee'] || '🐰 ยินดีต้อนรับสู่ร้าน Sherly Panty!'; },
  setMarquee(t){ this._fbSet('marquee', t); },

  getBanner(){ return this._cache['banner'] || 'assets/images/banner.png'; },
  setBanner(i){ this._fbSet('banner', i); },

  getMascot(){ return this._cache['mascot'] || 'assets/images/mascot.png'; },
  setMascot(i){ this._fbSet('mascot', i); },

  getChatbotImg(){ return this._cache['chatbot_img'] || 'assets/images/chatbot.png'; },
  setChatbotImg(i){ this._fbSet('chatbot_img', i); },

  getProducts(){ return this._cache['products'] || DEFAULT_PRODUCTS; },
  setProducts(p){ this._fbSet('products', p); },

  getSkinPacks(){ return this._cache['skin_packs'] || DEFAULT_SKIN_PACKS; },
  setSkinPacks(p){ this._fbSet('skin_packs', p); },

  getOrders(){ return this._cache['orders'] || []; },
  addOrder(order){
    const orders = this.getOrders();
    order.id = Date.now();
    order.queueNumber = orders.length + 1;
    order.status = 'waiting';
    order.createdAt = new Date().toISOString();
    orders.push(order);
    this._fbSet('orders', orders);
    return order;
  },
  updateOrder(id, updates){
    const orders = this.getOrders();
    const i = orders.findIndex(o => o.id === id);
    if(i !== -1){ Object.assign(orders[i], updates); this._fbSet('orders', orders); }
  },

  getUsers(){ return this._cache['users'] || []; },
  register(user){
    const users = this.getUsers();
    if(users.find(u => u.username === user.username)) return {error:'ชื่อผู้ใช้นี้มีอยู่แล้ว'};
    user.id = Date.now(); user.createdAt = new Date().toISOString(); user.banned = false;
    users.push(user);
    this._fbSet('users', users);
    // Current user stays in localStorage (per-device)
    localStorage.setItem('sp_cur_user', JSON.stringify(user));
    return {success:true, user};
  },
  login(username, password){
    const users = this.getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if(!user) return {error:'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'};
    if(user.banned) return {error:'บัญชีนี้ถูกระงับ'};
    localStorage.setItem('sp_cur_user', JSON.stringify(user));
    return {success:true, user};
  },
  logout(){ localStorage.removeItem('sp_cur_user'); },
  getCurrentUser(){
    try{ const v = localStorage.getItem('sp_cur_user'); return v ? JSON.parse(v) : null; }
    catch{ return null; }
  },
  banUser(userId, ban){
    const users = this.getUsers();
    const i = users.findIndex(u => u.id === userId);
    if(i !== -1){ users[i].banned = ban; this._fbSet('users', users); }
  },

  getAdminUser(){ return this._cache['admin_user'] || 'PlengloveKB'; },
  getAdminPass(){ return this._cache['admin_pass'] || '4t.4{@],EzUkq~L_PKBxJEsJsMYLOVEISKB@LC+5z%Q'; },
  setAdminUser(u){ this._fbSet('admin_user', u); },
  setAdminPass(p){ this._fbSet('admin_pass', p); },

  getButtons(){ return this._cache['buttons'] || DEFAULT_BUTTONS; },
  setButtons(b){ this._fbSet('buttons', b); },

  getPromos(){ return this._cache['promos'] || DEFAULT_PROMOS; },
  setPromos(p){ this._fbSet('promos', p); },

  getFAQ(){ return this._cache['faq'] || DEFAULT_FAQ; },
  setFAQ(f){ this._fbSet('faq', f); },

  getRentals(){ return this._cache['rentals'] || DEFAULT_RENTALS; },
  setRentals(r){ this._fbSet('rentals', r); },

  getBookings(){ return this._cache['bookings'] || []; },
  addBooking(b){
    const bookings = this.getBookings();
    b.id = Date.now(); b.createdAt = new Date().toISOString();
    bookings.push(b);
    this._fbSet('bookings', bookings);
    return b;
  },
  updateBooking(id, updates){
    const bookings = this.getBookings();
    const i = bookings.findIndex(b => b.id === id);
    if(i !== -1){ Object.assign(bookings[i], updates); this._fbSet('bookings', bookings); }
  },

  getBank(){ return this._cache['bank'] || DEFAULT_BANK; },
  setBank(b){ this._fbSet('bank', b); },

  getChatbot(){ return this._cache['chatbot'] || DEFAULT_CHATBOT; },
  setChatbot(c){ this._fbSet('chatbot', c); },

  // Theme stays local (per-device preference)
  getTheme(){
    try{ const v = localStorage.getItem('sp_theme'); return v ? JSON.parse(v) : 'light'; }
    catch{ return 'light'; }
  },
  setTheme(t){ localStorage.setItem('sp_theme', JSON.stringify(t)); },

  getBannerSize(){ return this._cache['banner_size'] || 100; },
  setBannerSize(v){ this._fbSet('banner_size', v); },
  getMascotSize(){ return this._cache['mascot_size'] || 100; },
  setMascotSize(v){ this._fbSet('mascot_size', v); },
  getChatbotSize(){ return this._cache['chatbot_size'] || 100; },
  setChatbotSize(v){ this._fbSet('chatbot_size', v); },
  getChatbotBottom(){ return this._cache['chatbot_bottom'] || 0; },
  setChatbotBottom(v){ this._fbSet('chatbot_bottom', v); },

  getOrderBanner(){ return this._cache['order_banner'] || ''; },
  setOrderBanner(v){ this._fbSet('order_banner', v); },
  getGiftBanner(){ return this._cache['gift_banner'] || ''; },
  setGiftBanner(v){ this._fbSet('gift_banner', v); },
  getOrderBannerSize(){ return this._cache['order_banner_size'] || 100; },
  setOrderBannerSize(v){ this._fbSet('order_banner_size', v); },
  getGiftBannerSize(){ return this._cache['gift_banner_size'] || 100; },
  setGiftBannerSize(v){ this._fbSet('gift_banner_size', v); },

  getLoadingImg(){ return this._cache['loading_img'] || ''; },
  setLoadingImg(v){ this._fbSet('loading_img', v); },
  getLoadingImgSize(){ return this._cache['loading_img_size'] || 100; },
  setLoadingImgSize(v){ this._fbSet('loading_img_size', v); },

  getProfitSummary(){
    const orders = this.getOrders().filter(o => o.status === 'done');
    const today = new Date().toDateString(); const cm = new Date().getMonth();
    let tR=0,tC=0,dR=0,dC=0,mR=0,mC=0;
    orders.forEach(o => {
      const d = new Date(o.createdAt); const r = o.totalPrice||0; const c = o.totalCost||0;
      tR+=r; tC+=c;
      if(d.toDateString()===today){dR+=r;dC+=c;}
      if(d.getMonth()===cm){mR+=r;mC+=c;}
    });
    return {totalRevenue:tR,totalCost:tC,totalProfit:tR-tC,todayRevenue:dR,todayCost:dC,todayProfit:dR-dC,monthRevenue:mR,monthCost:mC,monthProfit:mR-mC,totalOrders:orders.length};
  }
};

const DEFAULT_PRODUCTS=[
  {id:1,name:'66 กระดุม',echoes:60,bonus:6,totalEcho:66,privatePrice:29,normalPrice:25,normalEnabled:false,cost:20,image:'',emoji:'💎'},
  {id:2,name:'203 กระดุม',echoes:185,bonus:18,totalEcho:203,privatePrice:90,normalPrice:80,normalEnabled:false,cost:65,image:'',emoji:'💎'},
  {id:3,name:'335 กระดุม',echoes:305,bonus:30,totalEcho:335,privatePrice:145,normalPrice:130,normalEnabled:false,cost:110,image:'',emoji:'💎'},
  {id:4,name:'759 กระดุม',echoes:690,bonus:69,totalEcho:759,privatePrice:285,normalPrice:260,normalEnabled:false,cost:220,image:'',emoji:'💎',
    volumeDiscount:[{minQty:20,price:283},{minQty:30,price:280}]},
];

// Skin packs: admin sets targetEcho, system auto-calcs breakdown+pricing
const DEFAULT_SKIN_PACKS=[
  {id:1,name:'แพ็คสกินทองประดับทอง',targetEcho:3288,sendPrice:1200,normalEnabled:false,cost:950,image:'',emoji:'✨',active:true},
  {id:2,name:'สกินแบบซื้อประดับไปแล้ว',targetEcho:1963,sendPrice:750,normalEnabled:false,cost:590,image:'',emoji:'🌟',active:true},
];

const DEFAULT_BUTTONS=[
  {id:1,name:'สั่งสินค้า',icon:'📋',image:'',action:'navigate',target:'order',active:true},
  {id:2,name:'ส่งสกิน',icon:'🎁',image:'',action:'navigate',target:'gift',active:true},
  {id:3,name:'ดูไอดีปล่อยเช่า',icon:'🎮',image:'',action:'navigate',target:'rental',active:true},
  {id:4,name:'เช็คเครดิต',icon:'💳',image:'',action:'link',target:'https://www.facebook.com/share/1E5GKvtGQi/',active:true},
];

// Promos: support multiple images + content for detail view
const DEFAULT_PROMOS=[
  {id:1,title:'🎉 แพ็คสกินเข้าใหม่ราคา20บาท ต้องสับบ',description:'สกิน Dazzling Lone Wolf เข้าใหม่! ราคาพิเศษเพียง 20 บาท',images:['assets/images/promo_test.jpg'],content:'🐺 สกิน Dazzling Lone Wolf เข้าใหม่!\n\nราคาพิเศษเพียง 20 บาทเท่านั้น!\nจำนวนจำกัด สนใจติดต่อแอดมินได้เลยค่ะ ♡\n\nเงื่อนไข:\n- ลูกค้าต้องสับสกินก่อนจึงจะส่งได้\n- ใช้ได้เฉพาะแบบพรีไว',active:true},
  {id:2,title:'💕 ซื้อกระดุมคู่ ลดเพิ่ม',description:'ซื้อกระดุม 2 แพ็คขึ้นไป รับส่วนลดเพิ่ม 3%',images:[],content:'ซื้อกระดุม 2 แพ็คขึ้นไป รับส่วนลดเพิ่ม 3%\nเฉพาะสมาชิกใหม่ ♡',active:true},
];

const DEFAULT_FAQ=[
  {id:1,question:'เติมพรีไวคืออะไร?',shortAnswer:'แบบพรีมีการลงทะเบียนลงข้อมูลเพื่อเติม...',fullAnswer:'แบบพรีมีการลงทะเบียนลงข้อมูลเพื่อเติมเสียงสะท้อนหรือกระดุมค่ะ ลงทะเบียนแค่ครั้งแรกครั้งเดียวต่อไอดีก็สามารถใช้เติมได้ตลอดในครั้งถัดๆไปค่ะ(ของร้านเค้า) แต่ถ้าลูกค้าย้ายระบบอาจจะต้องลงทะเบียนใหม่ค่ะ แม่ค้าเข้าโดยการสแกนค่ะ หากแม่ค้าไม่สะดวกบางครั้งอาจจะขอเข้าทางเมลฟ้า ใช้เวลาลงทะเบียน 1-5 นาที กระดุมแบบพรีไวเข้าเร็วมาก 1-10 นาที เติมเยอะอาจจะช้าลงได้ค่ะ',active:true},
  {id:2,question:'ส่งของขวัญมีเงื่อนไขอะไรบ้าง?',shortAnswer:'ต้องแอดเพื่อนในเกม 24 ชม. ก่อน...',fullAnswer:'ต้องแอดเพื่อนในเกม 24 ชม. ก่อนถึงจะสามารถส่งของได้ค่ะ หากลูกค้าเคยแอดไว้แล้วสามารถส่งได้เลย แบบส่งไม่สามารถใช้บัตรส่วนลดได้ ไม่ได้ยอดเติม',active:true},
];

const DEFAULT_RENTALS=[{id:1,name:'ไอดีที่ 1',pricePerHour:20,emoji:'🎭',skins:['🗡️','🛡️','✨','🎭','🌟'],image:'',description:'ไอดีสกินเยอะ หลากหลายตัวละคร',active:true}];

const DEFAULT_BANK={methods:[
  {id:1,name:'TrueMoney Wallet',icon:'📱',accountName:'ตัวอย่าง',accountNumber:'XXX-XXXX-XXX',noteText:'เติมกับ sherly panty',active:true},
  {id:2,name:'พร้อมเพย์ (PromptPay)',icon:'💳',accountName:'ตัวอย่าง',accountNumber:'XXX-XXXX-XXX',noteText:'เติมกับ sherly panty',active:true},
  {id:3,name:'ธนาคารกสิกร (KBank)',icon:'🏦',accountName:'ตัวอย่าง',accountNumber:'XXX-XXXX-XXX',noteText:'เติมกับ sherly panty',active:true},
]};

const DEFAULT_CHATBOT=[
  {keywords:['สวัสดี','หวัดดี','hi','hello'],answer:'สวัสดีค่ะ~ 🐰 ยินดีต้อนรับสู่ร้าน Sherly Panty! มีอะไรให้ช่วยคะ?'},
  {keywords:['ราคา','เท่าไหร่','กี่บาท'],answer:'สามารถดูราคาสินค้าได้ที่หน้า \"สั่งสินค้า\" ค่ะ 💕'},
  {keywords:['กระดุม','echo'],answer:'💎 แพ็คกระดุม:\n• 66 กระดุม = พรีไว 29฿\n• 203 กระดุม = พรีไว 90฿\n• 335 กระดุม = พรีไว 145฿\n• 759 กระดุม = พรีไว 285฿'},
  {keywords:['สกิน','skin'],answer:'✨ สกินดูได้ที่หน้า \"สั่งสินค้า\" หรือ \"ส่งสกิน\" ค่ะ'},
  {keywords:['ส่วนลด','โปร'],answer:'🎉 ดูโปรทั้งหมดที่หน้าแรกค่ะ'},
  {keywords:['ติดต่อ','แอดมิน','facebook'],answer:'📞 ติดต่อ Facebook: Sherly Panty ค่ะ 💕'},
  {keywords:['วิธี','สั่ง','ยังไง'],answer:'📋 วิธีสั่ง:\n1. สมัครสมาชิก\n2. เลือกสินค้า\n3. ชำระเงิน\n4. แคปสลิปส่งแอดมิน\n5. รอรับสินค้า 🐰'},
  {keywords:['พรีไว','private'],answer:'🔑 พรีไวคือแบบเติมที่ลงทะเบียนแค่ครั้งแรก เติมเร็ว 1-10 นาที!'},
  {keywords:['เช่า','rent','ไอดี'],answer:'🎮 ดูไอดีปล่อยเช่าได้ที่หน้า \"ปล่อยเช่า\" ค่ะ'},
  {keywords:['ขอบคุณ','thank'],answer:'ยินดีค่ะ~ 🐰💕'},
];
