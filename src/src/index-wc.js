import React, {useEffect, useRef, useState} from 'react'
import {createRoot} from 'react-dom/client'
import {MemoryRouter as ReactRouter, Route, Routes, useHref, useNavigate} from 'react-router-dom'
import {RouterProvider as AriaRouterProvider} from 'react-aria-components'
import location from '$ustoreinternal/services/locationProvider'
import { storefrontCookies, CookiesManager } from '$ustoreinternal/services/cookies'
import {Generic} from './generic'
import {getRoutes} from './routeList'
import {RootDocumentContext, ScriptLoader} from '$themeservices'


const App = (props) => {
  location.custom = props.startUrl
  const routes = getRoutes()
  const navigate = useNavigate()
  const dummyRef = useRef(null)
  const [rootDocument, setRootDocument] = useState(null)

  useEffect(() => {
    if (!rootDocument) {
      const rootNode = dummyRef?.current?.getRootNode()
      console.log(rootNode)
      setRootDocument({
        rootElement: rootNode?.getAttribute && rootNode?.getAttribute('id') === 'component-root' ? rootNode : rootNode?.getElementById('component-root'),
        documentRoot: rootNode
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dummyRef.current])

  useEffect(() => {
    return () => {
      Object.values(storefrontCookies).filter(cn => cn !== storefrontCookies.cookieRibbonNotShownYet).forEach(CookiesManager.deleteCookie)
    }
  },[])

  return (
    <>
      {/* This is a dummy span element that is used to get the root document element */}
      <span ref={dummyRef} style={{display: "none"}}></span>
      {rootDocument && <RootDocumentContext.Provider value={() => rootDocument}>
        <AriaRouterProvider navigate={navigate} useHref={useHref}>
          <Routes>
            {routes.map((route, i) => <Route key={i} path={route} element={<Generic {...props} />}
                                             trailing/>)}
          </Routes>
        </AriaRouterProvider>
      </RootDocumentContext.Provider>}
    </>
  )
}


class XUStoreWebComponent extends HTMLElement {
  constructor() {
    super()
    this.startUrl = ''
    this.cssUrl = ''
    this.root = ''
    this.container = null
    this.rootApp = null
    this.attachShadow({mode: 'open'})
  }

  static get observedAttributes() {
    return ['url', 'css-url', 'root']
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'root' && oldValue !== newValue) {
      this.root = newValue
    }

    if (name === 'css-url' && oldValue !== newValue) {
      this.cssUrl = newValue
    }

    if (name === 'url' && oldValue !== newValue) {
      this.startUrl = newValue
      this.shadowRoot.innerHTML = ''
      const rootElement = this.root ? document.querySelector(this.root) : this.shadowRoot
      loadScripts(rootElement, newValue).then(() => {
        if (!this.container) {
          this.container = document.createElement('div')
          this.container.id = 'component-root'
          this.container.setAttribute('data-bs-theme', 'light')
          rootElement.appendChild(this.container)
        } else {
          this.rootApp.unmount()
        }
        const newURL = new URL(this.startUrl)
        loadMainCss(rootElement, this.cssUrl || `${window.uStoreConfig?.uStoreRemoteServerUrl}/${window.uStoreConfig?.assetPrefix.replace(/^\//,'')}/static/css/x-store.css`)
        this.rootApp = createRoot(this.container)
        this.rootApp.render(<ReactRouter initialEntries={['/']}><App
          startUrl={this.startUrl}/></ReactRouter>, this.container)
        loadCustomCssVariables(rootElement, this.startUrl, newURL.origin)
      })
    }
  }

  connectedCallback() {
  }

  disconnectedCallback() {
    if (this.container) {
      this.rootApp.unmount()
    }
  }
}

customElements.define('x-ustore', XUStoreWebComponent)

if (module.hot) {
  module.hot.accept()
}

function getCultureCode(startUrl) {
  const [, , cultureCode] = startUrl.toLowerCase().includes('ustorethemes')
    ? /(.*?\/ustorethemes\/.*?\/\d+)(\/[a-z]{2}-[a-z]+[?/]|$)/i.exec(startUrl)
    : /(.*?)(\/[a-z]{2}-[a-z]+[?/]|$)/i.exec(startUrl)
  return cultureCode.replace(/\//g, '')
}

async function loadCustomCssVariables(shadowRoot, startUrl, origin) {
  fetch(`${origin}/uStoreRestAPI/v1/store/resourceByUrl?url=${encodeURIComponent(startUrl)}&type=3&cultureCode=${getCultureCode(startUrl)}&isDraft=false`)
    .then(async res => {
      if (res.ok) {
        const text = await res.text()
        const style = document.createElement('style')
        style.textContent = text.replace(':root', ':host')
        shadowRoot.appendChild(style)
      }
    })
}


async function loadMainCss(shadowRoot, cssUrl) {
  fetch(`${cssUrl}`)
    .then(async res => {
      if (res.ok) {
        const text = await res.text()
        const style = document.createElement('style');
        style.id = 'ustore-theme'
        style.textContent = text
        shadowRoot.appendChild(style);
        if (/^http:\/\/localhost:\d+/i.test(cssUrl)) {
          const fontFaceRegex = /@font-face\s*\{[^}]*\}/gi;
          const matches = text.match(fontFaceRegex);
          const fontFace = document.createElement('style')
          fontFace.textContent = matches.join('\n')
          document.head.appendChild(fontFace)
          return
        }
        const rootCss =  `${window.uStoreConfig?.uStoreRemoteServerUrl.replace(/\/$/,'')}/${window.uStoreConfig?.assetPrefix.replace(/^\//,'')}`
        const reFontFace =  /@font-face\s*{[^}]*?font-family:\s*(?<fontFamily>[^;]+?);[^}]*?src:\s*(?<sources>[^;}]+)/gm
        const m = reFontFace.exec(text)
        if (m?.groups?.sources) {
          const fontFace = new FontFace(m.groups.fontFamily, m.groups.sources.replaceAll('url(', `url(${rootCss}`))
          fontFace.load().then(f => {
            document.fonts.add(f)
          }).catch(e => {
            console.error('error', e)
          })
        }
      }
    })
}

async function loadScripts(shadowRoot, startUrl){
  const isDev = process.env.NODE_ENV === 'development'
  const url = new URL(startUrl)
  const rootUrl = isDev ? location.origin : url.origin
  const ducs = new ScriptLoader({src: `${rootUrl}/uStoreRestAPI/v1/system/properties/form/widgets`, global: 'body'})
  await ducs.load()
  for (const d of window.xmpie_uStore_DUCs) {
    const clonedStyle = document.createElement('link')
    clonedStyle.href = `${rootUrl}${d.baseUrl}/main.css?rand=${d.buildNumber || Math.random()}`
    clonedStyle.rel = 'stylesheet'
    shadowRoot.appendChild(clonedStyle);

    const loader = new ScriptLoader({
      src: `${rootUrl}${d.baseUrl}/main.min.js?rand=${d.buildNumber || Math.random()}`,
      global: 'body'
    })
    await loader.load()
  }

  const cultureCode = getCultureCode(startUrl)

  for (const resourceType of [1, 6]) {
    const script = new ScriptLoader({
      src: `${rootUrl}/uStoreRestAPI/v1/store/resourceByUrl?url=${encodeURIComponent(startUrl)}&type=${resourceType}&cultureCode=${cultureCode}&isDraft=false`,
      global: 'body'
    })
    try {
      await script.load()
      if (resourceType === 6) {
        window.xmpie_uStore_widgets.configurationUrl = `${rootUrl}${window.xmpie_uStore_widgets.configurationUrl}`
        const widgetScript = new ScriptLoader({
          src: `${window.xmpie_uStore_widgets.configurationUrl}`,
          global: 'body'
        })
        await widgetScript.load()
      }
    } catch (e) {
      console.log(e)
    }
  }

  for (const resourceType of [2, 4]) {
    const clonedStyle = document.createElement('link')
    clonedStyle.href = `${rootUrl}/uStoreRestAPI/v1/store/resourceByUrl?url=${encodeURIComponent(startUrl)}&type=${resourceType}&cultureCode=${cultureCode}&isDraft=false`
    clonedStyle.rel = 'stylesheet'
    shadowRoot.appendChild(clonedStyle);
  }
}
