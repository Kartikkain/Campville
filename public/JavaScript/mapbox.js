

mapboxgl.accessToken = mbxToken;
const map = new mapboxgl.Map({
container: 'map', 
style: 'mapbox://styles/mapbox/light-v10', 
center: campG.geometry.coordinates, 
zoom: 9 
});

map.addControl(new mapboxgl.NavigationControl())

 new mapboxgl.Marker()
.setLngLat(campG.geometry.coordinates)
.setPopup(
    new mapboxgl.Popup({offset:5})
    .setHTML(
        `<h3>${campG.location}</h3><p>${campG.name}</p>`
    )
    )
.addTo(map);