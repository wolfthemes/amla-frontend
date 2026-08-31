// Distinguishes a direct video file (self-hosted mp4/webm/…) from an embed
// link (YouTube/Vimeo/…) — a file can be dropped into a plain <video>, an
// embed needs an <iframe>. Shared by WorkGallery, WorkItemMedia and
// EntryHeader, which each render a work's video meta differently.
export const VIDEO_FILE_PATTERN = /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i;
