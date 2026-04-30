// CONSTANTS
const ADMIN_PASSWORD = "TwoKies123";

/* STORAGE HELPERS */
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

/* ADMIN LOGIC */
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
    byId("goConcessionsBtn").onclick = () => showAdminSection("concessionAdmin");
    byId("goReportsBtn").onclick = () => {
        showAdminSection("reportAdmin");
        refreshAdminUI(); 
    };
    byId("logoutBtn").onclick = () => location.reload();

    // Save Concession (Category & Status)
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
}

function showAdminSection(id) {
    ["adminMenu", "concessionAdmin", "reportAdmin"].forEach(sec => {
        if (byId(sec)) byId(sec).style.display = (sec === id) ? "block" : "none";
    });
}

// Requirement: Record inventory restocks and adjustments
function adjustStock(id) {
    const qty = parseInt(prompt("Enter quantity change (e.g. 10 for restock, -5 for waste):"));
    const reason = prompt("Reason (e.g. Restock, Damaged, Adjustment):");
    if (isNaN(qty) || !reason) return;

    const items = getConcessions();
    const item = items.find(i => i.id === id);
    item.stock += qty;
    saveConcessions(items);

    const logs = getRestockLogs();
    logs.push({ date: new Date().toLocaleString(), name: item.name, change: qty, reason: reason });
    saveRestockLogs(logs);
    refreshAdminUI();
}

// Requirement: POS flow for employees
function sellFromAdmin(id) {
    const qty = parseInt(prompt("Quantity to sell:"), 10);
    if (isNaN(qty) || qty <= 0) return;

    const items = getConcessions();
    const item = items.find(i => i.id === id);
    if (item.stock < qty) return alert("Insufficient stock!");

    item.stock -= qty;
    saveConcessions(items);

    const sales = getSales();
    sales.push({ 
        timestamp: new Date().toLocaleString(), 
        item: item.name, 
        qty: qty, 
        total: (item.price * qty).toFixed(2) 
    });
    saveSales(sales);
    refreshAdminUI();
}

function toggleStatus(id) {
    const items = getConcessions();
    const item = items.find(i => i.id === id);
    item.active = !item.active;
    saveConcessions(items);
    refreshAdminUI();
}

function refreshAdminUI() {
    const conList = byId("adminConcessionList");
    if (conList) {
        conList.innerHTML = getConcessions().map(c => `
            <li style="padding: 10px; border-bottom: 1px solid #ddd;">
                <strong>${c.name}</strong> (${c.category}) | Stock: ${c.stock} | $${c.price.toFixed(2)} [${c.active ? 'Active' : 'Inactive'}]
                <br>
                <button onclick="sellFromAdmin(${c.id})">Sell (POS)</button>
                <button onclick="adjustStock(${c.id})">Adjust Stock</button>
                <button onclick="toggleStatus(${c.id})">Toggle Status</button>
            </li>
        `).join("");
    }

    const reportDiv = byId("reportOutput");
    if (reportDiv) {
        const sales = getSales();
        const logs = getRestockLogs();
        reportDiv.innerHTML = `
            <h4>Sales History</h4>
            ${sales.length ? sales.map(s => `<p>${s.timestamp}: ${s.item} x${s.qty} - $${s.total}</p>`).join("") : "No sales."}
            <hr>
            <h4>Inventory Logs</h4>
            ${logs.length ? logs.map(l => `<p>${l.date}: ${l.name} (${l.change > 0 ? '+' : ''}${l.change}) - ${l.reason}</p>`).join("") : "No logs."}
        `;
    }
}

/* CUSTOMER LOGIC */
function initSchedulePage() {
    renderCustomerConcessions();
    updateCartDisplay();
    byId("checkoutBtn").onclick = handleCheckout;
}

function renderCustomerConcessions() {
    const area = byId("concessionArea");
    if (!area) return;
    area.innerHTML = getConcessions().filter(c => c.active).map(c => `
        <div class="concession-card">
            <strong>${c.name}</strong><br>${c.category}<br>$${c.price.toFixed(2)}<br>
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
        const sub = i.price * i.qty;
        grandTotal += sub;
        return `<li>${i.name} x ${i.qty} - $${sub.toFixed(2)}</li>`;
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
        if (masterItem.stock < cartItem.qty) return alert(`Not enough stock for ${masterItem.name}`);
        masterItem.stock -= cartItem.qty;
        sales.push({ timestamp: new Date().toLocaleString(), item: cartItem.name, qty: cartItem.qty, total: (cartItem.price * cartItem.qty).toFixed(2) });
    }

    saveConcessions(concessions);
    saveSales(sales);
    saveCart([]);
    alert("Order successful!");
    location.reload();
}
