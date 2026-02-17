(function(){

    document.addEventListener("click", function(e){

        var product = e.target.closest(".item");
        if (!product) return;

        var name = product.querySelector(".name")?.innerText;
        console.log("CAPTURE CLICK:", name);

    }, true);


    let searchSent = false;

    const target = document.querySelector("#subcategory");

    if (!target) return;

    const observer = new MutationObserver(function(mutations){

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

            }

        }

    });

    observer.observe(target, {
        childList: true,
        subtree: true
    });

})();
