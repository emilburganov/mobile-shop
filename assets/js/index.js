class Product {
	constructor(id, name, price, discount, ram, rom, brand, image) {
		this.id = id;
		this.name = name;
		this.price = price;
		this.discount = discount;
		this.ram = ram;
		this.rom = rom;
		this.brand = brand;
		this.image = image;
	}
	
	get discountPrice() {
		return Math.trunc(this.price / 100) * (100 - this.discount);
	}
}

const products = [
	new Product(1, "4\" Смартфон DEXP A440 8 ГБ розовый", 3200, 0, 1, 8, "DEXP", "assets/images/1.jpg"),
	new Product(2, "Samsung Galaxy M52", 40999, 4, 6, 256, "Samsung", "assets/images/2.jpg"),
	new Product(3, "Смартфон POCO F3 Черный", 32999, 0, 6, 128, "POCO", "assets/images/3.jpg"),
	new Product(4, "Смартфон POCO F3 Белый", 34999, 6, 6, 128, "POCO", "assets/images/4.jpg"),
];

let cart = JSON.parse(localStorage.getItem("cart")) ?? [];

const renderProducts = (products) => {
	const productsTemplate = document.querySelector(".card-grid");
	productsTemplate.innerHTML = "";
	
	products.forEach((product) => {
		let badge, price;
		
		if (product.discount) {
			badge = `<div class="badge success">Cкидка -${product.discount}%</div>`;
			price = `
				<p class="card__old-price">${product.price}₽</p>
				<p class="card__price">${product.discountPrice}₽</p>
			`;
		} else {
			badge = `<div class="badge">Бестселлер</div>`;
			price = `<p class="card__price">${product.price}₽</p>`;
		}
		
		
		productsTemplate.innerHTML += `
			<div class="card">
				<div class="card__image">
					<img src="${product.image}" alt="phone">
					${badge}
				</div>
				<div class="card__text sb">
					<h3>${product.name}</h3>
					<div class="flex col g-10 sb">
						<div class="card__pricing flex ac g-10">
							${price}
						</div>
					</div>
					<button id="addToCartButton" class="button" data-id="${product.id}">В корзину</button>
				</div>
			</div>
		`;
		
		document.querySelectorAll("#addToCartButton").forEach((button) => {
			button.addEventListener("click", () => {
				const cartProduct = cart.find((cartProduct) => cartProduct.product.id === Number(button.dataset.id));
				
				if (cartProduct) {
					cartProduct.count++;
				} else {
					cart.push({
						product: products.find((product) => product.id === Number(button.dataset.id)),
						count: 1,
					});
				}
				
				cartCount.innerHTML = cart.length;
			});
		});
	});
};

const filterParams = JSON.parse(localStorage.getItem("filterParams")) ?? {
	search: "",
	minPrice: Math.min(...products.map(product => product.price)),
	maxPrice: Math.max(...products.map(product => product.price)),
	minRam: Math.min(...products.map(product => product.ram)),
	maxRam: Math.max(...products.map(product => product.ram)),
	minRom: Math.min(...products.map(product => product.rom)),
	maxRom: Math.max(...products.map(product => product.rom)),
	withDiscounts: false,
	brands: [...new Set(products.map(product => product.brand))],
};

resetButton.addEventListener("click", () => {
	const brandCheckboxes = document.querySelectorAll(".company-checkbox");
	brandCheckboxes.forEach((brandCheckbox) => {
		filterParams.minPrice = 0;
		filterParams.maxPrice = 0;
		filterParams.minRam = 0;
		filterParams.maxRam = 0;
		filterParams.minRom = 0;
		filterParams.maxRom = 0;
		filterParams.withDiscounts = 0;
		filterParams.brands = [];
		brandCheckbox.removeAttribute("checked");
	});
});

const renderFilters = () => {
	searchInput.value = filterParams.search;
	searchInput.addEventListener("change", (event) => {
		filterParams.search = event.target.value;
	});
	
	priceFromInput.value = filterParams.minPrice;
	priceFromInput.addEventListener("change", (event) => {
		filterParams.minPrice = event.target.value;
	});
	
	priceToInput.value = filterParams.maxPrice;
	priceToInput.addEventListener("change", (event) => {
		filterParams.maxPrice = event.target.value;
	});
	
	ramFromInput.value = filterParams.minRam;
	ramFromInput.addEventListener("change", (event) => {
		filterParams.minRam = event.target.value;
	});
	
	ramToInput.value = filterParams.maxRam;
	ramToInput.addEventListener("change", (event) => {
		filterParams.maxRam = event.target.value;
	});
	
	romFromInput.value = filterParams.minRom;
	romFromInput.addEventListener("change", (event) => {
		filterParams.minRom = event.target.value;
	});
	
	romToInput.value = filterParams.maxRom;
	romToInput.addEventListener("change", (event) => {
		filterParams.maxRom = event.target.value;
	});
	
	romToInput.checked = filterParams.withDiscounts;
	withDiscountsCheckbox.addEventListener("click", (event) => {
		filterParams.withDiscounts = event.target.checked;
	});
	
	const renderCompaniesCheckboxes = () => {
		const companies = ["DEXP", "Samsung", "POCO"];
		
		companiesCheckboxes.innerHTML = "";
		companies.forEach((company) => {
			companiesCheckboxes.innerHTML += `
			<div class="flex g-10 ac">
				<input checked data-company="${company}" class="checkbox company-checkbox" type="checkbox">
				<label>${company}</label>
			</div>
		`;
			
			const companyCheckboxes = document.querySelectorAll(".company-checkbox");
			
			companyCheckboxes.forEach((companyCheckbox) => {
				companyCheckbox.addEventListener("click", (event) => {
					const brand = companyCheckbox.dataset.company;
					
					if (event.target.checked) {
						filterParams.brands.push(brand);
					} else {
						filterParams.brands = [...new Set([...filterParams.brands].filter((_brand) => _brand !== brand))];
					}
				});
			});
		});
	};
	
	renderCompaniesCheckboxes();
};

const filterProducts = (products) => {
	const filteredProducts = products.filter((product) =>
		product.discountPrice >= Number(filterParams.minPrice) && product.discountPrice <= Number(filterParams.maxPrice) &&
		product.ram >= Number(filterParams.minRam) && product.ram <= Number(filterParams.maxRam) &&
		product.rom >= Number(filterParams.minRom) && product.rom <= Number(filterParams.maxRom) &&
		(filterParams.withDiscounts ? !!product.discount : true) &&
		filterParams.brands.includes(product.brand) &&
		product.name.toLowerCase().includes(filterParams.search.toLowerCase())
	);
	
	localStorage.setItem("filterParams", JSON.stringify(filterParams));
	
	renderProducts(filteredProducts);
};

filterForm.addEventListener("submit", (event) => {
	event.preventDefault();
	
	filterProducts(products);
});

let sorting = JSON.parse(localStorage.getItem("sorting")) ?? "";

const sortProducts = (products) => {
	let sortedProducts = products;
	
	switch (sorting) {
		case "price-desc":
			sortingSelect.value = "price-desc";
			sortedProducts = [...products].sort((firstProduct, secondProduct) => secondProduct.discountPrice - firstProduct.discountPrice);
			break;
		case "price-asc":
			sortingSelect.value = "price-asc";
			sortedProducts = [...products].sort((firstProduct, secondProduct) => firstProduct.discountPrice - secondProduct.discountPrice);
			break;
		case "date-desc":
			sortingSelect.value = "date-desc";
			sortedProducts = [...products].sort((firstProduct, secondProduct) => secondProduct.id - firstProduct.id);
			break;
		case "date-asc":
			sortingSelect.value = "date-asc";
			sortedProducts = [...products].sort((firstProduct, secondProduct) => firstProduct.id - secondProduct.id);
			break;
	}
	
	
	filterProducts(sortedProducts);
};

sortingSelect.addEventListener("change", (event) => {
	sorting = event.target.value;
	
	localStorage.setItem("sorting", JSON.stringify(sorting));
	sortProducts(products);
});

searchInput.addEventListener("search", (event) => {
	filterParams.search = event.target.value;
	
	if (filterProducts.search === "") {
		filterProducts(products);
	} else {
		const searchedProducts = products.filter((product) =>
			product.name.toLowerCase().includes(filterParams.search.toLowerCase())
		);
		
		filterProducts(searchedProducts);
	}
});

modal.addEventListener("click", () => {
	modal.classList.remove("active");
});

modalCloseButton.addEventListener("click", () => {
	modal.classList.remove("active");
});

modalContainer.addEventListener("click", (event) => {
	event.stopPropagation();
});
openCartButton.addEventListener("click", () => {
	renderCart();
	
	if (cart.length > 0) {
		modal.classList.toggle("active");
	}
});

const renderCart = () => {
	const cartTemplate = document.querySelector("#cartProducts");
	cartTemplate.innerHTML = "";
	cartCount.innerHTML = cart.length;
	totalTemplate.innerHTML = "";
	
	if (cart.length === 0) {
		modal.classList.remove("active");
	}
	
	if (cart.length > 0) {
		const totalCount = cart.reduce((acc, val) => acc + val.count, 0);
		const totalPrice = cart.reduce((acc, val) => acc + val.count * Math.trunc(val.product.price / 100) * (100 - val.product.discount), 0);
		
		totalTemplate.innerHTML = `
				<hr>
				<div class="flex col g-20">
					<p class="cart_total">Итого: ${totalCount} товара(-ов) на сумму = ${totalPrice}₽</p>
					<button class="button">
						Перейти к оплате
					</button>
				</div>
			`;
	}
	
	cart.forEach((cartProduct) => {
		let badge, price, total;
		
		const discountPrice = Math.trunc(cartProduct.product.price / 100) * (100 - cartProduct.product.discount);
		
		if (cartProduct.product.discount) {
			badge = `<div class="badge success">Cкидка -${cartProduct.product.discount}%</div>`;
			price = `
				<p class="card__old-price">${cartProduct.product.price}₽</p>
				<p class="card__price">${discountPrice}₽</p>
			`;
			total = `
				<p class="card__price">Итого: ${discountPrice * cartProduct.count}₽</p>
			`;
		} else {
			badge = `<div class="badge">Бестселлер</div>`;
			price = `<p class="card__price">${cartProduct.product.price}₽</p>`;
			
			total = `
				<p class="card__price">Итого: ${cartProduct.product.price * cartProduct.count}₽</p>
			`;
		}
		
		if (cartProduct.count === 0) {
			cart = cart.filter((product) => product.product.id !== cartProduct.product.id);
			return;
		}
		
		cartTemplate.innerHTML += `
			 <div class="card cart-row">
                <div class="card__image">
                    <img src="${cartProduct.product.image}" alt="phone">
                    ${badge}
                </div>
                <div class="card__text col sb g-20">
                    <h3>${cartProduct.product.name}</h3>
                    <div class="flex col g-10 sb">
                        <div class="card__pricing flex ac g-10">
                            ${price}
                        </div>
                    </div>
                    <div class="flex col g-10 sb">
                        <div class="card__pricing flex ac g-10">
                           ${total}
                        </div>
                    </div>
                    <div class="flex g-10 ac">
                        <button data-id="${cartProduct.product.id}" id="decrementCart" class="button icon">-</button>
                        <input value="${cartProduct.count}"class="input" type="number">
                        <button data-id="${cartProduct.product.id}" id="incrementCart" class="button icon">+</button>
                    </div>
                    <button id="deleteFromCartButton" class="button danger" data-id="${cartProduct.product.id}">Удалить</button>
                </div>
            </div>
		`;
		
		
		document.querySelectorAll("#decrementCart").forEach((button) => {
			button.addEventListener("click", () => {
				cart.find((cartProduct) => cartProduct.product.id === Number(button.dataset.id)).count--;
				
				if (cartProduct.count === 0) {
					cart = cart.filter((product) => product.product.id !== Number(button.dataset.id));
				}
				
				cartCount.innerHTML = cart.length;
				renderCart();
			});
		});
		
		document.querySelectorAll("#incrementCart").forEach((button) => {
			button.addEventListener("click", () => {
				cart.find((cartProduct) => cartProduct.product.id === Number(button.dataset.id)).count++;
				
				cartCount.innerHTML = cart.length;
				renderCart();
			});
		});
		
		document.querySelectorAll("#deleteFromCartButton").forEach((button) => {
			button.addEventListener("click", () => {
				cart = cart.filter((product) => product.product.id !== Number(button.dataset.id));
				
				cartCount.innerHTML = cart.length;
				renderCart();
			});
		});
	});
};

window.addEventListener("beforeunload", () => {
	localStorage.setItem("cart", JSON.stringify(cart));
});

const render = () => {
	filterProducts(products);
	sortProducts(products);
	renderFilters();
	renderCart();
};

render();