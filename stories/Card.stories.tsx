// BidDeed.AI - Card Component Stories
// Author: Ariel Shapira, Solo Founder, Everest Capital USA

import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, StatCard, PropertyCard } from '../components/ui';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>This is a card description.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-neutral-400">Card content goes here.</p>
      </CardContent>
      <CardFooter>
        <p className="text-neutral-500 text-sm">Card footer</p>
      </CardFooter>
    </Card>
  ),
};

export const WithHover: Story = {
  render: () => (
    <Card hover className="w-80">
      <CardHeader>
        <CardTitle>Hoverable Card</CardTitle>
        <CardDescription>Hover to see the effect.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-neutral-400">This card has a hover effect.</p>
      </CardContent>
    </Card>
  ),
};

export const StatCardExample: Story = {
  render: () => (
    <div className="flex gap-4">
      <StatCard 
        title="Total Properties" 
        value="19" 
        change="+5 this week"
        changeType="positive"
      />
      <StatCard 
        title="BID" 
        value="4" 
        changeType="positive"
      />
      <StatCard 
        title="REVIEW" 
        value="3" 
        changeType="neutral"
      />
      <StatCard 
        title="SKIP" 
        value="12" 
        changeType="negative"
      />
    </div>
  ),
};

export const PropertyCardExample: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <PropertyCard
        address="123 Main St, Melbourne FL"
        caseNumber="05-2024-CA-012345"
        judgment={185000}
        openingBid={138750}
        recommendation="BID"
        mlProbability={72}
      />
      <PropertyCard
        address="456 Oak Ave, Palm Bay FL"
        caseNumber="05-2024-CA-012346"
        judgment={220000}
        openingBid={165000}
        recommendation="REVIEW"
        mlProbability={55}
      />
      <PropertyCard
        address="789 Pine Rd, Titusville FL"
        caseNumber="05-2024-CA-012347"
        judgment={95000}
        openingBid={71250}
        recommendation="SKIP"
        mlProbability={28}
      />
    </div>
  ),
};
