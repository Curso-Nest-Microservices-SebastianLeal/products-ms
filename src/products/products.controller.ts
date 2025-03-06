import { Controller } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { PaginationDto } from "src/common";
import { MessagePattern, Payload } from "@nestjs/microservices";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {
  }

  @MessagePattern({ cmd: 'create_product' })
  async create(@Payload() createProductDto: CreateProductDto) {
    try {
      const product = await this.productsService.create(createProductDto);
      return product;
    } catch (err) {
      throw err;
    }
  }

  @MessagePattern({ cmd: 'find_all_products' })
  findAll(@Payload() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  @MessagePattern({ cmd: 'find_one_product' })
  async findOne(@Payload() id: number) {

    try {
      const product = await this.productsService.findOne(id);

      return product;

    } catch (error) {
      throw error;
    }
  }

  @MessagePattern({ cmd: 'update_product' })
  update(
    @Payload() updateProductDto: UpdateProductDto
  ) {
    try {
      return this.productsService.update(updateProductDto.id, updateProductDto);
    } catch (err) {
      throw err;
    }
  }

  @MessagePattern({ cmd: 'delete_product' })
  async remove(@Payload() id: number) {
    try {
      return await this.productsService.remove(id);
    } catch (err) {
      throw err;
    }
  }

  @MessagePattern({ cmd: 'validate_products' })
  async validateProducts(@Payload() ids: number[]) {
    try {
      return await this.productsService.validateProducts(ids);

    } catch (err) {
      throw err;
    }
  }
}
