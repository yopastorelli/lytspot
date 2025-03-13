-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Servico" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "preco_base" REAL NOT NULL,
    "duracao_media_captura" TEXT NOT NULL,
    "duracao_media_tratamento" TEXT NOT NULL,
    "entregaveis" TEXT NOT NULL,
    "possiveis_adicionais" TEXT,
    "valor_deslocamento" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 999,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Servico" ("createdAt", "descricao", "duracao_media_captura", "duracao_media_tratamento", "entregaveis", "id", "nome", "possiveis_adicionais", "preco_base", "updatedAt", "valor_deslocamento") SELECT "createdAt", "descricao", "duracao_media_captura", "duracao_media_tratamento", "entregaveis", "id", "nome", "possiveis_adicionais", "preco_base", "updatedAt", "valor_deslocamento" FROM "Servico";
DROP TABLE "Servico";
ALTER TABLE "new_Servico" RENAME TO "Servico";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
