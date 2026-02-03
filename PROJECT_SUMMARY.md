# Krapper: Technical Scraper Architecture

A high-speed, streaming-based job scraping system designed to extract real-time data from top job boards with maximum efficiency and reliability.

## ️ Scraping Core & Implementation

### 1. **Data Extraction Logic**
- **Multi-Source Targeting**: Implemented a robust extraction engine that prioritizes internal JSON data layers for high accuracy.
- **Resilient Fallbacks**: Integrated secondary extraction from multiple data provider hooks and relevant job posting layers to handle variations in page structure.
- **Deep Data Parsing**: Developed advanced logic to pull not just titles and companies, but also salary snippets, job keys, locations, and formatted job descriptions.

### 2. **High-Performance Streaming**
- **NDJSON Streaming**: Utilized **Node.js Readable Streams** to provide a progressive data flow. Jobs are sent to the frontend as soon as they are parsed from a page, rather than waiting for the entire scrape to finish.
- **Zero-Timeout Architecture**: The streaming approach prevents gateway timeouts even during deep scrapes (multi-page), providing constant feedback through the connection.

### 3. **Proxy & Provider Integration**
- **Scrape.do API**: Core integration with Scrape.do for:
    - **Rotating Residential Proxies**: Bypassing IP-based rate limiting and geoblocking.
    - **Smart Retries**: Automatic handling of request failures at the proxy layer.
    - **Super Proxy Injection**: Capability to use enhanced proxy settings for more difficult scrapes.
- **Headless Handling**: Managed headless browser parameters (`render=false`) for maximum speed while maintaining the option for full browser rendering when needed.

### 4. **Infrastructure & Enforcement**
- **Serverless Quota Management**: Integrated **Upstash Redis** to track user fingerprints and enforce rate limits (3 free trials per 24 hours).
- **Custom API Key Support**: Built a bypass mechanism allowing power users to provide their own Scrape.do tokens, effectively unlocking unlimited scraping through their own credits.
- **Local Credential Processing**: Engineered the system to process custom API keys locally for the session, ensuring they are never stored or logged on our infrastructure.

### 5. **Security & Production Hardening**
- **Bot Counter-Intelligence**: Implemented "poisoning" logic to detect automated scripts targeting our API endpoints without proper session headers/cookies.
- **Information Leakage Prevention**: Stripped all development metadata, internal comments, and temporary scraping artifacts (`raw.html` benchmarks).
- **Payload Optimization**: Minimized data payloads sent over the wire to reduce bandwidth and improve response latency.

---

## � Tech Stack (Scraping Focus)

- **Runtime**: Node.js (Next.js App Router API).
- **HTTP Client**: Axios (Proxy communication).
- **Parser**: Cheerio (High-speed HTML/Script parsing).
- **State/Caching**: Upstash Redis.
- **Authentication**: JWT (Session-based quota tracking).
- **Communication**: Web Streams API (Progressive delivery).
