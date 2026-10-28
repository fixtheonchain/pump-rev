import {transactionError} from './service-routes';
import { z } from 'zod';
import { type RouteDefinition, type RouteKey, type ErrorEnvelope, errorEnvelope } from './registry';
import { routes } from './routes';

type SchemaInput<T, K extends PropertyKey> = K extends keyof T ? T[K] extends z.ZodType ? z.input<T[K]> : never : never;
type InputField<T, K extends 'params'|'query'|'body'> = K extends keyof T ? undefined extends SchemaInput<T,K> ? {[P in K]?:SchemaInput<T,K>} : {[P in K]:SchemaInput<T,K>} : {[P in K]?:never};
export type RouteInput<T extends RouteDefinition> = InputField<T,'params'> & InputField<T,'query'> & InputField<T,'body'> & {headers?:HeadersInit;signal?:AbortSignal};
export type RouteOutput<T extends RouteDefinition> = z.output<T['response']>;
export class ApiError extends Error {
  constructor(readonly status:number, readonly envelope:ErrorEnvelope) { super(envelope.message); this.name='ApiError'; }
}
export class TransactionApiError extends Error {
  constructor(readonly status:number,readonly envelope:z.infer<typeof transactionError>){super(envelope.data.reason);this.name='TransactionApiError';}
}
export function createClient<const R extends Record<RouteKey,RouteDefinition> = typeof routes>(
  options:{baseUrl:string;token?:string|(()=>string|Promise<string>);apiKey?:string;fetch?:typeof fetch;credentials?:RequestCredentials},
  routeMap:R = routes as unknown as R,
) {
  const transport=options.fetch ?? globalThis.fetch;
  return {
    async request<K extends keyof R & RouteKey>(key:K, input:RouteInput<R[K]>):Promise<RouteOutput<R[K]>> {
      const definition=routeMap[key];
      const [method,pattern]=key.split(' ');
      const params=definition.params?.parse(input.params) as Record<string,unknown> | undefined;
      let pathname=pattern.replace(/\{([^}]+)\}/g,(_match,name:string)=>encodeURIComponent(String(params?.[name])));
      const url=new URL(pathname, options.baseUrl);
      const query=definition.query?.parse(input.query ?? {}) as Record<string,unknown> | undefined;
      for(const [name,value] of Object.entries(query ?? {})) if(value!==undefined) url.searchParams.set(name,String(value));
      const headers=new Headers(input.headers);
      const token=typeof options.token==='function'?await options.token():options.token;
      if(token)headers.set('Authorization',`Bearer ${token}`);
      if(options.apiKey)headers.set('x-api-key',options.apiKey);
      let body:BodyInit|undefined;
      if(definition.body) {
        const parsed=definition.body.parse(input.body) as Record<string,unknown>;
        if(definition.multipart){const form=new FormData();for(const [name,value] of Object.entries(parsed))if(value!==undefined)form.set(name,String(value));body=form;}
        else{headers.set('Content-Type','application/json');body=JSON.stringify(parsed);}
      }
      const response=await transport(url,{method,headers,body,signal:input.signal,credentials:options.credentials});
      const payload:unknown=await response.json();
      if(!response.ok){if(definition.errorStyle==='transaction')throw new TransactionApiError(response.status,transactionError.parse(payload));throw new ApiError(response.status,errorEnvelope.parse(payload));}
      return definition.response.parse(payload) as RouteOutput<R[K]>;
    },
  };
}
