<div align="center">

# @CKIR.IO/VISIONS

A NestJS microservice monorepo for AI-powered image analysis using locally-hosted Ollama vision models. Supports image description, comparison, and OCR via REST, MCP (Model Context Protocol) JSON-RPC 2.0, and streaming real-time results over Socket.IO.

<br>

![Dashboard](dashboard.png)

<br>

![github](https://img.shields.io/github/release/ehildt/ckir.io-visions?labelColor=333&style=for-the-badge&cacheSeconds=3600&color=b16425&logo=github&logoColor=b16425&logoWidth=40&branch=main)
![github](https://img.shields.io/github/stars/ehildt/ckir.io-visions?labelColor=333&style=for-the-badge&cacheSeconds=3600&color=b16425&logo=github&logoColor=b16425&logoWidth=40&branch=main)
![github](https://img.shields.io/github/license/ehildt/ckir.io-visions?labelColor=333&style=for-the-badge&cacheSeconds=3600&color=b16425&logo=github&logoColor=b16425&logoWidth=40&branch=main)
[![codecov](https://img.shields.io/codecov/c/github/ehildt/ckir.io-visions?labelColor=333&cacheSeconds=3600&logo=codecov&logoColor=4021b0&logoWidth=40&style=for-the-badge&color=4021b0&branch=main)](https://about.codecov.io/)

<br>

</div>

<div align="center">

## What is VISIONS?

**@CKIR.IO/VISIONS** is a horizontally-scalable NestJS microservice that offloads vision analysis to BullMQ workers backed by Redis/KeyDB. It exposes two ingress protocols—REST and MCP—over a single Fastify HTTP server, with real-time results streamed over Socket.IO. A Vue 3 dashboard provides a debug console and user-facing UI.

### Built with AI-Assisted Context Coding, Owned by Humans

This project was developed using **context coding**—a disciplined  [AI-assisted](.wiki/3-ai-assisted-development.md) paradigm where generative tools accelerate boilerplate and exploration while every architectural decision, interface contract, and failure mode is deliberately reviewed, tested, and owned. We believe velocity without ownership accelerates directly into technical insolvency.

<br>

## Contributing & License

Contributions are welcome! Please open an issue first to discuss what you would like to change or add. This project follows [Semantic Versioning](https://semver.org/). Pull requests must pass CI before they can be merged. Distributed under the MIT License. 
See [LICENSE](LICENSE) for more information.

</div>

<br>


<div align="center">

[E-MAIL](mailto:eugen.hildt@gmail.com) · [WIKI](https://github.com/ehildt/ckir.io-visions/wiki) · [ISSUES](https://github.com/ehildt/ckir.io-visions/issues) · [DONATE](https://github.com/sponsors/ehildt)

</div>