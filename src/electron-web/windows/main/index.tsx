import { render } from 'react-dom';
import { HashRouter } from 'react-router-dom';
import '@fontsource/roboto/500.css';
import store from 'electron-web/store/store';
import { Provider } from 'react-redux';
import App from './App';
import 'common/locales';
import "uno.css";
import '@unocss/reset/tailwind.css'
import 'electron-web/styles/common.css';

render(
  <Provider store={store}>
    <HashRouter>
      <App />
    </HashRouter>
  </Provider>,
  document.getElementById('root')
);
