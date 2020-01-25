module.exports = function Cart(oldCart) {
    this.items = oldCart.items || {};
    this.totalQuantity = oldCart.totalQuantity || 0;
    this.totalPrice = oldCart.totalPrice || 0;
    this.random = 0;
    this.add = function (item, id) {
        let storedItem = this.items[id];

        if (!storedItem) {
            storedItem = this.items[id] = { item: item, qty: 0, price: 0, message: '', dezabuire: false, isbuton: false, isbuton_dublu: false, issenzor: false, israma: false }
        }
        if (storedItem.qty < 1) {
            storedItem.qty++;
            this.random++;
            storedItem.price = storedItem.item.price * storedItem.qty;
            this.totalQuantity++;
        } else {
            storedItem.message = "you allready have this product in card";
            this.random++;
        }
    };

    this.reduceByOne = function (id) {
        this.items[id].qty--;
        this.items[id].price -= this.items[id].item.price;
        this.totalQuantity--;
        this.totalPrice -= this.items[id].item.price;

        if (this.items[id].qty <= 0) {
            delete this.items[id];
        }
    };

    this.addByOne = function (id) {
        this.items[id].qty++;
        this.items[id].price += this.items[id].item.price;
        this.totalQuantity++;
        this.totalPrice += this.items[id].item.price;
    };

    this.removeItem = function (id) {
        this.totalQuantity -= this.items[id].qty;
        this.totalPrice -= this.items[id].price;
        delete this.items[id];
    };

    this.generateArray = () => {
        let arr = [];
        for (let id in this.items) {
            arr.push(this.items[id]);
        }
        return arr;
    };
};