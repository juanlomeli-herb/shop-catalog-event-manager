(function(){

    var root = document.querySelector("#subcategory");
    if (!root) return;

    root.addEventListener("click", function(e){

        // Detectar click en producto
        var productLink = e.target.closest("a.product-info");
        if (productLink) {
            var item = productLink.closest(".item");
            var name = item?.querySelector(".name")?.innerText.trim();
            console.log("PRODUCT CLICK:", name);
            return;
        }

        // Detectar add to cart
        var addBtn = e.target.closest(".btn-add-cart");
        if (addBtn) {
            var item = addBtn.closest(".item");
            var name = item?.querySelector(".name")?.innerText.trim();
            console.log("ADD TO CART CLICK:", name);
            return;
        }

    });

})();
