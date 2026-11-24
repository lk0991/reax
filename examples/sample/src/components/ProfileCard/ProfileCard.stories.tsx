import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProfileCard } from './ProfileCard';

const meta = {
  title: 'Components/ProfileCard',
  component: ProfileCard,
  args: { name: 'Ada Lovelace', initials: 'AL', bio: 'Writes the first published algorithm for a computing machine.' },
} satisfies Meta<typeof ProfileCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const LongBio: Story = { args: { bio: 'A much longer description that wraps across several lines at narrow widths, so the reflow capture at 320 pixels has something to check.' } };
export const InsideAPage: Story = { args: { headingLevel: 2 } };
