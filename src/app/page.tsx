/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { Coordinates } from "@/types";

import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Grid2 from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import LocationSearchingOutlinedIcon from "@mui/icons-material/LocationSearchingOutlined";
import HomeIcon from "@mui/icons-material/Home";

import { useEffect, useMemo, useRef, useState } from "react";

import { WeatherTab } from "@/components/WeatherTab";
import L from "leaflet";
import "leaflet-routing-machine";


export default function Home() {
  const [coordinates, setCoordinates] = useState<Coordinates | undefined>();
  const homeRef = useRef<Coordinates>();
  const mapRef = useRef<any>();
  const [goto, setGoto] = useState("");
  const [search, setSearch] = useState<string | null>(null);
  const searchOptions = ["Restaurant", "Cinema"];
  const [place, setPlace] = useState<{
    name: string;
    coordinates: [number, number];
  }>();
  const directionRef = useRef<any>();
  const markerRef = useRef<any>();
  const [forecast, setForecast] = useState<any[] | any>(undefined);
  const groupedForecast = useMemo(
    () =>
      forecast
        ? forecast && Array.isArray(forecast)
          ? forecast.reduce(
              (groups: { [x: string]: unknown[] }, item: { date: string }) => {
                const date = item.date;

                if (!groups[date]) {
                  groups[date] = [];
                }

                groups[date].push(item);
                return groups;
              },
              {}
            )
          : { [forecast.date]: forecast }
        : forecast,
    [forecast]
  );

  useEffect(() => {
    const location = navigator.geolocation;
    const getPositionSuccess = (position: GeolocationPosition) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      homeRef.current = { latitude, longitude };
      setCoordinates({
        latitude,
        longitude,
      });
    };
    location.getCurrentPosition(
      getPositionSuccess,
      (error) => {
        console.log(error);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    async function initMap() {
      if (coordinates) {
        const { latitude, longitude } = coordinates;
        
        if (!mapRef.current) mapRef.current = L.map("map");
        const map = mapRef.current;
        map.setView([latitude, longitude], 12);
        map.flyTo([latitude, longitude], 12);
        L
          .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
          })
          .addTo(map);
        L
          .marker([coordinates.latitude, coordinates.longitude])
          .addTo(map)
          .bindPopup("You are here.")
          .openPopup();
      }
    }
    initMap();
  }, [coordinates]);

  useEffect(() => {
    if (search && coordinates) {
      const map = mapRef.current;
      markerRef.current && map.removeControl(markerRef.current);
      fetch(
        `https://nominatim.openstreetmap.org/search?q=${search}&format=json&limit=10&viewbox=${
          coordinates.longitude - 0.05
        },${coordinates.latitude + 0.05},${coordinates.longitude + 0.05},${
          coordinates.latitude - 0.05
        }&bounded=1`
      )
        .then((response) => response.json())
        .then((data) => {
          data.forEach(
            (place: { lat: number; lon: number; display_name: string }) => {
              markerRef.current = L.marker([
                place.lat,
                place.lon,
              ]);
              markerRef.current
                .addTo(map)
                .bindPopup(
                  `${place.display_name}
              Click on marker to see more`
                )
                .openPopup();
              markerRef.current.on("click", () => {
                setPlace({
                  name: place.display_name,
                  coordinates: [place.lat, place.lon],
                });
              });
            }
          );
        })
        .catch((error) => console.error("Error fetching places:", error));
    }
  }, [coordinates, search]);

  useEffect(() => {
    if (place && coordinates) {
      const map = mapRef.current;
      if (directionRef.current) map.removeControl(directionRef.current);
      directionRef.current = L.Routing.control({
        waypoints: [
          L.latLng(
            coordinates.latitude,
            coordinates.longitude
          ), // Starting point (Latitude, Longitude)
          L.latLng(place.coordinates[0], place.coordinates[1]), // Destination point
        ],
        routeWhileDragging: true,
      })
      map.addControl(directionRef.current)
    }

  }, [place, coordinates]);

  if (coordinates)
    return (
      <Grid2 justifyContent="center" container wrap="wrap-reverse" spacing={3}>
        <Grid2 size={{ xs: 12, md: 8 }}>
          {place && (
            <Card sx={{ marginBottom: 5 }}>
              <CardContent>
                <Stack spacing={3} alignItems="center">
                  <Typography textAlign="center" variant="h5">
                    {place.name}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          )}
          {groupedForecast && (
            <Card sx={{ marginBottom: 5 }}>
              <CardContent>
                <Stack spacing={3}>
                  <Typography margin="auto" textAlign="center" variant="h5">
                    Your Weather Information
                  </Typography>
                  <WeatherTab
                    setForecast={setForecast}
                    forecast={groupedForecast}
                  />
                </Stack>
              </CardContent>
            </Card>
          )}
          <Card elevation={5} sx={{ height: 550 }} id="map"></Card>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <Container sx={{ height: { md: "90vh" } }}>
            <Stack justifyContent="center" height="inherit">
              <Stack alignItems="center" marginBottom={2}>
                <Button
                  disabled={!(forecast || goto || search || place)}
                  onClick={() => {
                    setCoordinates(homeRef.current);
                    setForecast(undefined);
                    setGoto("");
                    setSearch(null);
                    setPlace(undefined);
                    place && mapRef.current.removeControl(directionRef.current);
                  }}
                  startIcon={<HomeIcon sx={{ width: 30, height: 30 }} />}
                >
                  <Typography variant="h2" fontSize={30}>
                    HOME
                  </Typography>
                </Button>
              </Stack>
              <Card>
                <CardContent>
                  <Stack spacing={3}>
                    {goto.length == 0 ? (
                      <Button
                        variant="outlined"
                        color="success"
                        onClick={() => {
                          setGoto("goto");
                        }}
                      >
                        Go anywhere
                      </Button>
                    ) : (
                      <TextField
                        placeholder="Go anywhere"
                        onChange={(e) => {
                          setGoto(e.target.value);
                        }}
                        slotProps={{
                          input: {
                            endAdornment: (
                              <Chip
                                onClick={() => {
                                  fetch(
                                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
                                      goto
                                    )}&format=json&limit=1`
                                  )
                                    .then((response) => response.json())
                                    .then((data) => {
                                      const latitude = parseFloat(data[0].lat);
                                      const longitude = parseFloat(data[0].lon);
                                      setCoordinates({ latitude, longitude });
                                      setForecast(undefined);
                                      setGoto("");
                                      setSearch(null);
                                      setPlace(undefined);
                                      mapRef.current.removeControl(directionRef.current)
                                    })
                                    .catch((error) =>
                                      console.error("Error:", error)
                                    );
                                }}
                                label="Go to"
                                color="primary"
                                icon={<LocationSearchingOutlinedIcon />}
                              />
                            ),
                          },
                        }}
                      />
                    )}
                    <Autocomplete
                      value={search}
                      onChange={(e, newValue) => {
                        setSearch(newValue);
                      }}
                      disablePortal
                      options={searchOptions}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Search for interesting places and landmarks"
                        />
                      )}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.latitude}&lon=${coordinates.longitude}&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}&units=metric`;
                        fetch(url)
                          .then((response) => response.json())
                          .then((data) => {
                            setForecast({
                              temperature: data.main.temp,
                              weatherDescription: data.weather[0].description,
                              date: new Date().toDateString(),
                            });
                          })
                          .catch((error) =>
                            console.error("Error fetching weather data:", error)
                          );
                      }}
                    >
                      Get daily Weather info
                    </Button>
                    <Button
                      variant="contained"
                      color="info"
                      onClick={() => {
                        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${coordinates.latitude}&lon=${coordinates.longitude}&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}&units=metric`;
                        fetch(url)
                          .then((response) => response.json())
                          .then((data) => {
                            setForecast(
                              data.list.map(
                                (forecast: {
                                  main: { temp: any };
                                  weather: { description: any }[];
                                  dt_txt: string;
                                }) => ({
                                  temperature: forecast.main.temp,
                                  weatherDescription:
                                    forecast.weather[0].description,
                                  date: new Date(
                                    forecast.dt_txt
                                  ).toDateString(),
                                })
                              )
                            );
                          })
                          .catch((error) =>
                            console.error("Error fetching weather data:", error)
                          );
                      }}
                    >
                      Get Weather Forecast
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Container>
        </Grid2>
      </Grid2>
    );

  return (
    <Container maxWidth="sm" sx={{ height: "90vh" }}>
      <Stack
        alignItems="center"
        justifyContent="center"
        height="inherit"
        spacing={3}
      >
        <Typography variant="h1">Please</Typography>
        <Typography variant="h2" textAlign="center">
          Give access to location to use this service
        </Typography>
      </Stack>
    </Container>
  );
}
