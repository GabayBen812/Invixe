import { CommonActions, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "./AppNavigator";

let lastSelectedUnitIdx: number | null = null;

export function rememberMapUnitIndex(selectedUnitIdx: number | null) {
  lastSelectedUnitIdx = selectedUnitIdx;
}

export function getRememberedMapUnitIndex(): number | null {
  return lastSelectedUnitIdx;
}

type MapParams = RootStackParamList["Map"];

export function resetToMapScreen(
  navigation: NavigationProp<RootStackParamList>,
  params?: MapParams,
) {
  if (params?.selectedUnitIdx !== undefined) {
    rememberMapUnitIndex(params.selectedUnitIdx ?? null);
  }

  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: "Map", params: params ?? {} }],
    }),
  );
}

export function openMapFromTab(
  navigation: NavigationProp<RootStackParamList>,
) {
  const selectedUnitIdx = lastSelectedUnitIdx;
  resetToMapScreen(
    navigation,
    selectedUnitIdx !== null ? { selectedUnitIdx } : {},
  );
}

export function resetToLessonScreen(
  navigation: NavigationProp<RootStackParamList>,
  lessonId: number,
  unitId?: string,
  selectedUnitIdx?: number,
) {
  if (selectedUnitIdx !== undefined) {
    rememberMapUnitIndex(selectedUnitIdx);
  }

  const mapParams =
    selectedUnitIdx !== undefined ? { selectedUnitIdx } : undefined;

  navigation.dispatch(
    CommonActions.reset({
      index: 1,
      routes: [
        { name: "Map", params: mapParams ?? {} },
        { name: "Lesson", params: { lessonId, unitId } },
      ],
    }),
  );
}
