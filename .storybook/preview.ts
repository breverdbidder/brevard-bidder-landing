// BidDeed.AI - Storybook Preview Configuration
// Author: Ariel Shapira, Solo Founder, Everest Capital USA

import type { Preview } from '@storybook/react';
import '../styles/globals.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#09090b' },
        { name: 'light', value: '#fafafa' },
      ],
    },
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="dark font-sans">
        <Story />
      </div>
    ),
  ],
};

export default preview;
