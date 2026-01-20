import {type PropsWithChildren, useEffect, useState} from 'react';
import {createPortal} from 'react-dom';

export default function Portal({children}: PropsWithChildren) {
  const [mountNode, setMountNode] = useState<Element | null>(null);

  useEffect(() => {
    setMountNode(document.body);
  }, []);

  return mountNode ? createPortal(children, mountNode) : null;
};
