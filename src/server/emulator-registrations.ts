import {
  defineLoader,
  defineMutation,
  MutationError,
  type MutationContext,
} from "@sun/ssr";
import { executeDocument } from "@sun/api";
import { AUTH_COOKIE, getCookieValue } from "~/utils/auth";
import {
  GetPresignedDownloadUrlDocument,
  ListKeysDocument,
  type GetPresignedDownloadUrlMutation,
  type GetPresignedDownloadUrlResponse,
  type ListKeysQuery,
} from "~/generated/graphql";

const EMULATOR_BUCKET = "emulator";

/**
 * Loads ROMs for the emulator bucket.
 */
defineLoader({
  pattern: "mame",
  async loader(_params, context) {
    const token = getCookieValue(context?.cookie, AUTH_COOKIE);
    const result = await executeDocument<ListKeysQuery>(
      ListKeysDocument,
      { bucket: EMULATOR_BUCKET, prefix: "" },
      token,
    );
    const keys = result.data?.filestoreQueries?.listKeys;
    const roms = keys ? keys.filter((k) => !k.isDirectory) : null;
    return { roms: roms ?? [] };
  },
});

/**
 * Creates a presigned download URL for an emulator ROM.
 */
defineMutation({
  path: "emulator/get-presigned-download-url",
  async handler(
    body: { key: string },
    context: MutationContext,
  ): Promise<GetPresignedDownloadUrlResponse> {
    if (!body.key || typeof body.key !== "string") {
      throw new MutationError("key required");
    }
    const result = await executeDocument<GetPresignedDownloadUrlMutation>(
      GetPresignedDownloadUrlDocument,
      { input: { bucket: EMULATOR_BUCKET, key: body.key } },
      getCookieValue(context.cookie, AUTH_COOKIE),
    );
    const response = result.data?.filestoreMutations?.getPresignedDownloadUrl;
    if (response == null) {
      throw new MutationError("Failed to generate presigned download URL");
    }
    return response;
  },
});
