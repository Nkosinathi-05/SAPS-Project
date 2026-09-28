import Svg, { Path, Line, Circle, Rect } from "react-native-svg";
import { Colors } from "../../constants/FormTheme";

type IconProps = {
  size?: number;
  color?: string;
};

//LOGOUT ICON
export const PowerIcon = ({ size = 18, color = Colors.white }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M18.36 6.64a9 9 0 11-12.73 0"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Line
      x1="12"
      y1="2"
      x2="12"
      y2="12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

// ALERT / WARNING ICON
export const AlertIcon = ({ size = 32, color = Colors.red }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line
      x1="12"
      y1="9"
      x2="12"
      y2="13"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Circle cx="12" cy="17" r="1" fill={color} />
  </Svg>
);

// UNASSIGNED ICON
export const ClockIcon = ({ size = 32, color = Colors.gold }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth="2" />
    <Path
      d="M12 7v5l3 3"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
// FOLDER ICON
export const FolderIcon = ({ size = 32, color = "#00317a" }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </Svg>
);

// BRIEFCASE / VIEW CASES ICON
export const BriefcaseIcon = ({ size = 32, color = "#00317a" }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect
      x="2"
      y="7"
      width="20"
      height="14"
      rx="2"
      fill="none"
      stroke={color}
      strokeWidth="2"
    />
    <Path
      d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <Line x1="2" y1="13" x2="22" y2="13" stroke={color} strokeWidth="2" />
  </Svg>
);
// BAR CHART / ANALYTICS ICON
export const BarChartIcon = ({
  size = 32,
  color = Colors.sapsblue,
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Line
      x1="18"
      y1="20"
      x2="18"
      y2="10"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <Line
      x1="12"
      y1="20"
      x2="12"
      y2="4"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <Line
      x1="6"
      y1="20"
      x2="6"
      y2="14"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <Line
      x1="3"
      y1="20"
      x2="21"
      y2="20"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

// CLIPBOARD / TOTAL TODAY
export const ClipboardIcon = ({ size = 22, color = "#001b44" }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect
      x="8"
      y="2"
      width="8"
      height="4"
      rx="1"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <Path
      d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <Line
      x1="9"
      y1="12"
      x2="15"
      y2="12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Line
      x1="9"
      y1="16"
      x2="13"
      y2="16"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

// HOURGLASS / ACTIVE
export const HourglassIcon = ({ size = 22, color = "#001b44" }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M5 2h14M5 22h14M6 2v4l6 6-6 6v4M18 2v4l-6 6 6 6v4"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// CHECK CIRCLE / RESOLVED
export const CheckCircleIcon = ({
  size = 22,
  color = "#16a34a",
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth="2" />
    <Path
      d="M8 12l3 3 5-5"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// TREND UP ARROW
export const TrendUpIcon = ({ size = 13, color = "#dc2626" }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M18 7l-8 8-4-4-4 4"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14 7h4v4"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
// CHECK MARK (inline trend ok)
export const CheckIcon = ({ size = 13, color = "#16a34a" }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M5 13l4 4L19 7"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
//LOCATION ICON
export const PinIcon = ({ size = 16, color = "#f7c600" }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
      fill={color}
    />
    <Circle cx="12" cy="9" r="2.5" fill="white" />
  </Svg>
);

export const ArrowLeftIcon = ({ size = 18, color = "#f7c600" }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M19 12H5M5 12l7-7M5 12l7 7"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
// SETTINGS
export const SettingsIcon = ({ size = 15, color = "#001b44" }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="3" fill="none" stroke={color} strokeWidth="2" />
    <Path
      d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
      fill="none"
      stroke={color}
      strokeWidth="2"
    />
  </Svg>
);

export const SearchIcon = ({ size = 18, color = "#9ca3af" }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="11" cy="11" r="7" fill="none" stroke={color} strokeWidth="2" />
    <Line
      x1="16.5"
      y1="16.5"
      x2="22"
      y2="22"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

export const ScalesIcon = ({ size = 14, color = "#444650" }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Line
      x1="12"
      y1="3"
      x2="12"
      y2="21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M5 6l-3 6a3 3 0 006 0L5 6z"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <Path
      d="M19 6l-3 6a3 3 0 006 0L19 6z"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <Line
      x1="5"
      y1="6"
      x2="19"
      y2="6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Line
      x1="9"
      y1="21"
      x2="15"
      y2="21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

// SHIELD
export const ShieldIcon = ({ size = 22, color = "#dc2626" }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2l8 3v6c0 5-3.5 9.7-8 11C7.5 20.7 4 16 4 11V5l8-3z"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
