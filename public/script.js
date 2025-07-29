
// Get the sticky navbar
const stickyNavbar = document.querySelector(".other-navbar");
const button = document.getElementById("myButton")
const dropdown = document.querySelector('.buy-dropdown');
const dropdownMenu = document.querySelector('.buy-dropdown-item');
const container = document.querySelector('.carousel-container');
const nextBtn = document.querySelector('.carousel-btn.next');
const prevBtn = document.querySelector('.carousel-btn.prev');



// Add scroll event listener
window.addEventListener("scroll", () => {
  const scrollY = window.scrollY; // Current vertical scroll position

  // Show the navbar after scrolling past 200px, hide otherwise
  if (scrollY > 400) {
    stickyNavbar.classList.remove("hidden"); // Show the navbar
  } else {
    stickyNavbar.classList.add("hidden"); // Hide the navbar
  }
});


// four footer dropdown

function mybutton() {
  const image = document.querySelector(".myImage");
  const hideShow = document.getElementById("hide-show")
  const moveDown = document.getElementById("move-down")
  // Toggle between the two images
  if (image.getAttribute("src") === "./image/dropdown.png") {
    image.setAttribute("src", "./image/dropdown-up.png"); // Change to the second image
    hideShow.style.display = "block"
    // remove space
  } else {
    image.setAttribute("src", "./image/dropdown.png"); // Change back to the first image
     hideShow.style.display = "none"
     moveDown.style.top = "0";
  }
}

function mybutton2() {
  const image2 = document.querySelector(".myImage2");
  const second = document.querySelector(".second-box")
  const moveDown2 = document.getElementById("move-down")
  // Toggle between the two images
  if (image2.getAttribute("src") === "./image/dropdown.png") {
    image2.setAttribute("src", "./image/dropdown-up.png"); // Change to the second image
    second.style.display = "block"
    // remove space
  } else {
    image2.setAttribute("src", "./image/dropdown.png"); // Change back to the first image
     second.style.display = "none"
     moveDown2.style.paddingTop = "0";
  }
}

function mybutton3() {
  const image3 = document.querySelector(".myImage3");
  const third = document.querySelector(".third-box")
  const moveDown3 = document.getElementById("move-down")
  // Toggle between the two images
  if (image3.getAttribute("src") === "./image/dropdown.png") {
    image3.setAttribute("src", "./image/dropdown-up.png"); // Change to the second image
    third.style.display = "block"
    // remove space
  } else {
    image3.setAttribute("src", "./image/dropdown.png"); // Change back to the first image
     third.style.display = "none"
     moveDown3.style.top = "0";
  }
}

function mybutton4() {
  const image4 = document.querySelector(".myImage4");
  const fourth = document.querySelector(".fourth-box")
  const moveDown4 = document.getElementById("move-down")
  // Toggle between the two images
  if (image4.getAttribute("src") === "./image/dropdown.png") {
    image4.setAttribute("src", "./image/dropdown-up.png"); // Change to the second image
    fourth.style.display = "block"
    // remove space
  } else {
    image4.setAttribute("src", "./image/dropdown.png"); // Change back to the first image
     fourth.style.display = "none"
     moveDown4.style.top = "0";
  }
}

// Show menu on hover
dropdown.onmouseover = function () {
  dropdownMenu.style.visibility= 'visible';
};

// Hide menu when not hovering
dropdown.onmouseout = function () {
  dropdownMenu.style.visibility = 'hidden';
};


//slider section

let scrollPosition = 0;
const cardWidth = 400; // Width of each card, including margin
const containerWidth = container.offsetWidth; // Total visible width of the container
const totalCards = container.children.length; // Number of cards
const maxScroll = -(cardWidth * totalCards - containerWidth); // Maximum scroll position

nextBtn.addEventListener('click', () => {
  if (scrollPosition > maxScroll) {
    scrollPosition -= cardWidth;
    container.style.transform = `translateX(${scrollPosition}px)`;
  }
});

prevBtn.addEventListener('click', () => {
  if (scrollPosition < 0) {
    scrollPosition += cardWidth;
    container.style.transform = `translateX(${scrollPosition}px)`;
  }
});



function toggleMenu() {
  const helpmenu = document.querySelector('.dropdown-menu ');
  helpmenu.style.display = helpmenu.style.display === 'flex' ? 'none' : 'flex';
}

document.addEventListener("DOMContentLoaded", function () {
  const tabs = document.querySelectorAll(".loan-options-section .tab");
  const scrollContainer = document.querySelector(".loan-options-section .scroll-container");

  tabs.forEach((tab, index) => {
      tab.addEventListener("click", function () {
          // Remove active class from all tabs
          tabs.forEach(t => t.classList.remove("active"));
          tab.classList.add("active");

          // Scroll to the correct section
          scrollContainer.scrollTo({
              left: index * scrollContainer.offsetWidth, 
              behavior: "smooth"
          });
      });
  });
});

function switchTab(index) {
  // Get all the dots and tabs
  const dots = document.querySelectorAll('.dot');
  const tabs = document.querySelectorAll('.tab-dot');
  const scrollContainer = document.querySelector(".loan-options-section .scroll-container");

    scrollContainer.scrollTo({
      left: index * scrollContainer.offsetWidth, 
      behavior: "smooth"
    });

  // Reset all dots and tabs
  dots.forEach(dot => dot.classList.remove('active2'));
  tabs.forEach(tab => tab.classList.remove('active2'));

  // Set the active dot and tab
  dots[index].classList.add('active2');
  tabs[index].classList.add('active2');
}

{/* Set the first tab as active by default */}
document.addEventListener('DOMContentLoaded', () => {
  switchTab(0);
});


function openModal() {
  document.getElementById("authModal").style.display = "flex";
}

// Close Modal
function closeModal() {
  document.getElementById("authModal").style.display = "none";
}

// Switch Between Sign-In and Sign-Up
function switchTab(tab) {
  document.getElementById("signin").classList.remove("active");
  document.getElementById("signup").classList.remove("active");
  document.getElementById("signInTab").classList.remove("active");
  document.getElementById("signUpTab").classList.remove("active");

  document.getElementById(tab).classList.add("active");
  document.getElementById(tab + "Tab").classList.add("active");
}

// Close modal when clicking outside of it
window.onclick = function(event) {
  let modal = document.getElementById("authModal");
  if (event.target === modal) {
      modal.style.display = "none";
  }
} 

