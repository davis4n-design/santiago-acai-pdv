$port = 3000
$root = Join-Path $PSScriptRoot "dist"

if (-not (Test-Path $root)) {
    $root = $PSScriptRoot
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Prefixes.Add("http://127.0.0.1:$port/")

try {
    $listener.Start()
    Write-Host "=================================================" -ForegroundColor Cyan
    Write-Host "  SANTIAGO ACAI E CIA - SERVIDOR LOCAL DO CAIXA  " -ForegroundColor Yellow
    Write-Host "=================================================" -ForegroundColor Cyan
    Write-Host "Servidor ativo em: http://localhost:$port/" -ForegroundColor Green
    Write-Host "Pressione Ctrl+C para encerrar." -ForegroundColor Gray
} catch {
    Write-Host "Porta $port em uso ou sem permissao. Tentando abrir navegador..." -ForegroundColor Yellow
}

# Tipos MIME comuns
$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".mjs"  = "application/javascript; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".woff" = "font/woff"
    ".woff2"= "font/woff2"
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $rawUrl = $request.Url.LocalPath
        if ($rawUrl -eq "/" -or [string]::IsNullOrWhiteSpace($rawUrl)) {
            $rawUrl = "/index.html"
        }

        $localPath = Join-Path $root ($rawUrl.TrimStart('/'))
        
        # Se for rota SPA que não existe como arquivo físico, serve o index.html
        if (-not (Test-Path $localPath -PathType Leaf)) {
            $localPath = Join-Path $root "index.html"
        }

        if (Test-Path $localPath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
            $contentType = $mimeTypes[$ext]
            if (-not $contentType) { $contentType = "application/octet-stream" }

            $response.ContentType = $contentType
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            $bytes = [System.IO.File]::ReadAllBytes($localPath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("Arquivo nao encontrado")
            $response.OutputStream.Write($msg, 0, $msg.Length)
        }
        $response.OutputStream.Close()
    } catch {
        # Loop listener catch
    }
}
