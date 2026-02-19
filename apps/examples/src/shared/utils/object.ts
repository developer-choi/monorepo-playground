export interface LabelItem<T> {
  value: T;
  label: string;
}

export interface LabelMap<T extends string> {
  items: LabelItem<T>[];
  record: Record<T, string>;
  values: T[];
}

export function createLabelMap<T extends string>(items: LabelItem<T>[]): LabelMap<T> {
  const record = {} as Record<T, string>;
  const values: T[] = [];
  for (const {value, label} of items) {
    record[value] = label;
    values.push(value);
  }
  return {items, record, values};
}
