/* Toggles the new game popup */
function toggleNewGamePopup() {
  var overlay = document.getElementById('newGamePopup')

  if (!overlay.style.display) {
    overlay.style.display = 'none'
  }
  
  if (overlay.style.display == 'none') {
    overlay.style.display = 'block'
  } else {
    overlay.style.display = 'none'
  }
}
