;
((c, d) => {
    //Variables
    const cartBtn = d.querySelector('.cart-btn'),
        closeCartBtn = d.querySelector('.close-cart'),
        clearCartBtn = d.querySelector('.clear-cart'),
        cartDOM = d.querySelector('.cart'),
        cartItems = d.querySelector('.cart-items'),
        cartOverlay = d.querySelector('.cart-overlay'),
        cartTotal = d.querySelector('.cart-total'),
        cartContent = d.querySelector('.cart-content'),
        productsDOM = d.querySelector('.products-center');

    //Cart
    let cart = [];
    //Buttons
    let buttonsDOM = [];

    //getting the products
    class Products {
        async getProducts() {
            try {
                let result = await fetch("products.json");
                let data = await result.json();
                let products = data.items;
                products = products.map((item) => {
                    const { title, price } = item.fields;
                    const { id } = item.sys;
                    const image = item.fields.image.fields.file.url;

                    return { title, price, id, image }
                })
                return products;
            } catch (error) {
                c(error);
            }
        }
    }

    //Display products
    class UI {
        displayProducts(products) {
            //c(products);
            let result = '';
            products.forEach(product => {
                result += `
                <!--Single Products-->
                    <article class="product">
                        <div class="img-container">
                            <img src=${product.image} alt="product" class="product-img">
                            <button class="bag-btn" data-id=${product.id}>
                                add to cart
                                <i class="fas fa-shopping-cart"></i>
                            </button>
                        </div>
                        <h3>${product.title}</h3>
                        <h4>$${product.price}</h4>
                    </article>
            <!--End Single Products-->
                `;
            });
            productsDOM.innerHTML = result;
        }
        getBagButtons() {
            const btns = [...d.querySelectorAll('.bag-btn')];
            buttonsDOM = btns;
            //c(btns)
            btns.forEach(button => {
                let id = button.dataset.id;
                //c(id)
                let inCart = cart.find(item => item.id === id)

                if (inCart) {
                    button.innerText = "In Cart";
                    button.disabled = true
                } else {
                    button.addEventListener('click', (e) => {
                        //c(e)
                        e.target.innerText = "In Cart";
                        e.target.disabled = true;

                        //get products from products
                        let carItem = { ...Storage.getProduct(id), amount: 1 };
                        //c(carItem)

                        //add product to the cart
                        cart = [...cart, carItem]
                        //c(cart)

                        //save cart in localstorage
                        Storage.saveCart(cart)

                        //set cart values
                        this.setCartValues(cart)

                        //display cart item 
                        this.addCartItem(carItem)

                        //show the cart
                        this.showCart();

                    })
                }
            })
        }

        setCartValues(cart) {
            let tempTotal = 0;
            let itemsTotal = 0;
            cart.map(item => {
                tempTotal += item.price * item.amount;
                itemsTotal += item.amount;
            })
            cartTotal.innerText = parseFloat(tempTotal.toFixed(2))
            cartItems.innerText = itemsTotal;
            //c(cartTotal, cartItems)
        }

        addCartItem(item) {
            const div = d.createElement('div');
            div.classList.add('cart-item')
            div.innerHTML = `<img src=${item.image} alt="">
                    <div>
                        <h4>${item.title}</h4>
                        <h5>$${item.price}</h5>
                        <span class="remove-item" data-id=${item.id}>Remove</span>
                    </div>
                    <div>
                        <i class="fas fa-chevron-up" data-id=${item.id}></i>
                        <p class="item-amount">${item.amount}</p>
                        <i class="fas fa-chevron-down" data-id=${item.id}></i>
                    </div>
            `;
            cartContent.appendChild(div);
            //c(cartContent)
        }

        showCart() {
            cartOverlay.classList.add('transparentBcg');
            cartDOM.classList.add('showCart');
        }

        setApp() {
            cart = Storage.getCart();
            this.setCartValues(cart);
            this.populateCart(cart);
            cartBtn.addEventListener('click', this.showCart)
            closeCartBtn.addEventListener('click', this.hideCart)
        }

        populateCart(cart) {
            cart.forEach(item => this.addCartItem(item))
        }

        hideCart() {
            cartOverlay.classList.remove('transparentBcg');
            cartDOM.classList.remove('showCart');
        }

        cartLogic() {
            //Clear cart button
            clearCartBtn.addEventListener('click', () => {
                this.clearCart()
            })
            //cart functionality
            cartContent.addEventListener('click', e => {
                c(e)
                if (e.target.classList.contains('remove-item')) {
                    let removeItem = e.target;
                    let id = removeItem.dataset.id;
                    cartContent.removeChild(removeItem.parentElement.parentElement)
                    this.removeItem(id);

                } else if (e.target.classList.contains('fa-chevron-up')) {
                    let addAmount = e.target;
                    let id = addAmount.dataset.id;
                    let tempItem = cart.find(item => item.id === id);
                    tempItem.amount = tempItem.amount + 1;
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    addAmount.nextElementSibling.innerText = tempItem.amount;
                } else if (e.target.classList.contains('fa-chevron-down')) {
                    let lowerAmount = e.target;
                    let id = lowerAmount.dataset.id;
                    let tempItem = cart.find(item => item.id === id);
                    tempItem.amount = tempItem.amount - 1;
                    if (tempItem.amount > 0) {
                        Storage.saveCart(cart);
                        this.setCartValues(cart);
                        lowerAmount.previousElementSibling.innerText = tempItem.amount;
                    } else {
                        cartContent.removeChild(lowerAmount.parentElement.parentElement)
                        this.removeItem(id)
                    }

                }
            })
        }

        clearCart() {
            //c(this)
            let cartItems = cart.map(item => item.id)
            //c(cartItems)
            cartItems.forEach(id => this.removeItem(id))

            c(cartContent.children)
            while (cartContent.children.length > 0) {
                cartContent.removeChild(cartContent.children[0])
            }
            this.hideCart();
        }

        removeItem(id) {
            cart = cart.filter(item => item.id !== id);
            this.setCartValues(cart);
            Storage.saveCart(cart);
            let btn = this.getSingleButton(id);
            //cartTotal.innerHTML = 0;
            //cartItems.innerText = 0;
            btn.disabled = false;
            btn.innerHTML = `<i class="fas fa-shopping-cart"></i> add to cart`;
        }

        getSingleButton(id) {
            return buttonsDOM.find(button => button.dataset.id === id);
        }
    }

    //Local Storage
    class Storage {
        static saveProducts(products) {
            localStorage.setItem("products", JSON.stringify(products))
        }

        static getProduct(id) {
            let products = JSON.parse(localStorage.getItem('products'))
            return products.find(product => product.id === id);
        }

        static saveCart(cart) {
            localStorage.setItem("cart", JSON.stringify(cart));
        }

        static getCart() {
            return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : []
        }
    }

    d.addEventListener("DOMContentLoaded", () => {
        const ui = new UI();
        const products = new Products();

        //septup app
        ui.setApp();

        //get all products
        products.getProducts().then(products => {
            ui.displayProducts(products)
            Storage.saveProducts(products)
        }).then(() => {
            ui.getBagButtons()
            ui.cartLogic()
        });

    });

})(console.log, document);
