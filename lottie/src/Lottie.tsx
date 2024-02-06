import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  registerVevComponent,
  useDispatchVevEvent,
  useVevEvent,
  useEditorState,
} from "@vev/react";
import { colorify, getColors } from "lottie-colorify";
import { File, LottieColor, LottieColorReplacement } from "./types";
import defaultAnimation from "./constants/defaultAnimation";
import ColorPicker from "./components/ColorPicker";
import {
  DotLottiePlayer,
  Controls,
  PlayerEvents,
  DotLottieCommonPlayer,
} from "@dotlottie/react-player";
import "@dotlottie/react-player/dist/index.css";

import styles from "./Lottie.module.css";
import SpeedSlider from "./components/SpeedSlider";
import { Events, Interactions } from "./events";

type Props = {
  file: File;
  hostRef: React.RefObject<HTMLDivElement>;
  autoplay: boolean;
  loop: boolean;
  speed: number;
  colors: LottieColorReplacement[];
  controls: boolean;
};

const Lottie = ({
  file,
  loop = true,
  speed = 1,
  colors,
  autoplay = true,
  controls,
}: Props) => {
  const lottieRef = useRef<DotLottieCommonPlayer | null>(null);
  const dispatchVevEvent = useDispatchVevEvent();
  const { disabled } = useEditorState();

  const isJSON = (file?.url && file?.type === "application/json") || !file?.url;

  const [json, setJson] = useState({});
  const [lottieColors, setLottieColors] = useState<LottieColor[]>([]);

  const path = (file && file.url) || defaultAnimation;
  const colorsChanged = JSON.stringify({ lottieColors, colors });

  useVevEvent(Interactions.PLAY, () => {
    if (lottieRef.current) {
      lottieRef.current.setDirection(1);
      lottieRef.current?.play();
    }
  });

  useVevEvent(Interactions.PLAY_REVERSE, () => {
    if (lottieRef.current) {
      lottieRef.current.setDirection(-1);
      lottieRef.current?.play();
    }
  });

  useVevEvent(Interactions.PAUSE, () => {
    if (lottieRef.current) {
      lottieRef.current.pause();
    }
  });

  useVevEvent(Interactions.TOGGLE, () => {
    if (lottieRef.current) {
      if (lottieRef.current.currentState === "paused") {
        lottieRef.current?.play();
      } else {
        lottieRef.current?.pause();
      }
    }
  });

  useVevEvent(Interactions.RESET_ANIMATION, () => {
    if (lottieRef.current) {
      lottieRef.current?.goToAndStop(0);
    }
  });

  console.log("colors", colors);

  // Fetch json data when file url changes
  useEffect(() => {
    const fetchJson = async () => {
      try {
        const response = await fetch(path);
        if (response.ok) {
          console.log("fetch");
          const result = await response.json();
          const lottieColors = getColors(result);

          const colorOverrides = lottieColors.map(
            (lc: string | { oldColor: string }) => {
              const match = colors?.find(
                (c) => String(c.oldColor) === String(lc)
              );
              return match ? match.newColor : lc;
            }
          );

          if (colorOverrides.length && isJSON) {
            const jsonWithColor = colorify(colorOverrides, result);
            setJson(jsonWithColor);
          } else {
            setJson(json);
          }
        }
      } catch (e) {
        console.log("error", e);
        setJson({});
      }
    };

    isJSON && fetchJson();
  }, [colorsChanged]);

  useEffect(() => {
    if (disabled) {
      lottieRef.current?.goToAndStop(0);
    } else {
      lottieRef.current?.setLoop(!!loop);
      autoplay ? lottieRef.current?.play() : lottieRef.current?.pause();
    }
  }, [autoplay, loop, speed, disabled]);

  return (
    <DotLottiePlayer
      src={isJSON ? json : path}
      ref={lottieRef}
      speed={speed}
      onEvent={(event: PlayerEvents) => {
        const events = {
          [PlayerEvents.Play]: Events.PLAY,
          [PlayerEvents.Pause]: Events.PAUSE,
          [PlayerEvents.Complete]: Events.COMPLETE,
          [PlayerEvents.LoopComplete]: Events.LOOP_COMPLETED,
        };

        if (Object.keys(events).includes(event)) {
          dispatchVevEvent(events[event as keyof typeof events]);
        }
      }}
    >
      {controls && <Controls />}
    </DotLottiePlayer>
  );
};

registerVevComponent(Lottie, {
  name: "Lottie Animation",
  description:
    "Lottie is a JSON-based animation file format that enables designers to ship animations on any platform as easily as shipping static assets. Make your own Lottie animations in Adobe After Effects, or more easily, find animations on [lottiefiles.com](https://lottiefiles.com/featured) \n\nUse this element to upload and display your JSON file containing the Lottie animation.",
  icon: "https://cdn.vev.design/private/pK53XiUzGnRFw1uPeFta7gdedx22/5Vtsm6QxVv_lottieFiles.png.png",
  events: [
    {
      type: Events.PLAY,
      description: "Playing",
    },
    {
      type: Events.PAUSE,
      description: "Paused",
    },
    {
      type: Events.LOOP_COMPLETED,
      description: "Loop completed",
    },
    {
      type: Events.COMPLETE,
      description: "Completed",
    },
  ],
  interactions: [
    {
      type: Interactions.PLAY,
      description: "Play",
    },
    {
      type: Interactions.PLAY_REVERSE,
      description: "Play reverse",
    },
    {
      type: Interactions.PAUSE,
      description: "Pause",
    },
    {
      type: Interactions.TOGGLE,
      description: "Toggle",
    },
    {
      type: Interactions.RESET_ANIMATION,
      description: "Reset animation",
    },
  ],
  props: [
    {
      name: "file",
      title: "Lottie file",
      type: "upload",
      accept: ".lottie,.json",
      description:
        "JSON file exported from After Effects or downloaded from lottiefiles.com",
    },
    {
      name: "autoplay",
      title: "Autoplay",
      type: "boolean",
      initialValue: true,
    },
    {
      name: "loop",
      title: "Loop",
      type: "boolean",
      initialValue: true,
    },
    {
      name: "controls",
      title: "Controls",
      type: "boolean",
      initialValue: false,
    },
    {
      name: "speed",
      title: "Playback speed",
      type: "number",
      initialValue: 1,
      component: SpeedSlider,
      hidden: (context) => context?.value?.trigger === "scroll",
    },
    {
      name: "colors",
      title: "Colors",
      type: "array",
      of: "string",
      component: ColorPicker,
      hidden(context) {
        const isDotLottie =
          context?.value?.file &&
          context?.value?.file?.type !== "application/json";
        return isDotLottie;
      },
    },
  ],
  editableCSS: [
    {
      selector: styles.wrapper,
      title: "Container",
      properties: [
        "background",
        "border",
        "border-radius",
        "padding",
        "opacity",
        "filter",
      ],
    },
  ],
  type: "both",
});

export default Lottie;
