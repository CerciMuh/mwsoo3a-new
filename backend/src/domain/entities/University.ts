// Domain Entity: University
export class University {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly country: string,
    public readonly countryCode: string,
    public readonly domain: string,
    public readonly domains: string[],
    public readonly webPages: string[],
    public readonly stateProvince?: string
  ) {}

  public matchesDomain(emailDomain: string): boolean {
    const lowerEmailDomain = emailDomain.toLowerCase();
    return this.domains.some(domain => {
      const lowerDomain = domain.toLowerCase();
      return lowerEmailDomain === lowerDomain || lowerEmailDomain.endsWith('.' + lowerDomain);
    });
  }

  public getPrimaryWebPage(): string | null {
    return this.webPages[0] || null;
  }

  public static fromData(
    id: number,
    name: string,
    country: string,
    countryCode: string,
    domains: string[],
    webPages: string[],
    stateProvince?: string
  ): University {
    if (!name || !country || !domains || domains.length === 0) {
      throw new Error('Invalid university data: name, country, and domains are required');
    }

    const primaryDomain = domains[0];
    if (!primaryDomain) {
      throw new Error('At least one domain is required');
    }

    return new University(
      id,
      name,
      country,
      countryCode,
      primaryDomain, // Primary domain
      domains,
      webPages,
      stateProvince
    );
  }

  public static create(name: string, country: string, domain: string): Pick<University, 'name' | 'country' | 'domain'> {
    if (!name || !country || !domain) {
      throw new Error('Name, country, and domain are required');
    }

    return {
      name: name.trim(),
      country: country.trim(),
      domain: domain.toLowerCase().trim()
    };
  }
}