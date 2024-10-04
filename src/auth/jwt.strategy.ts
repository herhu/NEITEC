import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwtSecret'),
    });
  }

  async validate(payload: any) {
    // Find the user based on email in the payload
    const user = await this.usersService.findByEmail(payload.email);
    if (!user) {
      // Throw UnauthorizedException if the user does not exist or JWT is invalid
      throw new UnauthorizedException('Invalid token');
    }

    // Attach the user object to the request
    return { id: user.id, email: user.email, role: user.role };
  }
}
