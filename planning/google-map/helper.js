function initMap(){
  const myLatlng = { lat: -25.363, lng: 131.044 };
  const options ={
    zoom:8,
    center: myLatlng
  };
  const map = new google.maps.Map(document.getElementById("map"), options);
  const icon = "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png";

    // Create the initial InfoWindow.
  let infoWindow = new google.maps.InfoWindow({
    content: "Click the map to get Lat/Lng!",
    position: myLatlng,
  });
  infoWindow.open(map);
  // Configure the click listener.
  map.addListener("click", (mapsMouseEvent) => {
    // Close the current InfoWindow.
    infoWindow.close();
    // Create a new InfoWindow.
    infoWindow = new google.maps.InfoWindow({
      position: mapsMouseEvent.latLng,
    });
    console.log(mapsMouseEvent.latLng.toJSON());
    document.getElementById("position").innerHTML=JSON.stringify(mapsMouseEvent.latLng.toJSON(), null, 2);
    infoWindow.setContent(
      JSON.stringify(mapsMouseEvent.latLng.toJSON(), null, 2)
    );
    infoWindow.open(map);
  });
}

module.exports = initMap;
