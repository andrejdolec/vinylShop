module.exports = function Cart(oldCart) {
    this.items = oldCart.items || {};
    this.totalQty = oldCart.totalQty || (this.totalQty === 0);
    this.totalPrice = oldCart.totalPrice || 0;

    this.add = function (item, id, price) {
        let storedItem = this.items[id];
        if (!storedItem) {
            storedItem = this.items[id] = { item: item, qty: 0, price: 0 }
        }
        storedItem.price = price;
        storedItem.qty++;
        price = price * storedItem.qty;
        this.totalQty++;
        this.totalPrice += storedItem.item.price;
    }

    this.reduceByOne = function (id) {
        this.items[id].qty--;
        // this.items[id].price = this.items[id].item.price;
        this.totalQty--;
        this.totalPrice -= this.items[id].item.price;
        if (this.items[id].qty <= 0) {
            delete this.items[id]
        }
    }

    this.incrementByOne = function (id) {
        this.items[id].qty++;
        this.totalQty++;
        this.totalPrice += this.items[id].item.price;
    }

    this.removeItem = function (id) {
        this.totalQty -= this.items[id].qty;
        this.totalPrice -= this.items[id].price * this.items[id].qty;
        delete this.items[id];
    }

    this.generateArray = function () {
        let arr = [];
        for (let id in this.items) {
            arr.push(this.items[id]);
        }
        return arr;
    }
};