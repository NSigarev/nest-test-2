import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';
import { firstValueFrom, Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('tokenAuthorization') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    // Skip check on public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    try {
      const canActivateResult = await super.canActivate(context);
      if (isPublic) {
        return true;
      }
      if (canActivateResult instanceof Observable) {
        return firstValueFrom(canActivateResult);
      }
      return canActivateResult;
    } catch (e) {
      if (isPublic) {
        return true;
      }
      throw e;
    }
  }
}
