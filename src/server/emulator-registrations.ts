import { defineLoader, defineMutation, MutationError, type MutationContext } from "@sun/ssr";
import { executeDocument } from "@sun/api";
import { AUTH_COOKIE, getCookieValue } from "~/utils/auth";
import {
  GetPresignedDownloadUrlDocument,
  ListKeysDocument,
  GetPresignedUploadUrlDocument,
  DeleteFileDocument,
  ListBlogPostsByRemoteObjectsDocument,
  LocateBlogPostDocument,
  CreateBlogPostDocument,
  UpdateBlogPostDocument,
  AddRemoteObjectDocument,
  RemoveRemoteObjectDocument,
  DeleteBlogPostDocument,
  BlogPostTypesDocument,
  type GetPresignedDownloadUrlMutation,
  type GetPresignedDownloadUrlResponse,
  type ListKeysQuery,
  type GetPresignedUploadUrlMutation,
  type GetPresignedUploadUrlResponse,
  type DeleteFileMutation,
  type DeleteFileResponse,
  type ListBlogPostsByRemoteObjectsQuery,
  type LocateBlogPostQuery,
  type CreateBlogPostMutation,
  type UpdateBlogPostMutation,
  type AddRemoteObjectMutation,
  type RemoveRemoteObjectMutation,
  type DeleteBlogPostMutation,
  type BlogPostTypesQuery,
} from "~/generated/graphql";

const EMULATOR_BUCKET = "emulator";
const SAVES_BUCKET = "emulator-saves";

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
    const roms = keys ? keys.filter((k: { isDirectory: boolean }) => !k.isDirectory) : null;
    return { roms: roms ?? [] };
  },
});

/**
 * Loads save states for one ROM.
 */
defineLoader({
  pattern: "saves",
  async loader(params, context) {
    const token = getCookieValue(context?.cookie, AUTH_COOKIE);
    const romKey = params.key as string;
    const prefix = `saves/${romKey}/`;
    const result = await executeDocument<ListKeysQuery>(
      ListKeysDocument,
      { bucket: SAVES_BUCKET, prefix },
      token,
    );
    const keys = result.data?.filestoreQueries?.listKeys;
    const saves = keys
      ? keys.filter((k: { isDirectory: boolean }) => !k.isDirectory)
      : [];
    return { saves };
  },
});

/**
 * Loads blog posts linked to a ROM target.
 */
defineLoader({
  pattern: "notes",
  async loader(params, context) {
    const target = params.target as string;
    if (!target) return { notes: [] };
    const result = await executeDocument<ListBlogPostsByRemoteObjectsQuery>(
      ListBlogPostsByRemoteObjectsDocument,
      { ids: [target] },
      getCookieValue(context?.cookie, AUTH_COOKIE),
    );
    return { notes: result.data?.blogQueries?.listByRemoteObjects ?? [] };
  },
});

/**
 * Loads a single blog post by id.
 */
defineLoader({
  pattern: "notes/:id",
  async loader(params, context) {
    const id = params.id as string;
    if (!id) return null;
    const result = await executeDocument<LocateBlogPostQuery>(
      LocateBlogPostDocument,
      { id },
      getCookieValue(context?.cookie, AUTH_COOKIE),
    );
    return { note: result.data?.blogQueries?.locateBlogPost ?? null };
  },
});

/**
 * Loads a single blog post by id for editing.
 */
defineLoader({
  pattern: "notes/:id/edit",
  async loader(params, context) {
    const id = params.id as string;
    if (!id) return null;
    const result = await executeDocument<LocateBlogPostQuery>(
      LocateBlogPostDocument,
      { id },
      getCookieValue(context?.cookie, AUTH_COOKIE),
    );
    return { note: result.data?.blogQueries?.locateBlogPost ?? null };
  },
});

/**
 * Loads blog post types.
 */
defineLoader({
  pattern: "noteTypes",
  async loader(_params, context) {
    const result = await executeDocument<BlogPostTypesQuery>(
      BlogPostTypesDocument,
      {},
      getCookieValue(context?.cookie, AUTH_COOKIE),
    );
    return { noteTypes: result.data?.blogQueries?.blogPostTypes ?? [] };
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

/**
 * Creates a presigned upload URL for the saves bucket.
 */
defineMutation({
  path: "filestore/get-presigned-upload-url",
  async handler(
    body: { bucket: string; key: string; contentType?: string },
    context: MutationContext,
  ): Promise<GetPresignedUploadUrlResponse> {
    const result = await executeDocument<GetPresignedUploadUrlMutation>(
      GetPresignedUploadUrlDocument,
      {
        input: {
          bucket: body.bucket,
          key: body.key,
          contentType: typeof body.contentType === "string" ? body.contentType : null,
        },
      },
      getCookieValue(context.cookie, AUTH_COOKIE),
    );
    const response = result.data?.filestoreMutations?.getPresignedUploadUrl;
    if (response == null) {
      throw new MutationError("Failed to generate presigned upload URL");
    }
    return response;
  },
});

/**
 * Returns a presigned download URL for any bucket.
 */
defineMutation({
  path: "filestore/get-presigned-download-url",
  async handler(
    body: { bucket: string; key: string },
    context: MutationContext,
  ): Promise<GetPresignedDownloadUrlResponse> {
    const result = await executeDocument<GetPresignedDownloadUrlMutation>(
      GetPresignedDownloadUrlDocument,
      { input: { bucket: body.bucket, key: body.key } },
      getCookieValue(context.cookie, AUTH_COOKIE),
    );
    const response = result.data?.filestoreMutations?.getPresignedDownloadUrl;
    if (response == null) {
      throw new MutationError("Failed to generate presigned download URL");
    }
    return response;
  },
});

/**
 * Deletes a file from a bucket.
 */
defineMutation({
  path: "filestore/delete-file",
  async handler(
    body: { bucket: string; key: string },
    context: MutationContext,
  ): Promise<DeleteFileResponse> {
    const result = await executeDocument<DeleteFileMutation>(
      DeleteFileDocument,
      { input: { bucket: body.bucket, key: body.key } },
      getCookieValue(context.cookie, AUTH_COOKIE),
    );
    const response = result.data?.filestoreMutations?.deleteFile;
    if (response == null) {
      throw new MutationError("Failed to delete file");
    }
    return response;
  },
});

/**
 * Creates a blog post.
 */
defineMutation({
  path: "blog/create",
  async handler(
    body: { title: string; input?: Record<string, unknown> },
    context: MutationContext,
  ) {
    if (typeof body.title !== "string") {
      throw new MutationError("title required");
    }
    const result = await executeDocument<CreateBlogPostMutation>(
      CreateBlogPostDocument,
      {
        title: body.title,
        input: (body.input ?? {}) as never,
      },
      getCookieValue(context.cookie, AUTH_COOKIE),
    );
    const response = result.data?.blogMutations?.createBlogPost;
    if (response == null) {
      throw new MutationError("Failed to create blog post");
    }
    return response;
  },
});

/**
 * Updates a blog post.
 */
defineMutation({
  path: "blog/update",
  async handler(
    body: { id: string; input: Record<string, unknown> },
    context: MutationContext,
  ) {
    if (typeof body.id !== "string") {
      throw new MutationError("id required");
    }
    const result = await executeDocument<UpdateBlogPostMutation>(
      UpdateBlogPostDocument,
      {
        id: body.id,
        input: body.input as never,
      },
      getCookieValue(context.cookie, AUTH_COOKIE),
    );
    const response = result.data?.blogMutations?.updateBlogPost;
    if (response == null) {
      throw new MutationError("Failed to update blog post");
    }
    return response;
  },
});

/**
 * Attaches a remote object to a blog post.
 */
defineMutation({
  path: "blog/add-remote-object",
  async handler(
    body: { postId: string; target: string },
    context: MutationContext,
  ) {
    if (typeof body.postId !== "string" || typeof body.target !== "string") {
      throw new MutationError("Invalid input");
    }
    const result = await executeDocument<AddRemoteObjectMutation>(
      AddRemoteObjectDocument,
      {
        postId: body.postId,
        target: body.target,
      },
      getCookieValue(context.cookie, AUTH_COOKIE),
    );
    const response = result.data?.blogMutations?.addRemoteObject;
    if (response == null) {
      throw new MutationError("Failed to add remote object");
    }
    return response;
  },
});

/**
 * Removes a remote object from a blog post.
 */
defineMutation({
  path: "blog/remove-remote-object",
  async handler(
    body: { postId: string; target: string },
    context: MutationContext,
  ) {
    if (typeof body.postId !== "string" || typeof body.target !== "string") {
      throw new MutationError("Invalid input");
    }
    const result = await executeDocument<RemoveRemoteObjectMutation>(
      RemoveRemoteObjectDocument,
      {
        postId: body.postId,
        target: body.target,
      },
      getCookieValue(context.cookie, AUTH_COOKIE),
    );
    const response = result.data?.blogMutations?.removeRemoteObject;
    if (response == null) {
      throw new MutationError("Failed to remove remote object");
    }
    return response;
  },
});

/**
 * Deletes a blog post.
 */
defineMutation({
  path: "blog/delete",
  async handler(body: { id: string }, context: MutationContext) {
    if (typeof body.id !== "string") {
      throw new MutationError("id required");
    }
    const result = await executeDocument<DeleteBlogPostMutation>(
      DeleteBlogPostDocument,
      {
        id: body.id,
      },
      getCookieValue(context.cookie, AUTH_COOKIE),
    );
    const response = result.data?.blogMutations?.deleteBlogPost;
    if (response == null) {
      throw new MutationError("Failed to delete blog post");
    }
    return response;
  },
});
