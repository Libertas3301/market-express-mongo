/*FUNCTIONS FOR INCREMENTING THE CONTEXT OF AN INPUT BOX, WHEN YOU CLICK MINUS OR PLUS , DELETING PRODUCST AND ETC
                
}


}IN A CART ITEM*/
let cartsPlusSign = document.querySelectorAll(".cart .plus");
let cartMinusSign = document.querySelectorAll(".cart .minus");
let removeProductSign = document.querySelectorAll(".cart i[class]");

for (let i of cartsPlusSign) {
    i.addEventListener("click", productIncrement);
}

for (let sign of cartMinusSign) {
    sign.addEventListener("click", productDecrement);
}

for (let sign of removeProductSign) {
    sign.addEventListener("click", deleteProduct);
}

function productIncrement() {
    let totalPlata = document.querySelector("p.pret-final");

    let productTotals = document.querySelector;
    let productCost = parseFloat(
        this.parentNode.parentNode.querySelector("p.pret-total span").textContent
    );
    totalPlata_value = parseFloat(totalPlata.textContent.split("$")[0]);

    var parent = this.parentNode.parentNode.parentNode;
    var span = parent.querySelector(".caseta>span");
    let counter = parseInt(span.textContent);

    span.textContent = ++counter;
    totalPlata_value += productCost;
    totalPlata.textContent = totalPlata_value + "$";
}

function productDecrement() {
    let totalPlata = document.querySelector("p.pret-final");
    let productCost = parseFloat(
        this.parentNode.parentNode.querySelector("p.pret-total span").textContent
    );
    totalPlata_value = parseFloat(totalPlata.textContent.split("$")[0]);

    var parent = this.parentNode.parentNode.parentNode;
    var span = parent.querySelector(".caseta>span");
    let counter = parseInt(span.textContent);

    if (counter > 0) {
        span.textContent = --counter;
        totalPlata_value -= productCost;

        totalPlata.textContent = totalPlata_value + "$";
    }
}

function deleteProduct() {
    var parentCart = this.parentNode;
    let productCost = parentCart.querySelector("p.pret-total span").textContent;

    let totalPlata = document.querySelector("p.pret-final");
    totalPlata_value = parseFloat(totalPlata.textContent.split("$")[0]);

    var span = parentCart.querySelector(".caseta>span");
    let counter = parseInt(span.textContent);

    totalPlata_value -= productCost * counter;

    totalPlata.textContent = totalPlata_value + "$";
    /*COSTEA , AICI BAGI UN AJAX REQUEST CATRE UN ROUTE PENTRU A STERGE ELEMENTUL DIN BD */
    parentCart.nextElementSibling.remove();

    parentCart.remove();
}