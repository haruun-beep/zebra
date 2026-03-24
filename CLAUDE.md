# Zebra Landscaping — Claude Instructions

## After every git push

Always output the PR link immediately after pushing:

```
https://github.com/haruun-beep/zebra/compare/BRANCH_NAME?expand=1
```

Replace `BRANCH_NAME` with the actual branch that was pushed. This lets the user open a PR without having to ask.
