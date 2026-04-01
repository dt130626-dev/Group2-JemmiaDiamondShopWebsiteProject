import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const populateCart = async (cart) => {
    return await cart.populate("items.product", "name image price countInStock");
};

export const getUserCart = async (userId) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return { items: [], totalPrice: 0 };
    return await populateCart(cart);
};

export const addItemToCart = async (userId, productId, quantity = 1) => {
    const product = await Product.findById(productId);
    if (!product) throw new Error("Sản phẩm không tồn tại");

    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = new Cart({ user: userId, items: [] });

    const existIndex = cart.items.findIndex((i) => i.product.toString() === productId);

    if (existIndex >= 0) {
        cart.items[existIndex].quantity += quantity;
    } else {
        cart.items.push({ product: productId, quantity, price: product.price });
    }

    await cart.save();
    return await populateCart(cart);
};

export const updateItemInCart = async (userId, itemId, quantity) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new Error("Giỏ hàng trống");

    const item = cart.items.id(itemId);
    if (!item) throw new Error("Không tìm thấy sản phẩm trong giỏ");
    
    if (quantity > item.product.countInStock) {
        throw new Error(`Chỉ còn ${item.product.countInStock} sản phẩm trong kho`);
    }
    if (quantity <= 0) {
        cart.items.pull({ _id: itemId });
    } else {
        item.quantity = quantity;
    }

    await cart.save();
    return await populateCart(cart);
};

export const removeItemFromCart = async (userId, itemId) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new Error("Giỏ hàng trống");

    cart.items.pull({ _id: itemId });
    await cart.save();
    return await populateCart(cart);
};

export const deleteUserCart = async (userId) => {
    return await Cart.findOneAndDelete({ user: userId });
};