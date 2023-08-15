import React, { useState, useEffect, useRef } from 'react';
import { WidgetNode } from '@vev/react';
import { Props } from '../Slideshow';
import { useNext, usePrev } from '../hooks';

import styles from './Slide.module.css';

export const Slide = ({
  vertical,
  index,
  speed,
  slides,
  onNextSlide,
}: Omit<Props, 'children'> & { index: number; onNextSlide: () => void }) => {
  const prevIndex = useRef(0);
  const [move, setMove] = useState(-100);
  const [transitionSpeed, setTransitionSpeed] = useState(speed || 200);
  const direction = vertical ? 'Y' : 'X';

  const NEXT = useNext(index, slides);
  const PREV = usePrev(index, slides);
  const [array, setArray] = useState([slides[PREV], slides[index], slides[NEXT]]);

  useEffect(() => {
    if (
      index === prevIndex.current + 1 ||
      (prevIndex.current === slides.length - 1 && index === 0 && slides.length !== 1)
    ) {
      prevIndex.current = index;
      setTransitionSpeed(speed || 200);
      setMove(-200);
    }

    if (
      index === prevIndex.current - 1 ||
      (prevIndex.current === 0 && index === slides.length - 1 && slides.length !== 1)
    ) {
      prevIndex.current = index;
      setTransitionSpeed(speed || 200);
      setMove(0);
    }
  }, [index, prevIndex, speed]);

  console.log('move', move);

  return (
    <div
      className={styles.wrapper}
      style={{
        transform: `translate${direction}(${move}%)`,
        transition: `transform ${transitionSpeed}ms linear`,
      }}
      onTransitionEnd={(e) => {
        if (e.propertyName === 'transform') {
          onNextSlide();
          setTransitionSpeed(0);
          setMove(-100);
          setArray([slides[PREV], slides[index], slides[NEXT]]);
        }
      }}
    >
      {array?.map((child: string, i: number) => {
        return (
          <div
            className={styles.slide}
            key={child}
            style={{
              transform: `translate${direction}(${100 * i}%)`,
              width: '100%',
            }}
          >
            {child && <WidgetNode id={child} />}
          </div>
        );
      })}
    </div>
  );
};
