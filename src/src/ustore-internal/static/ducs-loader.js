window.uStoreDucs = window.uStoreDucs || [];

(function($w) {
  var $doc = $w.document;

  function appendScript(filename) {
    var fileref = $doc.createElement('script')
    fileref.setAttribute("type", "text/javascript")
    fileref.setAttribute("src", filename)
    document.getElementsByTagName("head")[0].appendChild(fileref)
  }

  function appendCss(filename) {
    var fileref = $doc.createElement("link")
    fileref.setAttribute("rel", "stylesheet")
    fileref.setAttribute("type", "text/css")
    fileref.setAttribute("href", filename)
    document.getElementsByTagName("head")[0].appendChild(fileref)
  }

  $w.ducConfig.forEach(function(duc) {
    duc.assets.forEach(function(asset) {
        if (/\.js$/i.test(asset)) {
          appendScript(asset)
        }
        if (/\.css$/i.test(asset)) {
          appendCss(asset)
        }
      }
    )
  });

})(window)

