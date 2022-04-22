import { Item, Navigation } from './navigation';
import './rcMenu.css';
import './navigation.css';

type NavigationType = typeof Navigation & {
  NavigationItem: typeof Item;
};

const ExportNavigation = Navigation as NavigationType;
ExportNavigation.NavigationItem = Item;
const NavigationItem = Item;

export default ExportNavigation;
export { Navigation, NavigationItem };
