# docprobe

**Local-first markdown link probe with agent-readable reports.**

Built for AI-written READMEs that ship broken relative links. Unlike network-default checkers, DocProbe focuses on **local file targets** first (HTTP optional / no fetch by default).

```bash
npm install && npm run build
npx docprobe . --out ./docprobe-report --fail
```

## License

MIT
