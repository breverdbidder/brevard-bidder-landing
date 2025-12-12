// BidDeed.AI - Loading States Stories
// Author: Ariel Shapira, Solo Founder, Everest Capital USA

import type { Meta, StoryObj } from '@storybook/react';
import { 
  PropertyCardSkeleton, 
  StatCardSkeleton, 
  TableSkeleton, 
  ChartSkeleton,
  Spinner,
  PageLoader,
  ErrorMessage,
  EmptyState,
  Toast
} from '../components/LoadingStates';

const meta: Meta = {
  title: 'Components/Loading States',
  tags: ['autodocs'],
};

export default meta;

export const Skeletons: StoryObj = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-white text-sm font-medium mb-2">Property Card Skeleton</h3>
        <PropertyCardSkeleton />
      </div>
      <div>
        <h3 className="text-white text-sm font-medium mb-2">Stat Card Skeletons</h3>
        <div className="grid grid-cols-4 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </div>
      <div>
        <h3 className="text-white text-sm font-medium mb-2">Chart Skeleton</h3>
        <ChartSkeleton />
      </div>
    </div>
  ),
};

export const TableSkeletonExample: StoryObj = {
  render: () => <TableSkeleton rows={5} />,
};

export const Spinners: StoryObj = {
  render: () => (
    <div className="flex items-center gap-8">
      <div className="text-center">
        <Spinner size="sm" className="text-blue-500 mb-2" />
        <p className="text-neutral-400 text-xs">Small</p>
      </div>
      <div className="text-center">
        <Spinner size="md" className="text-blue-500 mb-2" />
        <p className="text-neutral-400 text-xs">Medium</p>
      </div>
      <div className="text-center">
        <Spinner size="lg" className="text-blue-500 mb-2" />
        <p className="text-neutral-400 text-xs">Large</p>
      </div>
      <div className="text-center">
        <Spinner size="xl" className="text-blue-500 mb-2" />
        <p className="text-neutral-400 text-xs">XL</p>
      </div>
    </div>
  ),
};

export const ErrorMessageExample: StoryObj = {
  render: () => (
    <ErrorMessage
      title="Failed to load auctions"
      message="Unable to connect to the server. Please check your connection and try again."
      onRetry={() => alert('Retry clicked!')}
    />
  ),
};

export const EmptyStateExample: StoryObj = {
  render: () => (
    <EmptyState
      title="No auctions found"
      message="There are no upcoming auctions matching your criteria."
      icon="🏠"
      action={() => alert('Action clicked!')}
      actionLabel="View All Auctions"
    />
  ),
};

export const Toasts: StoryObj = {
  render: () => (
    <div className="space-y-4">
      <Toast message="This is an info message" type="info" onClose={() => {}} duration={0} />
      <Toast message="Operation completed successfully!" type="success" onClose={() => {}} duration={0} />
      <Toast message="Please review before proceeding" type="warning" onClose={() => {}} duration={0} />
      <Toast message="An error occurred" type="error" onClose={() => {}} duration={0} />
    </div>
  ),
};
