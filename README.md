# MCP Nexus

## 專案摘要 (Summary)

本專案 (`mcp-nexus`) 是一個採用 Nx Monorepo 架構的工作空間，旨在開發與管理一系列遵循模型上下文協定 (Model Context Protocol, MCP) 的獨立伺服器。

最終目標是將這些伺服器作為可組合的工具 (composable tools)，讓大型語言模型 (LLM) 能夠串連不同服務，自動化執行複雜的資訊處理任務，例如：從 `hacker-news-mcp-server` 獲取使用者感興趣的新聞，進行整理與總結後，再透過 `hackmd-mcp-server` 將結果儲存為一篇新的 HackMD 筆記。

## 核心問題 (Core Problem)

隨著 LLM 應用場景的擴展，單一的工具或服務已不足以應付複雜的需求。真正的生產力來自於將多個服務串連成自動化工作流。然而，這也帶來了新的挑戰：

1.  **開發與維護成本：** 為每個服務建立獨立的專案 (repository) 會導致大量的重複設定、程式碼複製以及依賴版本不同步的問題。
2.  **程式碼一致性：** 如何確保所有 MCP 伺服器都遵循相同的介面標準、錯誤處理機制與認證邏輯？
3.  **複雜工作流的實現：** 如何讓 LLM 有能力理解並調度多個獨立的服務來完成一個高階目標？

`mcp-nexus` 透過 Monorepo 架構來解決這些問題，提供一個統一的開發、測試與部署環境。

## 技術選型 (Tech Stack)

-   **Monorepo:** [Nx](https://nx.dev/)
-   **框架 (Framework):** [NestJS](https://nestjs.com/)
-   **語言 (Language):** [TypeScript](https://www.typescriptlang.org/)
-   **MCP 整合:** [`@rekog/mcp-nest`](https://www.npmjs.com/package/@rekog/mcp-nest)

## 快速開始 (Getting Started)

### 1. 安裝依賴

```bash
npm install
```

### 2. 啟動開發伺服器

您可以單獨啟動某個 MCP 伺服器，或是一次啟動所有伺服器。

-   **啟動 Hacker News 伺服器:**
    ```bash
    npm run start:hacker-news
    ```

-   **啟動 HackMD 伺服器:**
    ```bash
    npm run start:hackmd
    ```

-   **同時啟動所有伺服器:**
    ```bash
    npm run start:all
    ```

### 3. 檢視 MCP 服務

啟動伺服器後，您可以使用 MCP Inspector 工具來檢視已註冊的工具 (Tools) 與資源 (Resources)。

```bash
npm run mcp:inspect
```

## 架構規劃 (Architectural Plan)

本工作空間將包含兩種類型的專案：應用程式 (apps) 和函式庫 (libs)。

### `apps/` - 應用程式

存放可獨立執行與部署的伺服器。

-   **`hackmd-mcp-server`**
    -   **職責：** 負責管理使用者在 HackMD 中的筆記資料。
    -   **功能：** 提供建立、讀取、更新、列出與搜尋筆記的 MCP APIs。

-   **`hacker-news-mcp-server`**
    -   **職責：** 負責從 Hacker News 等來源獲取資訊。
    -   **功能：** 提供搜尋熱門新聞、根據關鍵字篩選文章等 MCP APIs。

### `libs/` - 共享函式庫

存放跨應用程式共享的程式碼，以確保程式碼的重用性與一致性。

-   **`shared-mcp-core`** (規劃中)
    -   **內容：** 包含所有 MCP 伺服器共通的核心邏輯。例如：MCP 請求/回應的標準介面、統一的錯誤處理、身分驗證中介層 (middleware) 等。
    -   **目的：** 讓所有 `apps` 中的伺服器都能輕鬆遵循 MCP 規範。

-   **`shared-types`** (規劃中)
    -   **內容：** 存放共享的 TypeScript 型別定義，例如：HackMD Note 的結構、Hacker News Article 的結構、API DTOs 等。
    -   **目的：** 確保資料在不同服務間傳遞時的型別安全。

## 開發參考 (Development Reference)

為了方便開發，本專案在 `docs/` 路徑下存放了重要的參考文件，供開發人員或 AI 助理查閱。

-   **`docs/MCP-Nest/`**: 存放 `@rekog/mcp-nest` 套件的完整文件與 `playground` 程式碼範例，是開發 MCP 相關功能時的主要參考。
-   **`docs/HackMD/swagger.json`**: 存放 HackMD 的 OpenAPI (Swagger) 文件，用於了解 HackMD 官方提供的 API 功能。

## License

This project is licensed under the MIT License.