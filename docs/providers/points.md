# Points

## Usage

You can use the points hook anywhere in the application, for example:

```typescript
import { usePoints } from "@/providers/points";

// in a Client component
const { points, poll } = usePoints();

<p>{points}</p> // render the points state (reactive)

poll(); // refresh the points state
```