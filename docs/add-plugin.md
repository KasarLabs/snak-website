# Steps to submit a new plugin:

- Build your plugin configuration in [data/plugins.ts](../data/plugins.ts).
  The format is the following :

```typescript
const yourPluginName: Plugin {
  id: string;          // Unique identifier for your plugin (UUID)
  name: string;        // Display name of your plugin
  description: string; // Brief description of what your plugin does
  image: string;       // Path to your plugin's logo
  actions: Action[];   // List of actions your plugin supports
}
```

```typescript
interface Action {
  name: string; // Name of the action
  description: string; // Description of what the action does
  parameters?: ActionParameter[]; // Optional list of parameters (if your action needs inputs)
}
```

```typescript
interface ActionParameter {
  name: string; // Name of the parameter
  type: string; // Data type (e.g., "string", "number", "boolean")
  description: string; // Description of what the parameter is for
  required: boolean; // Whether this parameter is mandatory
}
```

- Ensure you assign a unique UUID for your plugin. You can generate one here [v4 UUID Generator](https://www.uuidgenerator.net/version4)
- Upload your plugin's logo to [public/logos/](../public/logos/) with the format being "plugin_name.png".
- Submit a Pull Request titled "feat(plugin): Introducing PluginName" and verify it passes all CI checks.
