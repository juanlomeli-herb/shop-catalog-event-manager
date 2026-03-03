(function () {

    /* ================================
       LOAD COVEO UA
    ================================= */
    function loadCoveoScript() {

        return new Promise((resolve) => {

            const scriptUrl = "https://static.cloud.coveo.com/coveo.analytics.js/2/coveoua.js";

            if (window.coveoua && window.coveoua.version) {
                console.log("[COVEO UA] Library already ready");
                resolve();
                return;
            }

            const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);

            if (existingScript) {
                existingScript.addEventListener("load", resolve);
                return;
            }

            const script = document.createElement("script");
            script.src = scriptUrl;
            script.async = true;

            script.onload = () => {
                resolve();
            };

            document.head.appendChild(script);
        });
    }

    /* ================================
       GLOBAL CONFIG
    ================================= */

    const RATE_LIMIT_MAX = 5;
    const RATE_LIMIT_WINDOW = 2000;

    let eventTimestamps = [];

    function canSendAnalytics() {
    const now = Date.now();

    // eliminar eventos fuera de la ventana
    eventTimestamps = eventTimestamps.filter(
        ts => now - ts < RATE_LIMIT_WINDOW
    );

    if (eventTimestamps.length >= RATE_LIMIT_MAX) {
        console.warn("Rate limit reached");
        return false;
    }

    eventTimestamps.push(now);
    return true;
    }

    function detectEnvironment() {
        const host = window.location.hostname.toLowerCase();
        if (host.includes("localhost")) return "local";
        if (host.includes("zus2q1")) return "qa01";
        if (host.includes("zus2q2")) return "dev01";
        return "unknown";
    }

    /* ================================
       DERIVED GLOBALS
    ================================= */

    const pathParts = window.location.pathname.split("/");
    const locale = pathParts[1]?.toLowerCase().replace("-", "_") || "";
    const language = locale.split("_")[0];
    const environment = detectEnvironment();
    const searchHub = `ds_${locale}_myhl_search_${environment}`;
    const isAnonymous = false;
    const searchQueryUid = crypto.randomUUID();
    let userId = null;

    function detectCurrencyFromLocale(locale) {
        if (!locale) return null;

        const parts = locale.split("_");
        if (parts.length < 2) return null;

        const country = parts[1].toUpperCase();

        const currencyMap = {
            AR: "ARS",
            AW: "AWG",
            AU: "AUD",
            BO: "BOB",
            BR: "BRL",
            CA: "CAD",
            CL: "CLP",
            CO: "COP",
            CR: "CRC",
            DO: "DOP",
            EC: "USD",
            GT: "GTQ",
            HN: "HNL",
            JM: "JMD",
            MX: "MXN",
            NI: "NIO",
            PA: "USD",
            PY: "PYG",
            PE: "PEN",
            PR: "USD",
            SV: "USD",
            US: "USD",
            UY: "UYU",
            VE: "VES",
            TT: "TTD",

            AT: "EUR",
            BE: "EUR",
            BG: "BGN",
            BA: "BAM",
            BY: "BYN",
            CH: "CHF",
            CY: "EUR",
            CZ: "CZK",
            DE: "EUR",
            DK: "DKK",
            EE: "EUR",
            ES: "EUR",
            FI: "EUR",
            FR: "EUR",
            GB: "GBP",
            GE: "GEL",
            GR: "EUR",
            HR: "EUR",
            HU: "HUF",
            IE: "EUR",
            IS: "ISK",
            IT: "EUR",
            LT: "EUR",
            LV: "EUR",
            MD: "MDL",
            MK: "MKD",
            MT: "EUR",
            NL: "EUR",
            NO: "NOK",
            PL: "PLN",
            PT: "EUR",
            RO: "RON",
            RS: "RSD",
            RU: "RUB",
            SE: "SEK",
            SI: "EUR",
            SK: "EUR",
            UA: "UAH",

            AM: "AMD",
            AZ: "AZN",
            HK: "HKD",
            ID: "IDR",
            IN: "INR",
            IL: "ILS",
            JP: "JPY",
            KH: "KHR",
            KG: "KGS",
            KR: "KRW",
            KZ: "KZT",
            LB: "LBP",
            MO: "MOP",
            MN: "MNT",
            MY: "MYR",
            PH: "PHP",
            SG: "SGD",
            TH: "THB",
            TR: "TRY",
            TW: "TWD",
            UZ: "UZS",
            VN: "VND",

            BW: "BWP",
            GH: "GHS",
            LS: "LSL",
            NA: "NAD",
            SZ: "SZL",
            ZA: "ZAR",
            ZM: "ZMW",

            NZ: "NZD",
            PF: "XPF"
        };

        return currencyMap[country] || null;
        }
    
    const currencyCode = detectCurrencyFromLocale(locale);
    window._searchQueryUid = searchQueryUid;

    /* ================================
    CLICK PROTECTION
    ================================ */

    const CLICK_LOCK_MS = 800;
    const clickLocks = new Map();
    let productViewSent = false;


    function isLocked(key) {
        const now = Date.now();

        if (clickLocks.has(key)) {
            const last = clickLocks.get(key);
            if (now - last < CLICK_LOCK_MS) {
                return true;
            }
        }

        clickLocks.set(key, now);
        return false;
    }

    function getCoveoVisitorId() {
        const cookies = document.cookie.split(';');

        for (let cookie of cookies) {
            cookie = cookie.trim();

            if (cookie.startsWith("coveo_visitorId=")) {
                return cookie.substring("coveo_visitorId=".length);
            }
        }

        return null;
    }

    async function sha256Hash(value) {
        const encoder = new TextEncoder();
        const data = encoder.encode(value);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray
            .map(b => b.toString(16).padStart(2, "0"))
            .join("");
    }


    /* ================================
       INIT COVEO
    ================================= */

    async function initializeCoveo() {

        await loadCoveoScript();

        if (window.__coveoInitialized) {
            return;
        }

        coveoua('set', 'language', language);
        coveoua('set', 'currencyCode', currencyCode);
        coveoua('set', 'trackingId', searchHub);
        coveoua('set', 'searchHub', searchHub);

        coveoua(
            'init',
            "xx002baef0-c992-4354-8a11-b4af0aea92f8",
            "https://jayakrishnansconsultantherbalifecomneighbouringturymtx1wo4.analytics.org.coveo.com"
        );

        const visitorId = getCoveoVisitorId();
        if (visitorId) {
            coveoua('set', 'userId', visitorId);
        }

        window.__coveoInitialized = true;
        
    }


    /* ================================
       PAGE DETECTION
    ================================= */

    document.addEventListener("DOMContentLoaded", async function () {
        await initializeCoveo();

        if (!window.localSkuMap) {
            const stored = localStorage.getItem("skuCategoryMap");
            window.localSkuMap = new Map(
                stored ? Object.entries(JSON.parse(stored)) : []
            );
        }

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

    function getSearchContext() {
        const url = new URL(window.location.href);
        const searchText = url.searchParams.get("searchText");

        const pathParts = window.location.pathname.split("/").filter(Boolean);
        const lastSegment = pathParts[pathParts.length - 1];

        if (searchText) {
            return { type: "search", value: searchText };
        }

        if (/^\d+$/.test(lastSegment)) {
            return { type: "category", value: lastSegment };
        }

        return { type: "unknown", value: null };
    }

    function resolveCategoryForSku(sku) {

        const context = window._searchContext;

        sessionStorage.setItem(
            "lastSearchContext",
            JSON.stringify(context)
        );

        if (context?.type === "category") {
            return String(context.value);
        }

        if (context?.type === "search") {
            const mapped = window.localSkuMap?.get(sku);
            return mapped ? String(mapped) : "unknown";
        }

        return "unknown";
    }

    function getPersistedSearchContext() {
        const stored = sessionStorage.getItem("lastSearchContext");
        return stored ? JSON.parse(stored) : null;
    }

    function getCategoryFromMap(sku) {

        if (window.localSkuMap?.size > 0) {
            const value = window.localSkuMap.get(sku);
            if (value) return value;
        }

        const stored = localStorage.getItem("skuCategoryMap");
        if (!stored) return null;

        try {
            const parsed = JSON.parse(stored);
            return parsed[sku] || null;
        } catch {
            return null;
        }
    }

    function resolveCategoryForPDP(sku) {

        const context = getPersistedSearchContext();
        const lastClickedSku = sessionStorage.getItem("lastClickedSku");

        if (context && sku === lastClickedSku) {

            if (context.type === "category") {
                return String(context.value);
            }

            if (context.type === "search") {
                const mapped = getCategoryFromMap(sku);
                return mapped ? String(mapped) : "unknown";
            }
        }

        const fallback = getCategoryFromMap(sku);
        return fallback ? String(fallback) : "unknown";
    }

    function initSearchPage() {

        const context = getSearchContext();
        window._searchContext = context;

        if (context.type === "search") {
            initSearchEvent(context.value);
        }

        initSearchClickEvent();
        initSearchAddToCart();
    }

    function initSearchEvent(queryText) {

        const totalSpan = document.querySelector(
            ".title-arrow span[data-bind*='totalProducts']"
        );

        if (!totalSpan) return;

        let searchSent = false;
        const searchStartTime = performance.now();

        const observer = new MutationObserver(function () {

            const total = parseInt(totalSpan.textContent.trim(), 10);
            if (!total || searchSent) return;

            searchSent = true;

            const responseTime = Math.round(performance.now() - searchStartTime);

            coveoua('send', 'search', {
                actionCause: 'searchboxSubmit',
                queryText: queryText,
                numberOfResults: total,
                responseTime: responseTime,
                searchQueryUid: searchQueryUid,
                originLevel1: searchHub,
                originLevel2: 'Products',
                originLevel3: window.location.href
            });

            console.log("Search event sent");

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

            if (link.dataset.coveoClickSent === "true") {
                return;
            }

            link.dataset.coveoClickSent = "true";

            sessionStorage.setItem("lastClickedSku", sku);

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

        if (!sku) return;

        if (isLocked("add_" + sku)) return;

        const priceElement = item.querySelector("[data-bind*='YourPrice']");
        const price = priceElement
            ? parseFloat(priceElement.innerText.replace(",", "").trim())
            : 0;

        const qtyInput = item.querySelector("input.increment");
        const quantity = qtyInput ? parseInt(qtyInput.value, 10) || 1 : 1;

        const category = resolveCategoryForSku(sku);
        const context = window._searchContext;

        coveoua('set', 'custom', {
            context_website: searchHub,
            context_language: language
        });

        /* =====================================
           🔎 IF SEARCH → SEND SYNTHETIC CLICK
        ====================================== */

        if (context?.type === "search") {

            const allItems = Array.from(document.querySelectorAll(".product-list .item"));
            const position = allItems.indexOf(item) + 1;

            const clickPayload = {
                actionCause: 'documentOpen',
                documentPosition: position > 0 ? position : 1,
                documentTitle: name,
                documentUrl: window.location.href,
                searchQueryUid: searchQueryUid,
                sourceName: 'Products',
                originLevel1: searchHub,
                originLevel2: 'Products',
                originLevel3: window.location.href,
                customData: {
                    contentIDKey: 'sku',
                    contentIDValue: sku
                }
            };

            console.log("SENDING SYNTHETIC CLICK:", clickPayload);

            coveoua('send', 'click', clickPayload);

            // ⬇️ Esperar un micro-tick para evitar que ecommerce mode lo sobrescriba
            setTimeout(() => {

                sendAddEvent();

            }, 25);

            return; // importante para no ejecutar el add inmediatamente
        }

        /* =====================================
           📂 CATEGORY → DIRECT ADD
        ====================================== */

        sendAddEvent();


        /* =====================================
           🛒 ADD EVENT FUNCTION
        ====================================== */

        function sendAddEvent() {

            coveoua('ec:addProduct', {
                id: sku,
                name: name,
                category: category,
                price: price,
                quantity: quantity
            });

            coveoua('ec:setAction', 'add');

            if (!canSendAnalytics()) return;

            coveoua('send', 'event');

            console.log("Add to cart sent");
        }

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

            const category = resolveCategoryForPDP(sku);

            if (!sku || !price) return;

            if (productViewSent) return;

            observer.disconnect();

            productViewSent = true;

            coveoua('set', 'custom', {
                context_website: searchHub,
                originLevel1: searchHub,
                context_language: language
            });

            coveoua('ec:addProduct', {
                id: sku,
                name: name,
                category: category,
                price: price
            });

            coveoua('ec:setAction', 'detail');
            if (!canSendAnalytics()) return;
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
            const category = resolveCategoryForPDP(sku);

            if (isLocked("add_" + sku)) {
                return;
            }

            coveoua('ec:addProduct', {
                id: sku,
                name: name,
                category: category,
                price: price,
                quantity: quantity
            });

            coveoua('ec:setAction', 'add');
            if (!canSendAnalytics()) return;
            coveoua('send', 'event');

            console.log("Add to cart sent in detail page");

        }, true);

        
    }




})();
