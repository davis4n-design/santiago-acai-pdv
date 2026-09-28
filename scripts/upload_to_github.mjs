import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const token = execSync('"C:\\Program Files\\GitHub CLI\\gh.exe" auth token', { encoding: 'utf8' }).trim();
const OWNER = 'davis4n-design';
const REPO = 'santiago-acai-pdv';
const BRANCH = 'main';

const headers = {
  'Authorization': `Bearer ${token}`,
  'Accept': 'application/vnd.github+json',
  'User-Agent': 'SantiagoPDV-Uploader',
  'X-GitHub-Api-Version': '2022-11-28'
};

async function githubRequest(endpoint, method = 'GET', body = null) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}${endpoint}`;
  const options = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${method} ${endpoint} falhou (${res.status}): ${text}`);
  }
  return res.json();
}

const ignoreList = [
  'node_modules',
  '.git',
  'dist',
  'dist-ssr',
  'scratch',
  '.DS_Store',
  'temp_scripts.json',
  'grupo1.json'
];

function getLocalFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (ignoreList.includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getLocalFiles(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

async function main() {
  console.log(`🚀 Iniciando upload do projeto para https://github.com/${OWNER}/${REPO}...`);

  // 1. Obter SHA do último commit na branch main
  const refData = await githubRequest(`/git/ref/heads/${BRANCH}`);
  const parentCommitSha = refData.object.sha;
  console.log(`📌 Último commit na main: ${parentCommitSha}`);

  const files = getLocalFiles('.');
  console.log(`📦 Total de arquivos a enviar: ${files.length}`);

  // 2. Criar Blobs para cada arquivo
  const treeItems = [];
  for (let i = 0; i < files.length; i++) {
    const filePath = files[i];
    const relPath = path.relative('.', filePath).replace(/\\/g, '/');
    const content = fs.readFileSync(filePath);
    
    // Cria blob base64 para garantir suporte binário e UTF-8
    const base64Content = content.toString('base64');
    const blobRes = await githubRequest('/git/blobs', 'POST', {
      content: base64Content,
      encoding: 'base64'
    });

    // Se for arquivo .bat ou .ps1 ou executável, permissão 100644 (ou 100755 para executável)
    const mode = '100644';
    treeItems.push({
      path: relPath,
      mode: mode,
      type: 'blob',
      sha: blobRes.sha
    });

    process.stdout.write(`\r  [${i + 1}/${files.length}] Enviado: ${relPath.slice(0, 45).padEnd(45)}`);
  }
  console.log('\n✅ Todos os blobs criados com sucesso!');

  // 3. Criar a nova árvore (Tree)
  console.log('🌳 Criando árvore do repositório no GitHub...');
  const newTree = await githubRequest('/git/trees', 'POST', {
    tree: treeItems
  });
  console.log(`✅ Árvore criada: ${newTree.sha}`);

  // 4. Criar o Commit
  console.log('📝 Criando commit oficial...');
  const commit = await githubRequest('/git/commits', 'POST', {
    message: 'feat: upload completo do Santiago Açaí PDV (código, componentes e configs)',
    tree: newTree.sha,
    parents: [parentCommitSha]
  });
  console.log(`✅ Commit criado: ${commit.sha}`);

  // 5. Atualizar a referência HEAD na branch main
  console.log('🔄 Atualizando branch main...');
  await githubRequest(`/git/refs/heads/${BRANCH}`, 'PATCH', {
    sha: commit.sha,
    force: true
  });

  console.log('\n🎉 SUCESSO TOTAL!');
  console.log(`🌐 Repositório disponível em: https://github.com/${OWNER}/${REPO}`);
}

main().catch(err => {
  console.error('\n❌ Erro durante o upload:', err);
  process.exit(1);
});
