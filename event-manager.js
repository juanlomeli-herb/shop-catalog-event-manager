(function () {

    var root = document.querySelector("#subcategory");
    if (!root) return;

    /* =========================
       1️⃣ PAGE LOAD
    ==========================*/
    document.addEventListener("DOMContentLoaded", function () {

        var total = root.querySelector("[data-bind*='totalProducts']")?.innerText || "";
        var title = root.querySelector(".title-arrow")?.innerText.trim() || "";

        console.log("Page Loaded:", title);

        if (window.coveoua) {
            window.coveoua('send', 'event', 'Search', 'PageLoad', {
                title: title,
                totalResults: total
            });
        }
    });


    /* =========================
       2️⃣ CLICK EN PRODUCTO
    ==========================*/
    root.addEventListener("click", function (e) {

        var link = e.target.closest(".product-info");
        if (!link) return;

        var item = link.closest(".item");
        if (!item) return;

        var name = item.querySelector(".name")?.innerText.trim();
        var sku = item.querySelector(".sku")?.innerText.replace("SKU", "").trim();
        var price =
            item.querySelector("[data-bind*='YourPrice']")?.innerText.trim() ||
            item.querySelector("[data-bind*='Price']")?.innerText.trim();

        console.log("Product Click:", name);

        if (window.coveoua) {
            window.coveoua('send', 'event', 'Search', 'ProductClick', {
                name: name,
                sku: sku,
                price: price
            });
        }
    });


    /* =========================
       3️⃣ ADD TO CART
    ==========================*/

    // Detectar cuando aparece el mensaje de confirmación real
    var confirmBox = root.querySelector(".add-confirm");
    if (!confirmBox) return;

    var observer = new MutationObserver(function () {

        // Si el bloque se vuelve visible
        if (confirmBox.style.display !== "none") {

            var lastClicked = window.__LAST_PRODUCT__;

            if (lastClicked && window.coveoua) {
                window.coveoua('send', 'event', 'Ecommerce', 'AddToCart', lastClicked);
                console.log("AddToCart enviado:", lastClicked);
            }
        }
    });

    observer.observe(confirmBox, { attributes: true, attributeFilter: ["style"] });


    // Guardar último producto clickeado en botón Add
    root.addEventListener("click", function (e) {

        var btn = e.target.closest(".btn-add-cart");
        if (!btn) return;

        var item = btn.closest(".item");
        if (!item) return;

        var name = item.querySelector(".name")?.innerText.trim();
        var sku = item.querySelector(".sku")?.innerText.replace("SKU", "").trim();
        var qty = item.querySelector("input[type='number']")?.value || 1;

        window.__LAST_PRODUCT__ = {
            name: name,
            sku: sku,
            quantity: qty
        };

    });

})();
