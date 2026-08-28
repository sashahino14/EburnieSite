import JSZip from "jszip";

function safeFileName(value: string) {
  return String(value || "eburniesite-project")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "eburniesite-project";
}

export async function exportProjectZip(
  html: string,
  filename = "eburniesite-project"
) {
  const zip = new JSZip();

  zip.file("index.html", html);

  zip.file(
    "README.md",
    `# EburnieSite Project

This website was created with EburnieSite.

## Files

- index.html — website source

## Preview

Extract the ZIP file and open index.html in a browser.

The website may require an internet connection if it uses
external resources such as CDNs, fonts, APIs, or remote images.
`
  );

  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: {
      level: 9,
    },
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${safeFileName(filename)}.zip`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}
