# 專案：MCP Nexus

## 摘要 (Summary)

本專案 (`mcp-nexus`) 是一個採用 Nx Monorepo 架構的工作空間，旨在開發與管理一系列遵循模型上下文協定 (Model Context Protocol, MCP) 的獨立伺
服器。  

最終目標是將這些伺服器作為可組合的工具 (composable tools)，讓大型語言模型 (LLM) 能夠串連不同服務，自動化執行複雜的資訊處理任務，例如：從 `hacker-news-mcp-server` 獲取使用者感興趣的新聞，進行整理與總結後，再透過 `hackmd-mcp-server` 將結果儲存為一篇新的 HackMD 筆記。

## 核心問題 (Core Problem)

隨著 LLM 應用場景的擴展，單一的工具或服務已不足以應付複雜的需求。真正的生產力來自於將多個服務串連成自動化工作流。然而，這也帶來了新的挑戰：

1. **開發與維護成本：** 為每個服務建立獨立的專案 (repository) 會導致大量的重複設定、程式碼複製以及依賴版本不同步的問題。  
2. **程式碼一致性：** 如何確保所有 MCP 伺服器都遵循相同的介面標準、錯誤處理機制與認證邏輯？  
3. **複雜工作流的實現：** 如何讓 LLM 有能力理解並調度多個獨立的服務來完成一個高階目標？  

`mcp-nexus` 透過 Monorepo 架構來解決這些問題，提供一個統一的開發、測試與部署環境。

## 架構規劃 (Architectural Plan)

本工作空間將包含兩種類型的專案：應用程式 (apps) 和函式庫 (libs)。

### `apps/` - 應用程式

存放可獨立執行與部署的伺服器。

- **`hackmd-mcp-server`**  
  - **職責：** 負責管理使用者在 HackMD 中的筆記資料。  
  - **功能：** 提供建立、讀取、更新、列出與搜尋筆記的 MCP APIs。  

- **`hacker-news-mcp-server`**  
  - **職責：** 負責從 Hacker News 等來源獲取資訊。  
  - **功能：** 提供搜尋熱門新聞、根據關鍵字篩選文章等 MCP APIs。  

### `libs/` - 共享函式庫

存放跨應用程式共享的程式碼，以確保程式碼的重用性與一致性。

- **`shared-mcp-core`**  
  - **內容：** 包含所有 MCP 伺服器共通的核心邏輯。例如：MCP 請求/回應的標準介面、統一的錯誤處理、身分驗證中介層 (middleware) 等。  
  - **目的：** 讓所有 `apps` 中的伺服器都能輕鬆遵循 MCP 規範。  

- **`shared-types`**  
  - **內容：** 存放共享的 TypeScript 型別定義，例如：HackMD Note 的結構、Hacker News Article 的結構、API DTOs 等。  
  - **目的：** 確保資料在不同服務間傳遞時的型別安全。  

## 技術選型 (Tech Stack)

- **Monorepo:** Nx  
- **框架 (Framework):** NestJS  
- **語言 (Language):** TypeScript  

## 後續規劃 (Next Steps)

1. **初始化 Nx 工作空間：** 建立名為 `mcp-nexus` 的 Nx Workspace。  
2. **遷移專案：** 將現有的 `hackmd-mcp-server` 程式碼遷移至 `apps/hackmd-mcp-server`。  
3. **重構共享邏輯：** 建立 `libs/shared-mcp-core`，並將通用的 MCP 邏輯從 `hackmd-mcp-server` 中抽離出來。  
4. **開發新服務：** 在 `apps/` 中建立 `hacker-news-mcp-server`，並讓它依賴共享函式庫。  
5. **端對端測試：** 設計測試案例，模擬 LLM 調度兩個伺服器完成一個完整的工作流。  

## 開發MCP相關功能參考 (Development Reference)

本專案在 `docs/MCP-Nest` 路徑下存放了一份 `@rekog/mcp-nest` 套件的完整文件與 `playground` 程式碼範例。

**目的：** 為了提供 AI 助理 (例如 Gemini) 一個完整、離線的參考資料庫，使其在開發過程中能夠：

1.  **深入理解套件功能：** 直接查閱官方文件與範例，確保功能的正確使用。
2.  **加速問題排查：** 透過比對 `playground` 中的官方實作，快速定位問題。
3.  **提升開發效率：** 減少因資訊不足而導致的錯誤嘗試。

當需要對 `MCP-Nest` 相關功能進行開發或修改時，AI 助理應優先查閱此路徑下的文件。

## 開發HackMD相關功能參考 (Development Reference)

本專案在 `docs/HackMD/swagger.json` 路徑下存放了一份 HackMD 的 OpenAPI 文件。

**目的：** 為了提供 AI 助理 (例如 Gemini) 一個完整、離線的參考資料庫，使其在開發過程中能夠：

1.  **深入理解HackMD功能：** 直接查閱官方API文件，了解HackMD官方提供什麼樣的API互動。
3.  **提升開發效率：** 減少因資訊不足而導致的錯誤嘗試。

當需要對 `HackMD` 相關功能進行開發或修改時，AI 助理應優先查閱此路徑下的文件。