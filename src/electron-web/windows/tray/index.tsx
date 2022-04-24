import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import store from 'electron-web/store/store'
import Tray from './components/Tray'
import './index.css'

ReactDOM.render(
  <Provider store={store}>
    <Tray />
  </Provider>,
  document.getElementById('root'),
)
