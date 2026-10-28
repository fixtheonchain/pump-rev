import path from 'node:path';
import * as grpc from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import protobuf from 'protobufjs';

export const protoFiles = ['trading.proto', 'communities.proto', 'coins.proto'].map(name => path.resolve(__dirname, '..', name));
let loaded: grpc.GrpcObject | undefined;
/** Runtime loading keeps code generation independent of system protoc. */
export function loadPackage(packagePath: string): any {
  loaded ??= grpc.loadPackageDefinition(loadSync(protoFiles, {
    keepCase: false, longs: String, enums: String, defaults: true, oneofs: true,
  }));
  return packagePath.split('.').reduce((value: any, part) => value[part], loaded);
}
let rootPromise: Promise<protobuf.Root> | undefined;
export function getProtoRoot(): Promise<protobuf.Root> { return rootPromise ??= protobuf.load(protoFiles); }
export async function streamCodecs() {
  const root = await getProtoRoot();
  return { WatchRequest: root.lookupType('trading.v1.WatchRequest'), Frame: root.lookupType('trading.v1.Frame') };
}
export { grpc };
