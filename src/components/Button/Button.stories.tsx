import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const Icon = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" focusable="false">
    <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

const meta = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Save changes' },
  argTypes: {
    variant: { description: 'Emphasis of the button.', control: 'select', options: ['primary', 'secondary', 'ghost'] },
    intent: { description: 'Meaning of the action.', control: 'inline-radio', options: ['neutral', 'danger'] },
    size: { description: 'Size of the button.', control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    loading: { description: 'Pending state: aria-busy, focus kept, presses ignored.', control: 'boolean' },
    fullWidth: { description: 'Stretch to the container width.', control: 'boolean' },
    disabled: { description: 'Native disabled state.', control: 'boolean' },
    startIcon: { description: 'Decorative icon before the label.', control: false },
    endIcon: { description: 'Decorative icon after the label.', control: false },
    type: { description: 'Button type. Defaults to "button".', control: 'inline-radio', options: ['button', 'submit', 'reset'] },
    children: { description: 'Label content.', control: 'text' },
    'aria-label': { description: 'Required when the button has no text.', control: 'text' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
/** Hover, pressed and focus-visible are driven by the interaction states. */
export const Hover: Story = { parameters: { pseudo: { hover: true } } };
export const Pressed: Story = { parameters: { pseudo: { active: true } } };
export const FocusVisible: Story = { parameters: { pseudo: { focusVisible: true } } };
export const Disabled: Story = { args: { disabled: true } };
export const Loading: Story = { args: { loading: true, children: 'Saving' } };
export const IconOnly: Story = { args: { children: undefined, startIcon: <Icon />, 'aria-label': 'Add item' } };
export const WithIcons: Story = { args: { startIcon: <Icon />, endIcon: <Icon /> } };
export const Danger: Story = { args: { intent: 'danger', children: 'Delete account' } };
export const DangerSecondary: Story = { args: { intent: 'danger', variant: 'secondary', children: 'Delete account' } };
export const Small: Story = { args: { size: 'sm' } };
export const Large: Story = { args: { size: 'lg' } };
export const LongLabel: Story = {
  args: { children: 'Save all changes to the project settings and notify every member of the workspace' },
  decorators: [(Story) => <div style={{ maxInlineSize: '20rem' }}><Story /></div>],
};
export const FullWidth: Story = {
  args: { fullWidth: true },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
/** Text scaled to 200%: the label must wrap, not clip. */
export const TextScale200: Story = {
  args: { children: 'Save changes to the project' },
  decorators: [(Story) => <div style={{ fontSize: '200%', maxInlineSize: '20rem' }}><Story /></div>],
};
