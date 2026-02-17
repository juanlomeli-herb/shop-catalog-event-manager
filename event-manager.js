(function(){

    document.addEventListener("click", function(e){

        var product = e.target.closest(".item");
        if (!product) return;

        var name = product.querySelector(".name")?.innerText;
        console.log("CAPTURE CLICK:", name);

    }, true); // 🔥 IMPORTANTE: true = capture phase

})();
