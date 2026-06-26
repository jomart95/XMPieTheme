import React from 'react'
import {createRoot} from 'react-dom/client'
import {BrowserRouter as ReactRouter, Route, Routes, useHref, useNavigate} from 'react-router-dom'
import {RouterProvider as AriaRouterProvider} from 'react-aria-components'
import reportWebVitals from './reportWebVitals'
import {RootDocumentContext} from '$themeservices'
import { Generic } from './generic'
import routes from './routeList'

const AppendTrailingSlash = (props) => {
  if (!window.location.pathname.endsWith('/')) {
    window.history.replaceState(window.history.state,document.title, window.location.pathname + '/' + window.location.search)
  }
  return <Generic {...props}/>
}

const App = () => {
  const navigate = useNavigate()

  return (
    <RootDocumentContext.Provider value={() => {
      return {
        documentRoot: document,
        rootElement: document.body,
    }}}>
      <AriaRouterProvider navigate={navigate} useHref={useHref}>
        <Routes>
          { routes.map((route, i) => <Route key={i} path={route} element={<AppendTrailingSlash/>} trailing/> )}
        </Routes>
      </AriaRouterProvider>
    </RootDocumentContext.Provider>
  )
}
const root = createRoot(document.getElementById('root'))
root.render(<ReactRouter><App /></ReactRouter>)

if (module.hot) {
  module.hot.accept()
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
