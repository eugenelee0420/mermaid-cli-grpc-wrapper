// import { run } from "@mermaid-js/mermaid-cli";
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import type { MermaidHandlers } from "./proto/mermaid_cli/Mermaid";
import pino from 'pino';
import type { ProtoGrpcType } from "./proto/mermaid_cli";

const serverHost = process.env.GRPC_HOST;
const serverPort = process.env.GRPC_PORT;

if (!serverHost || !serverPort) {
  throw new Error('Invalid server host / port combination! Please specify environment variables GRPC_HOST and GRPC_PORT');
}

const logger = pino();

const handlers: MermaidHandlers = {
  async generateImage(call, callback) {
    const request = call.request;
    logger.info({msg: 'Received request', request});

    callback(null, {
      id: '101010',
      imageData: 'foo'
    });
  }
}

const packageDefinition = await protoLoader.load('./proto/mermaid_cli.proto', {
  enums: String,
  defaults: true
});

const proto = grpc.loadPackageDefinition(packageDefinition) as unknown as ProtoGrpcType;
const server = new grpc.Server();
server.addService(proto.mermaid_cli.Mermaid.service, handlers);

server.bindAsync(`${serverHost}:${serverPort}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    logger.error({msg: 'Error occurred', err});
  } else {
    logger.info({msg: 'Server started', port});
  }
})


// await run("input", "output.png");