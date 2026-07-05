import { run } from "@mermaid-js/mermaid-cli";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import type { MermaidHandlers } from "./proto/mermaid_cli/Mermaid";
import pino from "pino";
import type { ProtoGrpcType } from "./proto/mermaid_cli";
import { v4 as uuidv4 } from "uuid";
import path from "node:path";
import fs from "node:fs/promises";
import type { Stats } from "node:fs";

const GRPC_BYTES_MAX = 2 ** 32;

const serverHost = process.env.GRPC_HOST;
const serverPort = process.env.GRPC_PORT;

if (!serverHost || !serverPort) {
  throw new Error(
    "Invalid server host / port combination! Please specify environment variables GRPC_HOST and GRPC_PORT",
  );
}

if (!process.env.TEMP_FOLDER) {
  throw new Error("Missing temp folder path");
}

const tmpFolderPath = path.resolve(process.env.TEMP_FOLDER);
if (!tmpFolderPath) {
  throw new Error("Invalid temp folder path " + process.env.TEMP_FOLDER);
}

const logger = pino({ level: process.env.LOG_LEVEL || "info" });

const handlers: MermaidHandlers = {
  async generate_image(call, callback) {
    const request = call.request;
    const requestId = uuidv4().toString();
    const reqLogger = logger.child({ requestId });
    reqLogger.info({ msg: "Received request", requestId });
    reqLogger.trace({ request });

    if (!call.request.source || call.request.source.length == 0) {
      reqLogger.error({ msg: "Error: empty source" });
      callback({ code: grpc.status.INVALID_ARGUMENT, details: "Empty source" });
      return;
    }

    // Write the source code into a IDed file
    const inputFile = path.resolve(tmpFolderPath, `${requestId}.md`);
    reqLogger.info({ msg: "Writing to temp file", inputFile });

    try {
      // Wrap the input in markdown and save in .md to use the "markdown mode" of mermaid-cli which supports saving to a specified folder
      // Otherwise it always outputs to the CWD and ignores the artefacts argument
      const wrappedInMarkdown = ["```mermaid", call.request.source, "```"].join(
        "\n",
      );
      await fs.writeFile(inputFile, wrappedInMarkdown);
    } catch (e) {
      reqLogger.error({ msg: "Failed to write input file", err: e });
      callback({
        code: grpc.status.INTERNAL,
        details: "Failed to write input file",
      });
      return;
    }

    try {
      reqLogger.info({ msg: "Invoking mermaid-cli", inputFile, tmpFolderPath });
      await run(inputFile, `${requestId}.png`, { artefacts: tmpFolderPath, puppeteerConfig: {
        args: ['--no-sandbox']
      } });
    } catch (e) {
      reqLogger.error({ msg: "Failed to run mermaid-cli", err: e });
      callback({
        code: grpc.status.INTERNAL,
        details: `Failed to run mermaid-cli: ${e instanceof Error ? e.message : e}`,
      });
      return;
    }

    const outputFile = path.resolve(tmpFolderPath, `${requestId}-1.png`);
    reqLogger.info({
      msg: "mermaid-cli finished, finding output file",
      outputFile,
    });

    let statRes: Stats | undefined = undefined;
    try {
      reqLogger.debug({ msg: "stat", outputFile });
      statRes = await fs.stat(outputFile);
      reqLogger.debug({ msg: "stat result", statRes });

      if (statRes.size >= GRPC_BYTES_MAX) {
        reqLogger.error({ msg: "File too large for gRPC byte field", statRes });
        callback({
          code: grpc.status.INTERNAL,
          details: "Output file too large",
        });
        return;
      }
    } catch (e) {
      reqLogger.error({ msg: "Failed to stat file", outputFile, err: e });
      callback({ code: grpc.status.INTERNAL, details: "Failed to stat file" });
      return;
    }

    let buffer: Buffer | undefined = undefined;
    try {
      buffer = await fs.readFile(outputFile);
    } catch (e) {
      reqLogger.error({ msg: "Failed to read file", outputFile, err: e });
      callback({
        code: grpc.status.INTERNAL,
        details: "Failed to read output file",
      });
      return;
    }

    try {
      await fs.rm(inputFile);
      await fs.rm(outputFile);
    } catch (e) {
      reqLogger.error({
        msg: "Failed to delete file",
        inputFile,
        outputFile,
        err: e,
      });
    }

    reqLogger.info({
      msg: "Diagram successfully generated",
      size: statRes.size,
    });

    callback(null, {
      id: requestId,
      imageData: buffer,
    });
  },
};

const packageDefinition = await protoLoader.load("./proto/mermaid_cli.proto", {
  enums: String,
  defaults: true,
});

const proto = grpc.loadPackageDefinition(
  packageDefinition,
) as unknown as ProtoGrpcType;
const server = new grpc.Server();
server.addService(proto.mermaid_cli.Mermaid.service, handlers);

server.bindAsync(
  `${serverHost}:${serverPort}`,
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      logger.error({ msg: "Error occurred", err });
    } else {
      logger.info({ msg: "Server started", serverHost, port, tmpFolderPath });
    }
  },
);
