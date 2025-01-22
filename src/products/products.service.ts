import { BadRequestException, HttpCode, HttpStatus, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('ProductService')

  onModuleInit() {
    this.$connect()
    this.logger.log('Database connected');
  }

  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto
    })
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
    })

    if (!data.length) {
      return {
        mesagge: 'No existen registros'
      }
    } else {
      return {
        data: data,
        meta: {
          total: totalPages,
          page: page,
          lastPage: lastPage
        }
      }
    }
  }

  async findOne(id: number) {
    const product = await this.product.findUnique({
      where: { id, available: true },
    });

    if (!product) {
      throw new NotFoundException(`Producto con id #${id} no encontrado`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      const { id: _, ...data } = updateProductDto;

      await this.findOne(id);

      if (updateProductDto.name === "") {
        throw new BadRequestException("El nombre no puede estar vacío")
      };

      return this.product.update({
        where: { id },
        data: data
      });

    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  //TODO
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
      this.logger.error(err);
      throw err;
    }
  }
}
