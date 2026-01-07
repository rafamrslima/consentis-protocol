import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitAbility } from "@lit-protocol/constants";
import {
  createSiweMessage,
  generateAuthSig,
  LitAccessControlConditionResource,
} from "@lit-protocol/auth-helpers";
import type {
  EvmContractConditions,
  LitResourceAbilityRequest,
} from "@lit-protocol/types";

const LIT_NETWORK_NAME = process.env.NEXT_PUBLIC_LIT_NETWORK || "datil-dev";
// TODO: Replace with deployed ConsentRegistry contract address on Sepolia
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

let litNodeClient: LitNodeClient | null = null;

export async function getLitClient(): Promise<LitNodeClient> {
  if (litNodeClient?.ready) {
    return litNodeClient;
  }

  litNodeClient = new LitNodeClient({
    litNetwork: LIT_NETWORK_NAME as "datil-dev" | "datil-test" | "datil",
    debug: false,
  });

  await litNodeClient.connect();
  return litNodeClient;
}

export async function disconnectLit(): Promise<void> {
  if (litNodeClient) {
    await litNodeClient.disconnect();
    litNodeClient = null;
  }
}

export function buildEvmContractConditions(
  patientAddress: string,
  recordId: string
): EvmContractConditions {
  return [
    {
      contractAddress: CONTRACT_ADDRESS,
      chain: "sepolia",
      functionName: "checkAccess",
      functionParams: [patientAddress, ":userAddress", recordId],
      functionAbi: {
        name: "checkAccess",
        inputs: [
          { name: "patient", type: "address" },
          { name: "researcher", type: "address" },
          { name: "recordId", type: "string" },
        ],
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
      },
      returnValueTest: {
        key: "",
        comparator: "=",
        value: "true",
      },
    },
  ];
}

export interface EncryptResult {
  ciphertext: string;
  dataToEncryptHash: string;
}

export async function encryptFile(
  file: File,
  patientAddress: string,
  recordId: string
): Promise<
  {
    encryptedBlob: Blob;
    evmContractConditions: EvmContractConditions;
  } & EncryptResult
> {
  const client = await getLitClient();
  const evmContractConditions = buildEvmContractConditions(
    patientAddress,
    recordId
  );

  const arrayBuffer = await file.arrayBuffer();
  const fileData = new Uint8Array(arrayBuffer);

  const { ciphertext, dataToEncryptHash } = await client.encrypt({
    evmContractConditions,
    dataToEncrypt: fileData,
  });

  const encryptedBlob = new Blob([ciphertext], {
    type: "application/octet-stream",
  });

  return {
    encryptedBlob,
    evmContractConditions,
    ciphertext,
    dataToEncryptHash,
  };
}

export interface SessionSignature {
  sig: string;
  derivedVia: string;
  signedMessage: string;
  address: string;
}

export async function getSessionSignatures(
  walletClient: {
    account: { address: string };
    signMessage: (args: { message: string }) => Promise<string>;
  },
  resourceId?: string
): Promise<Record<string, SessionSignature>> {
  const client = await getLitClient();
  const address = walletClient.account.address;

  const sessionSigs = await client.getSessionSigs({
    chain: "sepolia",
    expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
    resourceAbilityRequests: [
      {
        resource: new LitAccessControlConditionResource(resourceId || "*"),
        ability: LitAbility.AccessControlConditionDecryption,
      },
    ],
    authNeededCallback: async ({
      uri,
      expiration,
      resourceAbilityRequests,
    }: {
      uri?: string;
      expiration?: string;
      resourceAbilityRequests?: LitResourceAbilityRequest[];
    }) => {
      const toSign = await createSiweMessage({
        uri: uri!,
        expiration: expiration!,
        resources: resourceAbilityRequests,
        walletAddress: address,
        nonce: await client.getLatestBlockhash(),
        litNodeClient: client,
      });

      return generateAuthSig({
        signer: {
          signMessage: async (message: string) => {
            return walletClient.signMessage({ message });
          },
          getAddress: async () => address,
        },
        toSign,
      });
    },
  });

  return sessionSigs as Record<string, SessionSignature>;
}

export async function decryptFile(
  ciphertext: string,
  dataToEncryptHash: string,
  evmContractConditions: EvmContractConditions,
  walletClient: {
    account: { address: string };
    signMessage: (args: { message: string }) => Promise<string>;
  }
): Promise<Uint8Array> {
  const client = await getLitClient();

  const sessionSigs = await getSessionSignatures(walletClient);

  const { decryptedData } = await client.decrypt({
    evmContractConditions,
    ciphertext,
    dataToEncryptHash,
    chain: "sepolia",
    sessionSigs,
  });

  return decryptedData;
}

export function decryptedDataToFile(
  decryptedData: Uint8Array,
  fileName: string,
  mimeType: string = "application/octet-stream"
): File {
  const buffer = decryptedData.buffer.slice(
    decryptedData.byteOffset,
    decryptedData.byteOffset + decryptedData.byteLength
  ) as ArrayBuffer;
  const blob = new Blob([buffer], { type: mimeType });
  return new File([blob], fileName, { type: mimeType });
}
