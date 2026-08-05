function active_modal(img_id) {
  var modal = document.getElementsByClassName("modal")[img_id];

  var img = document.getElementsByClassName("img-popup")[img_id];
  var modalImg = document.getElementsByClassName("modal-content")[img_id];
  img.onclick = function() {
    modal.style.display = "block";
    modalImg.src = this.src;
  }

  var span = document.getElementsByClassName("close")[img_id];

  span.onclick = function() {
    modal.style.display = "none";
  }
  
  window.onresize = function() {
    modal.style.display = "none";
  }
}
