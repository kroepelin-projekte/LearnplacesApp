import DOMPurify from 'dompurify';
import { useEffect, useState } from 'react';
import { isVisible } from '../../../utils/BlockVisibility.ts';

export const RichTextBlock = (props: {isWithinLearnplaceRadius: boolean, block: BlockInterface}) => {
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
    <div className="rich-text-block">
      <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(props.block.content) }} />
    </div>
  );
}
