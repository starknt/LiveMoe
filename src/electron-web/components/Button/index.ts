import { Button } from './button';
import { ButtonGroup } from './buttonGroup';
import './button.css';

type ButtonExport = typeof ButtonGroup & {
  Button: typeof Button;
};

const button = ButtonGroup as ButtonExport;
button.Button = Button;

export default button;
export { Button, ButtonGroup };
