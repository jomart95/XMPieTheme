(function () {

  var queryOrCookieStrToObj = function (str) {
    if (str && str !== '') {
      return JSON.parse('{"' +
        str
          .replace(/^(.*)\?/, '')
          .split(/[&;]\s?/g)
          .map(function (keyval) {
            return keyval.replace(/=/, '":"')
          })
          .join('","')
        + '"}', function (key, value) {
          return key === "" ? value : decodeURIComponent(value)
        })
    }
    return {}
  }

  var search = window.location.search.substring(1);
  var queryParams = queryOrCookieStrToObj(search)

  var cookieParams = {};
  document.cookie && document.cookie.split(/\s*;\s*/).forEach(function (pair) {
    pair = pair.split(/\s*=\s*/);
    cookieParams[pair[0]] = pair.splice(1).join('=')
  });

  if (queryParams.StoreGuid) {
    cookieParams._storeID = queryParams.StoreGuid
    document.cookie = "_storeID=" + queryParams.StoreGuid + '; path=/;'
  }

  var status = cookieParams._showThemeAsDraft === 'true' ? 'true' : 'false'

  var url = window.location.href
  if (!url.endsWith('/')) {
    url += '/'
  }

  var [,, cultureCodeFromUrl] = url.toLowerCase().includes('ustorethemes')
      ? /(.*?\/ustorethemes\/.*?\/\d+)(\/[a-z]{2}-[a-z]+[?/]|$)/i.exec(url)
      : /(.*?)(\/[a-z]{2}-[a-z]+[?/]|$)/i.exec(url)
    cultureCodeFromUrl = cultureCodeFromUrl.replace(/\//g, '')

  if (url && cultureCodeFromUrl && url.length > 0) {

    var cultureCode = cultureCodeFromUrl

    window.onload = function () {
      // check if google analytics code exists for store
      fetch('/uStoreRestAPI/v1/store/resourceByUrl?url=' + encodeURIComponent(url) + '&type=5&cultureCode=' + cultureCode + '&isDraft=false')
        .then(function (r) {
          return r.text()
        })
        .then(function (text) {
          const UA_ID = /UA-[0-9]*-[0-9]/
          const ua_res = text.match(UA_ID)

          const injectedScript = /<script(.*)<\/script>/s
          const matched_script = text.match(injectedScript)

          // if code exists and contain an Analytics code (UA-XXXXX-Y), add the analytics.js include
          if (ua_res && ua_res.length > 0) {
            (function (i, s, o, g, r, a, m) {
              i['GoogleAnalyticsObject'] = r
              i[r] = i[r] || function () {
                (i[r].q = i[r].q || []).push(arguments)
              }
              i[r].l = 1 * new Date()
              a = s.createElement(o)
              m = s.getElementsByTagName(o)[0]
              a.async = 1
              a.src = g
              m.parentNode.insertBefore(a, m)
            })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga')

            // initiate the analytics functionality and send a pageview
            window.ga('create', ua_res[0], 'auto')
            window.ga('send', 'pageview', window.location.asPath)

          } else if (matched_script && matched_script.length > 0) {
            // GA4 implementation: add any script the user inputs in the backoffice immediately after the opening <head> HTML tag

            const parser = new DOMParser()
            const scripts = parser.parseFromString(matched_script[0], 'text/html').getElementsByTagName('script')
            const firstScriptTag = document.getElementsByTagName('script')[0]
            Array.from(scripts).forEach(script => {
              const newScript = document.createElement('script')
              Array.from(script.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value)
              })
              newScript.textContent = script.textContent
              firstScriptTag.parentNode.insertBefore(newScript, firstScriptTag)
            })
          }
        })
    }

    // add localization
    document.writeln('<script type="application/javascript" src="'+ window.uStoreConfig.uStoreRemoteServerUrl +'/uStoreRestAPI/v1/store/resourceByUrl?url=' + encodeURIComponent(url) + '&type=1&cultureCode=' + cultureCode + '&isDraft=false"></script>')

    // get widgets - V15.4
    document.writeln('<script type="application/javascript" src="'+ window.uStoreConfig.uStoreRemoteServerUrl +'/uStoreRestAPI/v1/store/resourceByUrl?url=' + encodeURIComponent(url) + '&type=6&cultureCode=' + cultureCode + '&isDraft=' + status + '"></script>')
  }
}
)()
