'use client';

import {type ComponentProps, useState} from 'react';
import {EyeClosedIcon, EyeOpenIcon} from '@radix-ui/react-icons';
import IconButton from '@/components/IconButton/IconButton';
import TextField from '@/components/TextField/TextField';

export type PasswordFieldProps = Omit<ComponentProps<typeof TextField>, 'type' | 'trailing' | 'suffix'>;

export default function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      trailing={
        <IconButton
          icon={visible ? <EyeOpenIcon /> : <EyeClosedIcon />}
          label={visible ? '비밀번호 숨기기' : '비밀번호 표시'}
          size="small"
          onClick={() => setVisible((prev) => !prev)}
        />
      }
      type={visible ? 'text' : 'password'}
      {...props}
    />
  );
}
