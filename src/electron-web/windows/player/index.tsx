import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import store from 'electron-web/store/store'
import Player from './components/player'
import 'electron-web/styles/common.css'
import './index.css'

ReactDOM.render(
  <Provider store={store}>
    <Player />
  </Provider>,
  document.getElementById('root'),
)
