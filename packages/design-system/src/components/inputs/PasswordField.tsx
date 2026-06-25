'use client';

import {type ComponentProps, useState} from 'react';
import {EyeClosedIcon, EyeOpenIcon} from '@radix-ui/react-icons';
import IconButton from '@/components/inputs/IconButton';
import TextField from '@/components/inputs/TextField';

export type PasswordFieldProps = Omit<ComponentProps<typeof TextField>, 'type' | 'trailing' | 'suffix'>;

export default function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      trailing={
        <IconButton
          icon={visible ? <EyeOpenIcon /> : <EyeClosedIcon />}
          size="small"
          onClick={() => setVisible((prev) => !prev)}
        />
      }
      type={visible ? 'text' : 'password'}
      {...props}
    />
  );
}
