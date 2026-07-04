// Back to Top Button Functionality

// Get the button element
const backToTopBtn = document.getElementById('backToTopBtn');

// Show the button when the user scrolls down 200px from the top of the document

window.onscroll = function() {
  if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
    backToTopBtn.style.display = 'block';
  } else {
    backToTopBtn.style.display = 'none';
  }
};

// Scroll to the top of the document when the button is clicked
backToTopBtn.addEventListener('click', function() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

