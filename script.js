// CONSTANTS
const ADMIN_PASSWORD = "TwoKies123";

/* STORAGE HELPERS */
const getMovieCatalog = () => JSON.parse(localStorage.getItem("movieCatalog")) || [];
const saveMovieCatalog = (m) => localStorage.setItem("movieCatalog", JSON.stringify(m));
const getConcessions = () => JSON.parse(localStorage.getItem("concessions")) || [];
const saveConcessions = (c) => localStorage.setItem("concessions", JSON.stringify(c));
const getCart = () => JSON.parse(localStorage.getItem("cart")) || [];
const saveCart = (c) => localStorage.setItem("cart", JSON.stringify(c));
const getSales = () => JSON.parse(localStorage.getItem("sales")) || [];
const saveSales = (s) => localStorage.setItem("sales", JSON.stringify(s));
const getRestockLogs = () => JSON.parse(localStorage.getItem("restockLogs")) || [];
const saveRestockLogs = (l) => localStorage.setItem("restockLogs", JSON.stringify(l));

function byId(id) { return document.getElementById(id); }

/* INIT */
document.addEventListener("DOMContentLoaded", () => {
    if (byId("loginBtn")) initAdminPage();
    if (byId("viewerTheater")) initSchedulePage();
});

/* ADMIN & POS LOGIC */
function initAdminPage() {
    byId("loginBtn").onclick = () => {
        if (byId("adminPassword").value === ADMIN_PASSWORD) {
            byId("loginSection").style.display = "none";
            byId("adminMenu").style.display = "block";
            refreshAdminUI();
        } else {
            byId("loginMessage").textContent = "Incorrect Password";
        }
    };

    // Navigation
    byId("goMoviesBtn").onclick = () => showAdminSection("movieAdmin");
    byId("goConcessionsBtn").onclick = () => showAdminSection("concessionAdmin");
    byId("goReportsBtn").onclick = () => showAdminSection("reportAdmin");
    byId("logoutBtn").onclick = () => location.reload();

    // Save Concession with Category and Status
    byId("saveConcessionBtn").onclick = () => {
        const name = byId("conName").value;
        const price = parseFloat(byId("conPrice").value);
        const stock = parseInt(byId("conStock").value);
        const category = byId("conCategory").value; 

        if (!name || isNaN(price) || isNaN(stock)) return alert("Invalid entry");

        const items = getConcessions();
        items.push({ id: Date.now(), name, price, stock, category, active: true });
        saveConcessions(items);
        refreshAdminUI();
    };

    refreshAdminUI();
}

function showAdminSection(id) {
    ["adminMenu", "movieAdmin", "concessionAdmin", "reportAdmin"].forEach(sec => {
        if (byId(sec)) byId(sec).style.display = (sec === id) ? "block" : "none";
    });
}

function toggleStatus(id) {
    const items = getConcessions();
    const item = items.find(i => i.id === id);
    if (item) item.active = !item.active;
    saveConcessions(items);
    refreshAdminUI();
}

function restockItem(id) {
    const qty = parseInt(prompt("Enter restock quantity:"));
    const reason = prompt("Reason (e.g., Restock, Adjustment):");
    if (isNaN(qty)) return;

    const items = getConcessions();
    const item = items.find(i => i.id === id);
    item.stock += qty;
    saveConcessions(items);

    const logs = getRestockLogs();
    logs.push({ date: new Date().toLocaleString(), name: item.name, change: qty, reason });
    saveRestockLogs(logs);
    refreshAdminUI();
}

function refreshAdminUI() {
    const conList = byId("adminConcessionList");
    if (conList) {
        conList.innerHTML = getConcessions().map(c => `
            <li>
                <strong>${c.name}</strong> (${c.category}) - $${c.price.toFixed(2)} | Stock: ${c.stock} | Status: ${c.active ? 'Active' : 'Inactive'}
                <button onclick="toggleStatus(${c.id})">Toggle Status</button>
                <button onclick="restockItem(${c.id})">Restock/Adjust</button>
            </li>
        `).join("");
    }

    const reportDiv = byId("reportOutput");
    if (reportDiv) {
        const sales = getSales();
        const logs = getRestockLogs();
        reportDiv.innerHTML = `<h3>Sales History</h3>` + sales.map(s => `<p>${s.timestamp}: ${s.item} x${s.qty} - $${s.total}</p>`).join("") +
                              `<h3>Inventory Logs</h3>` + logs.map(l => `<p>${l.date}: ${l.name} (${l.change}) - ${l.reason}</p>`).join("");
    }
}

/* CUSTOMER/POS LOGIC */
function initSchedulePage() {
    renderCustomerConcessions();
    updateCartDisplay();
    byId("checkoutBtn").onclick = handleCheckout;
}

function renderCustomerConcessions() {
    const area = byId("concessionArea");
    if (!area) return;
    // Only show Active items
    area.innerHTML = getConcessions().filter(c => c.active).map(c => `
        <div class="card">
            <strong>${c.name}</strong><br><em>${c.category}</em><br>$${c.price.toFixed(2)}<br>
            <button onclick="addToCart(${c.id})">Add to Order</button>
        </div>
    `).join("");
}

function addToCart(id) {
    const cart = getCart();
    const item = getConcessions().find(c => c.id === id);
    const existing = cart.find(i => i.itemId === id);
    
    if (existing) existing.qty++;
    else cart.push({ itemId: id, name: item.name, price: item.price, qty: 1 });
    
    saveCart(cart);
    updateCartDisplay();
}

function updateCartDisplay() {
    const list = byId("cartList");
    if (!list) return;
    const cart = getCart();
    let grandTotal = 0;
    list.innerHTML = cart.map(i => {
        const subtotal = i.price * i.qty;
        grandTotal += subtotal;
        return `<li>${i.name} x ${i.qty} - $${subtotal.toFixed(2)}</li>`;
    }).join("");
    byId("cartTotal").textContent = grandTotal.toFixed(2);
}

function handleCheckout() {
    const cart = getCart();
    const concessions = getConcessions();
    const sales = getSales();
    
    if (cart.length === 0) return alert("Cart is empty");

    for (let cartItem of cart) {
        let masterItem = concessions.find(c => c.id === cartItem.itemId);
        if (masterItem.stock < cartItem.qty) return alert(`Insufficient stock for ${masterItem.name}`);
        
        masterItem.stock -= cartItem.qty;
        sales.push({ 
            timestamp: new Date().toLocaleString(), 
            item: cartItem.name, 
            qty: cartItem.qty, 
            total: (cartItem.price * cartItem.qty).toFixed(2) 
        });
    }

    saveConcessions(concessions);
    saveSales(sales);
    saveCart([]);
    alert("Purchase successful! Inventory and Sales updated.");
    location.reload();
}
