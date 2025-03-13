<script setup lang="ts">
import {ref} from 'vue';
import {LineString} from "ol/geom";
import {fromLonLat} from "ol/proj";

import markerIcon from '../../public/marker.png';

const center = ref(fromLonLat([13.388860, 52.517037]));
const projection = ref('EPSG:3857');
const zoom = ref(3);
const rotation = ref(0);

const routeGeometry = ref<LineString | null>(null);

const featureRef = ref(null);

async function plotRoute(pointsCoordinates: number[][]) {
  const formattedCoordinates = ref<string[]>([]);

  pointsCoordinates.forEach((pointAsArray) => {
    const pointAsString = pointAsArray[0].toString() + ',' + pointAsArray[1].toString();
    formattedCoordinates.value.push(pointAsString);
  })

  const url = ref('http://router.project-osrm.org/route/v1/driving/');

  formattedCoordinates.value.forEach((pointCoordinates, index) => {
    if (index !== 0) {
      url.value += ';';
    }

    url.value += pointCoordinates;
  });
  url.value += '?overview=full&geometries=geojson';

  try {
    const response = await fetch(url.value);
    const data = await response.json();

    if (data.routes.length === 0) {
      return ('No route found');
    }

    const coordinates = data.routes[0].geometry.coordinates;
    routeGeometry.value = new LineString(coordinates).transform('EPSG:4326', 'EPSG:3857');
  } catch (error) {
    console.error('Error fetching route', error);
  }
}

// This should be transformed to coordinate arrays
const pointsCoordinates = ref([[13.388860, 52.517037], [13.428555, 53.523219], [13.428555, 56.523219], [13.428555, 60.523219]]);

plotRoute(pointsCoordinates.value);
</script>

<template>
  <ol-map
      :loadTilesWhileAnimating="true"
      :loadTilesWhileInteracting="true"
      class="map"
  >
    <ol-view
        ref="view"
        :center="center"
        :rotation="rotation"
        :zoom="zoom"
        :projection="projection"
    />

    <ol-tile-layer>
      <ol-source-osm/>
    </ol-tile-layer>

    <ol-vector-layer
        v-if="routeGeometry"
    >
      <ol-source-vector>
        <ol-feature ref="featureRef">
          <ol-geom-line-string :coordinates="routeGeometry.getCoordinates()"/>
          <ol-style>
            <ol-style-stroke color="blue" :width="4"></ol-style-stroke>
          </ol-style>
        </ol-feature>
      </ol-source-vector>
    </ol-vector-layer>


    <div
        class="markers-container"
        v-if="pointsCoordinates.length > 0"
    >
      <ol-vector-layer
          v-for="point of pointsCoordinates"
      >
        <ol-source-vector>
          <ol-feature>
            <ol-geom-point :coordinates="fromLonLat(point)"></ol-geom-point>
            <ol-style>
              <ol-style-icon :src="markerIcon" :scale="0.030"></ol-style-icon>
            </ol-style>
          </ol-feature>
        </ol-source-vector>
      </ol-vector-layer>
    </div>
<!--    <ol-mouseposition-control />-->
  </ol-map>
</template>

<style scoped>
.map {
  height: 100vh;
  width: 100vw;
}

ol-style-icon {
  width: 10px;
  height: auto;
}
</style>
