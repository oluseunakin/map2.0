interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export const CustomWeatherPanel = (props: TabPanelProps) => {
  const { children, index, value, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
};
