const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');

if (bar) {
    bar.addEventListener('click', () => {
        nav.classList.add('active');
    });
}

if (close) {
    close.addEventListener('click', () => {
        nav.classList.remove('active');
    });
}

let currentPage = 1;
const productsPerPage = 12;
let totalPages = 0;
let products = [];
const popularProductIDs = ["19","5","7","8","11","15","3","26"];
let popularProducts = []; // Array to store most popular products

// Check if we are on the shop page by checking for the shop-specific element
function isShopPage() {
    return document.querySelector('.shop-pro-container') !== null;
}

// Check if we are on the home page by checking for the home-specific element
function isHomePage() {
    return document.querySelector('.home-pro-container') !== null;
}

// Fetch product data from JSON file
async function fetchProductData() {
    try {
        const response = await fetch('products.json'); 
        const data = await response.json();
        products = data;
        totalPages = Math.ceil(products.length / productsPerPage);

        // Filter the most popular products for the home page
        popularProducts = products.filter(product => popularProductIDs.includes(product.id));

        displayProducts();
        setupPagination(products.length);
    } catch (error) {
        console.error("Error fetching product data:", error);
    }
}

// Display products for the current page
function displayProducts() {
    console.log("Displaying products...");
    let productsContainer;
    let filteredProducts = [...products];

    if (isHomePage()) {
        productsContainer = document.querySelector('.home-pro-container');
        filteredProducts = popularProducts; // Use popular products for home page
    } else if (isShopPage()) {
        productsContainer = document.querySelector('.shop-pro-container');
    }

    if (!productsContainer) {
        console.error("Products container not found");
        return;
    }
    productsContainer.innerHTML = ''; // Clear existing products

    // Search
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(searchTerm)
        );
    }

    // Material Filter
    const materialFilterSelect = document.getElementById('materialFilterSelect');
    const materialFilter = materialFilterSelect ? materialFilterSelect.value : 'all';
    if (materialFilter !== 'all') {
        filteredProducts = filteredProducts.filter(product =>
            product.type.includes(materialFilter)
        );
    }

    // Type Filter
    const typeFilterSelect = document.getElementById('typeFilterSelect');
    const typeFilter = typeFilterSelect ? typeFilterSelect.value : 'all';
    if (typeFilter !== 'all') {
        filteredProducts = filteredProducts.filter(product =>
            product.type.includes(typeFilter)
        );
    }

    // Sort
    const sortSelect = document.getElementById('sortSelect');
    const sortType = sortSelect ? sortSelect.value : 'name';
    filteredProducts.sort((a, b) => {
        if (sortType === 'price') {
            return parseFloat(a.price.substring(1)) - parseFloat(b.price.substring(1)); 
        } else {
            return a.name.localeCompare(b.name);
        }
    });

    // Pagination
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const paginatedProducts = filteredProducts.slice(start, end);
    console.log("Displaying products for page", currentPage, paginatedProducts);

    paginatedProducts.forEach(product => {
        const productElement = document.createElement('div');
        productElement.classList.add('pro');
        productElement.setAttribute('data-id', product.id);
        productElement.setAttribute('data-aval', product.aval);
        productElement.setAttribute('data-name', product.name);
        productElement.setAttribute('data-price', product.price);
        productElement.setAttribute('data-type', product.type.join(','));
        productElement.setAttribute('data-images', product.images.join(','));
        productElement.onclick = () => goToProductPage(productElement);

        if (product.name === "") {
            productElement.style.display = 'none';
        }

        productElement.innerHTML = `
            <img src="${product.images[0]}" alt="${product.name}">
            <div class="des">
                <span>${product.type.join(', ')}</span>
                <h5>${product.name}</h5>
                <h4>${product.price}</h4>
            </div>
            <span class="availability"></span>
        `;

        const availabilitySpan = productElement.querySelector('.availability');
        switch (product.aval) {
            case 'yes':
                availabilitySpan.classList.add('availability-yes');
                break;
            case 'low':
                availabilitySpan.classList.add('availability-low');
                break;
            case 'no':
                availabilitySpan.classList.add('availability-no');
                break;
        }

        productsContainer.appendChild(productElement);
    });

    if (isShopPage()) {
        setupPagination(filteredProducts.length);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (isShopPage() || isHomePage()) {
        fetchProductData();
    }
});

function setupPagination(filteredProductsLength) {
    console.log("Setting up pagination...");
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) {
        console.error("Pagination container not found");
        return;
    }
    paginationContainer.innerHTML = ''; // Clear existing pagination

    totalPages = Math.ceil(filteredProductsLength / productsPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const pageLink = document.createElement('a');
        pageLink.href = '#';
        pageLink.textContent = i;
        pageLink.style.border = i === currentPage ? '2px solid' : '2px solid #191a1d';
        pageLink.onclick = (e) => {
            e.preventDefault();
            currentPage = i;
            displayProducts();
            scrollToTop(); // Scroll to the top after changing the page
        };
        paginationContainer.appendChild(pageLink);
    }
    
}

// Function to scroll to the top of the page or a specific element
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}
function goToProductPage(element) {
    const id = element.getAttribute('data-id');
    const aval = element.getAttribute('data-aval');
    const name = element.getAttribute('data-name');
    const price = element.getAttribute('data-price');
    const type = element.getAttribute('data-type');
    const images = element.getAttribute('data-images');

    const params = new URLSearchParams({
        id,
        aval,
        name,
        price,
        type,
        images
    });

    window.location.href = `sproduct.html?${params.toString()}`;
}

document.addEventListener('DOMContentLoaded', () => {
    if (isShopPage()) {
        fetchProductData();
    }
});

// Template for singular products
document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const aval = params.get('aval');
    const name = params.get('name');
    const price = params.get('price');
    const type = params.get('type');
    const images = params.get('images').split(',');

    document.querySelector('.single-pro-details h4').textContent = name;
    document.querySelector('.single-pro-details h2').textContent = price;
    document.querySelector('.single-pro-details h6').textContent = `Home / ${type}`;

    const availabilitySpan = document.querySelector('.single-pro-details .availability');
    switch (aval) {
        case 'yes':
            availabilitySpan.textContent = 'In Stock';
            availabilitySpan.classList.add('availability-yes-s');
            break;
        case 'no':
            availabilitySpan.textContent = 'Out of Stock';
            availabilitySpan.classList.add('availability-no-s');
            break;
        case 'low':
            availabilitySpan.textContent = 'Low Stock';
            availabilitySpan.classList.add('availability-low-s');
            break;
    }
    
    const mainImg = document.getElementById('MainImg');
    if (mainImg) {
        mainImg.src = images[0];
    }

    const smallImgs = document.querySelectorAll('.small-img');
    smallImgs.forEach((img, index) => {
        img.src = images[index] || '';
    });
});

var MainImg = document.getElementById("MainImg");
var smallimg = document.getElementsByClassName("small-img");
if (smallimg.length > 0) {
    smallimg[0].style = "border: 2px solid rgb(249, 206, 97)";

    if (smallimg[0]) {
        smallimg[0].onclick = function() {
            MainImg.src = smallimg[0].src;
            smallimg[0].style = "border: 2px solid rgb(249, 206, 97)";
            smallimg[1].style = "border: none";
            smallimg[2].style = "border: none";
            smallimg[3].style = "border: none";
        };
    }
    if (smallimg[1]) {
        smallimg[1].onclick = function() {
            MainImg.src = smallimg[1].src;
            smallimg[0].style = "border: none";
            smallimg[1].style = "border: 2px solid rgb(249, 206, 97)";
            smallimg[2].style = "border: none";
            smallimg[3].style = "border: none";
        };
    }
    if (smallimg[2]) {
        smallimg[2].onclick = function() {
            MainImg.src = smallimg[2].src;
            smallimg[0].style = "border: none";
            smallimg[1].style = "border: none";
            smallimg[2].style = "border: 2px solid rgb(249, 206, 97)";
            smallimg[3].style = "border: none";
        };
    }
    if (smallimg[3]) {
        smallimg[3].onclick = function() {
            MainImg.src = smallimg[3].src;
            smallimg[0].style = "border: none";
            smallimg[1].style = "border: none";
            smallimg[2].style = "border: none";
            smallimg[3].style = "border: 2px solid rgb(249, 206, 97)";
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (isShopPage()) {
        fetchProductData();
    }
    
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const materialFilterSelect = document.getElementById('materialFilterSelect');
    const typeFilterSelect = document.getElementById('typeFilterSelect');

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            currentPage = 1;
            displayProducts();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            currentPage = 1;
            displayProducts();
        });
    }

    if (materialFilterSelect) {
        materialFilterSelect.addEventListener('change', () => {
            currentPage = 1;
            displayProducts();
        });
    }

    if (typeFilterSelect) {
        typeFilterSelect.addEventListener('change', () => {
            currentPage = 1;
            displayProducts();
        });
    }
});

// Initialize by fetching product data when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', fetchProductData);
