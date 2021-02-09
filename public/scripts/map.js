$(document).ready(() => {
  console.log('hi');

  // const titleViewed = $("title")[0].innerHTML;
  const titleViewed = document.getElementById("title").innerHTML;
  console.log(titleViewed);
  // const positionViewed = $("position");
  const positionViewed = document.getElementById("position").innerHTML;
  console.log('positionViewed',positionViewed);


  const positionObj = positionViewed.split(" ");
  const positionImport = {lat: Number(positionObj[0]), lng: Number(positionObj[1])};

  const markers = [
    {coords: positionImport, title: titleViewed},
    {coords:{lat:42.8584, lng:-70.9300}, title: 'shopping mall'}
  ];

  const initMap = function() {
    const options = {
      zoom: 8,
      center: positionImport
    };
    const map = new google.maps.Map(document.getElementById("map"), options);
    const icon = "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png";

    const addMarker = function(obj) {
      const marker = new google.maps.Marker({
        position: obj.coords,
        map: map,
        animation: google.maps.Animation.DROP,
      });

      marker.setIcon(icon);
      const infoWindow = new google.maps.InfoWindow({
        content: `<h3>${obj.title}</h3>`
      });

      marker.addListener('click', function() {
        infoWindow.open(map, marker);
        map.setZoom(10);
        map.setCenter(marker.getPosition());
        document.getElementById("title").innerHTML = obj.title;
        const currentPosition = obj.coords.lat + ' ' + obj.coords.lng;
        document.getElementById("position").value = currentPosition;
      });
    };

    for (const marker of markers) {
      addMarker(marker);
    }
  };
});
