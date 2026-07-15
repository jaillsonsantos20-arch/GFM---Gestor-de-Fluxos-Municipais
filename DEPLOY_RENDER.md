# Deploy no Render.com

## Pré-requisitos
- Conta gratuita em https://render.com (crie com GitHub)
- Seu projeto publicado no GitHub (repositório privado ou público)

## Opção 1: Deploy automático (recomendado)

1. Suba o código para um repositório no GitHub:

```bash
# No diretório raiz do projeto
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/seu-usuario/gfm.git
git push -u origin main
```

2. Acesse https://dashboard.render.com

3. Clique em **New +** → **Blueprint**

4. Conecte seu GitHub e selecione o repositório `gfm`

5. O Render vai ler o `render.yaml` e criar automaticamente:

   | Recurso | Nome | Plano |
   |---------|------|-------|
   | PostgreSQL | `gfm-db` | Free |
   | Web Service | `gfm-backend` | Free |
   | Static Site | `gfm-frontend` | Free |

6. Após o deploy (cerca de 5-10 minutos), clique em **Manual Deploy** → **Deploy latest commit**

## Opção 2: Deploy manual (passo a passo)

### 2.1 Criar o Banco de Dados
1. Dashboard → **New +** → **PostgreSQL**
2. Name: `gfm-db`
3. Region: **São Paulo (sa-east-1)**
4. Plan: **Free**
5. Create
6. Anote a **Internal Connection String** (vai usar no backend)

### 2.2 Criar o Backend (Web Service)
1. Dashboard → **New +** → **Web Service**
2. Connect your GitHub repo
3. Name: `gfm-backend`
4. Region: **São Paulo**
5. Branch: `main`
6. Runtime: **Node**
7. Build Command:
   ```
   npm install && npx prisma generate && npm run build
   ```
8. Start Command:
   ```
   npx prisma migrate deploy && node dist/src/main.js
   ```
9. Plan: **Free**
10. **Advanced** → Environment Variables:

    | Chave | Valor |
    |-------|-------|
    | `DATABASE_URL` | Colar a **Internal Connection String** do PostgreSQL |
    | `JWT_SECRET` | Clicar em **Generate** |
    | `JWT_EXPIRES_IN` | `8h` |

11. Create Web Service

### 2.3 Criar o Frontend (Static Site)
1. Dashboard → **New +** → **Static Site**
2. Connect your GitHub repo
3. Name: `gfm-frontend`
4. Region: **São Paulo**
5. Branch: `main`
6. Root Directory: `frontend`
7. Build Command:
   ```
   npm install && npm run build
   ```
8. Publish Directory: `dist`
9. **Advanced** → Environment Variables:

    | Chave | Valor |
    |-------|-------|
    | `VITE_API_URL` | URL do backend (ex: `https://gfm-backend.onrender.com`) |

10. Create Static Site

### 2.4 Popular o banco (seed)
Após o backend estar "Live", vá ao Dashboard do backend:

1. Abra o Web Service `gfm-backend`
2. **Shell** → Execute:
   ```bash
   npx prisma db seed
   ```

## URLs após o deploy

| Componente | URL |
|-----------|-----|
| Frontend | `https://gfm-frontend.onrender.com` |
| Backend | `https://gfm-backend.onrender.com` |

Login padrão: `admin@gfm.com` / `admin123`

## Atualizar o sistema

Faça `git push` para a branch `main`. O Render faz auto-deploy automaticamente.

## Comandos úteis no Render

- **Logs**: Dashboard do Web Service → **Logs**
- **Shell**: Dashboard → **Shell** (terminal dentro do container)
- **Redeploy manual**: Dashboard → **Manual Deploy** → **Deploy latest commit**

## Dicas para produção

1. **Domínio personalizado**: Compre um domínio e configure em **Settings** → **Custom Domain**
2. **Plano pago**: O plano free "dorme" após 15 min sem uso. Para uso real na prefeitura, upgrade para plano **Starter** (~$7/mês)
3. **Backup**: Dashboard do PostgreSQL → **Backups** → agendamento automático
