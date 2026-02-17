(function(){

    document.addEventListener("DOMContentLoaded", function(){

        console.log("DOM READY");

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
            const locale = pathParts[1] || "en-US";
            const language = locale.split("-")[0].toLowerCase();

            // ---- Response Time ----
            const navTiming = performance.getEntriesByType("navigation")[0];
            const responseTime = navTiming
                ? Math.round(navTiming.responseEnd - navTiming.requestStart)
                : 0;

            // ---- Anonymous ----
            function getCoveoClientId() {
                const match = document.cookie.match(/_coveo_ua=([^;]+)/);
                return match ? match[1] : "anon_unknown";
            }

            const clientId = getCoveoClientId();
            const isAnonymous = clientId.startsWith("anon_");

            console.log("SEARCH TOTAL DETECTED:", total);

            console.log("SEARCH EVENT SENT", {
                queryText,
                total,
                responseTime,
                language,
                isAnonymous
            });

            if (typeof coveoua === "function") {
                coveoua('send', 'event', 'Search', 'SearchPageLoad', {
                    totalResults: total,
                    originLevel1: "ds_en_us_myhl_search_qa01",
                    originLevel2: "search",
                    originLevel3: window.location.href
                });
            }

        });

        observer.observe(totalSpan, {
            childList: true
        });


    });

})();
