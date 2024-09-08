/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import React from "react";

import { CustomWeatherPanel } from "./CustomWeatherPanel";

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export const WeatherTab = ({ forecast }: { forecast: any }) => {
  const entries = Object.entries(forecast) as [string, any][];
  const [value, setValue] = React.useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  return (
    <Stack>
      <Tabs
        value={value}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
      >
        {entries.map((entry, index) => (
          <Tab label={entry[0]} key={index} {...a11yProps(index)} />
        ))}
      </Tabs>
      {entries.map((entry, index) => (
        <CustomWeatherPanel index={index} value={value} key={index}>
          {Array.isArray(entry[1]) ? (
            entry[1].map(
              (
                forecast: {
                  weatherDescription:
                    | string
                    | number
                    | boolean
                    | React.ReactElement<
                        any,
                        string | React.JSXElementConstructor<any>
                      >
                    | Iterable<React.ReactNode>
                    | React.ReactPortal
                    | null
                    | undefined;
                  temperature:
                    | string
                    | number
                    | boolean
                    | React.ReactElement<
                        any,
                        string | React.JSXElementConstructor<any>
                      >
                    | Iterable<React.ReactNode>
                    | React.ReactPortal
                    | null
                    | undefined;
                },
                index: React.Key | null | undefined
              ) => (
                <Accordion sx={{ paddingTop: 2, marginTop: 4 }} key={index}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                  >
                    Weather info
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={3}>
                      <Typography>
                        Weather feels like {forecast.weatherDescription}
                      </Typography>
                      <Typography>
                        Temperature is {forecast.temperature}
                      </Typography>
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              )
            )
          ) : (
            <Stack marginTop={4} key={index} spacing={2}>
              <Typography>
                Weather feels like {entry[1].weatherDescription}
              </Typography>
              <Typography>Temperature is {entry[1].temperature}</Typography>
            </Stack>
          )}
        </CustomWeatherPanel>
      ))}
    </Stack>
  );
};
