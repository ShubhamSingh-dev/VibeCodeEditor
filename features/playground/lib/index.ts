import { TemplateFile, TemplateFolder } from "../types";

export function findFilePath(
  file: TemplateFile,
  folder: TemplateFolder | null,
  pathSoFar: string[] = []
): string | null {
   if (!folder || !folder.items) {
    return null; 
  }
  for (const item of folder.items) {
    if ("folderName" in item) {
      const res = findFilePath(file, item, [...pathSoFar, item.folderName]);
      if (res) return res;
    } else {
      if (
        item.filename === file.filename &&
        item.fileExtension === file.fileExtension
      ) {
        return [
          ...pathSoFar,
          item.filename + (item.fileExtension ? "." + item.fileExtension : ""),
        ].join("/");
      }
    }
  }
  return null;
}

export const generateFileId = (
  file: TemplateFile,
  rootFolder: TemplateFolder
): string => {
  // Find the file's path in the folder structure
  const path = findFilePath(file, rootFolder)?.replace(/^\/+/, "") || "";

  // Handle empty/undefined file extension
  const extension = file.fileExtension?.trim();
  const extensionSuffix = extension ? `.${extension}` : "";

  // Combine path and filename
  return path
    ? `${path}/${file.filename}${extensionSuffix}`
    : `${file.filename}${extensionSuffix}`;
};
