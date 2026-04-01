import * as wishlistService from "../services/wishlistService.js";

export const getWishlist = async (req, res) => {
  try {
    const wishlist = await wishlistService.fetchWishlist(req.user._id);
    res.json({ success: true, wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const result = await wishlistService.addProductToWishlist(req.user._id, productId);
    
    if (result.alreadyIn) {
      return res.json({ 
        success: true, 
        message: "Đã có trong wishlist", 
        wishlist: result.wishlist 
      });
    }

    res.json({ success: true, wishlist: result.wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const wishlist = await wishlistService.removeProductFromWishlist(
      req.user._id, 
      req.params.productId
    );
    res.json({ success: true, wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};