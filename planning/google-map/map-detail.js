function initMap(){
  console.log('import!');
  const options ={
    zoom:8,
    center:{lat:42.3601, lng:-71.0589}
  };
  const map = new google.maps.Map(document.getElementById("map"), options);
  const icon = "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png";

  const addMarker = function (obj) {
    const marker = new google.maps.Marker({
    position: obj.coords,
    map: map,
    animation: google.maps.Animation.DROP,
    });

    if (obj.image) {
      marker.setIcon(obj.image);
    }
    const infoWindow = new google.maps.InfoWindow({
      content: `<h3>${obj.title}</h3>`
    });

    marker.addListener('click', function(){
      infoWindow.open(map, marker);
      map.setZoom(10);
      map.setCenter(marker.getPosition());
      document.getElementById("position").innerHTML = obj.title;
    });
  }

  const markers = [
    {coords:{lat:42.3601, lng:-71.0589}, title: 'restaurant', image: icon},
    {coords:{lat:42.8584, lng:-70.9300}, title: 'shopping mall', image: icon}
  ];

  for (const marker of markers) {
    addMarker(marker);
  }
}
module.exports = initMap;
