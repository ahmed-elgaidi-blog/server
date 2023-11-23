import { InjectModel } from '@nestjs/mongoose';
import { User } from '../user.schema';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { MESSAGES } from '../constants';
import { CreateUserDto } from '../dtos';
import { HashHelper } from 'src/shared/helpers';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(data: CreateUserDto): Promise<User> {
    return await this.createOne(data);
  }

  async findUser(email: string): Promise<User> {
    return await this.findOneByEmail(email);
  }

  async isUserFound(email: string): Promise<boolean> {
    const isUserFound = await this.userModel.findOne({ email }).lean();

    return !!isUserFound;
  }

  private async createOne(data: CreateUserDto): Promise<User> {
    const isUserCreated = await this.userModel.create({
      ...data,
      password: await HashHelper.generateHash(data.password),
    });

    if (!isUserCreated)
      throw new InternalServerErrorException(MESSAGES.CREATION_FAILED);

    return isUserCreated;
  }

  private async findOneByEmail(email: string): Promise<User> {
    const isUserFound = await this.userModel.findOne({ email }).lean();

    if (!isUserFound) throw new NotFoundException(MESSAGES.USER_NOT_FOUND);

    return isUserFound;
  }
}
