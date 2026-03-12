import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { AuthGuard } from '../auth/auth.guard';

//@UseGuards(AuthGuard)
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  findAllPublished() {
    return this.booksService.findAllPublished();
  }

  @UseGuards(AuthGuard)
  @Get('me')
  findMyBooks(@Request() req: any) {
    return this.booksService.findMyBooks(req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Post()
  create(@Request() req: any, @Body() createBookDto: CreateBookDto) {
    return this.booksService.create(req.user.sub, createBookDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.booksService.update(+id, updateBookDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.booksService.remove(+id);
  }
}
