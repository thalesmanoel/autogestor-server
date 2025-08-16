import { IProduct } from "../models/Product";
import ProductRepository from "../repositories/ProductRepository";
import BaseService from "./BaseService";

export default class ProductService extends BaseService<IProduct> {
  constructor() {
    super(new ProductRepository());
  }
}
