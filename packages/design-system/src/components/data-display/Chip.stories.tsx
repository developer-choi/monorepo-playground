import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import Chip from './Chip';

const meta: Meta<typeof Chip> = {
  title: 'Components/data-display/Chip',
  component: Chip,
  parameters: {
    layout: 'centered',
  },
  args: {
    children: '야근',
    removeLabel: '야근 지우기',
    color: 'danger',
    variant: 'soft',
    size: 'medium',
  },
  argTypes: {
    onRemove: {action: 'removed'},
  },
};

export default meta;
type Story = StoryObj<typeof Chip>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div className="storyRow">
      <Chip {...args} size="small">
        small
      </Chip>
      <Chip {...args} size="medium">
        medium
      </Chip>
    </div>
  ),
};

function RemovableListStory() {
  const [tags, setTags] = useState(['야근', '회식', '늦잠']);

  return (
    <ul className="storyRow">
      {tags.map((tag) => (
        <li key={tag}>
          <Chip
            color="danger"
            removeLabel={`${tag} 지우기`}
            onRemove={() => setTags((prev) => prev.filter((item) => item !== tag))}
          >
            {tag}
          </Chip>
        </li>
      ))}
    </ul>
  );
}

export const RemovableList: Story = {
  render: () => <RemovableListStory />,
};
