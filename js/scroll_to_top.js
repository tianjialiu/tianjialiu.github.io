function scrollToTop() {
    window.scrollTo({top: 0, behavior: 'smooth'});
}

function scrollButtonShow() {
  var scrollTopButton = document.getElementById("scrollTopButton");

  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
   scrollTopButton.style.display = 'block';
  } else {
   scrollTopButton.style.display = 'none';
  }
}