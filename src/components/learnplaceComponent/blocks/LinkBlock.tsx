import { useEffect, useState } from 'react';
import { isVisible } from '../../../utils/BlockVisibility.ts';
import { BlockInterface } from '../../../types/types.ts';

export const LinkBlock = (props: {isWithinLearnplaceRadius: boolean, block: BlockInterface}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isVisible(true, props.isWithinLearnplaceRadius, props.block.visible)) {
      setVisible(false);
    } else {
      setVisible(true);
    }
  }, [props]);

  if (!visible) {
    return null;
  }

  return (
    <div className="center-horizontally">
      <a href={props.block.ilias_obj_url} target="_blank" rel="noopener noreferrer" className="btn">{props.block.ilias_obj_title}</a>
    </div>
  )
}