# Deploy no Oracle Cloud Free Tier

## 1. Criar conta Oracle Cloud
- Acesse https://cloud.oracle.com
- Cadastro gratuito (necessário cartão de crédito para verificação, mas não cobra)
- Escolha região São Paulo (sa-east-1)

## 2. Criar VM (Máquina Virtual)
- Painel Oracle → Compute → Instances → Create Instance
- Nome: `gfm-server`
- Image: **Canonical Ubuntu 22.04** (ou 24.04)
- Shape: **VM.Standard.A1.Flex** (4 OCPUs ARM, 24GB RAM) — GRATUITO
- Add SSH keys: gere uma chave ou use existente
- Boot volume: 200GB (padrão, gratuito)
- Create

## 3. Configurar Firewall (Security List)
- No painel, Networking → Virtual Cloud Networks → VCN
- Adicione **Ingress Rule** para:
  - Porta **22** (SSH) — já deve vir por padrão
  - Porta **80** (HTTP)
  - Porta **443** (HTTPS) — para SSL futuro

## 4. Acessar a VM e preparar

```bash
# Conecte-se via SSH
ssh -i ~/.ssh/sua-chave ubuntu@<IP-DA-VM>

# Instalar Docker
curl -fsSL https://get.docker.com | sudo bash
sudo usermod -aG docker $USER
# Saia e entre novamente (logout + ssh)

# Instalar Docker Compose
sudo apt install -y docker-compose-plugin
```

## 5. Enviar o projeto para a VM

No seu computador local (PowerShell):

```powershell
# No diretório raiz do projeto
# Substitua <IP-DA-VM> pelo IP público da sua VM

# Crie um tar (exclua node_modules, dist etc.)
tar --exclude='node_modules' --exclude='dist' --exclude='.git' --exclude='frontend/node_modules' --exclude='frontend/dist' -czf gfm.tar.gz .

# Envie para VM
scp -i ~/.ssh/sua-chave gfm.tar.gz ubuntu@<IP-DA-VM>:~/

# Conecte na VM e extraia
ssh -i ~/.ssh/sua-chave ubuntu@<IP-DA-VM>
tar -xzf gfm.tar.gz
rm gfm.tar.gz
```

## 6. Configurar e iniciar

```bash
# Copie o .env.production para .env
cp .env.production .env

# Edite o JWT_SECRET com uma chave segura
nano .env
# Coloque uma senha aleatória em JWT_SECRET

# Rode o build e inicie
docker compose up -d --build
```

## 7. Aplicar migrations do banco

```bash
# Execute as migrations para criar as tabelas
docker compose exec backend npx prisma migrate dev --name init

# Popule com dados de teste (opcional)
docker compose exec backend npx prisma db seed
```

## 8. Acessar
- Abra `http://<IP-DA-VM>` no navegador
- Login: `admin@gfm.com` / `admin123`

## 9. (Recomendado) Configurar domínio + SSL

Compre um domínio (ex: `gfm.prefeitura.gov.br`) e aponte o DNS para o IP da VM.

```bash
# Instalar Certbot no host
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d gfm.prefeitura.gov.br
```

Depois edite o `nginx.conf` da frontend para incluir SSL, ou melhor:

**Para produção, use um proxy reverso:**

```bash
# Instale Nginx no host (fora do Docker)
sudo apt install -y nginx

# Configure o proxy
sudo nano /etc/nginx/sites-available/gfm
```

Conteúdo do `/etc/nginx/sites-available/gfm`:

```nginx
server {
    listen 80;
    server_name gfm.prefeitura.gov.br;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 50m;
}
```

```bash
sudo ln -s /etc/nginx/sites-available/gfm /etc/nginx/sites-enabled/
sudo certbot --nginx -d gfm.prefeitura.gov.br
```

## Comandos úteis

```bash
# Ver logs
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend

# Parar
docker compose down

# Atualizar após mudanças no código
docker compose up -d --build

# Backup do banco
docker compose exec postgres pg_dump -U postgres gfm > backup.sql
```

## Arquivos criados para deploy

| Arquivo | Função |
|---------|--------|
| `Dockerfile` | Build da API NestJS |
| `frontend/Dockerfile` | Build do frontend React (nginx) |
| `frontend/nginx.conf` | Proxy reverso (/api/ → backend) |
| `docker-compose.yml` | Orquestração dos containers |
| `.env.production` | Template de variáveis de ambiente |
