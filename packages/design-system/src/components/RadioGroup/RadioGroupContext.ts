'use client';

import {type ChangeEventHandler, createContext} from 'react';

export interface RadioGroupContextValue {
  name?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}

export const radioGroupContext = createContext<RadioGroupContextValue>({});
