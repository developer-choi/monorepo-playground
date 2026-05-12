# Storybook Controls 패널 — render 반영 원칙

Controls 패널에 노출되는 prop은 반드시 render에 반영되어야 한다. args 값이 실제로 컴포넌트에 흘러 들어가서 토글 시 화면이 바뀌어야 한다.

render가 args를 무시하고 prop을 하드코딩한다면, 해당 prop은 args에서 제거하고 Controls 패널에서도 행 자체를 숨긴다.

## 위반

토글해도 화면이 안 바뀌는 컨트롤은 만들지 않는다. 아래 `content`는 `args`에 있어 Controls 패널에 노출되지만 `render`가 무시한다.

```tsx
export const Positions: Story = {
  args: {
    content: 'Tooltip content',
    position: 'bottom-center',
  },
  render: () => (
    <div>
      {POSITIONS.map((position) => (
        <Tooltip key={position} content={position} position={position} />
      ))}
    </div>
  ),
};
```

## 올바른 사용

`render`가 사용하지 않는 prop은 `args`에서 제거하고, story-level `argTypes`에서 행 자체를 숨긴다.

```tsx
export const Positions: Story = {
  argTypes: {
    content: {table: {disable: true}},
    position: {table: {disable: true}},
  },
  render: () => (
    <div>
      {POSITIONS.map((position) => (
        <Tooltip key={position} content={position} position={position} />
      ))}
    </div>
  ),
};
```

## 일부 props만 고정하는 경우

`{...args}`로 args를 흘려보내되, 고정할 prop만 spread 뒤에 하드코딩으로 덮어쓴다. 해당 prop은 `argTypes`에서 숨긴다.

```tsx
export const WithLeading: Story = {
  argTypes: {
    leading: {table: {disable: true}},
  },
  render: (args) => (
    <InputBase {...args} leading={<SearchIcon />}>
      <input />
    </InputBase>
  ),
};
```
