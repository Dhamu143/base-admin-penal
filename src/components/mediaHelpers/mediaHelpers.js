// utils/mediaHelpers.js
export const getVideoDuration = (file) =>
  new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => resolve(video.duration);
    video.src = URL.createObjectURL(file);
  });

export const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "application/pdf",
  "video/mp4",
];

export const maxImageSize = 5 * 1024 * 1024; // 5MB
export const maxVideoDuration = 30; // seconds
