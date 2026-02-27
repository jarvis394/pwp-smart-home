import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import Router from 'src/components/Router'
import store from './store'

import 'src/styles/fonts.css'
import 'simplebar-react/dist/simplebar.min.css'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <Router />
    </Provider>
  </React.StrictMode>
)
