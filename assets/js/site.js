//======================================
// BACK TO TOP BUTTON
//======================================

const backToTopBtn = document.getElementById("backToTopBtn");

window.addEventListener("scroll", () => {
  if (window.scrollY > 200) {
    backToTopBtn.style.display = "block";
  } else {
    backToTopBtn.style.display = "none";
  }
});

backToTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

// ======================================
// Scroll Reveal Animation
// ======================================

const fadeElements = document.querySelectorAll(".fade-in");
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
      observer.unobserve(entry.target);
    }
  });
});
fadeElements.forEach((element) => {
  observer.observe(element);
});

// Active Navigation Highlighting

const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-links a");


const navObserver = new IntersectionObserver(
  entries => {

    entries.forEach(entry => {

      if(entry.isIntersecting){

        const id = entry.target.getAttribute("id");


        navLinks.forEach(link => {

          link.classList.remove("active");


          if(link.getAttribute("href") === `#${id}`){

            link.classList.add("active");

          }

        });

      }

    });

  },

  {
    threshold: 0.5
  }

);


sections.forEach(section => {

  navObserver.observe(section);

});

// Mobile Navigation
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".nav-links");

menuToggle.addEventListener("click", () => {

    mobileMenu.classList.toggle("active");

});

// Close mobile menu after clicking a navigation link
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("active");
  });
});