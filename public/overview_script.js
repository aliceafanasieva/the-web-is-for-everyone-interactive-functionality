// Slide plaatjes in carousel met cursor
const carousels = document.querySelectorAll(".carousel");
const arrowIcons = document.querySelectorAll(".wrapper i");

// Functie om de breedte van de eerste afbeelding te verkrijgen, met gepaste aan de schermgrootte margin
const getFirstImgWidth = (carousel) => {
    const firstImg = carousel.querySelector(".carousel_item");
    const margin = window.matchMedia("(min-width: 45em)").matches ? 112 : -80;
    return firstImg.clientWidth + margin;
};

carousels.forEach((carousel, index) => {
    let isDragStart = false, prevPageX, prevScrollLeft;

    const dragStart = (e) => {
        e.preventDefault();
        isDragStart = true;
        prevPageX = e.pageX || e.touches[0].pageX;
        prevScrollLeft = carousel.scrollLeft;
        carousel.style.cursor = "grabbing";
    };

    const dragging = (e) => {
        if (!isDragStart) return;
        e.preventDefault();
        const positionDiff = (e.pageX || e.touches[0].pageX) - prevPageX;
        carousel.scrollLeft = prevScrollLeft - positionDiff;
    };

    const dragStop = () => {
        isDragStart = false;
        carousel.style.cursor = "grab";
    };

    // Event Listeners per functie
    carousel.addEventListener("mousedown", dragStart);
    carousel.addEventListener("touchstart", dragStart);

    carousel.addEventListener("mousemove", dragging);
    carousel.addEventListener("touchmove", dragging);

    carousel.addEventListener("mouseup", dragStop);
    carousel.addEventListener("mouseleave", dragStop);
    carousel.addEventListener("touchend", dragStop);

    const firstImg = carousel.querySelector(".carousel_item");
    let firstImgWidth = firstImg.clientWidth + 112; // getting first img width & adding 112 margin value 

    // Selecteer arrow icons binnen huidige wrapper
    const wrapper = carousel.closest('.wrapper');
    const leftArrow = wrapper.querySelector("#left");
    const rightArrow = wrapper.querySelector("#right");

    const updateScrollWidth = () => {
        const firstImgWidth = getFirstImgWidth(carousel);
        leftArrow.addEventListener("click", () => {
            carousel.scrollLeft -= firstImgWidth;
        });

        rightArrow.addEventListener("click", () => {
            carousel.scrollLeft += firstImgWidth;
        });
    };

    // Первоначальное обновление ширины прокрутки
    updateScrollWidth();

    // Добавляем обработчик события изменения размера окна для динамического обновления ширины прокрутки
    window.addEventListener('resize', () => {
        updateScrollWidth();
    });
});


// navigation bar 

document.addEventListener("DOMContentLoaded", () => {
    const menuIcon = document.getElementById("menu-icon");
    const xIcon = document.getElementById("x-icon");
    const sidebar = document.querySelector(".sidebar");
    const navOptions = document.querySelectorAll('.nav_option');

    menuIcon.addEventListener("click", () => {
      sidebar.style.display = "flex";
      menuIcon.style.display = "none";
      xIcon.style.display = "block";
    });

    xIcon.addEventListener("click", () => {
      sidebar.style.display = "none";
      menuIcon.style.display = "block";
      xIcon.style.display = "none"; 
    });

    // tekst bold wanneer clicked
    navOptions.forEach(option => {
      option.addEventListener('click', function() {
        // verwijderen 'active' class van alle nav_option elements
        navOptions.forEach(opt => opt.classList.remove('active'));
        // toevoegen 'active' class op clicked nav_option element
        this.classList.add('active');
      });
    });
});


