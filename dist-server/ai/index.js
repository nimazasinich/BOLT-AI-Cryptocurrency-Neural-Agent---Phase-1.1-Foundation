// AI Core Module Exports
export { XavierInitializer, InitializationMode } from './XavierInitializer.js';
export { StableActivations } from './StableActivations.js';
export { NetworkArchitectures } from './NetworkArchitectures.js';
// Re-export for convenience
import { XavierInitializer } from './XavierInitializer.js';
import { StableActivations } from './StableActivations.js';
import { NetworkArchitectures } from './NetworkArchitectures.js';
export const AICore = {
    XavierInitializer: XavierInitializer.getInstance(),
    StableActivations: StableActivations.getInstance(),
    NetworkArchitectures: NetworkArchitectures.getInstance()
};
