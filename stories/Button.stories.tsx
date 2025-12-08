// BrevardBidderAI - Button Component Stories
// Author: Ariel Shapira, Solo Founder, Everest Capital USA

import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../components/ui';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'outline', 'ghost', 'success', 'warning', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'default',
    size: 'md',
  },
};

export const Success: Story = {
  args: {
    children: 'BID',
    variant: 'success',
    size: 'md',
  },
};

export const Warning: Story = {
  args: {
    children: 'REVIEW',
    variant: 'warning',
    size: 'md',
  },
};

export const Danger: Story = {
  args: {
    children: 'SKIP',
    variant: 'danger',
    size: 'md',
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading...',
    variant: 'default',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    variant: 'default',
    disabled: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="success">Success</Button>
      <Button variant="warning">Warning</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>
    </div>
  ),
};
