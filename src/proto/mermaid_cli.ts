import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { GenerateImageRequest as _mermaid_cli_GenerateImageRequest, GenerateImageRequest__Output as _mermaid_cli_GenerateImageRequest__Output } from './mermaid_cli/GenerateImageRequest';
import type { GenerateImageResponse as _mermaid_cli_GenerateImageResponse, GenerateImageResponse__Output as _mermaid_cli_GenerateImageResponse__Output } from './mermaid_cli/GenerateImageResponse';
import type { MermaidClient as _mermaid_cli_MermaidClient, MermaidDefinition as _mermaid_cli_MermaidDefinition } from './mermaid_cli/Mermaid';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  mermaid_cli: {
    GenerateImageRequest: MessageTypeDefinition<_mermaid_cli_GenerateImageRequest, _mermaid_cli_GenerateImageRequest__Output>
    GenerateImageResponse: MessageTypeDefinition<_mermaid_cli_GenerateImageResponse, _mermaid_cli_GenerateImageResponse__Output>
    Mermaid: SubtypeConstructor<typeof grpc.Client, _mermaid_cli_MermaidClient> & { service: _mermaid_cli_MermaidDefinition }
  }
}

