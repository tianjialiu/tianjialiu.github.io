function change_sticky(navbar_height) {
  var navbar = document.getElementById("sidenav");
  var offTop = navbar.offsetTop;
  
  var body = document.body, html = document.documentElement
  var body_height = body.scrollHeight;
  var total_height = html.scrollHeight;
    
  var footer = document.querySelector("body > footer");
  var footer_height = footer.scrollHeight;
  
  var blurb = document.getElementsByClassName("blurb")[0];
  var blurb_height = blurb.offsetTop;

  var cross_pt = getOffset(document.getElementById("cross"));
  var nocross_pt = getOffset(document.getElementById("nocross"));

  var disappear_pt = 'no';
  if (window.pageYOffset > (nocross_pt - navbar_height)) {
    disappear_pt = 'yes'
  }

  if (disappear_pt == 'no') {
    navbar.style.display = 'block';
  
    if (window.pageYOffset >= cross_pt) {
      navbar.classList.add("sticky");
      navbar.style.position = 'fixed'
    } else {
      navbar.classList.remove("sticky");
      navbar.style.position = 'absolute'
      navbar.style.top = (this.scrollY - blurb_height) + ' px'
    }
  } else {
    navbar.style.display = "none";
  }
}

function getOffset(element) {
  const rect = element.getBoundingClientRect();
  return rect.top + window.scrollY;
}

function calc_navbar_height() {
  var navbar_height = getOffset(document.getElementById("sidenav_end")) - getOffset(document.getElementById("sidenav_start"));
  return navbar_height;
}
