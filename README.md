# nodejs-sockets-monitor

### Install
```bash
# NOTE: Comes with typescript types
npm install nodejs-sockets-monitor
# or
yarn add nodejs-sockets-monitor
```

### Allows subscription to socket stats. Example usage:

```typescript
import { subscribeToSocketStats } from 'nodejs-sockets-monitor';

const interval = 1000; // Show updated stats every sec.
subscribeToSocketStats(stats => {
  console.clear();
  console.table(stats);
}, interval);
```

### Credits
This codebase is essentially a refactoring of https://github.com/vigneshshanmugam/monitor-sockets