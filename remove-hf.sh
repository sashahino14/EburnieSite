#!/data/data/com.termux/files/usr/bin/bash

set -e

echo "=========================================="
echo " EburnieSite — Suppression de Hugging Face"
echo "=========================================="

echo "[1/8] Vérification du dépôt..."
git status

echo
echo "[2/8] Sauvegarde supplémentaire..."
git branch backup-hf-removal-$(date +%Y%m%d-%H%M%S) 2>/dev/null || true

echo
echo "[3/8] Suppression des dépendances Hugging Face..."
npm uninstall @huggingface/hub @huggingface/inference

echo
echo "[4/8] Nettoyage des variables HF..."
sed -i '/DEFAULT_HF_TOKEN=/d' .env.example 2>/dev/null || true
sed -i '/HF_TOKEN=/d' .env.example 2>/dev/null || true
sed -i '/DEFAULT_HF_TOKEN=/d' .env 2>/dev/null || true
sed -i '/HF_TOKEN=/d' .env 2>/dev/null || true
sed -i '/OAUTH_CLIENT_ID=/d' .env.example 2>/dev/null || true
sed -i '/OAUTH_CLIENT_SECRET=/d' .env.example 2>/dev/null || true
sed -i '/REDIRECT_URI=/d' .env.example 2>/dev/null || true

echo
echo "[5/8] Création du système d'export ZIP..."

npm install jszip

cat > src/utils/exportZip.ts <<'JS'
import JSZip from "jszip";

export async function exportProjectZip(
  html: string,
  prompts: string[] = []
) {
  const zip = new JSZip();

  zip.file("index.html", html);

  if (prompts.length > 0) {
    zip.file("prompts.txt", prompts.join("\n"));
  }

  zip.file(
    "README.md",
    `# EburnieSite Project

This website was created with EburnieSite.

## Files

- index.html — website source
${prompts.length > 0 ? "- prompts.txt — AI prompts used to create the project\n" : ""}
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
  link.download = "eburniesite-project.zip";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}
JS

echo
echo "[6/8] Recherche des références Hugging Face restantes..."

grep -RInE \
"huggingface|HuggingFace|HF_TOKEN|DEFAULT_HF_TOKEN|hf_token|oauth|checkUser|@huggingface" \
src server.js utils .env.example package.json \
--exclude-dir=node_modules \
--exclude-dir=dist \
--exclude-dir=.git \
|| true

echo
echo "=========================================="
echo " Nettoyage automatique principal terminé"
echo "=========================================="

echo
echo "IMPORTANT:"
echo "Le frontend DeployButton/LoadButton doit maintenant être"
echo "remplacé par Export ZIP / Import GitHub."
echo
echo "Vérification TypeScript..."
npm run build

echo
echo "=========================================="
echo " EburnieSite — Build terminé"
echo "=========================================="

git status
