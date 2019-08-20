// Generate random IDs for table elements
function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const User = document.getElementById('twitchID').innerText
$('#twitchID').remove();
console.log(User)

var pusher = new Pusher('94254303a6a5048bf191', {
  cluster: 'us2',
  forceTLS: true
});

// Realtime song request
var channel = pusher.subscribe('sr-channel');
channel.bind('sr-event', function(data) {
  try { 
    console.log('New Request')
    var srContainer = document.getElementById('srContainer')
    var srElement = document.createElement('tr');
    srElement.setAttribute('class', 'song-request');
    srElement.setAttribute('id', `${data.id}`);
    if (data.source === 'spotify') {
      srElement.innerHTML = `
        <td><a class="srLink" href="${data.link}">${data.track} - ${data.artist}</a> <a class="spotify" href="${data.uri}"><i class="fab fa-spotify" title="Open in Spotify"></i></a></td>
        <td>${data.reqBy}</td>
        <td> <button class="btn btn-success btn-sm mr-3" data-srID="${data.id}">Add to Mix</button> <button class="delete btn btn-danger btn-sm" data-srID="${data.id}" data-srName="${data.track} - ${data.artist}"> <i class="fas fa-minus-circle"></i> </button> </td>
      `
    }
    if (data.source === 'youtube') {
      srElement.innerHTML = `
        <td><a class="srLink" href="${data.link}">${data.track}</a> <a class="youtube" href="${data.link}"><i class="fab fa-youtube" title="Open on Youtube"></i></a></td>
        <td>${data.reqBy}</td>
        <td> 
          <button class="btn btn-success btn-sm mr-3 mix-add" data-srID="${data.id}">Add to Mix</button> 
          <button class="delete btn btn-danger btn-sm" data-srID="${data.id}" data-srName="${data.track}"> <i class="fas fa-minus-circle"></i> </button> </td>
      `
    }
    srContainer.append(srElement)
  } catch (err) {
    console.error(err)
  }
});

// realtime song add to mix
channel.bind('mix-event', function(data) {
  try { 
    console.log('Song added to mix')
    var mixContainer = document.getElementById('mixContainer')
    var mixElement = document.createElement('tr');
    mixElement.setAttribute('class', 'song-request');
    mixElement.setAttribute('id', `${data.id}`);
    if (data.source === 'spotify') {
      mixElement.innerHTML = `
        <td><a class="srLink" href="${data.link}">${data.track} - ${data.artist}</a> <a class="spotify" href="${data.uri}"><i class="fab fa-spotify" title="Open in Spotify"></i></a></td>
        <td>${data.reqBy}</td>
        <td> 
          <button class="btn btn-success btn-sm mr-3 mix-add" data-srID="${data.id}">Add to Mix</button> 
          <button class="delete btn btn-danger btn-sm mix" data-srID="${data.id}" data-srName="${data.track} - ${data.artist}"> <i class="fas fa-minus-circle"></i> </button>
        </td>
      `
    }
    if (data.source === 'youtube') {
      mixElement.innerHTML = `
        <td><a class="srLink" href="${data.link}">${data.track}</a> <a class="youtube" href="${data.link}"><i class="fab fa-youtube" title="Open on Youtube"></i></a></td>
        <td>${data.reqBy}</td>
        <td> 
          <button class="btn btn-success btn-sm mr-3 mix-add" data-srID="${data.id}">Add to Mix</button> 
          <button class="delete btn btn-danger btn-sm mix" data-srID="${data.id}" data-srName="${data.track}"> <i class="fas fa-minus-circle"></i> </button>
        </td>
      `
    }
    mixContainer.append(mixElement)
  } catch (err) {
    console.error(err)
  }
});

// Flips table data
// $(function(){
//   $("tbody").each(function(elem,index){
//     var arr = $.makeArray($("tr",this).detach());
//     arr.reverse();
//       $(this).append(arr);
//   });
// });

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2000,
})

// Add request to mix
$('#srContainer').on('click', '.mix-add.btn', function() {
  var srId = $(this).attr('data-srID')
  var xhr = new XMLHttpRequest();
      xhr.open('GET', `/mix/add/${srId}`);
      xhr.onload = function() {
        if (xhr.status === 200) {
          try {
            Toast.fire({
              type: 'success',
              title: 'Song Added to Mix!'
            })
          } catch (err) {
            console.error(err)
          }
        } else {
          Toast.fire({
            type: 'error',
            title: 'Error adding song!',
            text: '${xhr.responseText}'
          })
        }
      }
      xhr.send();
})

// Delete request from mix
$('#mixContainer').on('click', '.mix.delete', function() {
  var srId = $(this).attr('data-srID')
  var xhr = new XMLHttpRequest();
      xhr.open('GET', `/mix/remove/${srId}`);
      xhr.onload = function() {
        if (xhr.status === 200) {
          try {
            Toast.fire({
              type: 'success',
              title: 'Song Removed from mix!'
            })
            var el = document.getElementById(`${srId}`)
            el.remove()
          } catch (err) {
            console.error(err)
          }
        } else {
          Toast.fire({
            type: 'error',
            title: 'Error removing song from mix!',
            text: '${xhr.responseText}'
          })
        }
      }
      xhr.send();
})


// Delete Song Request
$('#srContainer').on('click', '.delete.btn', function() {
  var srName = $(this).attr('data-srName')
  var srId = $(this).attr('data-srID')
  swal.fire({
    title: `Are you sure you want to delete ${srName}?`,
    text: "You won't be able to revert this!",
    type: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
  }).then((result) => {
    if (result.value) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', `/dashboard/delete/${srId}`);
      xhr.onload = function() {
        if (xhr.status === 200) {
          Swal.fire({
            title:'Deleted!',
            text: `${srName} has been deleted.`,
            type:'success',
            timer: 500,
            allowOutsideClick: false,
            allowEscapeKey: false,
            onBeforeOpen: () => {
              Swal.showLoading()
            },
            onClose: () => {
              try {
                TweenMax.to(`#${srId}`, .5, {autoAlpha:0, margin: 0, onComplete:function(){
                  $(`#${srId}`).remove();
                }});
              } catch (err) {
                console.error(err)
              }
            }
          });
        } else {
          Swal.fire(
            'Uh Oh!',
            `There was an error deleteing the song request. Error: ${xhr.responseText}`,
            'error'
          )
        }
      }
      xhr.send();
    }
  })
})