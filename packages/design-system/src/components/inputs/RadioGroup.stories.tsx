import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import Radio from '@/components/inputs/Radio';
import RadioGroup from './RadioGroup';

const meta: Meta<typeof RadioGroup> = {
  title: 'Components/inputs/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    direction: {control: 'inline-radio', options: ['row', 'column']},
    name: {control: false},
    value: {control: false},
    children: {control: false},
  },
  render: (args) => (
    <RadioGroup {...args}>
      <Radio value="free">무료</Radio>
      <Radio value="pro">프로</Radio>
      <Radio value="enterprise">엔터프라이즈</Radio>
    </RadioGroup>
  ),
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Uncontrolled: Story = {
  args: {name: 'plan-uncontrolled'},
};

export const Controlled: Story = {
  render: function Controlled(args) {
    const [value, setValue] = useState('pro');

    return (
      <div>
        <RadioGroup {...args} name="plan-controlled" value={value} onChange={(event) => setValue(event.target.value)}>
          <Radio value="free">무료</Radio>
          <Radio value="pro">프로</Radio>
          <Radio value="enterprise">엔터프라이즈</Radio>
        </RadioGroup>
        <p>선택: {value}</p>
      </div>
    );
  },
};

export const Column: Story = {
  args: {name: 'plan-column', direction: 'column'},
};

export const WithDisabledOption: Story = {
  render: (args) => (
    <RadioGroup {...args} name="plan-disabled">
      <Radio value="free">무료</Radio>
      <Radio disabled value="pro">
        프로 (준비중)
      </Radio>
      <Radio value="enterprise">엔터프라이즈</Radio>
    </RadioGroup>
  ),
};
