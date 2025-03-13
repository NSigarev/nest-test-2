import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';
import { firstValueFrom, Observable } from "rxjs";

@Injectable()
export class JwtAuthGuard extends AuthGuard('tokenAuthorization') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Skip check on public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      const canActivateResult = super.canActivate(context);

      if (canActivateResult instanceof Observable) {
        return firstValueFrom(canActivateResult).then(() => true);
      } else if (canActivateResult instanceof Promise) {
        return canActivateResult.then(() => true);
      } else {
        return true;
      }
    }
    return super.canActivate(context);
  }
}
