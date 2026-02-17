(function(){

    (function (c, o, v, e, O, u, a) {
        a = 'coveoua';
        c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments) };
        c[a].t = Date.now();
        u = o.createElement(v); u.async = 1; u.src = e;
        O = o.getElementsByTagName(v)[0]; O.parentNode.insertBefore(u, O);
    })(window, document, 'script', 'https://static.cloud.coveo.com/coveo.analytics.js/2/coveoua.js');

    // Global fields
    coveoua('set', 'language', 'en');
    coveoua('set', 'currency', 'USD');
    coveoua('set', 'trackingId', 'ds_en_us_myhl_search_qa01');
    coveoua('set', 'searchHub', 'ds_en_us_myhl_search_qa01');

    // Init
    coveoua(
        'init',
        "xx002baef0-c992-4354-8a11-b4af0aea92f8",
        ('https://jayakrishnansconsultantherbalifecomneighbouringturymtx1wo4.analytics.org.coveo.com')
    );

    function detectEnvironment() {

        const host = window.location.hostname.toLowerCase();

        if (host.includes("localhost")) return "local";
        if (host.includes("q")) return "qa01";
        if (host.includes("u")) return "uat";
        if (host.includes("s")) return "stage";
        if (host.includes("p")) return "prod";

        return "unknown";
    }

    document.addEventListener("DOMContentLoaded", function(){

        console.log("DOM READY");
        const searchStartTime = performance.now();

        // ---- CLICK LISTENER ----
        document.addEventListener("click", function(e){

            var link = e.target.closest("a.product-info");
            if (!link) return;

            var item = link.closest(".item");
            if (!item) return;

            var name = item.querySelector(".name")?.innerText;
            console.log("PRODUCT CLICK:", name);

        }, true);

        // Cart
        document.addEventListener("click", function(e){

            var btn = e.target.closest(".btn-add-cart");
            if (!btn) return;

            var item = btn.closest(".item");
            if (!item) return;

            var name = item.querySelector(".name")?.innerText;
            var sku = item.querySelector(".sku")?.innerText?.replace("SKU ", "");

            console.log("ADD TO CART CLICK:", name, sku);

            if (typeof coveoua === "function") {
                coveoua('send', 'event', 'Search', 'AddToCart', {
                    productName: name,
                    productSku: sku,
                    originLevel1: "ds_en_us_myhl_search_qa01",
                    originLevel2: "search",
                    originLevel3: window.location.href
                });
            }

        }, true);


        // ---- OBSERVER ----
        let searchSent = false;

        const totalSpan = document.querySelector(
            ".title-arrow span[data-bind*='totalProducts']"
        );

        if (!totalSpan) return;

        let lastValue = null;
        let searchQueryUid = crypto.randomUUID();
        window._searchQueryUid = searchQueryUid;

        const observer = new MutationObserver(function(){

            const total = parseInt(totalSpan.textContent.trim(), 10);

            if (!total || total === lastValue) return;

            lastValue = total;
            if (searchSent) return;
            searchSent = true;

            //if (typeof coveoua !== "function") return;

            // ---- Query ----
            const params = new URLSearchParams(window.location.search);
            const queryText = params.get("searchText") || "";
            if (!queryText) return;

            // ---- Language ----
            const pathParts = window.location.pathname.split("/");
            const locale = pathParts[1].toLowerCase().replace("-", "_");
            const language = locale.split("_")[0];

            // ---- Response Time ----
            const responseTime = Math.round(performance.now() - searchStartTime);

            // ---- Anonymous ----
            function isAnonymousUser() {
                return !document.cookie
                    .split("; ")
                    .some(cookie => cookie.startsWith("coveo_visitorId="));
            }

            const isAnonymous = isAnonymousUser();

            const environment = detectEnvironment();

            console.log("SEARCH TOTAL DETECTED:", total);

            console.log("SEARCH EVENT SENT", {
                queryText,
                total,
                responseTime,
                language,
                isAnonymous
            });

            console.log("ENVIRONMENT DETECTED:", `ds_${locale}_myhl_search_${environment}`);

            // ---- Context ----
            coveoua('set', 'custom', {
                context_website: `ds_${locale.toLowerCase()}_myhl_search_${environment}`,
                context_language: language
            });

            // ---- SEND SEARCH ----
            coveoua('send', 'search', {
                actionCause: 'searchboxSubmit',
                queryText: queryText,
                numberOfResults: total,
                responseTime: responseTime,
                searchQueryUid: searchQueryUid,
                language: language,

                originLevel1: `ds_${locale.toLowerCase()}_myhl_search_${environment}`,
                originLevel2: 'Products',
                originLevel3: window.location.href,

                anonymous: isAnonymous
            });

        });

        observer.observe(totalSpan, {
            childList: true
        });


    });

})();
