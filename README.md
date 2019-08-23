# nodejs-sockets-monitor

### Install
```bash
# NOTE: Comes with typescript types
npm install nodejs-sockets-monitor
# or
yarn add nodejs-sockets-monitor
```

### Allows subscription to socket stats. Example output and usage:
```typescript
import { subscribeToSocketStats } from 'nodejs-sockets-monitor';

const interval = 1000; // Show updated stats every sec.
subscribeToSocketStats(stats => {
  console.clear();
  console.table(stats);
}, interval);
```
| (index)  | active | close | connect | data | drain | end | error | lookup | ready | timeout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| localhost:5984 | 1  | 34  | 35  | 34  | 33  | 0  | 0  | 35  | 35  | 0 |

### Credits
This codebase is essentially a refactoring of https://github.com/vigneshshanmugam/monitor-sockets