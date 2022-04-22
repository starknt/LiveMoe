import ReactDOM from 'react-dom';
import Setting from './components/Setting';
import { Provider } from 'react-redux';
import store from 'electron-web/store/store';
import 'electron-web/styles/common.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@unocss/reset/tailwind.css';
import 'uno.css';
import './index.css';

ReactDOM.render(
  <Provider store={store}>
    <Setting />
  </Provider>,
  document.getElementById('root')
);
