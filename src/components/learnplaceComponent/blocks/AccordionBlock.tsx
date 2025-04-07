import {JSX, useEffect, useState} from 'react';
import { BsChevronRight } from "react-icons/bs";
import { LinkBlock } from './LinkBlock';
import { RichTextBlock } from './RichTextBlock';
import { PictureBlock } from './PictureBlock';
import { VideoBlock } from './VideoBlock';
import { isVisible } from '../../../utils/BlockVisibility.ts';

export const AccordionBlock = (props: {isWithinLearnplaceRadius: boolean, block: BlockInterface}) => {
  const { title, sub_blocks: subBlocks } = props.block;
  const [isOpen, setIsOpen] = useState(props.block.expand);
  const [visible, setVisible] = useState(false);
  const [subBlockComponents, setSubBlockComponents] = useState<JSX.Element[]>([]);

  useEffect(() => {
    if (!isVisible(props.block.visited, props.isWithinLearnplaceRadius, props.block.visible)) {
      setVisible(false);
    } else {
      setVisible(true);
    }

    const blockComponents = subBlocks.map((block: BlockInterface, idx: number) => {
        switch (block.type) {
          case 'ILIASLinkBlock':
            return <LinkBlock key={idx} block={block} isWithinLearnplaceRadius={props.isWithinLearnplaceRadius}/>;
          case 'RichTextBlock':
            return <RichTextBlock key={idx} block={block} isWithinLearnplaceRadius={props.isWithinLearnplaceRadius}/>;
          case 'AccordionBlock':
            return <AccordionBlock key={idx} block={block} isWithinLearnplaceRadius={props.isWithinLearnplaceRadius}/>;
          case 'PictureBlock':
            return <PictureBlock key={idx} block={block} isWithinLearnplaceRadius={props.isWithinLearnplaceRadius}/>;
          case 'VideoBlock':
            return <VideoBlock key={idx} block={block} isWithinLearnplaceRadius={props.isWithinLearnplaceRadius}/>;
          default:
            return null;
        }
      })
      .filter((component): component is JSX.Element => component != null);

    setSubBlockComponents(blockComponents);
  }, [props, subBlocks]);

  if (!visible) {
    return null;
  }

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  if (!subBlockComponents) {
    return null;
  }

  return (
    <div className="accordion-block">
      <button className="accordion-title" onClick={toggleAccordion}>
        <span
          className={`accordion-icon ${isOpen ? 'open' : ''}`}
        >
          <BsChevronRight />
        </span>
        {title}
      </button>

      <div
        className="accordion-content"
        style={{
          gridTemplateRows: isOpen ? `1fr` : `0fr`,
        }}
      >
        <div className="accordion-items">
          {subBlockComponents.length > 0 ? subBlockComponents : null}
        </div>
      </div>
    </div>
  );
}