import Svg, { Line, Path } from "react-native-svg";
import { Colors } from "../../constants/FormTheme";

type IconProps = {
  size?: number;
  color?: string;
};

export const AnalyticsIcon = ({
  size = 24,
  color = Colors.grey500,
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

// FOLDER NAV ICON
export const FolderNavIcon = ({
  size = 24,
  color = Colors.grey500,
}: IconProps) => (
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

// HOME ICON
export const HomeIcon = ({ size = 24, color = "#6b7280" }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M3 12L12 3l9 9"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
