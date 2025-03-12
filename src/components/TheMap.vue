<script setup lang="ts">
import {ref} from 'vue';
import {LineString} from "ol/geom";

const center = ref([40, 40]);
const projection = ref('EPSG:3857');
const zoom = ref(3);
const rotation = ref(0);

const routeGeometry = ref<LineString | null>(null);

const featureRef = ref(null);

async function fetchRoute() {
  try {
    const response = await fetch('http://router.project-osrm.org/route/v1/driving/13.388860,52.517037;13.397634,52.529407;13.428555,52.523219?overview=full&geometries=geojson');
    const data = await response.json();
    console.log(data);

    if (data.routes.length === 0) {
      return ('No route found');
    }

    const coordinates = data.routes[0].geometry.coordinates;
    routeGeometry.value = new LineString(coordinates).transform('EPSG:4326', 'EPSG:3857');
  } catch (error) {
    console.error('Error fetching route', error);
  }
}

fetchRoute();
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

    <ol-vector-layer
        v-if="routeGeometry"
    >

      <ol-source-vector>
        <ol-feature ref="featureRef">
          <ol-geom-line-string :coordinates="routeGeometry.getCoordinates()"/>
          <ol-style>
            <ol-style-stroke color="red" :width="4"></ol-style-stroke>
          </ol-style>
        </ol-feature>
      </ol-source-vector>
    </ol-vector-layer>

    <ol-tile-layer>
      <ol-source-osm/>
    </ol-tile-layer>
  </ol-map>
  <button @click="fetchRoute()">получить данные с роута</button>
</template>

<style scoped>
.map {
  height: 80vh;
  width: auto;
  object-fit: cover;
}
</style>
