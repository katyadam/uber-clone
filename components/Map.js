import { StyleSheet, Text, View } from "react-native";
import React, { useRef, useEffect } from "react";
import MapView, { Marker } from "react-native-maps";
import tw from "twrnc";
import { useDispatch, useSelector } from "react-redux";
import {
  selectDestination,
  selectOrigin,
  setTravelTimeInformation,
} from "../slices/navSlice";
import MapViewDirections from "react-native-maps-directions";
import { GOOGLE_MAPS_API_KEY } from "@env";
import { useNavigation } from "@react-navigation/native";
//Jestli to je fuckupnute -> expo doctor --fix-dependencies
const Map = () => {
  const origin = useSelector(selectOrigin);
  //40.60844444661789, -7.9771864703356465 -- Fail location xd
  const destination = useSelector(selectDestination);

  const mapRef = useRef(null); //pointer na mapu, abychom ji mohli oddalit
  const navigation = useNavigation();

  const dispatch = useDispatch();

  useEffect(() => {
    if (!origin || !destination) return;
    console.log("zoom");
    //Zoom and Fit to the markers
    mapRef.current.fitToSuppliedMarkers(["origin", "destination"], {
      edgePadding: { top: 50, bottom: 50, right: 50, left: 50 },
    });
    navigation.navigate("RideOptionsCard");
  }, [origin, destination]);

  useEffect(() => {
    if (!origin || !destination) return;
    console.log("fetching...");
    console.log(origin.description);
    const getTravelTime = async () => {
      fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${origin.description}&destinations=${destination.description}&key=${GOOGLE_MAPS_API_KEY}
      `)
        .then((res) => res.json())
        .then((data) => {
          dispatch(setTravelTimeInformation(data.rows[0].elements[0]));
        });
    };
    getTravelTime();
  }, [origin, destination, GOOGLE_MAPS_API_KEY]);

  return (
    <MapView
      ref={mapRef}
      style={tw`flex-1`}
      mapType="mutedStandard"
      initialRegion={{
        latitude: origin === null ? 40.60844444661789 : origin.location.lat,
        longitude: origin === null ? -7.9771864703356465 : origin.location.lng,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }}
    >
      {destination && origin && (
        <MapViewDirections
          origin={origin.description}
          destination={destination.description}
          apikey={GOOGLE_MAPS_API_KEY}
          strokeWidth={3}
          strokeColor="black"
        />
      )}
      {origin?.location && (
        <Marker
          coordinate={{
            latitude: origin.location.lat,
            longitude: origin.location.lng,
          }}
          title="origin"
          description={origin.description}
          identifier="origin"
        />
      )}
      {destination?.location && (
        <Marker
          coordinate={{
            latitude: destination.location.lat,
            longitude: destination.location.lng,
          }}
          title="destination"
          description={destination.description}
          identifier="destination"
        />
      )}
    </MapView>
  );
};

export default Map;

const styles = StyleSheet.create({});
