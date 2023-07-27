import React, { useEffect, useState } from 'react';
import styles from './Flourish.module.css';
import { registerVevComponent, useScrollTop, useSize, useViewport } from '@vev/react';

type Props = {
  formUrl: string;
  scrollytelling: boolean;
  numberOfSlides: number;
  distance: number;
  type: 'bottom' | 'distance' | 'element';
  hostRef: React.MutableRefObject<HTMLDivElement>;
};

const DEFAULT_SCROLLYTELLING_URL = 'https://flo.uri.sh/story/468238/embed';
const DEFAULT_URL = 'https://flo.uri.sh/story/1767962/embed';

const Flourish = ({
  formUrl = DEFAULT_URL,
  scrollytelling = false,
  numberOfSlides,
  distance,
  type,
  hostRef,
}: Props) => {
  const [top, setTop] = useState<number>(0);
  const [url, setUrl] = useState<string>(formUrl);
  const scrollTop = useScrollTop();
  const { scrollHeight, height } = useViewport();
  const { height: hostHeight } = useSize(hostRef);
  const [slideChangeDistance, setSlideChangeDistance] = useState<number>(0);
  const [slide, setSlide] = useState<number>(0);

  // Strip hash if scrollytelling
  useEffect(() => {
    if (scrollytelling) {
      let newUrl;
      if (scrollytelling && formUrl === DEFAULT_URL) {
        newUrl = DEFAULT_SCROLLYTELLING_URL;
      }

      const urlObj = new URL(newUrl);
      setUrl(`${urlObj.origin}${urlObj.pathname}`);
    } else {
      setUrl(formUrl);
    }
  }, [formUrl, scrollytelling]);

  // Set top offset
  useEffect(() => {
    setTop(hostRef.current.getBoundingClientRect().top);
  }, [hostRef]);

  // Set slide change distance
  useEffect(() => {
    if (type === 'bottom') {
      setSlideChangeDistance((scrollHeight - height) / numberOfSlides);
    } else if (type === 'distance') {
      setSlideChangeDistance(distance);
    } else if (type === 'element') {
      // Will add when CLI has widget select
    }
  }, [scrollHeight, numberOfSlides, height, type, distance]);

  // Set slide
  useEffect(() => {
    if (scrollTop === 0) {
      setSlide(0);
    } else {
      setSlide(Math.round(scrollTop / slideChangeDistance));
    }
  }, [scrollTop, slideChangeDistance]);

  // Update url with slide
  useEffect(() => {
    const urlObj = new URL(url);
    setUrl(`${urlObj.origin}${urlObj.pathname}#slide-${slide}`);
  }, [slide, url]);

  return (
    <iframe
      className="flourish fill"
      src={url}
      sandbox="allow-scripts allow-popups"
      frameBorder="0"
    />
  );
};

registerVevComponent(Flourish, {
  name: 'Flourish',
  props: [
    {
      title: 'Flourish URL',
      name: 'formUrl',
      type: 'string',
      initialValue: 'https://flo.uri.sh/story/1767962/embed',
    },
    {
      title: 'Scrollytelling',
      name: 'scrollytelling',
      type: 'boolean',
      initialValue: false,
    },
    {
      title: 'Number of slides',
      name: 'numberOfSlides',
      type: 'number',
      hidden: (context) => {
        return context.value.scrollytelling !== true;
      },
    },
    {
      title: 'Play for how long',
      name: 'type',
      type: 'select',
      options: {
        items: [
          { label: 'Bottom of page', value: 'bottom' },
          {
            label: 'Distance',
            value: 'distance',
          },
          { label: 'To element', value: 'element' },
        ],
        display: 'dropdown',
      },
      hidden: (context) => {
        return context.value.scrollytelling !== true;
      },
    },
    {
      title: 'Distance in px',
      name: 'distance',
      type: 'number',
      hidden: (context) => {
        return context.value.type !== 'distance';
      },
    },
  ],
  editableCSS: [
    {
      selector: styles.wrapper,
      properties: ['background'],
    },
  ],
  type: 'both',
});

export default Flourish;
