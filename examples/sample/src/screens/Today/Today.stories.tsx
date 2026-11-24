import type { Meta, StoryObj } from '@storybook/react-vite';
import { Today } from './Today';

const sightings = [
  { id: '1', species: 'Marsh harrier', detail: '2, over the reedbed, 08:14', initials: 'MH' },
  { id: '2', species: 'Lapwing', detail: 'about 120, on the scrape, 08:40', initials: 'LA' },
  { id: '3', species: 'Bearded tit', detail: 'heard, not seen, 09:02', initials: 'BT' },
];

const meta = {
  title: 'Screens/Today',
  component: Today,
  args: { date: 'Monday 23 November', sightings, status: 'loaded' },
  argTypes: {
    status: { description: 'Which state the list is in.' },
    sightings: { description: 'What was seen, newest first.' },
  },
} satisfies Meta<typeof Today>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Loaded: Story = {};
export const Empty: Story = { args: { sightings: [] } };
export const Loading: Story = { args: { status: 'loading' } };
export const ErrorState: Story = { name: 'Error', args: { status: 'error', errorMessage: 'The sightings could not be loaded. Check your connection and try again.' } };
export const LongContent: Story = {
  args: { sightings: [{ id: '9', species: 'Black-tailed godwit (Icelandic race, in full summer plumage)', detail: 'about 340, spread across the whole of the eastern scrape and the flooded meadow beyond it, 07:55 to 09:30', initials: 'BG' }, ...sightings] },
};
