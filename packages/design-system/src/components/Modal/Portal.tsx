import {type PropsWithChildren, useEffect, useState} from 'react';
import {createPortal} from 'react-dom';

export default function Portal({children}: PropsWithChildren) {
  const [mountNode, setMountNode] = useState<Element | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMountNode(document.body);
  }, []);

  return mountNode ? createPortal(children, mountNode) : null;
};
