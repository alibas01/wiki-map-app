$(() => {

  $('.recommandation-content').empty();
  $.ajax({url: '/index_map', type: 'GET'}).done((result)=> {

    for (let map of result.maps) {
      let favouriteItem = `
        <div class="col-md-6 grid-item">
          <div class="card flex-md-row mb-4 box-shadow h-md-250">
            <div class="card-body d-flex flex-column align-items-start">
              <strong class="d-inline-block mb-2 text-success">Public</strong>
              <p hidden id="current_map_${map['id']}">${map['id']}</p>
              <h3 class="mb-0">
                <a class="text-dark" href="/detail/${map['id']}/1">${map['title']}</a>
              </h3>
              <button type="button" class="btn btn-outline-info favourite_${map['id']}">Add to Favorites</button>
              <p class="card-text mb-auto">${map['city']}</p>
            </div>
          </div>
        </div>
      `
      $('.recommandation-content').append(favouriteItem);
      const $button = $(`.favourite_${map['id']}`);
      $button.on('click', function (event) {
        event.preventDefault();
        // console.log('event: ', event);
        console.log('Button clicked, performing ajax call...');
        const user_name = $('#current_user').text().split(" ")[3];
        const map_id = $(`#current_map_${map['id']}`).text();
        const data = {user_name, map_id};
        console.log(data);
        $.ajax({url: '/favourite', type: 'POST', data: data})
      });
    }
  });
});
