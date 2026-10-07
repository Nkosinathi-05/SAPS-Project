import Svg, { Line, Path, Circle, Rect } from "react-native-svg";
import { Colors } from "../../constants/FormTheme";

type IconProps = {
  size?: number;
  color?: string;
  active?: boolean; // when true the icon is filled with sapsblue
};

//DIVISION ICON
export const BuildingIcon = ({ size = 16, color = "#f7c600" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="1"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
    />
    <Rect x="9" y="9" width="2" height="2" fill={color} />
    <Rect x="13" y="9" width="2" height="2" fill={color} />
    <Rect x="9" y="13" width="2" height="2" fill={color} />
    <Rect x="13" y="13" width="2" height="2" fill={color} />
    <Rect x="10" y="17" width="4" height="4" fill={color} />
    <Rect x="3" y="7" width="18" height="1.5" fill={color} />
  </Svg>
);

//CREATE CASE ICON
export const PlusIcon = ({ size = 32, color = "#00317a" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth="2" />
    <Line
      x1="12"
      y1="8"
      x2="12"
      y2="16"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Line
      x1="8"
      y1="12"
      x2="16"
      y2="12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

// VIEW CASES ICON
export const BriefcaseIcon = ({ size = 32, color = "#00317a" }) => (
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

export const SearchIcon = ({ size = 18, color = "#9ca3af" }) => (
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

// ANALYTICS NAV ICON
export const AnalyticsIcon = ({
  size = 24,
  color,
  active = false,
}: IconProps) => {
  const c = color ?? (active ? Colors.sapsblue : Colors.grey500);

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {active ? (
        <>
          {/* filled bars */}
          <Rect x="16.5" y="10" width="3" height="10" rx="1" fill={c} />
          <Rect x="10.5" y="4" width="3" height="16" rx="1" fill={c} />
          <Rect x="4.5" y="14" width="3" height="6" rx="1" fill={c} />
        </>
      ) : (
        <>
          <Line
            x1="18"
            y1="20"
            x2="18"
            y2="10"
            stroke={c}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <Line
            x1="12"
            y1="20"
            x2="12"
            y2="4"
            stroke={c}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <Line
            x1="6"
            y1="20"
            x2="6"
            y2="14"
            stroke={c}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </>
      )}
      <Line
        x1="3"
        y1="20"
        x2="21"
        y2="20"
        stroke={c}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
};

// FOLDER NAV ICON
export const FolderNavIcon = ({
  size = 24,
  color,
  active = false,
}: IconProps) => {
  const c = color ?? (active ? Colors.sapsblue : Colors.grey500);

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
        fill={active ? c : "none"}
        stroke={c}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

// HOME ICON
export const HomeIcon = ({ size = 24, color, active = false }: IconProps) => {
  const c = color ?? (active ? Colors.sapsblue : Colors.grey500);

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {active ? (
        // one closed shape so the whole house is filled (door stays open)
        <Path
          d="M12 3L3 12h2v8a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-8h2L12 3z"
          fill={c}
          stroke={c}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <>
          <Path
            d="M3 12L12 3l9 9"
            fill="none"
            stroke={c}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9"
            fill="none"
            stroke={c}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </Svg>
  );
};

export const HashIcon = ({ size = 22, color = "#f7c600" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Line
      x1="4"
      y1="9"
      x2="20"
      y2="9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Line
      x1="4"
      y1="15"
      x2="20"
      y2="15"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Line
      x1="10"
      y1="3"
      x2="8"
      y2="21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Line
      x1="16"
      y1="3"
      x2="14"
      y2="21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

export const CalendarIcon = ({ size = 22, color = "#f7c600" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect
      x="3"
      y="4"
      width="18"
      height="18"
      rx="2"
      fill="none"
      stroke={color}
      strokeWidth="2"
    />
    <Line
      x1="16"
      y1="2"
      x2="16"
      y2="6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Line
      x1="8"
      y1="2"
      x2="8"
      y2="6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth="2" />
  </Svg>
);
