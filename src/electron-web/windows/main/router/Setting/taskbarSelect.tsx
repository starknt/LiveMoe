import {
  BLURBEHIND_APPEARANCE,
  FLUENT_APPEARANCE,
  REGULAR_APPEARANCE,
  START_APPEARANCE,
  TASKBAR_APPEARANCE,
} from 'common/electron-common/taskbar';

export interface TaskbarProps {
  APPEARANCE: TASKBAR_APPEARANCE;
  color: string;
  label?: string;
}

export interface TaskbarSelectProp {
  onChange?: (value: TaskbarProps) => void;
  defaultValue?: number;
}

export const options: readonly TaskbarProps[] = [
  { APPEARANCE: START_APPEARANCE, label: '无', color: '#00B8D9' },
  { APPEARANCE: REGULAR_APPEARANCE, label: '透明', color: '#5243AA' },
  { APPEARANCE: BLURBEHIND_APPEARANCE, label: '模糊', color: '#36B37E' },
  { APPEARANCE: FLUENT_APPEARANCE, label: '亚克力', color: '#FFC400' },
];
