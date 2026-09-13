document.addEventListener("DOMContentLoaded", function () {
    const moreDetails = document.querySelectorAll(".more-details");

    const popup = document.getElementById("modal");
    const popupImage = document.getElementById("popup-image");
    const popupTitle = document.getElementById("popup-product-title");
    const popupPrice = document.getElementById("popup-product-price");
    const popupDescription = document.getElementById("popup-product-description");
    const popupSizes = document.getElementById("popup-sizes");
    const popupColors = document.getElementById("popup-colors");
    const addToCartButton = document.getElementById("add-to-cart-btn");
    let product;
    let imageUrl;
    var arrowImageUrl = "https://cdn.shopify.com/s/files/1/0584/9861/3345/files/down-arrow.png?v=1749734307";

    moreDetails.forEach((button) => {
        button.addEventListener("click", async (e) => {
            e.preventDefault();
            const productHandle = button.dataset.productHandle;
            const buttonImage = button.querySelector("img");

            if (button.classList.contains("active")) {
                buttonImage.src = "https://cdn.shopify.com/s/files/1/0584/9861/3345/files/plus-icon.png?v=1749734409";
                button.classList.remove("active");
                return;
            }

            // Close any open popup
            document.querySelectorAll(".more-details.active").forEach((activeButton) => {
                activeButton.classList.remove("active");
                activeButton.querySelector("img").src = "https://cdn.shopify.com/s/files/1/0584/9861/3345/files/plus-icon.png?v=1749734409";
            });

            try {
                const response = await fetch(`/products/${productHandle}.js`);
                product = await response.json();
                imageUrl = product.images[0];

                // Set main modal content directly
                popupImage.src = imageUrl;
                popupImage.alt = product.title;
                popupTitle.textContent = product.title;
                popupPrice.textContent = `$${(product.price / 100).toFixed(2)}`;
                popupDescription.innerHTML = product.description;

                // Handle sizes dropdown
                const sizes = product.variants.filter((variant) => variant.option1);
                const uniqueSizes = Array.from(new Map(sizes.map((size) => [size.option1, size])).values());

                if (uniqueSizes.length > 0) {
                    const dropdownWrapper = document.createElement("div");
                    dropdownWrapper.classList.add("custom-dropdown");

                    const label = document.createElement("label");
                    label.classList.add("label");
                    label.textContent = "Size";
                    dropdownWrapper.appendChild(label);

                    const dropdownButton = document.createElement("button");
                    dropdownButton.type = "button";
                    dropdownButton.classList.add("dropdown-button");

                    const arrowIcon = document.createElement("span");
                    arrowIcon.classList.add("arrow-icon");
                    const arrow = document.createElement("img");
                    arrow.src = arrowImageUrl;
                    arrow.alt = "Arrow down";
                    arrow.classList.add("arrow");

                    const btnText = document.createElement("span");
                    btnText.classList.add("btn-text");
                    btnText.textContent = "Choose your size";
                    arrowIcon.appendChild(arrow);
                    dropdownButton.appendChild(btnText);
                    dropdownButton.appendChild(arrowIcon);
                    dropdownWrapper.appendChild(dropdownButton);

                    const dropdownList = document.createElement("ul");
                    dropdownList.classList.add("dropdown-list");
                    uniqueSizes.forEach((size) => {
                        const listItem = document.createElement("li");
                        listItem.classList.add("dropdown-item");
                        listItem.dataset.value = size.id;
                        listItem.textContent = size.option1;
                        dropdownList.appendChild(listItem);
                    });
                    dropdownWrapper.appendChild(dropdownList);

                    dropdownButton.addEventListener("click", () => {
                        dropdownList.classList.toggle("show");
                        arrow.classList.toggle("rotate");
                    });

                    dropdownList.addEventListener("click", (e) => {
                        if (e.target.classList.contains("dropdown-item")) {
                            btnText.textContent = e.target.textContent;
                            dropdownButton.dataset.value = e.target.dataset.value;
                            dropdownList.classList.remove("show"); 
                            arrow.classList.remove("rotate"); 
                        }
                    });

                    document.addEventListener("click", (e) => {
                        if (!dropdownWrapper.contains(e.target)) {
                            dropdownList.classList.remove("show");
                            arrow.classList.remove("rotate");
                        }
                    });

                    popupSizes.innerHTML = ""; 
                    popupSizes.appendChild(dropdownWrapper);
                } else {
                    popupSizes.innerHTML = "<p>No sizes available.</p>";
                }
                const colors = product.variants.filter((variant) => variant.option2);
                const uniqueColors = Array.from(new Map(colors.map((color) => [color.option2, color])).values());

                popupColors.innerHTML = "";
                const colorsWrapper = document.createElement("div");
                colorsWrapper.classList.add("colors-wrapper");

                const label = document.createElement("label");
                label.classList.add("label");
                label.textContent = "Color";
                colorsWrapper.appendChild(label);
                popupColors.appendChild(colorsWrapper);
                const btnItems = document.createElement("div");
                btnItems.classList.add("btn-items");

                uniqueColors.forEach((color) => {
                    const colorButton = document.createElement("button");
                    colorButton.type = "button";
                    colorButton.classList.add("color-button");
                    colorButton.classList.add(color.option2);
                    colorButton.textContent = color.option2;
                    colorButton.dataset.colorId = color.id;
                    if (!(color.option2 === 'White')) {
                        colorButton.style.borderLeft = `5px solid ${color.option2}`;
                    }

                    colorButton.addEventListener("click", () => {
                        selectedColor = color.id;

                        document.querySelectorAll(".color-button").forEach((btn) => {
                            btn.classList.remove("active");
                        });

                        colorButton.classList.add("active");
                    });

                    btnItems.appendChild(colorButton);
                    popupColors.appendChild(btnItems);
                });

                if (uniqueColors.length === 0) {
                    popupColors.innerHTML = "<p>No colors available.</p>";
                }

                popup.classList.add("show-modal");
                buttonImage.src = "https://cdn.shopify.com/s/files/1/0584/9861/3345/files/cross-icon.png?v=1749734409";
                button.classList.add("active");
            } catch (error) {
                console.error("Error fetching product data:", error);
            }
        });
    });

    document.querySelector(".close-button").addEventListener("click", (e) => {
        e.preventDefault();
        popup.classList.remove("show-modal");
        
        document.querySelectorAll(".more-details").forEach((button) => {
            const buttonImage = button.querySelector("img");
            buttonImage.src = "https://cdn.shopify.com/s/files/1/0584/9861/3345/files/plus-icon.png?v=1749734409";
            button.classList.remove("active");
        });
    });

    addToCartButton.addEventListener("click", async () => {
        const selectedSizeText = document.querySelector(".dropdown-button .btn-text").textContent.trim();
        const selectedColorButton = document.querySelector(".color-button.active");

        if (!selectedColorButton) {
            alert("Please select a color.");
            return;
        }

        if (selectedSizeText === "Choose your size" || !selectedSizeText) {
            alert("Please select a size.");
            return;
        }

        const selectedColorText = selectedColorButton.textContent.trim();
        const selectedVariant = product.variants.find(
            (variant) =>
                variant.option1 === selectedSizeText && variant.option2 === selectedColorText
        );

        if (!selectedVariant) {
            alert("The selected variant is not available.");
            return;
        }

        try {
            const response = await fetch(`/cart/add.js`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: selectedVariant.id,
                    quantity: 1,
                }),
            });

            if (selectedSizeText === "M" && selectedColorText === "Black") {
                const softWinterJacketId = 42553691471908;

                await fetch(`/cart/add.js`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        id: softWinterJacketId,
                        quantity: 1,
                    }),
                });
            }

            if (response.ok) {
                window.location.href = "/cart";
            } else {
                const errorMessage = await response.text();
                alert(`Error adding item in the cart: ${errorMessage}`);
            }
        } catch (error) {
            console.error("Error when item in add to cart:", error);
        }
    });
});