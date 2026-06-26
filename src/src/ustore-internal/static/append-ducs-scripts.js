if (xmpie_uStore_DUCs) {
  xmpie_uStore_DUCs.forEach(duc => {
    document.writeln(`<script src="${duc.baseUrl}/main.min.js?rand=${duc.buildNumber || Math.random()}" type="application/javascript"></script>`)
    document.writeln(`<link href="${duc.baseUrl}/main.css?rand=${duc.buildNumber || Math.random()}" rel="stylesheet"/>`)
  })
}