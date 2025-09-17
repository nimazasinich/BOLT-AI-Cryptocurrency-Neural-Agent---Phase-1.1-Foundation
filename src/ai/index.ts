// AI Core Module Exports
export { XavierInitializer, InitializationMode, InitializationConfig } from './XavierInitializer.js';
export { StableActivations, ActivationConfig } from './StableActivations.js';
export { NetworkArchitectures, LayerConfig, NetworkConfig } from './NetworkArchitectures.js';

// Re-export for convenience
import { XavierInitializer } from './XavierInitializer.js';
import { StableActivations } from './StableActivations.js';
import { NetworkArchitectures } from './NetworkArchitectures.js';

export const AICore = {
  XavierInitializer: XavierInitializer.getInstance(),
  StableActivations: StableActivations.getInstance(),
  NetworkArchitectures: NetworkArchitectures.getInstance()
};