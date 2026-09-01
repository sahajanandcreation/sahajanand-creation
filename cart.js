const WHATSAPP_NUMBER = "917862061524";
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzOUL53mZhFCxosebEV9t53jdXpCdeR0EVW9UsTKy2Akg-U2dA--tQFfRYQ8k6Q7Nk1/exec";

let cart = {};

function renderProducts(gridId, productList){
  const el = document.getElementById(gridId);
  if(!el) return;
  el.innerHTML = productList.map(p=>{
    const unit = p.unit || "";
    return `
    <div class="prod">
      <div class="prod-art"><img src="${p.img}" alt="${p.name}"></div>
      <div class="prod-body">
        <div class="prod-name">${p.name}</div>
        <div class="prod-desc">${p.desc}</div>
        <div class="price-row"><span class="prod-price">₹${p.price}${unit}</span></div>
        <button class="add-btn" id="btn-${p.id}" onclick="addToCart('${p.id}','${p.name.replace(/'/g,"")}',${p.price})">કાર્ટમાં ઉમેરો</button>
      </div>
    </div>`;
  }).join("");
}

function addToCart(id, name, price){
  if(cart[id]) cart[id].qty += 1;
  else cart[id] = {name, price, qty:1};
  updateCartUI();
  const btn = document.getElementById("btn-"+id);
  if(!btn) return;
  const original = btn.textContent;
  btn.textContent = "ઉમેરાયું ✓";
  btn.disabled = true;
  setTimeout(()=>{ btn.textContent = original; btn.disabled = false; }, 900);
}

function changeQty(id, delta){
  if(!cart[id]) return;
  cart[id].qty += delta;
  if(cart[id].qty <= 0) delete cart[id];
  updateCartUI();
}

function removeItem(id){
  delete cart[id];
  updateCartUI();
}

function updateCartUI(){
  const ids = Object.keys(cart);
  const count = ids.reduce((s,id)=>s+cart[id].qty,0);
  const countEl = document.getElementById("cartCount");
  if(countEl) countEl.textContent = count;

  const body = document.getElementById("drawerBody");
  if(body){
    if(ids.length === 0){
      body.innerHTML = `<div class="cart-empty">તમારી કાર્ટ ખાલી છે<br>પ્રોડક્ટ પસંદ કરીને ઉમેરો</div>`;
    } else {
      body.innerHTML = ids.map(id=>{
        const it = cart[id];
        return `
        <div class="cart-item">
          <div style="flex:1">
            <div class="cart-item-name">${it.name}</div>
            <div class="cart-item-price">₹${it.price} x ${it.qty} = ₹${it.price*it.qty}</div>
            <div class="qty-ctrl">
              <button onclick="changeQty('${id}',-1)">−</button>
              <span>${it.qty}</span>
              <button onclick="changeQty('${id}',1)">+</button>
              <button class="cart-item-remove" onclick="removeItem('${id}')">દૂર કરો</button>
            </div>
          </div>
        </div>`;
      }).join("");
    }
  }

  const total = ids.reduce((s,id)=>s+cart[id].price*cart[id].qty,0);
  const totalEl = document.getElementById("totalAmt");
  if(totalEl) totalEl.textContent = "₹"+total;
}

function openCart(){
  document.getElementById("overlay").classList.add("open");
  document.getElementById("drawer").classList.add("open");
}
function closeCart(){
  document.getElementById("overlay").classList.remove("open");
  document.getElementById("drawer").classList.remove("open");
}

function buildOrderText(ids){
  let msg = "નમસ્તે, મારે નીચેની વસ્તુઓ ઓર્ડર કરવી છે:\n\n";
  let total = 0;
  ids.forEach(id=>{
    const it = cart[id];
    msg += `• ${it.name} x ${it.qty} = ₹${it.price*it.qty}\n`;
    total += it.price*it.qty;
  });
  msg += `\nકુલ રકમ: ₹${total}`;
  return msg;
}

function buildItemsSummary(ids){
  return ids.map(id=>{
    const it = cart[id];
    return `${it.name} x ${it.qty} (₹${it.price*it.qty})`;
  }).join(", ");
}

function logOrderToSheet(ids){
  if(!GOOGLE_SCRIPT_URL) return;
  const total = ids.reduce((s,id)=>s+cart[id].price*cart[id].qty,0);
  const payload = { items: buildItemsSummary(ids), total: total };
  try{
    fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {"Content-Type":"text/plain;charset=utf-8"},
      body: JSON.stringify(payload)
    });
  }catch(err){ /* silent fail, order still goes via WhatsApp */ }
}

function openWhatsappTextOnly(msg){
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
}

function sendOrder(){
  const ids = Object.keys(cart);
  if(ids.length === 0){
    alert("કૃપા કરી પહેલા કાર્ટમાં પ્રોડક્ટ ઉમેરો");
    return;
  }
  const msg = buildOrderText(ids);
  logOrderToSheet(ids);
  openWhatsappTextOnly(msg);
}

updateCartUI();
