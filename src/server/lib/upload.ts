import { v2 as cloudinary } from "cloudinary";
import config from "./config";
import AppError from "./AppError";

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

export type UploadedFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

/** Minimal "request" object handed to services (same shape the Express services used). */
export type ServiceReq = {
  body: any;
  file?: UploadedFile;
  user?: { id: string; name: string; email: string; role: string };
};

const STANDARD_TYPES = /\.(jpg|jpeg|png|webp|gif|pdf|doc|docx|xls|xlsx|ppt|pptx)$/i;
const EDITOR_TYPES = /\.(jpg|jpeg|png|webp|gif|svg|mp4|mov|avi|pdf|doc|docx|xls|xlsx|ppt|pptx)$/i;

export function validateFile(file: UploadedFile, editor = false) {
  const allowed = editor ? EDITOR_TYPES : STANDARD_TYPES;
  if (!allowed.test(file.originalname)) {
    throw new AppError(
      400,
      editor
        ? "Only image, video, and document files are allowed for editor uploads!"
        : "Only image, PDF, and Office document files are allowed!"
    );
  }
  const max = editor ? 20 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > max) {
    throw new AppError(400, `File too large (max ${max / 1024 / 1024}MB)`);
  }
}

const uploadToCloudinary = (file: UploadedFile, resourceType: "image" | "video" | "auto" = "auto") =>
  new Promise<{ secure_url: string; bytes?: number; resource_type?: string; width?: number; height?: number }>(
    (resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: resourceType, folder: resourceType === "image" ? "editor-images" : "documents" },
        (err, result) => {
          if (err) return reject(new Error(`Failed to upload file to Cloudinary: ${err.message}`));
          if (!result) return reject(new Error("Cloudinary upload returned no result"));
          resolve(result);
        }
      );
      stream.end(file.buffer);
    }
  );

const uploadEditorFileToCloudinary = async (file: UploadedFile) => {
  try {
    const result = await uploadToCloudinary(file, "auto");
    return {
      success: 1,
      file: {
        url: result.secure_url,
        size: result.bytes,
        name: file.originalname,
        type: result.resource_type,
        width: result.width,
        height: result.height,
      },
    };
  } catch (error) {
    return { success: 0, message: error instanceof Error ? error.message : "Upload failed" };
  }
};

export const FileUploader = { uploadToCloudinary, uploadEditorFileToCloudinary };
