(function(){

    document.addEventListener("click", function(e){

        var product = e.target.closest(".item");
        if (!product) return;

        var name = product.querySelector(".name")?.innerText;
        console.log("CAPTURE CLICK:", name);

    }, true); // 🔥 IMPORTANTE: true = capture phase


    function waitForProducts(){

        var items = document.querySelectorAll("#subcategory .item");

        if (items.length > 0) {

            if (typeof coveoua === "function") {

                console.log("SEARCH RESULTS READY:", items.length);

                coveoua('send', 'event', 'Search', 'SearchPageLoad', {
                    totalResults: items.length,
                    originLevel1: "ds_en_us_myhl_search_qa01",
                    originLevel2: "search",
                    originLevel3: window.location.href
                });

            }

        } else {
            setTimeout(waitForProducts, 200);
        }
    }

    waitForProducts();

})();
