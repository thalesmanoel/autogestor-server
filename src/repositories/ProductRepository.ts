import Product, {IProduct} from "../models/Product";
import BaseRepository from "./BaseRepository";

export default class ProductRepository extends BaseRepository<IProduct> {
  constructor() {
    super(Product);
  }
}