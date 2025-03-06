import { BadRequestException, HttpStatus, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { PrismaClient } from "@prisma/client";
import { PaginationDto } from "src/common";
import { RpcException } from "@nestjs/microservices";

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger("ProductService");

  onModuleInit() {
    this.$connect();
    this.logger.log("Database connected");
  }

  async create(createProductDto: CreateProductDto) {
    try {
      return this.product.create({
        data: createProductDto
      });
    } catch (err) {
      throw err;
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const totalPages = await this.product.count({ where: { available: true } });

    const lastPage = Math.ceil(totalPages / limit);

    const data = await this.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        available: true
      }
    });

    if (!data.length) {
      return {
        mesagge: "No existen registros"
      };
    } else {
      return {
        data: data,
        meta: {
          total: totalPages,
          page: page,
          lastPage: lastPage
        }
      };
    }
  }

  async findOne(id: number) {

    if (typeof id !== 'number') {
      throw new RpcException(`Invalid ID: ${id}`);
    }

    const product = await this.product.findUnique({
      where: {
        id,
        available: true
      }
    });

    if (!product) {
      throw new RpcException(
        {
          message: `Producto con id #${id} no encontrado`,
          status: HttpStatus.BAD_REQUEST
        }
      );
    }

    return product;

  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      const { id: _id, ...data } = updateProductDto;

      await this.findOne(id);

      if (updateProductDto.name === "") {
        throw new BadRequestException("El nombre no puede estar vacío");
      }
      ;

      return this.product.update({
        where: { id },
        data: data
      });

    } catch (err) {
      throw err;
    }
  }

  async remove(id: number) {
    try {
      await this.findOne(id);

      const product = await this.product.update({
        where: { id },
        data: {
          available: false
        }
      });
      return product;
    } catch (err) {
      throw err;
    }
  }

  async validateProducts(ids: number[]) {
    try {
      const singleIds = Array.from(new Set(ids));

      const products = await this.product.findMany({
        where: {
          id: {
            in: singleIds
          }
        }
      });

      if (products.length !== ids.length) {
        throw new RpcException({
          messsage: 'Some products were not found',
          status: HttpStatus.BAD_REQUEST
        })
      }

      return products;
    } catch (err) {
      throw err;
    }

  }
}
