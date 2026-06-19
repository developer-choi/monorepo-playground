import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {Cross2Icon, MagnifyingGlassIcon} from '@radix-ui/react-icons';
import IconButton from '@/components/IconButton/IconButton';
import InputBase from './InputBase';

const meta: Meta<typeof InputBase> = {
  title: 'Components/InputBase',
  component: InputBase,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          '## 슬롯(leading/trailing) 포커스 동작',
          '',
          'InputBase는 `<label>`로 렌더되며 content 슬롯의 input을 감쌉니다(암묵적 연결). 이 구조에서 클릭 시 포커스는 다음과 같이 갈립니다.',
          '',
          '- 박스의 비인터랙티브 영역(여백·플레이스홀더·장식 아이콘)을 클릭하면 label 기본동작으로 **input에 포커스가 갑니다**.',
          '- leading/trailing 슬롯의 인터랙티브 요소(버튼 등)를 클릭하면 input이 아니라 **그 요소가 포커스를 가져갑니다**.',
          '',
          '후자는 WHATWG HTML 스펙이 보장하는 동작입니다:',
          '',
          '> The activation behavior of a label element for events targeted at interactive content descendants of a label element, and any descendants of those interactive content descendants, must be to do nothing.',
          '> — https://html.spec.whatwg.org/multipage/forms.html#the-label-element',
          '',
          '즉 인터랙티브 자손은 label의 포커스 위임에서 제외되며, **이것이 의도된 정상 동작입니다**(PasswordField 눈 토글처럼 슬롯 버튼은 자기가 포커스를 가져야 합니다).',
          '',
          '주의:',
          '',
          '- 이 분기는 슬롯 `<span>` 래퍼와 무관합니다(span은 flex 레이아웃용). 포커스 향방을 가르는 건 클릭 대상이 인터랙티브 콘텐츠인지 여부뿐입니다.',
          '- "버튼이 포커스를 먹는 것"을 막으려는 `preventDefault`/`stopPropagation` 류를 넣지 마세요 — 정상 동작을 깨뜨립니다.',
          '',
          '검증은 `InteractiveSlots` 스토리에서 직접 할 수 있습니다.',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    isInvalid: {control: 'boolean'},
    suffix: {control: 'text'},
    leading: {control: false},
    trailing: {control: false},
    children: {control: false},
  },
  args: {
    isInvalid: false,
  },
  // eslint-disable-next-line no-restricted-syntax -- Storybook 데모 컨테이너 폭. 동적 값 아님
  decorators: [(story) => <div style={{width: 320}}>{story()}</div>],
  render: (args) => (
    <InputBase {...args}>
      <input placeholder="입력하세요" />
    </InputBase>
  ),
};

export default meta;
type Story = StoryObj<typeof InputBase>;

export const Default: Story = {};

export const Invalid: Story = {
  args: {isInvalid: true},
};

export const Disabled: Story = {
  render: (args) => (
    <InputBase {...args}>
      <input disabled placeholder="입력하세요" />
    </InputBase>
  ),
};

export const ReadOnly: Story = {
  render: (args) => (
    <InputBase {...args}>
      <input readOnly placeholder="입력하세요" value="읽기 전용 값" />
    </InputBase>
  ),
};

export const WithSuffix: Story = {
  args: {suffix: '원'},
};

export const WithSlots: Story = {
  args: {
    leading: <span aria-hidden>🔍</span>,
    trailing: <span aria-hidden>✕</span>,
  },
};

export const InteractiveSlots: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '슬롯에 인터랙티브 요소(버튼)를 넣었을 때 포커스 향방을 확인하는 스토리입니다. 박스 빈 곳/플레이스홀더를 클릭하면 input에 포커스가 가고(label 기본동작), 버튼을 클릭하면 버튼이 포커스를 가져갑니다(인터랙티브 자손이라 label 동작이 발동하지 않습니다).',
      },
    },
  },
  render: function InteractiveSlots(args) {
    const [focused, setFocused] = useState('—');

    return (
      <div>
        <InputBase
          {...args}
          leading={
            <IconButton icon={<MagnifyingGlassIcon />} size="small" onFocus={() => setFocused('leading 버튼')} />
          }
          trailing={<IconButton icon={<Cross2Icon />} size="small" onFocus={() => setFocused('trailing 버튼')} />}
        >
          <input placeholder="입력하세요" onFocus={() => setFocused('input')} />
        </InputBase>
        <p>현재 포커스: {focused}</p>
      </div>
    );
  },
};
