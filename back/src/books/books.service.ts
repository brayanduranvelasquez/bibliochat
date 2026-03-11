import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createBookDto: CreateBookDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('User profile not found. Cannot create book. Please update your profile first.');
    }

    return this.prisma.book.create({
      data: {
        ...createBookDto,
        authorId: profile.id,
      },
    });
  }

  findAll() {
    return this.prisma.book.findMany({
      include: { author: true },
    });
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { author: true },
    });
    if (!book) throw new NotFoundException(`Book with ID ${id} not found`);
    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    try {
      return await this.prisma.book.update({
        where: { id },
        data: updateBookDto,
      });
    } catch (error) {
      throw new NotFoundException(`Book with ID ${id} not found or update failed`);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.book.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Book with ID ${id} not found or remove failed`);
    }
  }
}
