/**
 * Domain Information Provider Interface
 * Provides an architectural abstraction for domain age and registration telemetry.
 * If reliable credentials / APIs are not configured, returns "unavailable" explicitly.
 * NEVER fabricates domain age.
 */

import { DomainEvidence } from '../../types/analysis.js';

export interface DomainInfoProvider {
  readonly name: string;
  getDomainInfo(hostname: string): Promise<DomainEvidence>;
}

export class UnavailableDomainInfoProvider implements DomainInfoProvider {
  public readonly name = 'Default Provider (RDAP/WHOIS Unconfigured)';

  public async getDomainInfo(_hostname: string): Promise<DomainEvidence> {
    return {
      age: 'unavailable',
      createdDate: 'unavailable',
      registrar: 'unavailable',
      provider: this.name,
    };
  }
}

// Active provider instance (can be swapped in configuration when API credentials exist)
export const domainInfoProvider: DomainInfoProvider = new UnavailableDomainInfoProvider();
