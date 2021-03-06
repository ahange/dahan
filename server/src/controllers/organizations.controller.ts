import { Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { OrganizationsService } from '@services/organizations.service';
import { decamelizeKeys } from 'humps';
import { CaslAbilityFactory } from 'src/modules/casl/casl-ability.factory';
import { JwtAuthGuard } from '../../src/modules/auth/jwt-auth.guard';

@Controller('organizations')
export class OrganizationsController {
  constructor(
    private organizationsService: OrganizationsService,
  ) { }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  async create(@Request() req) {
    const result = await this.organizationsService.fetchUsers(req.user);
    return decamelizeKeys({ users: result });
  }

}
