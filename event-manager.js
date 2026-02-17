(function(){

    document.addEventListener("DOMContentLoaded", function(){

        console.log("DOM READY");

        // ---- CLICK LISTENER ----
        document.addEventListener("click", function(e){

            var product = e.target.closest(".item");
            if (!product) return;

            var name = product.querySelector(".name")?.innerText;
            console.log("CAPTURE CLICK:", name);

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

        const target = document.querySelector("#subcategory");

        if (!target) {
            console.log("No subcategory found");
            return;
        }

        const observer = new MutationObserver(function(){

            const items = document.querySelectorAll("#subcategory .item");

            if (items.length > 0 && !searchSent) {

                searchSent = true;

                console.log("SEARCH RESULTS DETECTED:", items.length);

                if (typeof coveoua === "function") {

                    coveoua('send', 'event', 'Search', 'SearchPageLoad', {
                        totalResults: items.length,
                        originLevel1: "ds_en_us_myhl_search_qa01",
                        originLevel2: "search",
                        originLevel3: window.location.href
                    });

                } else {
                    console.log("coveoua not ready");
                }
            }

        });

        observer.observe(target, {
            childList: true,
            subtree: true
        });

    });

})();
