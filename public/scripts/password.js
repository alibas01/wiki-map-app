$(document).ready(function() {
  $("#password-form").hide();
  $("#pass-button").hide();
  $('#password-input').on('focus', function(event) {
  event.preventDefault();
    $("#password-form").show();
    $("#password-input").hide();

    $('#pass-old-button').click(function() {

      $("#password-input").show();
      $("#pass-button").show();
      $("#password-form").hide();
      $('#password-input').off('focus');

      })
    });
  });

