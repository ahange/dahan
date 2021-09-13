import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from '../../services/users.service';
import { OrganizationUser } from '../../entities/organization_user.entity';
import { Organization } from '../../entities/organization.entity';
import { User } from '../../entities/user.entity';
import { UsersController } from 'src/controllers/users.controller';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [OrganizationsModule, TypeOrmModule.forFeature([User, Organization, OrganizationUser])],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
