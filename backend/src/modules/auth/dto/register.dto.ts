import { PickType } from '@nestjs/swagger';
import { CreateUserDto } from '../../users/dto';

export class RegisterDto extends PickType(CreateUserDto, ['email', 'password', 'fullName'] as const) {}
