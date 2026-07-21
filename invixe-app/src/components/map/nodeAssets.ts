import type { FC } from "react";
import type { SvgProps } from "react-native-svg";

import C1U1Completed from "../../assets/nodes/c1u1-completed.svg";
import C1U1Inuse from "../../assets/nodes/c1u1-inuse.svg";
import C1U1Locked from "../../assets/nodes/c1u1-locked.svg";
import C1U2Completed from "../../assets/nodes/c1u2-completed.svg";
import C1U2Inuse from "../../assets/nodes/c1u2-inuse.svg";
import C1U2Locked from "../../assets/nodes/c1u2-locked.svg";
import C1U3Completed from "../../assets/nodes/c1u3-completed.svg";
import C1U3Inuse from "../../assets/nodes/c1u3-inuse.svg";
import C1U3Locked from "../../assets/nodes/c1u3-locked.svg";
import C1U4Completed from "../../assets/nodes/c1u4-completed.svg";
import C1U4Inuse from "../../assets/nodes/c1u4-inuse.svg";
import C1U4Locked from "../../assets/nodes/c1u4-locked.svg";
import C1U5Completed from "../../assets/nodes/c1u5-completed.svg";
import C1U5Inuse from "../../assets/nodes/c1u5-inuse.svg";
import C1U5Locked from "../../assets/nodes/c1u5-locked.svg";
import C2U1Completed from "../../assets/nodes/c2u1-completed.svg";
import C2U1Inuse from "../../assets/nodes/c2u1-inuse.svg";
import C2U1Locked from "../../assets/nodes/c2u1-locked.svg";
import C2U2Completed from "../../assets/nodes/c2u2-completed.svg";
import C2U2Inuse from "../../assets/nodes/c2u2-inuse.svg";
import C2U2Locked from "../../assets/nodes/c2u2-locked.svg";
import C2U3Completed from "../../assets/nodes/c2u3-completed.svg";
import C2U3Inuse from "../../assets/nodes/c2u3-inuse.svg";
import C2U3Locked from "../../assets/nodes/c2u3-locked.svg";
import C2U4Completed from "../../assets/nodes/c2u4-completed.svg";
import C2U4Inuse from "../../assets/nodes/c2u4-inuse.svg";
import C2U4Locked from "../../assets/nodes/c2u4-locked.svg";
import C2U5Completed from "../../assets/nodes/c2u5-completed.svg";
import C2U5Inuse from "../../assets/nodes/c2u5-inuse.svg";
import C2U5Locked from "../../assets/nodes/c2u5-locked.svg";
import C2U6Completed from "../../assets/nodes/c2u6-completed.svg";
import C2U6Inuse from "../../assets/nodes/c2u6-inuse.svg";
import C2U6Locked from "../../assets/nodes/c2u6-locked.svg";
import C2U7Completed from "../../assets/nodes/c2u7-completed.svg";
import C2U7Inuse from "../../assets/nodes/c2u7-inuse.svg";
import C2U7Locked from "../../assets/nodes/c2u7-locked.svg";
import C2U8Completed from "../../assets/nodes/c2u8-completed.svg";
import C2U8Inuse from "../../assets/nodes/c2u8-inuse.svg";
import C2U8Locked from "../../assets/nodes/c2u8-locked.svg";
import C3U1Completed from "../../assets/nodes/c3u1-completed.svg";
import C3U1Inuse from "../../assets/nodes/c3u1-inuse.svg";
import C3U1Locked from "../../assets/nodes/c3u1-locked.svg";
import C3U2Completed from "../../assets/nodes/c3u2-completed.svg";
import C3U2Inuse from "../../assets/nodes/c3u2-inuse.svg";
import C3U2Locked from "../../assets/nodes/c3u2-locked.svg";
import C3U3Completed from "../../assets/nodes/c3u3-completed.svg";
import C3U3Inuse from "../../assets/nodes/c3u3-inuse.svg";
import C3U3Locked from "../../assets/nodes/c3u3-locked.svg";
import C3U4Completed from "../../assets/nodes/c3u4-completed.svg";
import C3U4Inuse from "../../assets/nodes/c3u4-inuse.svg";
import C3U4Locked from "../../assets/nodes/c3u4-locked.svg";

export type NodeVisualState = "locked" | "inuse" | "completed";

/** Handoff unit ids: c{course}u{unit} — course 1 (5), course 2 (8), course 3 (4). */
export type UnitAssetId =
  | "c1u1"
  | "c1u2"
  | "c1u3"
  | "c1u4"
  | "c1u5"
  | "c2u1"
  | "c2u2"
  | "c2u3"
  | "c2u4"
  | "c2u5"
  | "c2u6"
  | "c2u7"
  | "c2u8"
  | "c3u1"
  | "c3u2"
  | "c3u3"
  | "c3u4";

type NodeSvg = FC<SvgProps>;

const NODE_ASSETS: Record<UnitAssetId, Record<NodeVisualState, NodeSvg>> = {
  c1u1: { locked: C1U1Locked, inuse: C1U1Inuse, completed: C1U1Completed },
  c1u2: { locked: C1U2Locked, inuse: C1U2Inuse, completed: C1U2Completed },
  c1u3: { locked: C1U3Locked, inuse: C1U3Inuse, completed: C1U3Completed },
  c1u4: { locked: C1U4Locked, inuse: C1U4Inuse, completed: C1U4Completed },
  c1u5: { locked: C1U5Locked, inuse: C1U5Inuse, completed: C1U5Completed },
  c2u1: { locked: C2U1Locked, inuse: C2U1Inuse, completed: C2U1Completed },
  c2u2: { locked: C2U2Locked, inuse: C2U2Inuse, completed: C2U2Completed },
  c2u3: { locked: C2U3Locked, inuse: C2U3Inuse, completed: C2U3Completed },
  c2u4: { locked: C2U4Locked, inuse: C2U4Inuse, completed: C2U4Completed },
  c2u5: { locked: C2U5Locked, inuse: C2U5Inuse, completed: C2U5Completed },
  c2u6: { locked: C2U6Locked, inuse: C2U6Inuse, completed: C2U6Completed },
  c2u7: { locked: C2U7Locked, inuse: C2U7Inuse, completed: C2U7Completed },
  c2u8: { locked: C2U8Locked, inuse: C2U8Inuse, completed: C2U8Completed },
  c3u1: { locked: C3U1Locked, inuse: C3U1Inuse, completed: C3U1Completed },
  c3u2: { locked: C3U2Locked, inuse: C3U2Inuse, completed: C3U2Completed },
  c3u3: { locked: C3U3Locked, inuse: C3U3Inuse, completed: C3U3Completed },
  c3u4: { locked: C3U4Locked, inuse: C3U4Inuse, completed: C3U4Completed },
};

/** Units available per course (from learning-map-handoff). */
const UNITS_PER_COURSE: Record<number, number> = {
  1: 5,
  2: 8,
  3: 4,
};

/**
 * Map course step + lesson index to handoff unit id (c1u1…c3u4).
 * lessonIndex is 0-based within the active course.
 */
export function resolveUnitAssetId(
  courseStep: number,
  lessonIndex: number,
): UnitAssetId {
  const course = Math.min(Math.max(Math.round(courseStep) || 1, 1), 3);
  const maxUnits = UNITS_PER_COURSE[course] ?? 4;
  const unit = Math.min(Math.max(lessonIndex, 0), maxUnits - 1) + 1;
  return `c${course}u${unit}` as UnitAssetId;
}

export function getNodeAsset(
  unitId: UnitAssetId,
  state: NodeVisualState,
): NodeSvg {
  return NODE_ASSETS[unitId][state];
}
