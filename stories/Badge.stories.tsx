// BidDeed.AI - Badge Component Stories
// Author: Ariel Shapira, Solo Founder, Everest Capital USA

import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '../components/ui';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'success', 'warning', 'danger', 'bid', 'review', 'skip'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: 'Badge',
    variant: 'default',
    size: 'md',
  },
};

export const BID: Story = {
  args: {
    children: 'BID',
    variant: 'bid',
    size: 'md',
  },
};

export const REVIEW: Story = {
  args: {
    children: 'REVIEW',
    variant: 'review',
    size: 'md',
  },
};

export const SKIP: Story = {
  args: {
    children: 'SKIP',
    variant: 'skip',
    size: 'md',
  },
};

export const Recommendations: Story = {
  render: () => (
    <div className="flex gap-4">
      <Badge variant="bid">BID</Badge>
      <Badge variant="review">REVIEW</Badge>
      <Badge variant="skip">SKIP</Badge>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge variant="default">Default</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="danger">Danger</Badge>
      <Badge variant="bid">BID</Badge>
      <Badge variant="review">REVIEW</Badge>
      <Badge variant="skip">SKIP</Badge>
    </div>
  ),
};
