import { ERROR_CODES, type ErrorCode } from '@pump/http';
import { status, type ServiceError } from '@grpc/grpc-js';

export class DomainError extends Error {
  constructor(readonly code:ErrorCode, readonly details:{retryAfterMs?:number;degraded_lanes?:string[]}={}) {super(ERROR_CODES[code].summary);}
}
// Function declaration is required for TypeScript 7 control-flow narrowing.
export function fail(code:ErrorCode,details:DomainError['details']={}):never {throw new DomainError(code,details);}
export function upstreamError(error:ServiceError,lane:string):DomainError {
  const domain=error.metadata?.get('error-code')[0];
  if(typeof domain==='string' && domain in ERROR_CODES) return new DomainError(domain as ErrorCode);
  const mapping:Record<number,ErrorCode> = {
    [status.INVALID_ARGUMENT]:'INVALID_ARGUMENT',[status.UNAUTHENTICATED]:'UNAUTHENTICATED',
    [status.PERMISSION_DENIED]:'FORBIDDEN',[status.NOT_FOUND]:'NOT_FOUND',
    [status.ALREADY_EXISTS]:'DUPLICATE_CALLOUT',[status.RESOURCE_EXHAUSTED]:'RATE_LIMITED',
    [status.UNAVAILABLE]:'UPSTREAM_UNAVAILABLE',[status.DEADLINE_EXCEEDED]:'UPSTREAM_UNAVAILABLE',
    [status.FAILED_PRECONDITION]:'INVALID_ARGUMENT',
  };
  const code=mapping[error.code] ?? 'INTERNAL';
  return new DomainError(code,code==='UPSTREAM_UNAVAILABLE'?{degraded_lanes:[lane]}:{});
}
