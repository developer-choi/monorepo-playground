import {type ComponentProps, type ReactNode, useId} from 'react';
import clsx from 'clsx';
import Caption from '@/components/Caption/Caption';
import InputBase from '@/components/InputBase/InputBase';
import Label from '@/components/Label/Label';
import styles from './TextArea.module.scss';

export interface TextAreaProps extends ComponentProps<'textarea'> {
  label?: ReactNode;
  caption?: ReactNode;
  error?: ReactNode;
  isRequired?: boolean;
}

export default function TextArea({label, caption, error, isRequired, id, ...rest}: TextAreaProps) {
  const reactId = useId();
  const textareaId = id ?? reactId;
  const isInvalid = !!error;

  return (
    <div className={clsx(styles.field, styles.styled)}>
      {label && (
        <Label htmlFor={textareaId} isInvalid={isInvalid} isRequired={isRequired}>
          {label}
        </Label>
      )}
      <InputBase multiline isInvalid={isInvalid}>
        <textarea id={textareaId} {...rest} />
      </InputBase>
      {error ? <Caption isInvalid>{error}</Caption> : caption ? <Caption>{caption}</Caption> : null}
    </div>
  );
}
