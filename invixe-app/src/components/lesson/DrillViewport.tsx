import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type DrillViewportContextValue = {
  height: number;
};

const DrillViewportContext = createContext<DrillViewportContextValue>({
  height: 0,
});

export function useDrillViewportHeight(): number {
  return useContext(DrillViewportContext).height;
}

type DrillViewportProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Measures the drill area between bubble and footer — no scrolling. */
export default function DrillViewport({ children, style }: DrillViewportProps) {
  const [height, setHeight] = useState(0);
  const value = useMemo(() => ({ height }), [height]);

  const onLayout = (event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.height;
    if (next > 0 && Math.abs(next - height) > 1) {
      setHeight(next);
    }
  };

  return (
    <DrillViewportContext.Provider value={value}>
      <View style={style} onLayout={onLayout}>
        {children}
      </View>
    </DrillViewportContext.Provider>
  );
}
