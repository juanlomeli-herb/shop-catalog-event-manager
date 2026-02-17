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
        const totalSpan = document.querySelector(
            ".title-arrow span[data-bind*='totalProducts']"
        );

        if (!totalSpan) {
            console.log("totalProducts span not found");
            return;
        }

        let lastValue = null;
        let searchQueryUid = crypto.randomUUID();
        let searchSent = false;

        const observer = new MutationObserver(function(){

            const total = parseInt(totalSpan.textContent.trim(), 10);
            if (isNaN(total) || total === lastValue) return;

            lastValue = total;

            if (searchSent) return;
            searchSent = true;

            console.log("SEARCH TOTAL DETECTED:", total);

            if (typeof coveoua !== "function") {
                console.log("coveoua not ready");
                return;
            }

            // 🔹 Detect query from URL
            const params = new URLSearchParams(window.location.search);
            const queryText = params.get("q") || "";

            if (!queryText) {
                console.log("No search text found");
                return;
            }

            // 🔹 Detect anonymous
            function getCoveoClientId() {
                const match = document.cookie.match(/_coveo_ua=([^;]+)/);
                return match ? match[1] : "anon_unknown";
            }

            const clientId = getCoveoClientId();
            const isAnonymous = clientId.startsWith("anon_");

            // 🔹 Set context
            coveoua('set', 'custom', {
                context_website: "ds_en_us_myhl_search_qa01",
                context_language: "en"
            });

            // 🔥 SEND REAL SEARCH EVENT
            coveoua('send', 'search', {
                actionCause: 'searchboxSubmit',
                queryText: queryText,
                numberOfResults: total,
                responseTime: 0, // no tenemos backend timing aquí
                searchQueryUid: searchQueryUid,
                language: 'en',

                originLevel1: "ds_en_us_myhl_search_qa01",
                originLevel2: 'Products',
                originLevel3: window.location.href,

                anonymous: isAnonymous
            });

            console.log("SEARCH EVENT SENT", total, queryText, isAnonymous);

        });

        observer.observe(totalSpan, {
            childList: true
        });


    });

})();
