export interface ToastOptions {
  title: string;
  description?: string;
  duration?: number;
}

export interface ToastItem extends ToastOptions {
  id: number;
  open: boolean;
}

export function toast(options: ToastOptions) {
  const next = [...items.filter((item) => item.open), {...options, id: nextId++, open: true}];
  const overflow = next.length - MAX_VISIBLE;
  setItems(next.map((item, index) => (index < overflow ? {...item, open: false} : item)));
}

/* 배열에서 바로 빼지 않고 open=false로 두어야 radix가 닫힘 애니메이션을 마친 뒤 내린다. */
export function closeToast(id: number) {
  setItems(items.map((item) => (item.id === id ? {...item, open: false} : item)));
}

export function subscribeToasts(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getToasts() {
  return items;
}

export function clearToasts() {
  setItems(EMPTY_TOASTS);
}

export const EMPTY_TOASTS: ToastItem[] = [];
const MAX_VISIBLE = 2;

let items: ToastItem[] = EMPTY_TOASTS;
let nextId = 0;
const listeners = new Set<() => void>();

function setItems(next: ToastItem[]) {
  items = next;
  listeners.forEach((listener) => listener());
}
