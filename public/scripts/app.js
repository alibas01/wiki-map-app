/* eslint-disable no-undef */
$(document).ready(() => {
  $('.collapse').collapse("hide");

  let newMap = {
    points: []
  };

  $('#map-title')[0].value = 'a';
  $('#map-city')[0].value = 'a';
  $('#map-vis')[0].value = 'Public';

  $("#new-map-info").on("submit", function(event) {
    // Prevent the default form submission
    event.preventDefault();

    //fetch field data
    const title =      $('#map-title')[0];
    const city =       $('#map-city')[0];
    const visibility = $('#map-vis')[0];

    //error handling
    if (!title.value.length ||
        !city.value.length  ||
        !visibility.value.length) {
      //show/hide error messages
      $('.error-box').slideToggle(200,'swing');
    } else {
      //save data
      newMap['title'] = title.value;
      newMap['city'] = city.value;

      if (visibility.value === 'Public') {
        newMap['visibility'] = true;
      }
      //hide box and enable map
      $(".new-map-box").css('display', 'none');

      //create map and store mapID in html
      $.ajax({
        method: "POST",
        url: "/new",
        data: newMap
      }).done((mapID) => {
        $('#mapID')[0].innerHTML = mapID['mapID'];
        $('.map-cover').css('display','none');
      });
    }
  });



  $("#new-point").on("submit", function(event) {
    // Prevent the default form submission
    event.preventDefault();

    //fetch field data
    const title =       $('#point-title')[0];
    const lat =         $('#point-lat')[0];
    const long =        $('#point-long')[0];
    const category =    $('#point-category')[0];
    const description = $('#point-desc')[0];

    console.log(lat, long);

    //error handling
    if (!title.value.length ||
        !category.value.length ||
        !description.value.length ||
        !lat.textContent.length ||
        !long.textContent.length) {
      //show/hide error messages
      $('.error-box').slideToggle(200,'swing');
    } else {
      //save data
      const newPoint = { name: title.value, lat: lat.textContent, long: long.textContent, description: description.value, category: category.value};

      // $.ajax({
      //   method: "POST",
      //   url: "/new-map/points",
      //   data: newPoint
      // }).done((data) => {
      //   console.log('Added point:', data);
      // });
    }

    // console.log(markerList);
    //hide box

    // INSERT INTO locations (
    // name, map_id, lat, long, user_id, picture_url, description, website
    // ) VALUES ('Efes Kebab House', 1, 43.680319, -79.33838100000001, 1, 'https://thumbnail.imgbin.com/0/9/7/imgbin-south-america-canada-organization-of-american-states-continent-map-canada-6PGHgTE8gvVsvPLhK5tpXfn2f_t.jpg', 'Doner kebab, falafel & other traditional Turkish dishes round out the menu at this relaxed eatery.', 'efeskebabhouse.ca');

  });

  // $.ajax({
  //   method: "GET",
  //   url: "/api/users"
  // }).done((users) => {
  //   for (user of users) {
  //     $("<div>").text(user.name).appendTo($("body"));
  //   }
  // });
});
