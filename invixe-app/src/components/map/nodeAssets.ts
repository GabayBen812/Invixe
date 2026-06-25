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

export type NodeVisualState = "locked" | "inuse" | "completed";
export type UnitAssetId =
  | "c1u1"
  | "c1u2"
  | "c1u3"
  | "c1u4"
  | "c2u1"
  | "c2u2"
  | "c2u3"
  | "c2u4";

type NodeSvg = FC<SvgProps>;

const NODE_ASSETS: Record<
  UnitAssetId,
  Record<NodeVisualState, NodeSvg>
> = {
  c1u1: { locked: C1U1Locked, inuse: C1U1Inuse, completed: C1U1Completed },
  c1u2: { locked: C1U2Locked, inuse: C1U2Inuse, completed: C1U2Completed },
  c1u3: { locked: C1U3Locked, inuse: C1U3Inuse, completed: C1U3Completed },
  c1u4: { locked: C1U4Locked, inuse: C1U4Inuse, completed: C1U4Completed },
  c2u1: { locked: C2U1Locked, inuse: C2U1Inuse, completed: C2U1Completed },
  c2u2: { locked: C2U2Locked, inuse: C2U2Inuse, completed: C2U2Completed },
  c2u3: { locked: C2U3Locked, inuse: C2U3Inuse, completed: C2U3Completed },
  c2u4: { locked: C2U4Locked, inuse: C2U4Inuse, completed: C2U4Completed },
};

/** Map course step + lesson index to handoff unit id (c1u1…c2u4). */
export function resolveUnitAssetId(
  courseStep: number,
  lessonIndex: number,
): UnitAssetId {
  const course = Math.min(Math.max(courseStep, 1), 2);
  const unit = (lessonIndex % 4) + 1;
  return `c${course}u${unit}` as UnitAssetId;
}

export function getNodeAsset(
  unitId: UnitAssetId,
  state: NodeVisualState,
): NodeSvg {
  return NODE_ASSETS[unitId][state];
}
