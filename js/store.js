/* ============================================
   🐰 Sherly Panty - Data Store v3
   ============================================ */
const Store = {
  KEYS: {
    PRODUCTS:'sp_products',SKIN_PACKS:'sp_skins',ORDERS:'sp_orders',USERS:'sp_users',CURRENT_USER:'sp_cur_user',
    ADMIN_USER:'sp_admin_u',ADMIN_PASS:'sp_admin_p',SHOP_STATUS:'sp_status',MARQUEE:'sp_marquee',
    BANNER:'sp_banner',MASCOT:'sp_mascot',CHATBOT_IMG:'sp_chatbot_img',PROMOS:'sp_promos',BUTTONS:'sp_buttons',
    FAQ:'sp_faq',RENTALS:'sp_rentals',BOOKINGS:'sp_bookings',BANK:'sp_bank',CHATBOT:'sp_chatbot',THEME:'sp_theme',
    BANNER_SIZE:'sp_banner_size',MASCOT_SIZE:'sp_mascot_size',CHATBOT_SIZE:'sp_chatbot_size',CHATBOT_BOTTOM:'sp_chatbot_bottom',
    ORDER_BANNER:'sp_order_banner',GIFT_BANNER:'sp_gift_banner',ORDER_BANNER_SIZE:'sp_order_banner_size',GIFT_BANNER_SIZE:'sp_gift_banner_size',
    LOADING_IMG:'sp_loading_img',LOADING_IMG_SIZE:'sp_loading_img_size'
  },
  get(k,d=null){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch{return d;}},
  set(k,v){
    try{ localStorage.setItem(k,JSON.stringify(v)); }
    catch(e){
      if(e.name==='QuotaExceededError' || e.message.includes('quota')) {
        alert('❌ พื้นที่ความจำเบราว์เซอร์เต็มรูปภาพแล้ว! ระบบได้บีบอัดภาพให้แล้วแต่ถ้ายังมีปัญหา ให้ลบรูปเก่าที่ไม่ใช้ออกค่ะ');
      }
    }
  },
  remove(k){localStorage.removeItem(k);},
  sanitize(str){if(!str)return'';const d=document.createElement('div');d.textContent=str;return d.innerHTML;},

  getShopStatus(){return this.get(this.KEYS.SHOP_STATUS,{open:true,message:''});},setShopStatus(s){this.set(this.KEYS.SHOP_STATUS,s);},
  getMarquee(){return this.get(this.KEYS.MARQUEE,'🐰 ยินดีต้อนรับสู่ร้าน Sherly Panty! 🎮 รับเติม/ส่งของขวัญ Identity V แบบ Official ✨ สมัครสมาชิกรับส่วนลดพิเศษ 💕');},setMarquee(t){this.set(this.KEYS.MARQUEE,t);},
  getBanner(){return this.get(this.KEYS.BANNER,'assets/images/banner.png');},setBanner(i){this.set(this.KEYS.BANNER,i);},
  getMascot(){return this.get(this.KEYS.MASCOT,'assets/images/mascot.png');},setMascot(i){this.set(this.KEYS.MASCOT,i);},
  getChatbotImg(){return this.get(this.KEYS.CHATBOT_IMG,'assets/images/chatbot.png');},setChatbotImg(i){this.set(this.KEYS.CHATBOT_IMG,i);},

  getProducts(){return this.get(this.KEYS.PRODUCTS,DEFAULT_PRODUCTS);},setProducts(p){this.set(this.KEYS.PRODUCTS,p);},
  getSkinPacks(){return this.get(this.KEYS.SKIN_PACKS,DEFAULT_SKIN_PACKS);},setSkinPacks(p){this.set(this.KEYS.SKIN_PACKS,p);},

  getOrders(){return this.get(this.KEYS.ORDERS,[]);},
  addOrder(order){const orders=this.getOrders();order.id=Date.now();order.queueNumber=orders.length+1;order.status='waiting';order.createdAt=new Date().toISOString();orders.push(order);this.set(this.KEYS.ORDERS,orders);return order;},
  updateOrder(id,updates){const orders=this.getOrders();const i=orders.findIndex(o=>o.id===id);if(i!==-1){Object.assign(orders[i],updates);this.set(this.KEYS.ORDERS,orders);}},

  getUsers(){return this.get(this.KEYS.USERS,[]);},
  register(user){const users=this.getUsers();if(users.find(u=>u.username===user.username))return{error:'ชื่อผู้ใช้นี้มีอยู่แล้ว'};user.id=Date.now();user.createdAt=new Date().toISOString();user.banned=false;users.push(user);this.set(this.KEYS.USERS,users);this.set(this.KEYS.CURRENT_USER,user);return{success:true,user};},
  login(username,password){const users=this.getUsers();const user=users.find(u=>u.username===username&&u.password===password);if(!user)return{error:'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'};if(user.banned)return{error:'บัญชีนี้ถูกระงับ'};this.set(this.KEYS.CURRENT_USER,user);return{success:true,user};},
  logout(){this.remove(this.KEYS.CURRENT_USER);},getCurrentUser(){return this.get(this.KEYS.CURRENT_USER,null);},
  banUser(userId,ban){const users=this.getUsers();const i=users.findIndex(u=>u.id===userId);if(i!==-1){users[i].banned=ban;this.set(this.KEYS.USERS,users);}},

  getAdminUser(){return this.get(this.KEYS.ADMIN_USER,'PlengloveKB');},getAdminPass(){return this.get(this.KEYS.ADMIN_PASS,'4t.4{@],EzUkq~L_PKBxJEsJsMYLOVEISKB@LC+5z%Q');},
  setAdminUser(u){this.set(this.KEYS.ADMIN_USER,u);},setAdminPass(p){this.set(this.KEYS.ADMIN_PASS,p);},

  getButtons(){return this.get(this.KEYS.BUTTONS,DEFAULT_BUTTONS);},setButtons(b){this.set(this.KEYS.BUTTONS,b);},
  getPromos(){return this.get(this.KEYS.PROMOS,DEFAULT_PROMOS);},setPromos(p){this.set(this.KEYS.PROMOS,p);},
  getFAQ(){return this.get(this.KEYS.FAQ,DEFAULT_FAQ);},setFAQ(f){this.set(this.KEYS.FAQ,f);},
  getRentals(){return this.get(this.KEYS.RENTALS,DEFAULT_RENTALS);},setRentals(r){this.set(this.KEYS.RENTALS,r);},
  getBookings(){return this.get(this.KEYS.BOOKINGS,[]);},
  addBooking(b){const bookings=this.getBookings();b.id=Date.now();b.createdAt=new Date().toISOString();bookings.push(b);this.set(this.KEYS.BOOKINGS,bookings);return b;},
  updateBooking(id,updates){const bookings=this.getBookings();const i=bookings.findIndex(b=>b.id===id);if(i!==-1){Object.assign(bookings[i],updates);this.set(this.KEYS.BOOKINGS,bookings);}},
  getBank(){return this.get(this.KEYS.BANK,DEFAULT_BANK);},setBank(b){this.set(this.KEYS.BANK,b);},
  getChatbot(){return this.get(this.KEYS.CHATBOT,DEFAULT_CHATBOT);},setChatbot(c){this.set(this.KEYS.CHATBOT,c);},
  getTheme(){return this.get(this.KEYS.THEME,'light');},setTheme(t){this.set(this.KEYS.THEME,t);},
  getBannerSize(){return this.get(this.KEYS.BANNER_SIZE,100);},setBannerSize(v){this.set(this.KEYS.BANNER_SIZE,v);},
  getMascotSize(){return this.get(this.KEYS.MASCOT_SIZE,100);},setMascotSize(v){this.set(this.KEYS.MASCOT_SIZE,v);},
  getChatbotSize(){return this.get(this.KEYS.CHATBOT_SIZE,100);},setChatbotSize(v){this.set(this.KEYS.CHATBOT_SIZE,v);},
  getChatbotBottom(){return this.get(this.KEYS.CHATBOT_BOTTOM,0);},setChatbotBottom(v){this.set(this.KEYS.CHATBOT_BOTTOM,v);},
  getOrderBanner(){return this.get(this.KEYS.ORDER_BANNER,'');},setOrderBanner(v){this.set(this.KEYS.ORDER_BANNER,v);},
  getGiftBanner(){return this.get(this.KEYS.GIFT_BANNER,'');},setGiftBanner(v){this.set(this.KEYS.GIFT_BANNER,v);},
  getOrderBannerSize(){return this.get(this.KEYS.ORDER_BANNER_SIZE,100);},setOrderBannerSize(v){this.set(this.KEYS.ORDER_BANNER_SIZE,v);},
  getGiftBannerSize(){return this.get(this.KEYS.GIFT_BANNER_SIZE,100);},setGiftBannerSize(v){this.set(this.KEYS.GIFT_BANNER_SIZE,v);},
  getLoadingImg(){return this.get(this.KEYS.LOADING_IMG,'');},setLoadingImg(v){this.set(this.KEYS.LOADING_IMG,v);},
  getLoadingImgSize(){return this.get(this.KEYS.LOADING_IMG_SIZE,100);},setLoadingImgSize(v){this.set(this.KEYS.LOADING_IMG_SIZE,v);},

  getProfitSummary(){
    const orders=this.getOrders().filter(o=>o.status==='done');const today=new Date().toDateString();const cm=new Date().getMonth();
    let tR=0,tC=0,dR=0,dC=0,mR=0,mC=0;
    orders.forEach(o=>{const d=new Date(o.createdAt);const r=o.totalPrice||0;const c=o.totalCost||0;tR+=r;tC+=c;if(d.toDateString()===today){dR+=r;dC+=c;}if(d.getMonth()===cm){mR+=r;mC+=c;}});
    return{totalRevenue:tR,totalCost:tC,totalProfit:tR-tC,todayRevenue:dR,todayCost:dC,todayProfit:dR-dC,monthRevenue:mR,monthCost:mC,monthProfit:mR-mC,totalOrders:orders.length};
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
  {keywords:['ราคา','เท่าไหร่','กี่บาท'],answer:'สามารถดูราคาสินค้าได้ที่หน้า "สั่งสินค้า" ค่ะ 💕'},
  {keywords:['กระดุม','echo'],answer:'💎 แพ็คกระดุม:\n• 66 กระดุม = พรีไว 29฿\n• 203 กระดุม = พรีไว 90฿\n• 335 กระดุม = พรีไว 145฿\n• 759 กระดุม = พรีไว 285฿'},
  {keywords:['สกิน','skin'],answer:'✨ สกินดูได้ที่หน้า "สั่งสินค้า" หรือ "ส่งสกิน" ค่ะ'},
  {keywords:['ส่วนลด','โปร'],answer:'🎉 ดูโปรทั้งหมดที่หน้าแรกค่ะ'},
  {keywords:['ติดต่อ','แอดมิน','facebook'],answer:'📞 ติดต่อ Facebook: Sherly Panty ค่ะ 💕'},
  {keywords:['วิธี','สั่ง','ยังไง'],answer:'📋 วิธีสั่ง:\n1. สมัครสมาชิก\n2. เลือกสินค้า\n3. ชำระเงิน\n4. แคปสลิปส่งแอดมิน\n5. รอรับสินค้า 🐰'},
  {keywords:['พรีไว','private'],answer:'🔑 พรีไวคือแบบเติมที่ลงทะเบียนแค่ครั้งแรก เติมเร็ว 1-10 นาที!'},
  {keywords:['เช่า','rent','ไอดี'],answer:'🎮 ดูไอดีปล่อยเช่าได้ที่หน้า "ปล่อยเช่า" ค่ะ'},
  {keywords:['ขอบคุณ','thank'],answer:'ยินดีค่ะ~ 🐰💕'},
];
