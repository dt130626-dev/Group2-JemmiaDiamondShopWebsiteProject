/**
 * ApiFeatures — dùng cho GET /api/products?category=ring&sort=-price&page=2
 * Cách dùng:
 *   const features = new ApiFeatures(Product.find(), req.query)
 *     .filter().sort().limitFields().paginate();
 *   const products = await features.query;
 */
export default class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields", "search"];
    excludedFields.forEach((f) => delete queryObj[f]);

    // Hỗ trợ: price[gte]=100000&price[lte]=500000
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (m) => `$${m}`);

    this.query = this.query.find(JSON.parse(queryStr));

    // Tìm kiếm theo tên
    if (this.queryString.search) {
      this.query = this.query.find({
        name: { $regex: this.queryString.search, $options: "i" },
      });
    }

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      // sort=-price,ratings  →  -price ratings
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate() {
    const page  = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 12;
    const skip  = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    this.page  = page;
    this.limit = limit;
    return this;
  }
}