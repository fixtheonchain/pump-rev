import { Root, type INamespace } from 'protobufjs/light';
import { descriptor } from './descriptor';
// Browser-safe entry point: no filesystem, gRPC or service-internal imports.
const root=Root.fromJSON(descriptor as unknown as INamespace);
export function streamCodecs(){return {WatchRequest:root.lookupType('trading.v1.WatchRequest'),Frame:root.lookupType('trading.v1.Frame')};}
