/* js/script.js
   Central script:
   - register(), login(), logout()
   - product management (seed / load / save)
   - katalog render + addToCart
   - keranjang render + removeItem + clearCart + checkout (simpan lastOrder)
   - profile load & update
   - admin add/edit/delete products (localStorage)
   - theme toggle (light/dark)
*/

/* ---------- THEME ---------- */
const THEME_KEY = 'siteTheme';
function applyTheme(t){
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem(THEME_KEY, t);
}
function initTheme(){
  const t = localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(t);
}
initTheme();

/* ---------- USER AUTH (uses keys: nama, username, password) ---------- */
function register(){
  const nama = document.getElementById('nama')?.value || '';
  const username = document.getElementById('regusername')?.value || '';
  const password = document.getElementById('regpassword')?.value || '';

  if(!nama || !username || !password){
    alert('Semua kolom harus diisi!');
    return;
  }
  // simpan user
  localStorage.setItem('nama', nama);
  localStorage.setItem('username', username);
  localStorage.setItem('password', password);

  alert('Registrasi sukses. Silakan login.');
  window.location.href = 'login.html';
}

function login(){
  const inputUsername = document.getElementById('loginusername')?.value || '';
  const inputPassword = document.getElementById('loginpassword')?.value || '';

  const savedUsername = localStorage.getItem('username');
  const savedPassword = localStorage.getItem('password');

  if(!inputUsername || !inputPassword){ alert('Semua kolom harus diisi!'); return; }

  if(inputUsername === savedUsername && inputPassword === savedPassword){
    localStorage.setItem('isLogin', 'true'); // status login
    alert('Login berhasil!');
    // redirect ke dashboard or katalog depending on existence
    if (location.pathname.includes('login.html')) {
      // prefer direct to katalog
      window.location.href = 'katalog.html';
    } else {
      window.location.href = 'katalog.html';
    }
  } else {
    alert('Username atau password salah!');
  }
}

function logout(){
  localStorage.removeItem('isLogin');
  // keep user details but remove login session
  alert('Logout berhasil!');
  window.location.href = 'login.html';
}
/* Protect page utility */
function requireLogin(redirectPage='login.html'){
  const status = localStorage.getItem('isLogin');
  if(status !== 'true'){
    window.location.href = redirectPage;
    return false;
  }
  return true;
}

/* ---------- PRODUCTS (localStorage key: products) ---------- */
const PRODUCTS_KEY = 'products';
function seedProductsIfEmpty(){
  let p = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || 'null');
  if(!p){
    p = [
      { id:1, name:'Sepatu Nike Air', price:350000, img:'https://i.imgur.com/XB7YFUy.png', category:'Sepatu' },
      { id:2, name:'Sepatu Adidas Run', price:420000, img:'https://i.imgur.com/jTjIU0c.png', category:'Sepatu' },
      { id:3, name:'Jaket Varsity', price:280000, img:'https://i.imgur.com/NCXuy6v.png', category:'Jaket' },
      { id:4, name:'Jaket Bomber', price:310000, img:'https://i.imgur.com/1xWoX5b.png', category:'Jaket' },
      { id:5, name:'Baju Kaos Distro', price:150000, img:'https://i.imgur.com/8HsEwk2.png', category:'Baju' },
      { id:6, name:'Baju Kemeja Flanel', price:190000, img:'https://i.imgur.com/Vm8Gwbg.png', category:'Baju' }
    ];
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(p));
  }
}
function getProducts(){ seedProductsIfEmpty(); return JSON.parse(localStorage.getItem(PRODUCTS_KEY)); }
function saveProducts(arr){ localStorage.setItem(PRODUCTS_KEY, JSON.stringify(arr)); }

/* ---------- KATALOG (katalog.html) ---------- */
function renderKatalog(){
  const container = document.getElementById('product-list');
  if(!container) return;
  const products = getProducts();
  container.innerHTML = '';
  products.forEach(p => {
    const col = document.createElement('div');
    col.className = 'col-md-4 mb-4';
    col.innerHTML = `
      <div class="card menu-card">
        <img src="${p.img}" class="img-thumb" alt="${p.name}">
        <div style="padding:12px;">
          <h5>${p.name}</h5>
          <p class="small-muted">${p.category}</p>
          <p class="fw-bold text-success">Rp ${p.price.toLocaleString()}</p>
          <div style="display:flex; gap:8px; margin-top:8px;">
            <button class="btn btn-primary w-50" onclick="addToCart(${p.id})">Tambah ke Keranjang</button>
            <button class="btn btn-outline-secondary w-50" onclick="viewDetail(${p.id})">Detail</button>
          </div>
        </div>
      </div>
    `;
    container.appendChild(col);
  });
}

/* detail view can be simple modal or redirect — here redirect to detail.html with id param */
function viewDetail(id){
  window.location.href = 'detail.html?id=' + id;
}

/* ---------- CART (localStorage key: cart) ---------- */
function addToCart(id){
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const p = getProducts().find(x => x.id === id);
  if(!p){ alert('Produk tidak ditemukan'); return; }
  cart.push(p);
  localStorage.setItem('cart', JSON.stringify(cart));
  alert('Produk ditambahkan ke keranjang!');
}

function renderCartTable(){
  const tbody = document.getElementById('cart-body');
  if(!tbody) return;
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  if(cart.length === 0){
    tbody.innerHTML = `<tr><td colspan="3">Keranjang masih kosong</td></tr>`;
    document.getElementById('totalPrice').innerText = 'Rp 0';
    return;
  }
  let rows = '';
  let total = 0;
  cart.forEach((it, idx) => {
    rows += `<tr>
        <td>${it.name}</td>
        <td>Rp ${it.price.toLocaleString()}</td>
        <td><button class="btn btn-danger btn-sm" onclick="removeItem(${idx})">Hapus</button></td>
    </tr>`;
    total += it.price;
  });
  tbody.innerHTML = rows;
  document.getElementById('totalPrice').innerText = 'Rp ' + total.toLocaleString();
}

function removeItem(i){
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.splice(i,1);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCartTable();
}

function clearCart(){
  if(!confirm('Hapus semua item keranjang?')) return;
  localStorage.removeItem('cart');
  renderCartTable();
}

function checkout(){
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  if(cart.length === 0){ alert('Keranjang kosong'); return; }
  // simpan lastOrder untuk invoice
  localStorage.setItem('lastOrder', JSON.stringify(cart));
  localStorage.removeItem('cart');
  window.location.href = 'invoice.html';
}

/* ---------- PROFILE ---------- */
function loadProfile(){
  if(!requireLogin()) return;
  const nama = localStorage.getItem('nama') || '';
  const username = localStorage.getItem('username') || '';
  document.getElementById('profile_nama').value = nama;
  document.getElementById('profile_username').value = username;
}

function saveProfile(){
  const nama = document.getElementById('profile_nama').value || '';
  const username = document.getElementById('profile_username').value || '';
  const password = document.getElementById('profile_password').value || '';
  if(!nama || !username){ alert('Nama dan username wajib diisi'); return; }
  localStorage.setItem('nama', nama);
  localStorage.setItem('username', username);
  if(password) localStorage.setItem('password', password);
  alert('Profile diperbarui');
  window.location.reload();
}

/* ---------- ADMIN (simple password 'admin123' prompt) ---------- */
function requireAdmin(){
  const adminFlag = sessionStorage.getItem('isAdmin'); // session only
  if(adminFlag === 'true') return true;
  const pass = prompt('Masukkan password admin:');
  if(pass === 'admin123'){
    sessionStorage.setItem('isAdmin', 'true');
    return true;
  }
  alert('Password admin salah');
  return false;
}

function renderAdminProducts(){
  if(!requireAdmin()) return;
  const list = document.getElementById('admin-products');
  const products = getProducts();
  list.innerHTML = '';
  products.forEach(p => {
    const row = document.createElement('div');
    row.className = 'd-flex align-items-center justify-content-between mb-2 card p-2';
    row.innerHTML = `
      <div>
        <b>${p.name}</b><br><span class="small-muted">${p.category} • Rp ${p.price.toLocaleString()}</span>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn btn-sm btn-primary" onclick="editProduct(${p.id})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteProduct(${p.id})">Hapus</button>
      </div>
    `;
    list.appendChild(row);
  });
}

function addProduct(){
  if(!requireAdmin()) return;
  const name = document.getElementById('prod_name').value;
  const price = parseInt(document.getElementById('prod_price').value || 0);
  const img = document.getElementById('prod_img').value || 'https://via.placeholder.com/400x300';
  const category = document.getElementById('prod_cat').value || 'Uncategorized';
  if(!name || !price){ alert('Nama & harga wajib diisi'); return; }

  const products = getProducts();
  const id = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
  products.push({ id, name, price, img, category });
  saveProducts(products);
  alert('Produk ditambahkan');
  document.getElementById('prod_name').value=''; document.getElementById('prod_price').value=''; document.getElementById('prod_img').value=''; document.getElementById('prod_cat').value='';
  renderAdminProducts();
}

function deleteProduct(id){
  if(!requireAdmin()) return;
  if(!confirm('Hapus produk ini?')) return;
  let products = getProducts();
  products = products.filter(p => p.id !== id);
  saveProducts(products);
  renderAdminProducts();
  // re-render katalog if on that page
  if(document.getElementById('product-list')) renderKatalog();
}

function editProduct(id){
  if(!requireAdmin()) return;
  const products = getProducts();
  const p = products.find(x=>x.id===id);
  if(!p) return alert('Produk tidak ditemukan');
  // Fill form for editing
  document.getElementById('prod_name').value = p.name;
  document.getElementById('prod_price').value = p.price;
  document.getElementById('prod_img').value = p.img;
  document.getElementById('prod_cat').value = p.category;
  document.getElementById('prod_add_btn').style.display='none';
  document.getElementById('prod_save_btn').style.display='inline-block';
  document.getElementById('prod_save_btn').dataset.editId = id;
}

function saveEdit(){
  const id = parseInt(document.getElementById('prod_save_btn').dataset.editId);
  if(!id) return;
  const products = getProducts();
  const p = products.find(x=>x.id===id);
  if(!p) return alert('Produk tidak ditemukan');
  p.name = document.getElementById('prod_name').value;
  p.price = parseInt(document.getElementById('prod_price').value || 0);
  p.img = document.getElementById('prod_img').value || p.img;
  p.category = document.getElementById('prod_cat').value || p.category;
  saveProducts(products);
  alert('Perubahan disimpan');
  document.getElementById('prod_name').value=''; document.getElementById('prod_price').value=''; document.getElementById('prod_img').value=''; document.getElementById('prod_cat').value='';
  document.getElementById('prod_add_btn').style.display='inline-block';
  document.getElementById('prod_save_btn').style.display='none';
  renderAdminProducts();
  if(document.getElementById('product-list')) renderKatalog();
}

/* ---------- UTILITY: run initializers on pages ---------- */
document.addEventListener('DOMContentLoaded', function(){
  // if katalog page exists
  if(document.getElementById('product-list')) {
    renderKatalog();
  }
  // if cart page exists
  if(document.getElementById('cart-body')) {
    renderCartTable();
  }
  // if profile page exists
  if(document.getElementById('profile_nama')) {
    loadProfile();
  }
  // if admin page exists
  if(document.getElementById('admin-products')) {
    renderAdminProducts();
  }
});
