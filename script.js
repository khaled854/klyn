// ==================================================
// ====== المتغيرات الأساسية ======
// ==================================================
let cart = [];
const cartDiv = document.getElementById("cart");
const clearCartBtn = document.getElementById("clear-cart-btn");


// ==================================================
// ====== تحميل السلة من LocalStorage ======
// ==================================================
let savedCart = localStorage.getItem("cart");
if (savedCart) {
    cart = JSON.parse(savedCart);
}


// ==================================================
// ====== حفظ السلة ======
// ==================================================
function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}


// ==================================================
// ====== تحديث السلة ======
// ==================================================
function updateCart() {

    cartDiv.innerHTML = "";

    if (cart.length === 0) {
        cartDiv.textContent = "السلة فارغة";
        if (clearCartBtn) clearCartBtn.style.display = "none";
        return;
    }

    if (clearCartBtn) clearCartBtn.style.display = "inline-block";

    cart.forEach((item, i) => {
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `
            ${item.name} - ${item.color} - ${item.size} - Qty: ${item.qty} - السعر: ${item.price * item.qty} جنيه
            <button class="remove-btn" data-index="${i}">حذف</button>
        `;
        cartDiv.appendChild(div);
    });

    document.querySelectorAll(".remove-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const index = parseInt(btn.dataset.index);
            if (confirm("هل تريد الحذف؟")) {
                cart.splice(index, 1);
                updateCart();
                saveCart();
            }
        });
    });
}


// ==================================================
// ====== التحكم في إظهار الأقسام ======
// ==================================================
function showSection(sectionId) {
    document.querySelectorAll("main section").forEach(sec => {
        sec.style.display = "none";
    });

    const target = document.getElementById(sectionId);
    if (target) {
        target.style.display = "block";
    }
}

// ربط لينكات الـ navbar
document.querySelectorAll("nav a").forEach(link => {
    link.addEventListener("click", function (e) {
        const id = this.getAttribute("href").replace("#", "");
        if (document.getElementById(id)) {
            e.preventDefault();
            showSection(id);
        }
    });
});


// ==================================================
// ====== زر حذف كل المنتجات ======
// ==================================================
if (clearCartBtn) {
    clearCartBtn.addEventListener("click", () => {
        if (cart.length === 0) return;
        if (confirm("هل أنت متأكد من حذف كل المنتجات في السلة؟")) {
            cart = [];
            updateCart();
            saveCart();
        }
    });
}


// ==================================================
// ====== إضافة منتج للسلة ======
// ==================================================
document.querySelectorAll(".add-cart-btn").forEach(btn => {
    btn.addEventListener("click", () => {

        const ok = confirm("هل أنت متأكد من إضافة هذا المنتج إلى السلة؟");
        if (!ok) return;

        const card = btn.closest(".product-card");
        const name = card.querySelector("h3").textContent;
        const color = card.querySelector(".color-select").value;
        const size = card.querySelector(".size-select").value;
        const qty = parseInt(card.querySelector(".quantity").value);
        const price = parseFloat(card.querySelector("h3").dataset.price);

        let existing = cart.find(p =>
            p.name === name &&
            p.color === color &&
            p.size === size
        );

        if (existing) {
            existing.qty += qty;
        } else {
            cart.push({ name, color, size, qty, price });
        }

        updateCart();
        saveCart();
    });
});


// ==================================================
// ====== تنبيه عند مغادرة الصفحة ======
// ==================================================
window.addEventListener("beforeunload", function (e) {
    if (cart.length > 0) {
        e.preventDefault();
        e.returnValue = "لديك منتجات في السلة، هل تريد الاحتفاظ بها؟";
    }
});


// ==================================================
// ====== إرسال الطلب ======
// ==================================================
const customerForm = document.getElementById("customerForm");
if (customerForm) {
    customerForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const phone1 = document.getElementById("phone1").value.trim();
        const phone2 = document.getElementById("phone2").value.trim();
        const city = document.getElementById("city").value.trim();
        const street = document.getElementById("street").value.trim();
        const area = document.getElementById("area").value.trim();
        const notes = document.getElementById("notes").value.trim();

        if (!name || !phone1 || !phone2 || !city || !street || !area) {
            alert("يرجى ملء كل الحقول الضرورية");
            return;
        }

        if (cart.length === 0) {
            alert("السلة فارغة");
            return;
        }

        if (!confirm("ستدفع جزء من المبلغ قبل الاستلام. هل تريد المتابعة؟")) return;

        let total = 0;
        let productText = cart.map((p, index) => {
            let subtotal = p.qty * p.price;
            total += subtotal;
            return `${index + 1}. ${p.name} - اللون: ${p.color} - المقاس: ${p.size} - الكمية: ${p.qty} - السعر: ${subtotal} جنيه`;
        }).join("%0A");

        let msg =
            `🛒 طلب جديد من Klyn Hoodies%0A%0A` +
            `👤 الاسم: ${name}%0A` +
            `📞 رقم الهاتف 1: ${phone1}%0A` +
            `📞 رقم الهاتف 2: ${phone2}%0A` +
            `🏙️ المحافظة: ${city}%0A` +
            `🏠 الشارع: ${street}%0A` +
            `📍 المنطقة: ${area}%0A` +
            (notes ? `📝 ملاحظات: ${notes}%0A` : "") +
            `%0A📦 المنتجات:%0A${productText}%0A` +
            `%0A💰 الإجمالي: ${total} جنيه%0A` +
            `%0A✅ سيتم دفع جزء من المبلغ قبل الاستلام.`;

        window.open(`https://wa.me/201034704595?text=${msg}`, "_blank");

        cart = [];
        updateCart();
        localStorage.removeItem("cart");
    });
}


// ==================================================
// ====== Carousel ======
// ==================================================
const track = document.querySelector(".product-track");
const prevBtn = document.querySelector(".carousel-btn.prev");
const nextBtn = document.querySelector(".carousel-btn.next");

let scrollAmount = 0;
const cardWidth = 265;

if (prevBtn) {
    prevBtn.addEventListener("click", () => {
        scrollAmount -= cardWidth;
        if (scrollAmount < 0) scrollAmount = 0;
        track.style.transform = `translateX(-${scrollAmount}px)`;
    });
}

if (nextBtn) {
    nextBtn.addEventListener("click", () => {
        scrollAmount += cardWidth;
        const maxScroll = track.scrollWidth - track.parentElement.offsetWidth;
        if (scrollAmount > maxScroll) scrollAmount = maxScroll;
        track.style.transform = `translateX(-${scrollAmount}px)`;
    });
}


// ==================================================
// ====== السحب باللمس ======
// ==================================================
let startX, isDown = false;
if (track) {
    track.addEventListener("pointerdown", e => {
        isDown = true;
        startX = e.pageX;
        track.style.cursor = "grabbing";
    });

    track.addEventListener("pointerup", () => {
        isDown = false;
        track.style.cursor = "grab";
    });

    track.addEventListener("pointerleave", () => {
        isDown = false;
        track.style.cursor = "grab";
    });

    track.addEventListener("pointermove", e => {
        if (!isDown) return;
        let walk = (startX - e.pageX);
        const maxScroll = track.scrollWidth - track.parentElement.offsetWidth;
        scrollAmount += walk;
        if (scrollAmount < 0) scrollAmount = 0;
        if (scrollAmount > maxScroll) scrollAmount = maxScroll;
        track.style.transform = `translateX(-${scrollAmount}px)`;
        startX = e.pageX;
    });
}


// ==================================================
// ====== تبديل اللغة ======
// ==================================================
function switchLang(lang) {

    document.querySelectorAll(".label-text").forEach(span => {
        span.textContent = span.parentElement.dataset[lang];
    });

    document.querySelectorAll("input[data-ar], textarea[data-ar]").forEach(el => {
        el.placeholder = lang === "ar" ? el.dataset.ar : el.dataset.en;
    });

    document.querySelectorAll("select").forEach(select => {
        Array.from(select.options).forEach(opt => {
            if (opt.dataset.ar) {
                opt.textContent = lang === "ar" ? opt.dataset.ar : opt.dataset.en;
            }
        });
    });

    document.querySelectorAll("[data-ar]").forEach(el => {
        if (!el.querySelector("input, textarea, select") && !el.classList.contains("label-text")) {
            el.textContent = lang === "ar" ? el.dataset.ar : el.dataset.en;
        }
    });
}

const langArBtn = document.getElementById("lang-ar");
const langEnBtn = document.getElementById("lang-en");

if (langArBtn) langArBtn.addEventListener("click", () => switchLang("ar"));
if (langEnBtn) langEnBtn.addEventListener("click", () => switchLang("en"));


// ==================================================
// ====== تشغيل أولي ======
// ==================================================
updateCart();
showSection("home");
