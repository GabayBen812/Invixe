import React, { useRef } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Dimensions,
  Text,
  Animated,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/AppNavigator";
import LessonNode, { CIRCLE_SIZE } from "../components/map/LessonNode";
import { isLessonUnlocked } from "../modules/lessons/registry";
import {
  computeUnitProgress,
  isLessonNodeCompleted,
} from "../modules/lessons/lessonNavigation";
import { useLessons } from "../context/LessonsContext";
import TopBar from "../components/ui/TopBar";
import BottomNavbar from "../components/ui/BottomNavbar";
import theme from "../theme";
import Svg, { Path, G, Ellipse, Rect, Mask, Circle } from "react-native-svg";
import StickyHeader from "../components/map/StickyHeader";
import UnitSelector from "../components/map/UnitSelector";
import LessonModal from "../components/map/LessonModal";
import ProgressBar from "../components/map/ProgressBar";
import { useUser } from "../context/UserContext";

const SCREEN_WIDTH = Dimensions.get("window").width;

// inline icons and art moved to components
const NODE_X_CENTER = SCREEN_WIDTH / 2;
const NODE_X_OFFSET = 80;

interface Lesson {
  id: number;
  title: string;
  lessonType?: "info" | "memorize" | "practice" | "test";
  [key: string]: any;
}

// --- Tooltip Component ---
interface LessonTooltipProps {
  title: string;
  status: "locked" | "active" | "completed";
  onPress: () => void;
  style?: any;
  buttonText?: string;
  progressLabel?: string;
  progressPercent?: number;
}

const LessonTooltip = ({
  title,
  status,
  onPress,
  style,
  buttonText,
  progressLabel,
  progressPercent: explicitProgressPercent,
}: LessonTooltipProps) => {
  const isCompleted = status === "completed";
  const themeColor = isCompleted ? "#10B981" : "#3B82F6";

  // Use passed props or fallbacks
  const btnText = buttonText || (isCompleted ? "תרגול חוזר" : "המשך למידה");
  const progressText = progressLabel || (isCompleted ? "16/16" : "0/16");
  const progressPercent =
    explicitProgressPercent !== undefined
      ? explicitProgressPercent
      : isCompleted
      ? 1
      : 0;

  return (
    <View style={[tooltipStyles.container, style]}>
      {/* Arrow at top pointing up */}
      <View style={tooltipStyles.arrow} />
      <View style={tooltipStyles.content}>
        <Text style={tooltipStyles.title}>{title}</Text>
        <View style={tooltipStyles.progressRow}>
          <View style={tooltipStyles.progressBarBg}>
            <View
              style={[
                tooltipStyles.progressBarFill,
                {
                  width: `${progressPercent * 100}%`,
                  backgroundColor: themeColor,
                },
              ]}
            />
          </View>
          <Text style={[tooltipStyles.progressText, { color: themeColor }]}>
            {progressText}
          </Text>
        </View>
        <TouchableOpacity
          style={[tooltipStyles.button, { backgroundColor: themeColor }]}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 18l-6-6 6-6"
              stroke="white"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={tooltipStyles.buttonText}>{btnText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const tooltipStyles = StyleSheet.create({
  container: {
    position: "absolute",
    width: 200,
    backgroundColor: "white",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
    padding: 16,
    alignItems: "center",
  },
  arrow: {
    position: "absolute",
    // top: -8 means it sits above the container
    top: -8,
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8, // Pointing up needs bottom width
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "white", // Color matches container
    left: "50%",
    marginLeft: -8,
  },
  content: { width: "100%", alignItems: "center" },
  title: {
    fontSize: 16,
    fontFamily: theme.font.bold,
    color: "#1E293B",
    marginBottom: 8,
    textAlign: "center",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 12,
    gap: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", borderRadius: 3 },
  progressText: { fontSize: 12, fontFamily: theme.font.bold },
  button: {
    width: "100%",
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  buttonText: {
    color: "white",
    fontFamily: theme.font.bold,
    fontSize: 14,
  },
});

// Helper to determine lesson status for new structure
// function getLessonStatuses(completedLessons: number[]) {
//   let foundCurrent = false;
//   const statuses: {
//     completed: boolean;
//     current: boolean;
//     unlocked: boolean;
//     stepIdx: number;
//     lessonIdx: number;
//     lessonId: number;
//   }[] = [];
//   lessonsRegistry.forEach((step, stepIdx) => {
//     step.lessons.forEach((lesson, lessonIdx) => {
//       const completed = completedLessons.includes(lesson.id);
//       let unlocked = false;
//       // All previous steps' lessons must be completed
//       if (stepIdx === 0) {
//         unlocked = true;
//       } else {
//         const prevStep = lessonsRegistry[stepIdx - 1];
//         unlocked = prevStep.lessons.every((l) =>
//           completedLessons.includes(l.id)
//         );
//       }
//       let current = false;
//       if (!completed && unlocked && !foundCurrent) {
//         current = true;
//         foundCurrent = true;
//       }
//       statuses.push({
//         completed,
//         current,
//         unlocked,
//         stepIdx,
//         lessonIdx,
//         lessonId: lesson.id,
//       });
//     });
//   });
//   return statuses;
// }

// ProgressBarSVG replaced with reusable ProgressBar component

// small icons moved to components

// App Character SVG - Simplified without mask
// const AppCharacterSVG = ({ size = 48 }: { size?: number }) => (
//   <Svg width={size} height={size} viewBox="0 0 243 243" fill="none">
//     <Circle cx="121.554" cy="121.603" r="120.859" fill="white" />
//     <Path
//       d="M161.043 183.33C164.069 184.228 204.472 211.26 205.017 214.194L204.756 215.969C202.582 218.142 199.855 220.546 200.631 223.887C200.846 224.801 201.722 225.6 201.929 226.484C202.413 228.588 198.596 235.462 197.29 237.713C193.334 244.51 151.327 235.874 142.993 236.365C140.865 236.488 139.459 235.666 137.631 235.536C120.472 234.322 107.022 226.987 93.4958 216.687C81.2598 207.37 29.3912 221.241 25.0898 206.086C25.2163 205.642 37.4025 193.007 47.182 187.292C56.0432 182.113 71.6892 175.011 71.6892 175.011C71.6892 175.011 77.7419 172.484 78.8556 171.424C79.739 170.587 80.1768 168.076 81.0063 166.662C81.9972 164.973 84.1095 162.653 84.6779 161.071C85.5843 158.559 82.5118 154.726 82.6424 151.869C61.5348 153.436 49.9672 133.313 44.6519 115.739C42.8545 109.794 40.3735 99.8629 41.1954 93.8258C41.3183 92.9425 41.5334 92.3127 42.4551 92.0132C47.6859 91.1836 52.4328 93.8028 57.341 94.9933C57.1182 87.7657 55.9354 80.4075 56.5575 73.0878C58.2627 53.0257 69.285 43.371 86.5213 35.4598C118.544 20.7742 158.777 32.4567 176.259 63.2564C185.661 79.8161 183.718 97.9196 182.596 116.169C181.142 126.602 181.446 127.652 183.326 136.07C184.77 152.553 175.806 169.013 164.123 179.889C162.902 181.025 160.743 181.363 161.028 183.322L161.043 183.33Z"
//       fill="#0D2033"
//     />
//     <Path
//       d="M181.013 108.058C180.706 111.05 180.756 112.663 180.706 112.822C180.671 112.825 180.688 112.88 180.706 112.822L178.654 127.644C185.168 145.187 174.499 171.34 158.492 180.395C142.469 189.459 118.696 183.037 103.672 174.251C94.2856 168.767 84.2542 159.066 85.7597 147.23C84.1466 147.107 83.271 148.482 81.5197 148.743C61.8255 151.677 50.9337 127.475 46.8013 112.067C45.3112 106.514 44.0208 100.769 44.2896 94.9931C45.0807 94.1482 55.3119 97.9271 57.1093 98.6875C72.9246 105.385 84.4308 116.315 91.1134 132.168C91.6894 133.543 93.7864 132.629 94.2088 130.701C94.9078 127.483 94.5929 123.827 95.0384 120.777C97.9342 100.792 109.379 86.3523 97.1507 66.3286C95.5377 63.6864 93.2257 61.7047 91.9122 58.8936C93.0413 58.8782 94.1781 58.8168 95.3072 58.9474C108.25 60.4758 128.92 68.9016 140.564 75.1384C143.974 76.9664 152.001 83.1263 152.562 86.9514C152.861 89.0175 152.539 91.652 152.585 93.8487C152.6 94.5015 152.224 96.5139 153.729 95.7612C157.086 94.0868 162.125 83.0265 163.369 79.2783C165.656 71.9529 168.503 62.7118 167.171 55.0532C169.253 61.2823 174.215 65.7602 176.78 71.9509C178.87 76.9971 180.081 81.3973 181.005 87.6964C182.158 95.561 181.005 108.05 181.005 108.05L181.013 108.058Z"
//       fill="#62D24C"
//     />
//     <Path
//       d="M127.247 230.95C114.159 228.032 102.568 220.013 92.26 211.756C93.7962 207.224 96.4615 202.939 95.7625 197.923L85.9904 198.641L83.1126 199.203L92.6748 201.018L87.8704 212.915C87.8704 212.915 100.413 221.225 111.918 228.083C119.274 232.468 137.429 233.385 137.429 233.385L160.754 236.677L181.835 239.831L111.918 248.675L99.9714 241.542C85.5409 247.568 25.4874 242.095 26.7944 209.718C26.7944 209.718 38.7088 195.527 48.499 189.174C59.192 182.234 78.8565 174.12 78.8565 174.12C80.2391 177.515 79.302 181.041 79.6092 184.512C79.9011 187.754 83.1126 199.203 83.1126 199.203L85.9904 198.641C85.9904 198.641 82.9812 190.142 82.7354 188.291C82.0518 183.099 82.2208 176.716 81.8982 171.409C82.1517 168.237 85.0167 165.779 86.9216 163.375C88.2428 164.189 88.6729 165.879 89.587 166.847C90.3858 167.699 91.8606 168.045 92.3061 168.736C92.8437 169.566 92.7592 171.171 93.2892 172.361C101.723 191.379 114.904 206.472 124.321 224.283C124.843 225.274 127.677 230.543 127.247 230.958V230.95Z"
//       fill="#3F9FFF"
//     />
//     <Path
//       d="M129.396 187.331L130.257 192.493C128.928 193.268 125.863 192.531 126.478 194.851H131.086L129.934 200.227C128.982 202.193 118.459 207.969 116.5 206.809C111.822 203.822 110.063 184.804 114.672 183.399C116.93 182.715 126.163 187.193 129.396 187.331Z"
//       fill="#FFA73B"
//     />
//     <Path
//       d="M136.463 213.284C136.148 209.974 135.695 206.633 135.695 203.299C141.203 201.986 142.831 206.379 147.44 208.077C148.684 208.537 149.698 208.822 151.05 208.691C152.14 209.59 149.229 221.333 148.569 223.461C148.039 225.174 145.688 231.994 144.436 232.386L136.471 232.486C137.431 227.125 136.471 213.284 136.471 213.284C136.471 213.284 136.778 216.594 136.463 213.284Z"
//       fill="#F9DD83"
//     />
//     <Path
//       d="M142.614 194.866L146.439 193.698L142.675 192.477L143.328 187.515C146.877 187.623 150.564 185.956 153.805 185.657C154.735 185.572 155.488 185.518 156.071 186.386C158.022 189.535 156.463 198.737 154.481 201.74C149.427 209.39 140.748 202.362 142.614 194.873V194.866Z"
//       fill="#FFA73B"
//     />
//     <Path
//       d="M111.087 181.063L108.429 194.082C105.841 190.288 103.183 186.355 100.986 182.323C100.38 181.209 96.8771 174.535 97.2918 174.112L111.087 181.056V181.063Z"
//       fill="#F9DD83"
//     />
//     <Path
//       d="M132.622 189.858C132.568 189.367 131.355 188.36 131.862 187.17L140.265 187.984C141.302 192.07 141.555 196.057 140.173 200.089C137.454 201.149 135.487 202.27 132.63 200.995C132.361 197.408 133.006 193.376 132.63 189.858H132.622Z"
//       fill="#FFA73B"
//     />
//     <Path
//       d="M124.411 105.876C133.042 105.876 139.913 112.447 139.913 120.402C139.913 128.358 133.042 134.93 124.411 134.93C115.78 134.93 108.909 128.358 108.909 120.402C108.909 112.447 115.78 105.876 124.411 105.876Z"
//       fill="#F9E8B1"
//       stroke="#0D2033"
//       strokeWidth="2.42739"
//     />
//     <Path
//       d="M130.791 111.699C134.255 111.699 137.307 114.907 137.307 119.182C137.306 123.456 134.255 126.663 130.791 126.663C127.327 126.663 124.275 123.456 124.274 119.182C124.274 114.907 127.327 111.699 130.791 111.699Z"
//       fill="#3F9FFF"
//       stroke="#0D2033"
//       strokeWidth="2.5173"
//     />
//     <Path
//       d="M165.94 106.213C173.943 106.213 180.305 112.305 180.305 119.668C180.304 127.031 173.943 133.122 165.94 133.122C157.938 133.122 151.577 127.031 151.577 119.668C151.577 112.305 157.938 106.213 165.94 106.213Z"
//       fill="#F9E8B1"
//       stroke="#0D2033"
//       strokeWidth="2.42739"
//     />
//     <Path
//       d="M172.732 111.699C176.197 111.699 179.248 114.907 179.248 119.182C179.248 123.456 176.197 126.663 172.732 126.663C169.268 126.663 166.216 123.456 166.216 119.182C166.216 114.907 169.268 111.699 172.732 111.699Z"
//       fill="#3F9FFF"
//       stroke="#0D2033"
//       strokeWidth="2.5173"
//     />
//     <Ellipse cx="169.472" cy="117.204" rx="1.69511" ry="1.90568" fill="white" />
//     <Ellipse cx="127.293" cy="117.204" rx="1.69511" ry="1.90568" fill="white" />
//   </Svg>
// );

const CourseCardArtSVG = ({
  width = 118,
  height = 106,
  radius = 18,
}: {
  width?: number;
  height?: number;
  radius?: number;
}) => (
  <Svg width={width} height={height} viewBox="0 0 118 106" fill="none">
    <Mask id="courseMask" x={0} y={0} width={118} height={106}>
      <Rect
        width={117.164}
        height={105.074}
        rx={radius}
        transform="matrix(-1 0 0 1 117.164 0)"
        fill="#3F9FFF"
      />
    </Mask>

    <G mask="url(#courseMask)">
      <Path
        d="M38.8911 90.8951C37.2258 91.3896 14.9933 106.265 14.6932 107.879L14.8369 108.856C16.0331 110.052 17.5336 111.375 17.1067 113.213C16.9883 113.716 16.5065 114.156 16.3924 114.642C16.1261 115.8 18.2268 119.583 18.9453 120.821C21.1221 124.562 44.2379 119.809 48.8239 120.079C49.9947 120.147 50.7681 119.695 51.7741 119.623C61.2166 118.955 68.6176 114.919 76.0609 109.251C82.794 104.124 111.336 111.757 113.703 103.418C113.634 103.173 106.928 96.2206 101.546 93.0754C96.6702 90.2256 88.0605 86.3178 88.0605 86.3178C88.0605 86.3178 84.7299 84.9273 84.117 84.344C83.6309 83.8833 83.39 82.5012 82.9335 81.7235C82.3883 80.7937 81.2259 79.5173 80.9131 78.6466C80.4144 77.2645 82.1051 75.1555 82.0332 73.5832C93.6482 74.4454 100.014 63.3719 102.939 53.7015C103.928 50.4302 105.293 44.9653 104.841 41.6432C104.773 41.1572 104.655 40.8106 104.147 40.6458C101.269 40.1893 98.6569 41.6305 95.956 42.2857C96.0786 38.3085 96.7295 34.2594 96.3871 30.2315C95.4488 19.1918 89.3835 13.879 79.8987 9.5257C62.2775 1.44455 40.138 7.87312 30.518 24.8216C25.3444 33.934 26.4138 43.896 27.0309 53.9382C27.831 59.6793 27.6635 60.2569 26.6294 64.8892C25.8347 73.9594 30.7673 83.0169 37.1962 89.0017C37.8682 89.6272 39.0559 89.8131 38.8995 90.8909L38.8911 90.8951Z"
        fill="#0D2033"
      />
      <Path
        d="M27.901 49.475C28.0696 51.1217 28.0422 52.0087 28.0696 52.0967C28.0889 52.098 28.0794 52.1282 28.0696 52.0967L29.1986 60.2527C25.6143 69.9061 31.4852 84.2975 40.2937 89.2806C49.1107 94.2679 62.1924 90.7345 70.4598 85.8994C75.6249 82.8816 81.145 77.5435 80.3165 71.0304C81.2042 70.9628 81.686 71.7193 82.6497 71.863C93.487 73.4775 99.4805 60.1597 101.754 51.6813C102.574 48.6255 103.285 45.464 103.137 42.2857C102.701 41.8207 97.0713 43.9002 96.0822 44.3186C87.3794 48.0042 81.0478 54.0185 77.3705 62.7421C77.0535 63.4987 75.8996 62.9957 75.6672 61.9349C75.2825 60.1639 75.4558 58.1521 75.2107 56.4742C73.6172 45.4767 67.3194 37.5308 74.0483 26.5122C74.9359 25.0583 76.2082 23.9678 76.9309 22.4209C76.3096 22.4124 75.6841 22.3786 75.0627 22.4505C67.9407 23.2916 56.5666 27.9281 50.1589 31.36C48.2822 32.3659 43.8653 35.7556 43.5567 37.8605C43.3919 38.9974 43.5694 40.4471 43.5441 41.6559C43.5356 42.0152 43.7427 43.1225 42.9143 42.7083C41.0672 41.7869 38.2945 35.7007 37.6097 33.6381C36.3515 29.6072 34.7848 24.5219 35.5175 20.3076C34.3721 23.7353 31.6416 26.1994 30.2299 29.606C29.0802 32.3829 28.4136 34.8042 27.9052 38.2704C27.2704 42.5981 27.9052 49.4708 27.9052 49.4708L27.901 49.475Z"
        fill="#62D24C"
      />
      {/* dropped mixBlendMode; kept opacity */}
      <G opacity={0.5}>
        <Path
          d="M26.9548 46.2057L27.8779 55.5789L28.3751 58.1353L27.8779 61.0466L26.9548 68.0765L27.8779 72.6921C28.6431 74.3596 34.8275 87.0557 39.5111 89.2698C40.2573 88.5165 33.3256 81.0555 33.6494 77.4348C33.6494 77.4348 34.5335 75.9145 35.6859 74.8038C37.1115 74.0312 39.3805 73.5647 42.7896 73.8992C44.3178 73.5454 39.0876 73.9356 38.6074 72.555C36.9032 67.6554 39.7725 65.0866 43.536 64.4475C47.2994 63.8084 47.1216 60.8336 46.3405 56.7861C45.7156 53.5481 43.571 48.052 42.5769 45.7087L32.0675 43.6494L26.9548 46.2057Z"
          fill="#368642"
        />
      </G>
      <G opacity={0.5}>
        <Path
          d="M44.7359 44.5381C44.4926 39.2478 47.7626 37.1581 50.8099 35.1131C56.8024 31.0875 70.8439 23.9599 77.5297 24.6171C78.2661 24.6906 78.9241 21.8193 79.6722 21.7733C77.7843 23.9608 86.1686 20.7486 84.8487 23.6069C79.4515 35.2978 82.0327 23.561 82.7533 35.2656L83.5093 38.2802C83.4662 37.6598 83.6111 37.1773 83.8814 36.6442C86.3332 31.8236 83.1346 52.2182 87.1453 49.1439C88.1401 48.381 91.6495 46.4417 92.0098 45.6605C93.5021 38.5973 93.5256 30.422 91.2304 23.6069C89.7969 19.3515 87.5252 16.6816 84.2547 14.3287C73.8989 6.89327 63.5157 5.0367 51.8595 9.59539C47.0968 11.4611 42.1422 18.1467 39.3809 23.119C39.2516 24.6676 39.2634 26.6369 39.3809 28.1672C39.8195 33.7599 40.5128 36.2712 42.6866 41.5973C43.1488 42.7278 43.9213 43.7982 44.7359 44.5381Z"
          fill="#093937"
        />
      </G>
      <Path
        opacity={0.5}
        d="M82.3397 69.076C80.7658 65.1724 81.874 55.4135 98.8984 47.6064C98.7935 52.6223 95.3348 63.9384 82.3397 69.076Z"
        fill="#093937"
        stroke="black"
        strokeWidth={0.0386945}
      />
      <Path
        d="M85.5068 14.1846C74.195 7.26259 62.8491 5.5326 50.1143 9.77734C45.0744 11.46 39.8307 14.4574 36.7598 18.8604L36.4688 19.291L36.4609 19.3037L36.46 19.3174C36.3362 20.5809 36.3304 22.1435 36.417 23.4697L36.46 24.0225C36.6994 26.6245 37.0089 28.5124 37.5557 30.3701C38.1024 32.2276 38.8861 34.0533 40.0723 36.5303C40.197 36.7903 40.348 37.1799 40.5186 37.6318C40.6887 38.0826 40.8778 38.594 41.0791 39.0938C41.2805 39.5935 41.4949 40.0844 41.7148 40.4932C41.9336 40.8998 42.1621 41.2332 42.3945 41.4131L42.5264 41.5156L42.4863 41.3535L42.0908 39.7725C41.8298 34.8956 45.688 32.4296 49.0156 30.5264H49.0166C52.2826 28.6565 57.7437 26.0649 63.2998 24.0176C66.0777 22.994 68.8785 22.1069 71.4395 21.5137C74.0014 20.9203 76.32 20.6215 78.1348 20.7734C78.5295 20.807 78.9033 20.9256 79.2881 21.0332C79.6253 21.1275 79.9695 21.212 80.333 21.2158C78.3222 23.1934 76.6427 24.6206 75.2217 27.2432C72.2687 32.6946 72.4205 37.373 73.4072 42.0459C73.9001 44.3798 74.6022 46.7168 75.2285 49.1436C75.8553 51.5721 76.4073 54.0958 76.6035 56.8115L76.6045 56.8232L76.6611 56.8066L76.6055 56.8232L77.4307 59.626L77.5439 59.6055C77.4982 59.0444 77.6504 58.6074 77.9414 58.1182C80.6128 53.6419 84.295 49.5083 88.6621 46.6553C89.2025 46.3021 90.4265 45.6773 91.5723 45.0449C92.1435 44.7296 92.6948 44.4124 93.1279 44.1289C93.3441 43.9874 93.532 43.8535 93.6787 43.7314C93.8241 43.6104 93.9345 43.4966 93.9893 43.3955L93.9932 43.3887L93.9941 43.3818C95.6244 36.8054 95.6512 29.1908 93.1416 22.8398C91.5719 18.8687 89.0836 16.3772 85.5078 14.1846H85.5068Z"
        fill="#093937"
        stroke="#093937"
        strokeWidth={0.116083}
      />
      <Path
        d="M57.4927 117.099C64.6951 115.493 71.0732 111.081 76.7454 106.537C75.9001 104.043 74.4334 101.685 74.8181 98.9251L80.1955 99.3201L81.7791 99.6293L76.5172 100.628L79.161 107.175C79.161 107.175 72.2591 111.748 65.9283 115.522C61.8801 117.935 51.8901 118.439 51.8901 118.439L39.0548 120.25L27.4542 121.986L65.9283 126.853L72.502 122.928C80.4428 126.244 113.489 123.232 112.77 105.416C112.77 105.416 106.213 97.6068 100.826 94.1106C94.942 90.2919 84.1211 85.827 84.1211 85.827C83.3603 87.6951 83.8759 89.6351 83.7069 91.5455C83.5463 93.3291 81.7791 99.6293 81.7791 99.6293L80.1955 99.3201C80.1955 99.3201 81.8513 94.6436 81.9866 93.625C82.3628 90.7678 82.2698 87.2556 82.4473 84.335C82.3078 82.5895 80.7313 81.237 79.683 79.9141C78.956 80.3621 78.7193 81.2919 78.2164 81.8245C77.7768 82.2936 76.9652 82.4838 76.7201 82.8642C76.4242 83.3207 76.4707 84.204 76.1791 84.8591C71.5381 95.324 64.2851 103.629 59.1031 113.431C58.8157 113.976 57.256 116.875 57.4927 117.103V117.099Z"
        fill="#3F9FFF"
      />
      <Path
        d="M56.3048 93.0966L55.8314 95.9368C56.5627 96.3637 58.2491 95.958 57.911 97.2344H55.375L56.009 100.193C56.5331 101.275 62.3237 104.453 63.4015 103.815C65.9756 102.171 66.9435 91.7061 64.4075 90.9326C63.1648 90.5564 58.0843 93.0205 56.3048 93.0966Z"
        fill="#1F4973"
      />
      <Path
        d="M52.4133 107.378C52.5866 105.557 52.8359 103.718 52.8359 101.884C49.8054 101.161 48.9093 103.579 46.3733 104.513C45.6886 104.766 45.1306 104.923 44.3867 104.851C43.7865 105.345 45.3885 111.808 45.752 112.979C46.0436 113.921 47.337 117.674 48.0259 117.89L52.409 117.945C51.8807 114.995 52.409 107.378 52.409 107.378C52.409 107.378 52.24 109.2 52.4133 107.378Z"
        fill="#B0D7FF"
      />
      <Path
        d="M52.9666 108.734C52.7776 111.538 52.8194 112.288 52.8083 114.566C52.8051 115.226 52.7451 115.533 52.789 116.151C52.8389 116.851 53.0856 117.925 53.0856 117.925C53.0856 117.925 54.5821 117.624 55.1147 117.467C55.6472 117.311 58.2425 112.074 58.8342 111.047C59.5908 109.733 61.776 106.977 62.1395 105.899C62.1987 105.722 59.9247 105.033 59.464 104.779C57.5493 103.731 55.9769 101.013 53.8763 102.712C53.5128 103.232 53.5279 104.112 53.4466 104.779C53.3058 105.936 53.0351 107.719 52.9666 108.734Z"
        fill="#B0D7FF"
      />
      <Path
        d="M49.0296 97.2433L46.9247 96.6009L48.9958 95.9289L48.6365 93.1985C46.6838 93.2577 44.6549 92.3405 42.8713 92.1757C42.3598 92.1292 41.9456 92.0996 41.6244 92.5772C40.5508 94.3101 41.4088 99.3735 42.4993 101.026C45.2805 105.236 50.0567 101.368 49.0296 97.2475V97.2433Z"
        fill="#1F4973"
      />
      <Path
        d="M66.3823 89.6483L67.8447 96.8123C69.2691 94.7243 70.7316 92.5603 71.9404 90.3414C72.2743 89.7286 74.2017 86.0557 73.9735 85.8232L66.3823 89.644V89.6483Z"
        fill="#B0D7FF"
      />
      <Path
        d="M54.537 94.4871C54.5666 94.2166 55.2344 93.6629 54.9555 93.0078L50.3314 93.4558C49.7608 95.7043 49.6213 97.8979 50.3821 100.117C51.8784 100.7 52.9604 101.317 54.5328 100.616C54.6807 98.6418 54.3257 96.4229 54.5328 94.4871H54.537Z"
        fill="#1F4973"
      />
      <Path
        d="M38.468 99.7711L36.3715 96.2208C37.276 95.0797 38.8272 94.2132 38.8906 92.5902C38.6117 92.2986 36.9294 93.5624 36.5659 93.8582C36.1517 94.1921 15.6929 107.927 15.6464 108.138L19.3474 112.425L35.1601 102.023L38.468 99.7754V99.7711Z"
        fill="#3F9FFF"
      />
      <Path
        d="M40.1562 98.0801L39.5222 94.7031C38.1232 95.9457 38.0302 97.8139 40.1562 98.0801Z"
        fill="#AFD7FF"
      />
      <Path
        d="M41.0073 100.616C39.511 101.453 34.8278 103.22 35.1279 104.834C35.2335 105.397 39.0503 110.46 39.5575 111.157C40.3606 112.256 42.1358 114.344 43.1502 115.172C43.8603 115.747 44.7521 116.077 45.4453 116.677L43.146 108.833L43.0657 103.418C42.2161 102.391 40.7663 102.328 41.003 100.62L41.0073 100.616Z"
        fill="#3F9FFF"
      />
      <Path
        d="M29.0522 103.766C28.1863 105.246 11.5591 108.43 12.6359 109.67C13.0119 110.101 24.6907 123.198 25.4813 123.542C26.7305 124.082 37.9207 122.539 39.215 122.739C41.7535 127.208 47.1532 119.107 48.0549 119.273L38.0468 112.347L35.234 107.72L32.8531 101.906L29.0522 103.766Z"
        fill="#3F9FFF"
      />
      <Path
        d="M82.4317 62.9993L84.9677 59.4067L87.2882 57.5047C89.7143 60.7085 87.7235 64.7955 85.3946 67.4371L87.9433 66.1861C90.8809 63.2275 90.5385 59.2841 88.3956 55.9536L88.5351 55.3915C90.957 52.826 94.034 50.8733 97.0984 49.132C97.5718 48.8615 97.8677 48.4938 98.4932 48.6248C98.5735 51.0381 97.5633 53.3078 96.7222 55.5183C96.5785 55.9029 95.9065 56.6848 96.7983 56.651C96.8448 55.4422 97.8592 54.7152 98.2861 53.7009C99.3048 51.279 99.6598 48.6417 100.18 46.0888C99.9472 45.8522 97.3182 47.2807 96.7899 47.5555C91.5741 50.2943 84.8621 55.2985 82.7614 61.0001C82.5078 61.689 82.2964 62.2216 82.4317 62.9908V62.9993Z"
        fill="#0D2033"
      />
      <Path
        d="M43.7958 73.8983C43.5692 73.8852 43.1381 73.9041 42.9004 73.8967C42.8916 73.8965 42.883 73.8963 42.8744 73.8961C42.8312 73.8952 42.7781 73.8924 42.7159 73.8882C42.5675 73.8765 42.367 73.8673 41.9534 73.8097C41.8344 73.7857 41.7166 73.7585 41.5997 73.728C40.4826 73.4457 39.4855 72.785 38.911 71.7875C38.6943 71.3542 38.5405 71.0413 38.3647 70.4076C38.2872 70.0942 38.2642 69.8795 38.2509 69.7006C38.211 68.6706 38.7082 67.6662 39.4471 66.9015C39.9292 66.4364 40.4423 66.04 41.1275 65.6105C41.8103 65.2772 42.7336 64.8495 43.0463 64.7205C43.6991 64.489 44.8994 64.1031 45.6128 63.7812C45.9654 63.4138 46.274 63.0984 46.3527 62.9229C46.697 62.0916 46.867 61.2605 46.9328 60.1982C46.9297 59.9017 46.9201 59.3025 46.8849 58.743C46.7575 57.7497 46.5043 56.676 46.3402 56.2288C46.1372 55.7894 45.8741 55.5114 45.6791 55.5363C45.9756 56.8373 46.3322 58.8422 46.3742 59.3985C46.4155 60.1761 46.4027 60.6027 46.3995 60.6823C46.3124 61.3214 46.1674 62.0392 46.0767 62.3113C45.7943 62.9138 45.4398 63.2902 45.1477 63.5037C44.6846 63.6957 44.2922 63.7896 43.7854 63.9596C43.2486 64.142 42.5777 64.4108 42.3879 64.4948C41.5776 64.916 40.9011 65.2385 40.457 65.5287C40.201 65.7019 39.9938 65.8692 39.8075 66.0606C39.476 66.3189 39.1343 66.5992 38.896 66.8871C38.5325 67.3718 38.263 67.7707 38.1114 68.0822C37.8393 68.8851 37.709 69.6078 37.7426 70.333C37.9161 71.0761 38.2724 71.8937 38.7868 72.7137C39.3038 73.4147 40.0464 73.926 40.8889 74.2908C41.2454 74.4108 41.5574 74.4397 41.8432 74.5026C42.0972 74.627 42.3187 74.6272 42.9685 74.647C43.5454 74.6025 44.1251 74.5432 44.8994 64.1031C45.1314 64.0429 45.3683 63.9525 45.6128 63.7812C45.7687 63.6698 45.8291 63.5901 45.9192 63.4741C46.274 63.0984 46.5846 62.3676 46.3527 62.9229Z"
        fill="#0D2033"
      />
      <Path
        d="M60.4729 74.2978L60.7138 75.5785C54.5682 78.3849 47.9829 80.2403 41.3343 78.0087C40.7468 77.8101 40.5354 77.2353 40.6115 78.3088C43.5322 81.1237 49.6229 80.4305 53.3931 79.6824C55.7305 79.2175 60.1009 77.0747 61.593 76.931C62.1213 76.8802 63.8669 77.734 63.2541 75.9588C62.8187 74.6909 61.8043 74.0527 60.4729 74.2978Z"
        fill="#0D2033"
      />
      <Path
        d="M51.6097 68.3165C51.4659 69.183 52.3409 69.3816 52.4634 70.2185C52.8016 72.5135 51.0475 72.2261 49.268 72.1331C48.3508 72.0866 47.1082 71.0089 47.3829 72.5389C49.0609 72.9193 50.2571 73.7941 52.0577 73.1982C55.7011 71.9894 52.4212 67.4712 51.6097 68.3165Z"
        fill="#0D2033"
      />
      <Path
        d="M45.6855 82.7544C45.8588 83.5405 46.4928 83.5532 47.1437 83.6166C48.9316 83.7983 51.1548 83.6546 52.8667 83.1728C52.985 82.4712 51.81 82.6952 51.3789 82.7417C49.3374 82.9699 47.8665 83.5194 45.6812 82.7544H45.6855Z"
        fill="#0D2033"
      />
      <Path
        d="M59.0518 48.1289C54.2301 48.1289 50.376 51.8025 50.376 56.2686C50.3762 60.7345 54.2303 64.4072 59.0518 64.4072C63.8732 64.4072 67.7273 60.7344 67.7275 56.2686C67.7275 51.8025 63.8733 48.129 59.0518 48.1289Z"
        fill="#F9E8B1"
        stroke="#0D2033"
        strokeWidth={1.04475}
      />
      <Path
        d="M55.5342 51.3281C53.5285 51.3281 51.798 53.1772 51.7979 55.5957C51.7979 58.0143 53.5284 59.8643 55.5342 59.8643C57.54 59.8642 59.2705 58.0143 59.2705 55.5957C59.2704 53.1773 57.5399 51.3282 55.5342 51.3281Z"
        fill="#3F9FFF"
        stroke="#0D2033"
        strokeWidth={1.08344}
      />
      <Path
        d="M36.1934 48.3135C31.7179 48.3137 28.1445 51.7231 28.1445 55.8633C28.1448 60.0032 31.7181 63.4119 36.1934 63.4121C40.6688 63.4121 44.2429 60.0034 44.2432 55.8633C44.2432 51.723 40.669 48.3135 36.1934 48.3135Z"
        fill="#F9E8B1"
        stroke="#0D2033"
        strokeWidth={1.04475}
      />
      <Path
        d="M32.4561 51.3281C30.4503 51.3281 28.7199 53.1772 28.7197 55.5957C28.7197 58.0143 30.4502 59.8643 32.4561 59.8643C34.4618 59.8642 36.1924 58.0143 36.1924 55.5957C36.1922 53.1773 34.4617 51.3282 32.4561 51.3281Z"
        fill="#3F9FFF"
        stroke="#0D2033"
        strokeWidth={1.08344}
      />
      <Ellipse
        cx={0.93278}
        cy={1.04866}
        rx={0.93278}
        ry={1.04866}
        transform="matrix(-1 0 0 1 35.1875 53.459)"
        fill="white"
      />
      <Ellipse
        cx={0.93278}
        cy={1.04866}
        rx={0.93278}
        ry={1.04866}
        transform="matrix(-1 0 0 1 58.3984 53.459)"
        fill="white"
      />
      <Path
        d="M48.6078 46.9891C55.9266 45.7592 64.5393 42.3311 70.6066 48.4503C71.2891 47.6807 69.5681 44.8173 68.9036 44.0213C67.224 42.0044 62.8607 39.8665 60.2837 39.6954C58.7466 39.5933 52.6358 40.955 51.2753 41.737C49.3603 42.8323 48.4591 44.8213 48.6078 46.9891Z"
        fill="#0D2033"
      />
      <Path
        d="M42.8131 46.551C37.5481 45.5399 31.3426 42.7798 27.0132 47.6005C26.5191 46.987 27.7415 44.7257 28.215 44.098C29.4119 42.5075 32.5365 40.8344 34.3874 40.7115C35.4913 40.6381 39.889 41.7478 40.8704 42.3745C42.2519 43.2522 42.9092 44.8333 42.8131 46.551Z"
        fill="#0D2033"
      />
    </G>
  </Svg>
);

// Enhanced Footprint with better styling
const FootprintSVG = ({
  rotation = 0,
  color = "#4A5568",
}: {
  rotation?: number;
  color?: string;
}) => (
  <Svg
    width={32}
    height={32}
    viewBox="0 0 24 24"
    fill="none"
    style={{ transform: [{ rotate: `${rotation}deg` }] }}
  >
    <Path
      d="M12 18c2 0 2.5-2 0.5-2.5s-2.5 2.5-0.5 2.5z"
      fill={color}
      opacity={0.7}
    />
    <Path
      d="M8 13c1.2 0 1.2-1.5 0-1.5s-1.2 1.5 0 1.5z"
      fill={color}
      opacity={0.7}
    />
    <Path
      d="M16 13c1.2 0 1.2-1.5 0-1.5s-1.2 1.5 0 1.5z"
      fill={color}
      opacity={0.7}
    />
    <Path
      d="M7 9c.8 0 .8-1.2 0-1.2s-.8 1.2 0 1.2z"
      fill={color}
      opacity={0.7}
    />
    <Path
      d="M17 9c.8 0 .8-1.2 0-1.2s-.8 1.2 0 1.2z"
      fill={color}
      opacity={0.7}
    />
  </Svg>
);

type Props = NativeStackScreenProps<RootStackParamList, "Map">;

export default function MapScreen({ navigation, route }: Props) {
  const {
    completedLessons,
    lessonAttempts,
    coins,
    markLessonAttempted,
    refreshUserData,
  } = useUser();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedMainLesson, setSelectedMainLesson] =
    React.useState<Lesson | null>(null);
  // New: selected unit (step) index. When null → show unit selector
  const [selectedUnitIdx, setSelectedUnitIdx] = React.useState<number | null>(
    null
  );

  // Sync route params with local state
  React.useEffect(() => {
    if (
      route.params?.selectedUnitIdx !== undefined &&
      route.params?.selectedUnitIdx !== null
    ) {
      setSelectedUnitIdx(route.params.selectedUnitIdx);
    }
  }, [route.params?.selectedUnitIdx]);

  // New state for Tooltip
  const [activeTooltipId, setActiveTooltipId] = React.useState<number | null>(
    null
  );
  const dismissActiveTooltip = () => {
    if (activeTooltipId !== null) setActiveTooltipId(null);
  };

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const heroOpacity = useRef(new Animated.Value(1)).current;
  const stickyHeaderOpacity = useRef(new Animated.Value(0)).current;

  // Scroll Ref
  const scrollViewRef = React.useRef<ScrollView>(null);
  const scrollOffsetRef = React.useRef(0);

  // Initialize animations immediately
  React.useEffect(() => {
    heroOpacity.setValue(1);
    stickyHeaderOpacity.setValue(0);
  }, []);

  // Determine active step based on selected unit
  const { lessonsRegistry } = useLessons();
  const activeStep =
    selectedUnitIdx !== null ? lessonsRegistry[selectedUnitIdx] : null;

  // Unit progress counts every playable step (sublessons when present)
  const unitProgress = React.useMemo(() => {
    const lessons = activeStep?.lessons ?? [];
    return computeUnitProgress(lessons, completedLessons);
  }, [activeStep, completedLessons]);

  const progressPercentage = unitProgress.percentage;
  const completedCount = unitProgress.completed;
  const currentStreak = 7; // TODO: Calculate actual streak from user data
  const totalXP = completedCount * 10; // 10 XP per lesson

  useFocusEffect(
    React.useCallback(() => {
      void refreshUserData();
    }, [refreshUserData]),
  );

  // Simplified scroll handler - no animations to prevent blocking
  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollOffsetRef.current = offsetY; // Track scroll offset

    const threshold = 80;
    const maxScroll = 160;

    if (offsetY <= threshold) {
      heroOpacity.setValue(1);
      stickyHeaderOpacity.setValue(0);
    } else if (offsetY >= maxScroll) {
      heroOpacity.setValue(0);
      stickyHeaderOpacity.setValue(1);
    } else {
      const progress = (offsetY - threshold) / (maxScroll - threshold);
      heroOpacity.setValue(1 - progress);
      stickyHeaderOpacity.setValue(progress);
    }
  };

  const handleLessonStart = (lessonId: number) => {
    setModalVisible(false);
    markLessonAttempted(lessonId);
    navigation.navigate("Lesson", {
      lessonId,
      unitId: activeStep?.unitId,
    });
  };

  const handleTabPress = (tab: "map" | "profile" | "shop" | "graph") => {
    switch (tab) {
      case "map":
        // Already on map screen, do nothing
        break;
      case "graph":
        navigation.navigate("Sandbox");
        break;
      case "profile":
        navigation.navigate("Profile");
        break;
      case "shop":
        navigation.navigate("Shop");
        break;
    }
  };

  // Lessons for the currently selected unit
  const allLessons = (activeStep ? [activeStep] : []).flatMap((step, stepIdx) =>
    step.lessons.map((lesson) => ({
      lesson,
      stepIdx: selectedUnitIdx ?? stepIdx,
      step,
    }))
  );

  // Calculate node positions for each lesson (only within active unit)
  // Calculate node positions for each lesson (only within active unit)
  // We use useMemo to ensure stability, though the logic is deterministic.
  const nodePositions = React.useMemo(() => {
    return allLessons.map((_, idx) => {
      // Increased vertical spacing slightly for a more fluent flow
      const y = idx * (CIRCLE_SIZE + 60);

      // Deterministic "Randomness" based on index
      // Center the nodes more (reduce spread)

      const baseDirection = idx % 2 === 0 ? -1 : 1;

      // Much tighter horizontal spread (closer to center)
      // Range: 10px to 22% of screen width
      const randomFactor = Math.abs(Math.sin(idx * 4.5 + 2)) * 0.5 + 0.2; // Smoother variance
      const minOffset = 10;
      const maxOffset = SCREEN_WIDTH * 0.22; // Significantly reduced from 0.35
      const offsetMagnitude =
        minOffset + randomFactor * (maxOffset - minOffset);

      const x = NODE_X_CENTER + baseDirection * offsetMagnitude;
      return { x, y };
    });
  }, [allLessons.length]);

  // Calculate total height needed for all lessons
  const totalMapHeight = allLessons.length * (CIRCLE_SIZE + 60) + 200;

  // Calculate lesson statuses with support for re-taking
  const lessonStatuses = allLessons.map((lessonData, idx) => {
    const { lesson } = lessonData;
    const lessonAttempt = lessonAttempts.find((a) => a.lessonId === lesson.id);
    // Check if lesson is completed: either directly completed OR all sublessons are completed
    // Check if lesson is completed: strict check for sublessons
    const completed = isLessonNodeCompleted(lesson, completedLessons);

    // Lock all lesson nodes except the first one in the unit.
    // A node becomes unlocked only after all sublessons of the previous node
    // are completed (or the previous node itself is completed if it has no sublessons).
    let unlocked = false;
    if (idx === 0) {
      unlocked = true;
    } else {
      const prevLesson = allLessons[idx - 1].lesson;
      const prevCompleted = isLessonNodeCompleted(prevLesson, completedLessons);
      unlocked = prevCompleted;
    }

    // Current lesson is the first uncompleted, unlocked lesson
    let current = false;
    if (!completed && unlocked) {
      // Check if this is the first uncompleted lesson
      const prevLessonsCompleted = allLessons
        .slice(0, idx)
        .every((l) => isLessonNodeCompleted(l.lesson, completedLessons));
      if (prevLessonsCompleted) {
        current = true;
      }
    }

    return {
      completed,
      unlocked,
      current,
      lesson,
      stepIdx: lessonData.stepIdx,
      attempts: lessonAttempt?.attempts || 0,
      lastAttempted: lessonAttempt?.lastAttempted,
      lessonId: lesson.id,
    };
  });

  // Enhanced Unit Selector Icons
  const TechnicalAnalysisIcon = ({ size = 48 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 81 79" fill="none">
      <Path
        d="M67.5144 1.00107C67.0798 0.872169 66.6228 0.826832 66.1697 0.867687L52.3551 2.12675C51.4391 2.21023 50.5954 2.63732 50.0096 3.31406C49.4238 3.9908 49.1439 4.86176 49.2314 5.73534C49.319 6.60891 49.7668 7.41354 50.4764 7.97222C51.186 8.5309 52.0992 8.79787 53.0151 8.71439L58.4926 8.21517L41.0441 28.3727L28.5844 18.5627C27.8749 18.0042 26.9618 17.7374 26.0461 17.8209C25.1303 17.9043 24.2867 18.3313 23.701 19.0078L11.2065 33.4421C10.6396 34.1207 10.3749 34.9844 10.4693 35.8473C10.5637 36.7102 11.0097 37.5033 11.7112 38.0556C12.4128 38.608 13.3137 38.8754 14.22 38.8004C15.1263 38.7254 15.9654 38.3139 16.5566 37.6545L26.8427 25.7714L39.3024 35.5814C40.0119 36.1399 40.925 36.4068 41.8408 36.3233C42.7566 36.2398 43.6001 35.8129 44.1859 35.1364L63.8428 12.4275L64.3662 17.6515C64.4538 18.5251 64.9016 19.3297 65.6111 19.8884C66.3207 20.4471 67.234 20.7141 68.1499 20.6306C69.0659 20.5471 69.9096 20.12 70.4954 19.4433C71.0812 18.7665 71.3611 17.8956 71.2735 17.022L69.9534 3.84674C69.8873 3.19559 69.6204 2.57773 69.1863 2.07123C68.7522 1.56473 68.1704 1.19232 67.5144 1.00107Z"
        fill="black"
        stroke="white"
        strokeWidth={2.5}
      />
      <Rect x={21.8906} y={39} width={3} height={35} rx={1.5} fill="#3F9FFF" />
      <Rect x={16.8906} y={48} width={13} height={17} rx={1.5} fill="#3F9FFF" />
      <Rect x={41.3516} y={43} width={3} height={35} rx={1.5} fill="#3F9FFF" />
      <Rect x={36.3516} y={52} width={13} height={17} rx={1.5} fill="#3F9FFF" />
      <Rect x={60.8906} y={30} width={3} height={35} rx={1.5} fill="#3F9FFF" />
      <Rect x={55.8906} y={38} width={13} height={18} rx={1.5} fill="#3F9FFF" />
    </Svg>
  );

  const TradingIcon = ({ size = 48 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 81 79" fill="none">
      <Path
        d="M11.8064 53.4653H69.1922C70.4206 53.4653 71.4127 52.4855 71.4127 51.2725V4.38574H9.58594V51.2725C9.58594 52.4855 10.5781 53.4653 11.8064 53.4653Z"
        fill="#3F9FFF"
      />
      <Path
        d="M62.6776 45.7663C61.3595 45.7663 60.2949 44.7366 60.2949 43.4617C60.2949 42.1868 61.3595 41.1571 62.6776 41.1571H68.8116V36.4498H56.9829C55.6648 36.4498 54.6002 35.4201 54.6002 34.1452C54.6002 32.8703 55.6648 31.8406 56.9829 31.8406H68.8116V2.68164H12V49.6237H68.8116V45.7663H62.6776Z"
        fill="white"
      />
      <Path
        d="M24.4222 37.2497C22.2018 37.2497 20.375 35.4614 20.375 33.2686C20.375 32.1801 19.4774 31.2936 18.375 31.2936C17.2726 31.2936 16.375 32.1801 16.375 33.2686C16.375 36.9543 18.9419 40.049 22.4065 40.9354V42.8326C22.4065 43.9212 23.3041 44.8076 24.4065 44.8076C25.5089 44.8076 26.4065 43.9212 26.4065 42.8326V40.9354C29.8711 40.0645 32.438 36.9543 32.438 33.2686C32.438 28.8988 28.5325 25.3686 24.1073 25.3686C22.0128 25.1976 20.375 23.4869 20.375 21.3875C20.375 19.1948 22.186 17.4064 24.4222 17.4064C26.6427 17.4064 28.4537 19.1948 28.4537 21.3875C28.4537 22.4761 29.3514 23.3625 30.4537 23.3625C31.5561 23.3625 32.4537 22.4761 32.4537 21.3875C32.4537 17.7019 29.8868 14.6072 26.4222 13.7208V11.808C26.4222 10.7194 25.5246 9.83301 24.4222 9.83301C23.3199 9.83301 22.4222 10.7194 22.4222 11.808V13.7208C18.9577 14.5917 16.3907 17.7019 16.3907 21.3875C16.3907 25.7574 19.997 29.3186 24.4222 29.3186C26.5167 29.4897 28.4537 31.1848 28.4537 33.2686C28.4537 35.4614 26.6427 37.2497 24.4222 37.2497Z"
        fill="#3F9FFF"
      />
      <Path
        d="M36.469 29.9588C37.6439 30.8167 38.6946 30.1412 39.0514 29.7056L44.7471 22.8355L48.8957 26.3325C49.4105 26.7553 50.1098 26.8885 50.731 26.6498C51.3523 26.4111 51.809 25.8592 51.9012 25.2122L53.0887 17.0599L57.6762 18.7857C58.4797 19.0895 59.4051 18.7889 59.8739 18.0647L63.9372 11.8212C64.4914 10.9809 64.2423 9.85117 63.3918 9.3185C62.5411 8.77149 61.3969 9.0179 60.8572 9.85798L57.6038 14.8557L52.2568 12.8541C51.7309 12.661 51.1505 12.7126 50.6752 12.9921C50.1998 13.2717 49.8727 13.75 49.7936 14.2964L48.7509 21.4279L45.7056 18.8616C45.3233 18.5516 44.8414 18.3865 44.3482 18.4368C43.855 18.4871 43.408 18.7233 43.094 19.1009L36.199 27.409C35.571 28.1787 35.6465 29.354 36.469 29.9588Z"
        fill="black"
      />
      <Path
        d="M78.2795 0H2.72047C1.49213 0 0.5 0.979724 0.5 2.19272C0.5 3.40571 1.49213 4.38543 2.72047 4.38543H5.14567V51.2722C5.14567 54.8957 8.1378 57.8504 11.8071 57.8504H38.2795V63.5421C34.9567 64.4907 32.5157 67.5232 32.5157 71.1155C32.5157 75.4699 36.0905 79 40.5 79C44.9095 79 48.4843 75.4699 48.4843 71.1155C48.4843 67.5232 46.0433 64.5063 42.7205 63.5421V57.8504H69.1929C72.8622 57.8504 75.8543 54.8957 75.8543 51.2722V4.38543H78.2795C79.5079 4.38543 80.5 3.40571 80.5 2.19272C80.5 0.979724 79.5079 0 78.2795 0ZM44.0433 71.1155C44.0433 73.0439 42.4528 74.6146 40.5 74.6146C38.5472 74.6146 36.9567 73.0439 36.9567 71.1155C36.9567 69.1872 38.5472 67.6165 40.5 67.6165C42.4528 67.6165 44.0433 69.1872 44.0433 71.1155ZM71.4134 51.2722C71.4134 52.4852 70.4213 53.465 69.1929 53.465H11.8071C10.5787 53.465 9.58661 52.4852 9.58661 51.2722V4.38543H71.4134V51.2722Z"
        fill="black"
      />
    </Svg>
  );

  const InvestmentIcon = ({ size = 48 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 81 69" fill="none">
      <Path
        d="M62.7197 65.1698H62.6457C61.5411 65.1698 60.6457 64.2744 60.6457 63.1698V61.4621C60.6457 60.3575 61.5411 59.4621 62.6457 59.4621H62.7197C63.3067 59.4522 63.8675 59.1484 64.2826 58.6153C64.6977 58.0822 64.9343 57.3621 64.942 56.6082V40.2081C64.9343 39.4542 64.6977 38.7341 64.2826 38.201C63.8675 37.6679 63.3067 37.3641 62.7197 37.3542H54.0234C52.9189 37.3542 52.0234 36.4588 52.0234 35.3542V33.6465C52.0234 32.5419 52.9189 31.6465 54.0234 31.6465H62.7197C64.4878 31.6465 66.1835 32.5485 67.4338 34.1541C68.684 35.7597 69.3864 37.9374 69.3864 40.2081V56.6082C69.3864 58.8789 68.684 61.0566 67.4338 62.6622C66.1835 64.2678 64.4878 65.1698 62.7197 65.1698Z"
        fill="black"
        stroke="white"
      />
      <Path
        d="M37.8307 63.4481C37.8307 64.5526 36.9353 65.4481 35.8307 65.4481H29.1641C28.0595 65.4481 27.1641 64.5526 27.1641 63.4481V61.8672C27.1641 60.7626 28.0595 59.8672 29.1641 59.8672H35.8307C36.9353 59.8672 37.8307 60.7626 37.8307 61.8672V63.4481Z"
        fill="black"
        stroke="white"
        strokeWidth={1.5}
      />
      <Path
        d="M26.2769 62.9412C26.2769 64.0457 25.3815 64.9412 24.2769 64.9412H22.0547C20.9501 64.9412 20.0547 64.0457 20.0547 62.9412V62.375C20.0547 61.2704 20.9501 60.375 22.0547 60.375H24.2769C25.3815 60.375 26.2769 61.2704 26.2769 62.375V62.9412Z"
        fill="#3F9FFF"
      />
      <Path
        d="M71.5191 7.13258C71.5191 8.23715 70.6237 9.13258 69.5191 9.13258H67.2969C66.1923 9.13258 65.2969 8.23715 65.2969 7.13258V6.56641C65.2969 5.46184 66.1923 4.56641 67.2969 4.56641H69.5191C70.6237 4.56641 71.5191 5.46184 71.5191 6.56641V7.13258Z"
        fill="#3F9FFF"
      />
      <Path
        d="M19.1675 62.9412C19.1675 64.0457 18.2721 64.9412 17.1675 64.9412H14.9453C13.8407 64.9412 12.9453 64.0457 12.9453 62.9412V62.375C12.9453 61.2704 13.8407 60.375 14.9453 60.375H17.1675C18.2721 60.375 19.1675 61.2704 19.1675 62.375V62.9412Z"
        fill="#3F9FFF"
      />
      <Path
        d="M64.4097 7.13258C64.4097 8.23715 63.5143 9.13258 62.4097 9.13258H60.1875C59.0829 9.13258 58.1875 8.23715 58.1875 7.13258V6.56641C58.1875 5.46184 59.0829 4.56641 60.1875 4.56641H62.4097C63.5143 4.56641 64.4097 5.46184 64.4097 6.56641V7.13258Z"
        fill="#3F9FFF"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M29.002 35.3534C29.002 36.458 28.1065 37.3534 27.002 37.3534H18.276C16.5079 37.3534 14.8122 36.4514 13.562 34.8458C12.3118 33.2402 11.6094 31.0625 11.6094 28.7918V12.3917C11.6094 10.121 12.3118 7.94331 13.562 6.33771C14.8122 4.7321 16.5079 3.83008 18.276 3.83008H19.239C20.3436 3.83008 21.239 4.72551 21.239 5.83008V7.5378C21.239 8.64237 20.3436 9.5378 19.239 9.5378H18.276C17.6867 9.5378 17.1214 9.83847 16.7047 10.3737C16.2879 10.9089 16.0538 11.6348 16.0538 12.3917V28.7918C16.0615 29.5457 16.2981 30.2658 16.7132 30.7989C17.1283 31.332 17.6891 31.6358 18.276 31.6457H27.002C28.1065 31.6457 29.002 32.5411 29.002 33.6457V35.3534Z"
        fill="black"
        stroke="white"
      />
      <Rect
        x={38.7188}
        y={56.8232}
        width={21.3333}
        height={11.1618}
        rx={3}
        fill="#3F9FFF"
      />
      <Rect
        x={29.8359}
        y={28.4121}
        width={21.3333}
        height={11.1618}
        rx={3}
        fill="#3F9FFF"
      />
      <Rect
        x={21.8359}
        y={1.01465}
        width={21.3333}
        height={11.1618}
        rx={3}
        fill="#3F9FFF"
      />
    </Svg>
  );

  const FundamentalIcon = ({ size = 48 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 80 79" fill="none">
      <Path
        d="M53.1641 42.792C58.6179 42.792 63.0391 38.3708 63.0391 32.917C63.0391 27.4632 58.6179 23.042 53.1641 23.042C47.7103 23.042 43.2891 27.4632 43.2891 32.917C43.2891 38.3708 47.7103 42.792 53.1641 42.792Z"
        fill="#3F9FFF"
      />
      <Path
        d="M69.6224 49.3753L60.307 40.0599M43.2891 55.9587H23.5391M30.1224 42.792H23.5391M43.2891 32.917C43.2891 34.8701 43.8682 36.7793 44.9533 38.4032C46.0384 40.0272 47.5806 41.2929 49.3851 42.0403C51.1895 42.7877 53.175 42.9833 55.0906 42.6022C57.0061 42.2212 58.7657 41.2807 60.1467 39.8997C61.5278 38.5186 62.4683 36.7591 62.8493 34.8435C63.2303 32.9279 63.0348 30.9424 62.2874 29.138C61.54 27.3336 60.2743 25.7913 58.6503 24.7062C57.0264 23.6212 55.1172 23.042 53.1641 23.042C50.5451 23.042 48.0333 24.0824 46.1814 25.9343C44.3295 27.7862 43.2891 30.298 43.2891 32.917Z"
        stroke="#3F9FFF"
        strokeWidth={4.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M56.4583 55.9583V65.8333C56.4583 66.7063 56.1115 67.5436 55.4942 68.1609C54.8769 68.7782 54.0397 69.125 53.1667 69.125H13.6667C12.7937 69.125 11.9564 68.7782 11.3391 68.1609C10.7218 67.5436 10.375 66.7063 10.375 65.8333V13.1667C10.375 12.2937 10.7218 11.4564 11.3391 10.8391C11.9564 10.2218 12.7937 9.875 13.6667 9.875H53.1667"
        stroke="black"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

  // Unit selector moved to UnitSelector component

  return (
    <View style={styles.container}>
      <TopBar />

      {selectedUnitIdx !== null && (
        <Animated.View
          style={[
            styles.stickyHeader,
            {
              opacity: stickyHeaderOpacity,
              transform: [
                {
                  translateY: stickyHeaderOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-60, 0],
                    extrapolate: "clamp",
                  }),
                },
              ],
            },
          ]}
        >
          <StickyHeader
            title={
              activeStep?.step === 1
                ? "מבוא לשוק ההון"
                : activeStep?.step === 2
                ? "ניתוח טכני"
                : activeStep?.step === 3
                ? "השקעות לטווח ארוך"
                : "ניתוח פונדמנטלי"
            }
            progress={progressPercentage}
          />
        </Animated.View>
      )}

      {/* If no unit selected, render the unit chooser */}
      {selectedUnitIdx === null ? (
        <UnitSelector
          completedLessons={completedLessons}
          onSelectUnit={setSelectedUnitIdx}
        />
      ) : (
        <ScrollView
            ref={scrollViewRef}
            style={styles.mapScrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onScrollBeginDrag={dismissActiveTooltip}
            removeClippedSubviews={false} // Changed to false to avoid clipping overflow tooltips
            decelerationRate="normal"
            bounces={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Unit Header Card matching Figma */}
            <View style={styles.headerCard}>
              <View style={styles.headerRow}>

                                              {/* Actions Row */}
              <View style={styles.headerActionsRow}>
                <TouchableOpacity
                  style={styles.backToUnitsButton}
                  activeOpacity={0.8}
                  onPress={() => setSelectedUnitIdx(null)}
                >
                  <Text style={styles.backToUnitsText}>חזרה לבחירת קורס</Text>
                </TouchableOpacity>
              </View>
                {/* Text Right */}
                <View style={styles.headerTextContainer}>
                  <Text style={styles.headerTitle}>
                    {activeStep?.step === 1
                      ? "מבוא לשוק ההון"
                      : activeStep?.step === 2
                      ? "ניתוח טכני"
                      : activeStep?.step === 3
                      ? "השקעות לטווח ארוך"
                      : "ניתוח פונדמנטלי"}
                  </Text>
                  <Text style={styles.headerSubtitle}>
                    {activeStep?.step === 1
                      ? "מושגי יסוד ומונחים"
                      : activeStep?.step === 2
                      ? "תמיכה והתנגדות"
                      : "אסטרטגיות מתקדמות"}
                  </Text>
                </View>

                {/* Icon Left */}
                <View style={styles.headerIconContainer}>
                  <TechnicalAnalysisIcon size={56} />
                </View>


              </View>



              {/* Progress Bar Row */}
              <View style={styles.headerProgressRow}>
                <View style={styles.headerProgressBarBg}>
                  <View
                    style={[
                      styles.headerProgressBarFill,
                      { width: `${progressPercentage * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.headerProgressText}>
                  {Math.round(progressPercentage * 100)}%
                </Text>
              </View>
            </View>

            <View style={[styles.mapContainer, { minHeight: totalMapHeight }]}>
              {/* Map Connector Path - Dotted Blue Line */}
              <Svg
                width={SCREEN_WIDTH}
                height={totalMapHeight}
                style={{ position: "absolute", top: 0, left: 0 }}
                pointerEvents="none"
              >
                {nodePositions.slice(1).map((curr, idx) => {
                  const prev = nodePositions[idx];
                  const x0 = prev.x;
                  const y0 = prev.y + CIRCLE_SIZE / 2;
                  const x1 = curr.x;
                  const y1 = curr.y + CIRCLE_SIZE / 2;

                  // Cubic Bezier for smooth S-curve
                  const dy = y1 - y0;
                  const controlY = dy * 0.5; // Control point distance

                  // M Start C Control1 Control2 End
                  const d = `M ${x0} ${y0} C ${x0} ${y0 + controlY} ${x1} ${
                    y1 - controlY
                  } ${x1} ${y1}`;

                  return (
                    <Path
                      key={`conn-${idx}`}
                      d={d}
                      stroke="#3B82F6"
                      strokeWidth={4}
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray="10, 10"
                      opacity={0.8}
                    />
                  );
                })}
              </Svg>
              {allLessons.map((lessonData, idx) => {
                const { lesson, step } = lessonData;
                const { completed, current, unlocked } = lessonStatuses[idx];
                const position = idx % 2 === 0 ? "left" : "right";
                const nodeStyle = {
                  position: "absolute" as const,
                  left: nodePositions[idx].x - CIRCLE_SIZE / 2,
                  top: nodePositions[idx].y,
                  alignItems: "center" as const,
                  zIndex: 1, // Base zIndex
                };

                // In unit view we do not need unit dividers
                const isNewUnit = false;

                // Determine status for styling
                const status = completed
                  ? "completed"
                  : !unlocked
                  ? "locked"
                  : "active";
                const isTooltipVisible = activeTooltipId === lesson.id;

                return (
                  <React.Fragment key={lesson.id}>
                    {/* Unit Divider */}
                    {isNewUnit && (
                      <View
                        style={[
                          styles.unitDivider,
                          { top: nodePositions[idx].y - 40 },
                        ]}
                      >
                        <View style={styles.dividerLine} />
                        <View style={styles.dividerBadge}>
                          <Text style={styles.dividerText}>
                            יחידה {step.step}
                          </Text>
                        </View>
                        <View style={styles.dividerLine} />
                      </View>
                    )}

                    <View
                      style={[
                        nodeStyle,
                        { zIndex: isTooltipVisible ? 100 : 1 },
                      ]}
                    >
                      {/* Calculate progress for tooltip */}
                      {(() => {
                        const sublessons = lesson.sublessons || [];
                        const totalSub = sublessons.length;
                        const doneSub = sublessons.filter((s: any) =>
                          completedLessons.includes(s.id)
                        ).length;

                        // Default logic if no sublessons found: use 0 or 1 based on main lesson completion
                        let displayTotal = totalSub > 0 ? totalSub : 1;
                        let displayDone =
                          totalSub > 0 ? doneSub : completed ? 1 : 0;

                        // If completed, ensure full progress shown
                        if (completed) {
                          displayDone = displayTotal;
                        }

                        const progLabel = `${displayDone}/${displayTotal}`;
                        const progPercent =
                          displayTotal > 0 ? displayDone / displayTotal : 0;

                        // Button text logic
                        let btnTxt = "המשך למידה";
                        if (completed) {
                          btnTxt = "תרגול חוזר";
                        } else if (displayDone === 0) {
                          btnTxt = "התחל למידה";
                        }

                        return (
                          <>
                            {/* Node circle */}
                            <LessonNode
                              title={lesson.title}
                              unlocked={unlocked}
                              lessonId={lesson.id}
                              onStart={() => {
                                // Toggle tooltip logic
                                if (activeTooltipId === lesson.id) {
                                  setActiveTooltipId(null);
                                } else {
                                  setActiveTooltipId(lesson.id);
                                  // ... auto scroll code ... (omitted from this block, preserved in file)
                                  const tooltipHeight = 160;
                                  const bottomBarHeight = 90;
                                  const screenHeight =
                                    Dimensions.get("window").height;
                                  const nodeY = nodePositions[idx].y;
                                  const tooltipBottomY =
                                    nodeY + CIRCLE_SIZE + tooltipHeight;
                                  const visibleBottomY =
                                    scrollOffsetRef.current +
                                    screenHeight -
                                    bottomBarHeight;

                                  if (tooltipBottomY > visibleBottomY) {
                                    const targetScroll =
                                      tooltipBottomY -
                                      screenHeight +
                                      bottomBarHeight +
                                      40;
                                    scrollViewRef.current?.scrollTo({
                                      y: targetScroll,
                                      animated: true,
                                    });
                                  }
                                }
                              }}
                              completed={completed}
                              current={current}
                              position={position}
                              lessonType={lesson.lessonType || "info"}
                            />

                            {/* Tooltip Rendered Below Node (Inside the absolute view) */}
                            {isTooltipVisible && (
                              <LessonTooltip
                                title={lesson.title}
                                status={status}
                                buttonText={btnTxt}
                                progressLabel={progLabel}
                                progressPercent={progPercent}
                                style={{
                                  top: CIRCLE_SIZE + 10,
                                  left: (CIRCLE_SIZE - 200) / 2,
                                }}
                                onPress={() => {
                                  setSelectedMainLesson(lesson);
                                  setModalVisible(true);
                                  setActiveTooltipId(null);
                                }}
                              />
                            )}
                          </>
                        );
                      })()}
                    </View>
                  </React.Fragment>
                );
              })}
              <LessonModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                selectedMainLesson={selectedMainLesson}
                completedLessons={completedLessons}
                lessonAttempts={lessonAttempts}
                onStart={handleLessonStart}
              />
              {/* Spacer for scroll */}
              <View style={{ height: 200 }} />
            </View>
          </ScrollView>
      )}
      <BottomNavbar activeTab="map" onTabPress={handleTabPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E3EEF9",
  },
  mapScrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 200, // Increased padding for better scroll
    flexGrow: 1, // Allow content to expand
  },

  // Header Card Styles
  headerCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  headerIconContainer: {
    marginLeft: 16,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: theme.font.bold,
    color: "#1E293B",
    textAlign: "right",
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: theme.font.family,
    color: "#64748B",
    marginTop: 4,
    textAlign: "right",
  },
  headerProgressRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerActionsRow: {
    marginTop: 12,
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
  },
  backToUnitsButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },
  backToUnitsText: {
    fontSize: 13,
    fontFamily: theme.font.bold,
    color: "#1D4ED8",
  },
  headerProgressText: {
    fontSize: 14,
    fontFamily: theme.font.bold,
    color: "#3B82F6",
    marginLeft: 12,
  },
  headerProgressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  headerProgressBarFill: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 4,
  },

  // Elegant Hero Section
  heroSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 0,
    marginBottom: 32,
    paddingTop: 24,
    paddingBottom: 28,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  unitHeader: {
    alignItems: "center",
    marginBottom: 24,
  },

  unitBadge: {
    backgroundColor: "#F0F4FF",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E7FF",
  },

  unitBadgeText: {
    fontSize: 13,
    fontFamily: theme.font.bold,
    color: "#4F46E5",
    letterSpacing: 0.5,
  },

  unitTitle: {
    fontSize: 28,
    fontFamily: theme.font.bold,
    color: "#1E293B",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.5,
  },

  unitSubtitle: {
    fontSize: 16,
    fontFamily: theme.font.family,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 16,
  },

  progressContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },

  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  progressText: {
    fontSize: 14,
    fontFamily: theme.font.family,
    color: "#475569",
    flex: 1,
    textAlign: "right",
  },

  progressPercentage: {
    fontSize: 18,
    fontFamily: theme.font.bold,
    color: "#0EA5E9",
    marginLeft: 12,
  },

  progressBar: {
    alignItems: "center",
  },

  // Sticky Minimal Header Styles
  stickyHeader: {
    position: "absolute",
    width: "90%",
    // top: -90, // Position below TopBar (assuming TopBar height is ~90px)
    left: "5%",
    right: "5%",
    backgroundColor: "rgba(104, 160, 14, 0)",
    zIndex: 1000,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(226, 232, 240, 0)",
    // paddingVertical: 12,
    // paddingHorizontal: 20,
    // shadowColor: "#1E293B",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.08,
    // shadowRadius: 8,
    elevation: 8,
    marginTop: 120,
  },

  stickyHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  stickyHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  stickyBadge: {
    backgroundColor: "#EFF6FF",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },

  stickyBadgeText: {
    fontSize: 12,
    fontFamily: theme.font.bold,
    color: "#0EA5E9",
  },

  stickyTitle: {
    fontSize: 16,
    fontFamily: theme.font.bold,
    color: "#1E293B",
    letterSpacing: -0.2,
  },

  stickyHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },

  stickyProgress: {
    fontSize: 14,
    fontFamily: theme.font.bold,
    color: "#0EA5E9",
    marginRight: 8,
    minWidth: 35,
    textAlign: "right",
  },

  miniProgressBar: {
    alignItems: "center",
  },

  // Premium Map Container
  mapContainer: {
    width: SCREEN_WIDTH,
    minHeight: 2000, // Increased to accommodate all lessons
    alignItems: "center",
    justifyContent: "flex-start",
    position: "relative",
    paddingBottom: 120, // More bottom padding for better scroll
    paddingTop: 24,
    backgroundColor: "transparent",
  },

  // Unit Divider Styles
  unitDivider: {
    position: "absolute",
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 999,
  },

  dividerLine: {
    flex: 1,
    height: 2,
    backgroundColor: "rgba(59, 130, 246, 0.3)",
  },

  dividerBadge: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginHorizontal: 12,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  dividerText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: theme.font.bold,
    textAlign: "center",
  },

  // Refined Footprint Styles
  footprintContainer: {
    position: "absolute",
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },

  // Professional Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(30, 41, 59, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 380,
    maxHeight: "85%",
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  modalIconContainer: {
    marginRight: 16,
  },
  modalIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },
  modalHeaderText: {
    flex: 1,
    alignItems: "flex-start",
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: theme.font.bold,
    color: "#1E293B",
    marginBottom: 4,
    textAlign: "left",
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: theme.font.family,
    color: "#64748B",
    textAlign: "left",
  },
  modalProgress: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  modalLessonsList: {
    marginBottom: 24,
  },
  modalLessonsScrollContainer: {
    maxHeight: 280,
    marginBottom: 24,
  },
  modalLessonsScrollContent: {
    paddingBottom: 8,
  },
  modalLessonItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
    backgroundColor: "#FAFBFF",
    borderWidth: 1,
    borderColor: "transparent",
  },
  modalLessonCompleted: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  modalLessonCurrent: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
  },
  modalLessonIcon: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkmark: {
    fontSize: 16,
    color: "#059669",
    fontWeight: "bold",
  },
  currentDot: {
    fontSize: 16,
    color: "#0EA5E9",
  },
  lockedDot: {
    fontSize: 16,
    color: "#94A3B8",
  },
  modalLessonTextContainer: {
    flex: 1,
    flexDirection: "column",
  },
  modalLessonText: {
    fontSize: 15,
    fontFamily: theme.font.family,
    color: "#334155",
    textAlign: "right",
    lineHeight: 20,
  },
  modalLessonDescription: {
    fontSize: 11,
    fontFamily: theme.font.family,
    color: "#64748B",
    textAlign: "right",
    marginTop: 1,
    lineHeight: 14,
  },
  modalLessonAttempts: {
    fontSize: 12,
    fontFamily: theme.font.family,
    color: "#64748B",
    textAlign: "right",
    marginTop: 2,
  },
  modalLessonTextCompleted: {
    color: "#059669",
    fontFamily: theme.font.bold,
  },
  modalLessonTextCurrent: {
    color: "#0EA5E9",
    fontFamily: theme.font.bold,
  },
  modalActionButton: {
    backgroundColor: "#0EA5E9",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  modalActionText: {
    fontSize: 17,
    fontFamily: theme.font.bold,
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  modalCompletedContainer: {
    alignItems: "center",
  },
  modalCompletedButton: {
    backgroundColor: "#F59E0B",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    marginBottom: 12,
  },
  modalCompletedText: {
    fontSize: 17,
    fontFamily: theme.font.bold,
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  modalCompletedSubtext: {
    fontSize: 14,
    fontFamily: theme.font.family,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 16,
  },
  modalRetakeButton: {
    backgroundColor: "#E2E8F0",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  modalRetakeText: {
    fontSize: 15,
    fontFamily: theme.font.bold,
    color: "#475569",
  },

  // Simple Unit Selector Styles
  unitSelectorHero: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 0,
    elevation: 1,
  },

  heroIconContainer: {
    marginBottom: 6,
  },

  heroTitle: {
    fontSize: 20,
    fontFamily: theme.font.bold,
    color: "#1E293B",
    marginBottom: 2,
    textAlign: "right",
  },

  heroSubtitle: {
    fontSize: 16,
    fontFamily: theme.font.family,
    color: "#64748B",
    textAlign: "right",
    marginBottom: 12,
    lineHeight: 16,
  },

  overallProgressContainer: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: 6,
    padding: 8,
    borderWidth: 0.5,
    borderColor: "#E2E8F0",
  },

  overallProgressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  overallProgressText: {
    fontSize: 11,
    fontFamily: theme.font.family,
    color: "#475569",
  },

  overallProgressPercentage: {
    fontSize: 12,
    fontFamily: theme.font.bold,
    color: "#0EA5E9",
  },

  overallProgressBar: {
    marginBottom: 3,
    alignItems: "center",
  },

  overallProgressDetails: {
    fontSize: 9,
    fontFamily: theme.font.family,
    color: "#64748B",
    textAlign: "center",
  },

  unitCardsContainer: {
    gap: 12,
    alignItems: "stretch",
  },

  unitCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    position: "relative",
  },

  unitCardCompleted: {
    borderWidth: 1,
    borderColor: "#10B981",
  },

  unitCardContent: {
    padding: 16,
  },

  unitCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  unitIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(59, 130, 246, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "rgba(59, 130, 246, 0.15)",
  },

  unitStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    borderWidth: 0.5,
    borderColor: "#BFDBFE",
  },

  completedBadgeText: {
    fontSize: 11,
    fontFamily: theme.font.bold,
    color: "#059669",
  },

  inProgressBadgeText: {
    fontSize: 11,
    fontFamily: theme.font.bold,
    color: "#0EA5E9",
  },

  availableBadgeText: {
    fontSize: 11,
    fontFamily: theme.font.bold,
    color: "#6B7280",
  },

  unitCardBody: {
    marginBottom: 12,
  },

  unitCardTitle: {
    fontSize: 18,
    fontFamily: theme.font.bold,
    color: "#1E293B",
    marginBottom: 6,
    textAlign: "right",
  },

  unitCardSubtitle: {
    fontSize: 13,
    fontFamily: theme.font.family,
    color: "#64748B",
    lineHeight: 18,
    textAlign: "right",
  },

  unitCardFooter: {
    marginBottom: 12,
  },

  unitProgressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  unitProgressText: {
    fontSize: 12,
    fontFamily: theme.font.family,
    color: "#475569",
  },

  unitProgressPercentage: {
    fontSize: 13,
    fontFamily: theme.font.bold,
    color: "#0EA5E9",
  },

  unitProgressBar: {
    alignItems: "center",
  },

  unitActionButton: {
    backgroundColor: "#0EA5E9",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },

  unitActionText: {
    fontSize: 14,
    fontFamily: theme.font.bold,
    color: "#FFFFFF",
  },

  bottomInfo: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#00A5E9",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  infoIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#CEF6FF",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  infoIconText: { fontSize: 16 },

  bottomInfoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: theme.font.family,
    color: "gray",
    textAlign: "right",
  },

  close: {
    fontSize: 18,
    color: "#B45309",
    paddingHorizontal: 4,
  },
});
