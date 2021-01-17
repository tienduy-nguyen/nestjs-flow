import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { IPayloadJwt } from './auth.interface';
import { RegisterUserDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthRepository } from './auth.repository';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthRepository)
    private authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  public async validateUser(email: string, password: string) {
    try {
      const user = await this.authRepository.getUserByEmail(email);
      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          return user;
        }
      }
      throw new BadRequestException('Invalids credentials');
    } catch (error) {
      if (error.status === HttpStatus.BAD_REQUEST) {
        throw error;
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  public async registerUser(registerDto: RegisterUserDto) {
    try {
      const userCheck = await this.authRepository.getUserByEmail(
        registerDto.email,
      );
      if (userCheck) {
        throw new ConflictException(
          `User with email: ${registerDto.email} already exists`,
        );
      }
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(registerDto.password, salt);

      const user = await this.authRepository.createUser({
        ...registerDto,
        password: hashPassword,
      });
      return user;
    } catch (error) {
      if (error.status === HttpStatus.CONFLICT) {
        throw error;
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  public getCookieWithToken(payload: IPayloadJwt) {
    const token = this.jwtService.sign(payload);
    return `Authorization=${token};HttpOnly;Path=/;Max-Age=${process.env.JWT_EXPIRATION_TIME}`;
  }
  public clearCookie(res: Response): void {
    const emptyCookie = `Authorization=;HttpOnly;Path=/;Max-Age=0`;
    res.setHeader('Set-Cookie', emptyCookie);
  }
  public setHeader(res: Response, cookie: string): void {
    res.setHeader('Set-Cookie', cookie);
  }
}
