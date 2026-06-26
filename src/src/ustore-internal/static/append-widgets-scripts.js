if (xmpie_uStore_widgets) {
    document.writeln(`<script src="${xmpie_uStore_widgets.configurationUrl}" type="application/javascript"></script>`)
    xmpie_uStore_widgets.definitions.forEach(duc => {
        document.writeln(`<script src="${duc.baseUrl}/main.min.js?rand=${duc.buildNumber || Math.random()}" type="application/javascript"></script>`)
        document.writeln(`<link href="${duc.baseUrl}/main.css?rand=${duc.buildNumber || Math.random()}" rel="stylesheet"/>`)
    })
}