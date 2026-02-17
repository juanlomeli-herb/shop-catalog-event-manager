(function () {

    /* ================================
       LOAD COVEO UA
    ================================= */
    (function (c, o, v, e, O, u, a) {
        a = 'coveoua';
        c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments) };
        c[a].t = Date.now();
        u = o.createElement(v); u.async = 1; u.src = e;
        O = o.getElementsByTagName(v)[0]; O.parentNode.insertBefore(u, O);
    })(window, document, 'script', 'https://static.cloud.coveo.com/coveo.analytics.js/2/coveoua.js');


    /* ================================
       GLOBAL CONFIG
    ================================= */

    function detectEnvironment() {
        const host = window.location.hostname.toLowerCase();
        if (host.includes("localhost")) return "local";
        if (host.includes("q")) return "qa01";
        if (host.includes("u")) return "uat";
        if (host.includes("s")) return "stage";
        if (host.includes("p")) return "prod";
        return "unknown";
    }

    function detectCurrencyFromSymbol() {
        const symbol = document.querySelector(".price-symbol-left")?.innerText?.trim();
        if (!symbol) return "USD";

        const currencies = Intl.supportedValuesOf('currency');

        for (const currency of currencies) {
            const parts = new Intl.NumberFormat('en', {
                style: 'currency',
                currency
            }).formatToParts(1);

            const currencySymbol = parts.find(p => p.type === 'currency')?.value;

            if (currencySymbol === symbol) {
                return currency;
            }
        }

        return "USD";
    }

    function isAnonymousUser() {
        return !document.cookie
            .split("; ")
            .some(cookie => cookie.startsWith("coveo_visitorId="));
    }

    /* ================================
       DERIVED GLOBALS
    ================================= */

    const pathParts = window.location.pathname.split("/");
    const locale = pathParts[1]?.toLowerCase().replace("-", "_") || "";
    const language = locale.split("_")[0];
    const environment = detectEnvironment();
    const searchHub = `ds_${locale}_myhl_search_${environment}`;
    const currencyCode = detectCurrencyFromSymbol();
    const isAnonymous = isAnonymousUser();
    const searchQueryUid = crypto.randomUUID();

    window._searchQueryUid = searchQueryUid;

    /* ================================
       INIT COVEO
    ================================= */

    coveoua('set', 'language', language);
    coveoua('set', 'currencyCode', currencyCode);
    coveoua('set', 'trackingId', searchHub);
    coveoua('set', 'searchHub', searchHub);

    coveoua(
        'init',
        "xx002baef0-c992-4354-8a11-b4af0aea92f8",
        "https://jayakrishnansconsultantherbalifecomneighbouringturymtx1wo4.analytics.org.coveo.com"
    );

    /* ================================
       PAGE DETECTION
    ================================= */

    document.addEventListener("DOMContentLoaded", function () {

        const isSearchPage = !!document.querySelector("#subcategory");
        const isProductPage = !!document.querySelector("#product");

        if (isSearchPage) {
            initSearchPage();
        }

        if (isProductPage) {
            initProductPage();
        }

    });


    /* ================================
       SEARCH PAGE MODULE
    ================================= */

    function initSearchPage() {

        console.log("Initializing Search Page Analytics");

        initSearchEvent();
        initSearchClickEvent();
        initSearchAddToCart();

    }

    function initSearchEvent() {

        const totalSpan = document.querySelector(
            ".title-arrow span[data-bind*='totalProducts']"
        );

        if (!totalSpan) return;

        const params = new URLSearchParams(window.location.search);
        const queryText = params.get("searchText");

        if (!queryText) return;

        let searchSent = false;
        const searchStartTime = performance.now();

        const observer = new MutationObserver(function () {

            const total = parseInt(totalSpan.textContent.trim(), 10);
            if (!total || searchSent) return;

            searchSent = true;

            const responseTime = Math.round(performance.now() - searchStartTime);

            coveoua('set', 'custom', {
                context_website: searchHub,
                context_language: language
            });

            coveoua('send', 'search', {
                actionCause: 'searchboxSubmit',
                queryText: queryText,
                numberOfResults: total,
                responseTime: responseTime,
                searchQueryUid: searchQueryUid,
                language: language,
                originLevel1: searchHub,
                originLevel2: 'Products',
                originLevel3: window.location.href,
                anonymous: isAnonymous
            });

            console.log("Search event sent in search page");

        });

        observer.observe(totalSpan, { childList: true });
    }

    function initSearchClickEvent() {

        document.addEventListener("click", function (e) {

            const link = e.target.closest("a.product-info");
            if (!link) return;

            const item = link.closest(".item");
            if (!item) return;

            const name = item.querySelector(".name")?.innerText?.trim() || "";
            const sku = item.querySelector(".sku")?.innerText?.replace("SKU ", "").trim() || "";

            const allItems = Array.from(document.querySelectorAll(".product-list .item"));
            const position = allItems.indexOf(item) + 1;

            coveoua('send', 'click', {
                actionCause: 'documentOpen',
                documentPosition: position,
                documentTitle: name,
                documentUrl: link.href,
                searchQueryUid: searchQueryUid,
                sourceName: 'Products',
                language: language,
                originLevel1: searchHub,
                originLevel2: 'Products',
                originLevel3: window.location.href,
                anonymous: isAnonymous,
                customData: {
                    contentIDKey: 'sku',
                    contentIDValue: sku
                }
            });

            console.log("Product click sent in search page");

        }, true);
    }

    function initSearchAddToCart() {

        document.addEventListener("click", function (e) {

            const btn = e.target.closest(".btn-add-cart");
            if (!btn) return;

            const item = btn.closest(".item");
            if (!item) return;

            const name = item.querySelector(".name")?.innerText?.trim() || "";
            const sku = item.querySelector(".sku")?.innerText?.replace("SKU ", "").trim() || "";

            const priceElement = item.querySelector("[data-bind*='YourPrice']");
            const price = priceElement
                ? parseFloat(priceElement.innerText.replace(",", "").trim())
                : 0;

            const qtyInput = item.querySelector("input.increment");
            const quantity = qtyInput ? parseInt(qtyInput.value, 10) || 1 : 1;

            coveoua('set', 'custom', {
                context_website: searchHub,
                context_language: language
            });

            coveoua('ec:addProduct', {
                id: sku,
                name: name,
                category: "Products",
                price: price,
                quantity: quantity
            });

            coveoua('ec:setAction', 'add');
            coveoua('send', 'event');

            console.log("Add to cart sent in search page");

        }, true);
    }


    /* ================================
       PRODUCT DETAIL MODULE
    ================================= */

    function initProductPage() {

        console.log("Initializing Product Detail Analytics");

        sendProductViewEvent();
        initProductAddToCart();
    }

    function sendProductViewEvent() {

        const priceSelector = "[data-bind*='YourPrice']";
        const nameSelector = "h2.title";
        const skuSelector = ".sku span, .sku";

        const observer = new MutationObserver(() => {

            const priceElement = document.querySelector(priceSelector);
            const nameElement = document.querySelector(nameSelector);

            if (!priceElement || !nameElement) return;

            const priceText = priceElement.innerText.trim();
            if (!priceText) return;

            const name = nameElement.innerText.trim();
            const sku = document
                .querySelector(skuSelector)
                ?.innerText
                ?.replace("SKU ", "")
                ?.trim() || "";

            const price = parseFloat(priceText.replace(",", ""));

            if (!sku || !price) return;

            observer.disconnect();

            coveoua('set', 'custom', {
                context_website: searchHub,
                originLevel1: searchHub,
                context_language: language
            });

            coveoua('ec:addProduct', {
                id: sku,
                name: name,
                category: "Products",
                price: price
            });

            coveoua('ec:setAction', 'detail');
            coveoua('send', 'event');

        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log("Product view event sent in detail page");
    }


    function initProductAddToCart() {

        document.addEventListener("click", function (e) {

            const btn = e.target.closest(".btn-add-cart-large, .btn-add-cart");
            if (!btn) return;

            const name = document.querySelector("h2.title")?.innerText?.trim() || "";
            const sku = document.querySelector(".sku span, .sku")?.innerText?.replace("SKU ", "").trim() || "";

            const priceElement = document.querySelector("[data-bind*='YourPrice']");
            const price = priceElement
                ? parseFloat(priceElement.innerText.replace(",", "").trim())
                : 0;

            const qtyInput = document.querySelector("input.increment");
            const quantity = qtyInput ? parseInt(qtyInput.value, 10) || 1 : 1;

            coveoua('ec:addProduct', {
                id: sku,
                name: name,
                category: "Products",
                price: price,
                quantity: quantity
            });

            coveoua('ec:setAction', 'add');
            coveoua('send', 'event');

        }, true);

        console.log("Add to cart sent in detail page");
    }




})();
