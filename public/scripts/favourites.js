$(() => {
  const load = function() {
    $('#favourites').empty();
    $.ajax({url: '/favorites-ajax', type: 'GET'}).done((result)=> {
      for (let favourite of result.favourites) {
        let favouriteItem = `
        <div class="col-md-6 grid-item">
          <div class="card flex-md-row mb-4 box-shadow h-md-250">
            <div class="card-body d-flex flex-column align-items-start">
              <strong class="d-inline-block mb-2 text-success">Map Id: ${favourite['map_id']}</strong>
              <h3 class="mb-0">${favourite['title']}</h3>
              <p class="card-text mb-auto">City: ${favourite['city']}</p>
              <form method="GET" action="/detail/${favourite['map_id']}/${favourite['location_id']}">
                <td><button type="submit" class="btn btn-outline-primary">All locations</button></td>
                <td><button id="delete-${favourite['map_id']}" class="btn btn-outline-primary">Remove from favourites</button></td>
              </form>
            </div>
          </div>
        </div>
        `;
        $('#favourites').append(favouriteItem);
        const $button = $(`#delete-${favourite['map_id']}`);
        $button.on('click', function(event) {
          event.preventDefault();
          console.log('Button clicked, performing ajax call...');
          const data = {user_id: favourite['user_id'], map_id: favourite['map_id']};
          console.log(data);
          $.ajax({url: '/delete-favourites', type: 'POST', data: data}).always(function() {
            load();
          });
        });
      }
    });
  };
  load();
});
