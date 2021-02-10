$(document).ready(() => {

  let newMap = {
    points: []
  };

  $('#map-title')[0].value = '';
  $('#map-city')[0].value = '';
  $('#map-vis')[0].value = '';

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
      newMap['visibility'] = visibility.value;

      //hide box and enable map
      $(".new-map-box").css('display', 'none');
    }


    $(".form-inline").on("submit", function(event) {
      // Prevent the default form submission
      event.preventDefault();
      console.log('point.');
    });

    console.log(newMap);
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
