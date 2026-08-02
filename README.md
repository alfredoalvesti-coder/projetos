# Barbearia Singer

Site da Barbearia Singer com login/cadastro de clientes e acesso do administrador da barbearia.

## Stack

- **Backend:** Java 17 + Spring Boot 4 + Spring Security + JWT + JPA
- **Frontend:** Angular 19
- **Banco:** PostgreSQL 16 (Docker Compose)

## Pré-requisitos

- Java 17+
- Node.js 20+
- Docker e Docker Compose (obrigatório para o PostgreSQL)

> Nesta máquina de desenvolvimento, o Docker precisa estar instalado e acessível no PATH antes de subir a API.

## Subir o banco

```bash
docker compose up -d
```

Isso cria o banco `barbearia_singer` com usuário/senha `barbearia`/`barbearia` na porta `5432`.

## Backend (API)

```bash
cd backend
./mvnw spring-boot:run
```

API em `http://localhost:8080`.

### Endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/auth/register` | Não | Cadastro de cliente |
| POST | `/api/auth/login` | Não | Login (cliente ou admin) |
| GET | `/api/auth/me` | Bearer JWT | Dados do usuário logado |
| GET | `/api/servicos` | Não | Lista serviços |
| POST | `/api/servicos` | Admin | Cadastra serviço |
| PUT | `/api/servicos/{id}` | Admin | Edita serviço |
| DELETE | `/api/servicos/{id}` | Admin | Exclui serviço |
| GET | `/api/barbeiros` | Não | Lista barbeiros |
| POST | `/api/barbeiros` | Admin | Cadastra barbeiro |
| PUT | `/api/barbeiros/{id}` | Admin | Edita barbeiro |
| DELETE | `/api/barbeiros/{id}` | Admin | Exclui barbeiro |
| GET | `/api/clientes` | Admin | Lista clientes |
| POST | `/api/clientes` | Admin | Cadastra cliente |
| PUT | `/api/clientes/{id}` | Admin | Edita cliente |
| DELETE | `/api/clientes/{id}` | Admin | Exclui cliente |

### Admin padrão (seed)

Criado automaticamente na primeira subida:

- **E-mail:** `admin@barbeariaSinger.com`
- **Senha:** `admin123`

## Frontend

```bash
cd frontend
npm install
npm start
```

Abra `http://localhost:4200/login`.

- Cliente: aba **Cadastrar** → depois redireciona para `/home`
- Admin: aba **Entrar** com as credenciais acima → `/admin`
- Serviços e barbeiros começam vazios: cadastre em `/admin/servicos` e `/admin/barbeiros`
- Clientes: cadastro público com data de nascimento ou gestão em `/admin/clientes`

## Estrutura

```
projetoBarbearia/
├── docker-compose.yml
├── backend/          # Spring Boot API
└── frontend/         # Angular
```
