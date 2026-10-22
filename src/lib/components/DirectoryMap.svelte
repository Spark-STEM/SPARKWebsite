<script lang="ts">
    import { onMount } from 'svelte';
    import type * as Leaflet from 'leaflet';
    import 'leaflet/dist/leaflet.css';
    import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
    import markerIconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
    import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';

    interface MapLocation {
        id: number;
        name: string;
        address: string | null;
        latitude: number | null;
        longitude: number | null;
    }

    let { locations }: { locations: MapLocation[] } = $props();

    let mapElement = $state<HTMLDivElement>();
    let map: Leaflet.Map | null = null;
    let markers: Leaflet.LayerGroup | null = null;
    let leaflet: typeof Leaflet | null = null;
    let isReady = $state(false);

    onMount(() => {
        let disposed = false;

        void import('leaflet').then((module) => {
            if (disposed) return;

            leaflet = module.default;
            if (!mapElement) return;
            map = leaflet.map(mapElement, { scrollWheelZoom: false });
            leaflet
                .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution:
                        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                })
                .addTo(map);
            markers = leaflet.layerGroup().addTo(map);
            isReady = true;
        });

        return () => {
            disposed = true;
            map?.remove();
            map = null;
        };
    });

    $effect(() => {
        if (!isReady || !map || !markers || !leaflet) return;

        const points = locations.filter(
            (location) =>
                Number.isFinite(location.latitude) &&
                Number.isFinite(location.longitude)
        );
        markers.clearLayers();

        // Let Vite resolve these assets instead of Leaflet guessing their paths.
        const destinationIcon = leaflet.icon({
            iconUrl: markerIconUrl,
            iconRetinaUrl: markerIconRetinaUrl,
            shadowUrl: markerShadowUrl,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            tooltipAnchor: [16, -28],
            shadowSize: [41, 41],
        });

        const bounds: Leaflet.LatLngExpression[] = [];
        for (const point of points) {
            const latitude = point.latitude;
            const longitude = point.longitude;
            if (latitude === null || longitude === null) continue;

            const marker = leaflet.marker([latitude, longitude], {
                icon: destinationIcon,
            });
            const popup = document.createElement('div');
            const name = document.createElement('strong');
            name.textContent = point.name;
            popup.append(name);
            if (point.address) {
                const address = document.createElement('div');
                address.textContent = point.address;
                popup.append(address);
            }
            marker.bindPopup(popup).addTo(markers);
            bounds.push([latitude, longitude]);
        }

        if (bounds.length === 1) {
            map.setView(bounds[0], 14);
        } else if (bounds.length > 1) {
            map.fitBounds(leaflet.latLngBounds(bounds), {
                padding: [24, 24],
                maxZoom: 14,
            });
        }
    });
</script>

{#if locations.some(
    (location) =>
        Number.isFinite(location.latitude) &&
        Number.isFinite(location.longitude)
)}
    <div
        class="map"
        bind:this={mapElement}
        aria-label="Interactive map of locations"
        role="application"
    ></div>
{:else}
    <p class="map-empty">Map coordinates are not available for these locations.</p>
{/if}

<style>
    .map {
        width: 100%;
        min-height: 330px;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        background: var(--surface-muted);
        z-index: 0;
    }

    .map-empty {
        display: grid;
        min-height: 180px;
        place-items: center;
        margin: 0;
        padding: var(--space-lg);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        background: var(--surface-muted);
        color: var(--text-tertiary);
        text-align: center;
    }
</style>
