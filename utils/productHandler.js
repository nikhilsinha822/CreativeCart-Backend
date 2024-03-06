const Product = require('../models/product');

const finalCost = async (cartItems) => {
    let subTotal = 0, totalSavings = 0;
    await Promise.all(cartItems.map(async (item) => {
        const { price, discount } = await costPrice(item.product);
        subTotal += price * item.quantity;
        totalSavings += discount * item.quantity;
    }));
    return {
        subTotal,
        totalSavings,
        finalPrice: subTotal - totalSavings,
    }
}
const costPrice = async (productID) => {
    let price = 0, discount = 0;

    const product = await Product.findById(productID);

    price += product.price;

    if (product.discountType === "amount") {
        discount += product.discountValue;
    } else if (product.discountType === "percent") {
        discount += (product.discountValue * price) / 100;
    }

    return { price, discount };
}

module.exports = {
    finalCost
}