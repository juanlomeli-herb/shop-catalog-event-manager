(function () {
    const TARGET_PATH = "/en-US/Shop/Catalog/API/Search/V2/Ds";

    // Map en memoria
    const skuMap = new Map();

    // Exponer globalmente para consulta manual
    window.localSkuMap = skuMap;

    function processResponse(json) {
        if (!json || !json.Items || !Array.isArray(json.Items)) return;

        json.Items.forEach(item => {
            if (!item.Sku || !item.Categories) return;

            // Extraer primer número de "|506|501|"
            const match = item.Categories.match(/\|(\d+)\|/);
            if (!match) return;

            const firstCategory = match[1];

            skuMap.set(item.Sku, firstCategory);
        });

        // Persistir en localStorage (opcional)
        localStorage.setItem(
            "skuCategoryMap",
            JSON.stringify(Object.fromEntries(skuMap))
        );

        console.log("SKU Map actualizado:", skuMap);
    }

    // Interceptar fetch
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
        const response = await originalFetch.apply(this, args);

        try {
            const url = typeof args[0] === "string" ? args[0] : args[0].url;

            if (url.includes(TARGET_PATH)) {
                const cloned = response.clone();
                cloned.json().then(processResponse).catch(() => {});
            }
        } catch (e) {}

        return response; // no interrumpe flujo normal
    };

    // Interceptar XMLHttpRequest
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
        this._url = url;
        return originalOpen.apply(this, arguments);
    };

    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function () {
        this.addEventListener("load", function () {
            try {
                if (this._url && this._url.includes(TARGET_PATH)) {
                    const json = JSON.parse(this.responseText);
                    processResponse(json);
                }
            } catch (e) {}
        });

        return originalSend.apply(this, arguments);
    };

    console.log("Interceptor de Search API instalado correctamente.");
})();