FROM node:20-slim

# Instalar dependências necessárias para o Prisma em sistemas slim
RUN apt-get update && apt-get install -y python3 make g++ openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
# Copiamos a pasta prisma primeiro para o comando generate funcionar
COPY prisma ./prisma/ 

RUN npm install
# Gerar o cliente especificamente para o ambiente Linux do container
RUN npx prisma generate

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]