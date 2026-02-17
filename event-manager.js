(function(){

    document.addEventListener("click", function(e){

        var product = e.target.closest(".item");
        if (!product) return;

        var name = product.querySelector(".name")?.innerText;
        console.log("CAPTURE CLICK:", name);

    }, true);


    function hookDataBound(){

        var root = document.getElementById("subcategory");
        if (!root || !window.ko) {
            setTimeout(hookDataBound, 200);
            return;
        }

        var vm = ko.dataFor(root);
        if (!vm || !vm.onDataBound) {
            setTimeout(hookDataBound, 200);
            return;
        }

        var original = vm.onDataBound;

        vm.onDataBound = function(){

            original.apply(this, arguments);

            if (typeof coveoua === "function") {

                var total = vm.totalProducts?.();

                console.log("SEARCH READY VIA DATABOUND", total);

                coveoua('send', 'event', 'Search', 'SearchPageLoad', {
                    totalResults: total,
                    originLevel1: "ds_en_us_myhl_search_qa01",
                    originLevel2: "search",
                    originLevel3: window.location.href
                });

            }
        };

        console.log("Hooked onDataBound");

    }

    hookDataBound();

})();
