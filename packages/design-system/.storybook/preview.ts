import type {Preview} from '@storybook/react-vite';
import '@/styles/reset.css';
import '@/styles/global.css';
import {themeClassName} from '@/styles/theme';
import './storybook.scss';

document.body.classList.add(themeClassName);

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: ['디자인 시스템 구축기', 'Components', '*'],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
};

export default preview;
