import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dialog } from './Dialog';

function Demo({ initiallyOpen = false }: { initiallyOpen?: boolean }) {
  const [open, setOpen] = React.useState(initiallyOpen);
  return (
    <>
      <button type="button" data-slot="trigger" onClick={() => setOpen(true)}>Open dialog</button>
      <Dialog open={open} onOpenChange={setOpen} title="Delete project?">
        <p>This removes the project and all of its files.</p>
      </Dialog>
    </>
  );
}

const meta = { title: 'Components/Dialog', component: Demo } satisfies Meta<typeof Demo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};
export const Open: Story = { args: { initiallyOpen: true } };
