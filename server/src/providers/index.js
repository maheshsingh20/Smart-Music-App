import { DummyProvider } from './DummyProvider.js';
import { SpotifyProvider } from './SpotifyProvider.js';
import { JamendoProvider } from './JamendoProvider.js';

const providers = {
  dummy: DummyProvider,
  spotify: SpotifyProvider,
  jamendo: JamendoProvider,
};

let providerInstance = null;

export function getProvider() {
  if (providerInstance) {
    return providerInstance;
  }

  const providerName = process.env.MUSIC_PROVIDER || 'dummy';
  const ProviderClass = providers[providerName];

  if (!ProviderClass) {
    throw new Error(`Unknown music provider: ${providerName}`);
  }

  console.log(`✓ Initializing ${providerName} provider`);
  providerInstance = new ProviderClass();
  return providerInstance;
}
