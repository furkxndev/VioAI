import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators';
import { UserRole } from '../../common/enums';
import { AdminService } from './admin.service';
import { AdminStatsDto } from './dto';

@ApiTags('Admin')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@Controller({ path: 'admin', version: '1' })
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Yönetim paneli özet istatistikleri' })
  getStats(): Promise<AdminStatsDto> {
    return this.adminService.getStats();
  }
}
