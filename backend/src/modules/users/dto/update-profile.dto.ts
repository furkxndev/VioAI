import { OmitType } from '@nestjs/swagger';
import { UpdateUserDto } from './update-user.dto';

export class UpdateProfileDto extends OmitType(UpdateUserDto, ['role', 'isActive'] as const) {}
