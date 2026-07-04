// Original file: proto/mermaid_cli.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { GenerateImageRequest as _mermaid_cli_GenerateImageRequest, GenerateImageRequest__Output as _mermaid_cli_GenerateImageRequest__Output } from '../mermaid_cli/GenerateImageRequest';
import type { GenerateImageResponse as _mermaid_cli_GenerateImageResponse, GenerateImageResponse__Output as _mermaid_cli_GenerateImageResponse__Output } from '../mermaid_cli/GenerateImageResponse';

export interface MermaidClient extends grpc.Client {
  generateImage(argument: _mermaid_cli_GenerateImageRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_mermaid_cli_GenerateImageResponse__Output>): grpc.ClientUnaryCall;
  generateImage(argument: _mermaid_cli_GenerateImageRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_mermaid_cli_GenerateImageResponse__Output>): grpc.ClientUnaryCall;
  generateImage(argument: _mermaid_cli_GenerateImageRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_mermaid_cli_GenerateImageResponse__Output>): grpc.ClientUnaryCall;
  generateImage(argument: _mermaid_cli_GenerateImageRequest, callback: grpc.requestCallback<_mermaid_cli_GenerateImageResponse__Output>): grpc.ClientUnaryCall;
  
}

export interface MermaidHandlers extends grpc.UntypedServiceImplementation {
  generateImage: grpc.handleUnaryCall<_mermaid_cli_GenerateImageRequest__Output, _mermaid_cli_GenerateImageResponse>;
  
}

export interface MermaidDefinition extends grpc.ServiceDefinition {
  generateImage: MethodDefinition<_mermaid_cli_GenerateImageRequest, _mermaid_cli_GenerateImageResponse, _mermaid_cli_GenerateImageRequest__Output, _mermaid_cli_GenerateImageResponse__Output>
}
