import type { Meta, StoryObj } from '@storybook/react-vite';
import { Chip } from './Chip';

const meta = { title: 'Components/Chip', component: Chip, args: { label: 'Design' } } satisfies Meta<typeof Chip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
