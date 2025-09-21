// Domain Entity: University
export class University {
  public readonly id: number;
  public readonly name: string;
  public readonly country: string;
  public readonly countryCode: string;
  public readonly domain: string;
  public readonly domains: string[];
  public readonly webPages: string[];
  public readonly stateProvince?: string;

  constructor(
    id: number,
    name: string,
    country: string,
    countryCode: string,
    domain: string,
    domains: string[],
    webPages: string[],
    stateProvince?: string
  ) {
    this.id = id;
    this.name = name;
    this.country = country;
    this.countryCode = countryCode;
    this.domain = domain;
    this.domains = domains;
    this.webPages = webPages;
    this.stateProvince = stateProvince;
  }

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

  public getDisplayLocation(): string {
    if (this.stateProvince) {
      return `${this.stateProvince}, ${this.country}`;
    }
    return this.country;
  }

  public static fromApiResponse(data: {
    id: number;
    name: string;
    country: string;
    countryCode?: string;
    domain: string;
    domains?: string[];
    webPages?: string[];
    stateProvince?: string;
  }): University {
    return new University(
      data.id,
      data.name,
      data.country,
      data.countryCode || '',
      data.domain,
      data.domains || [data.domain],
      data.webPages || [],
      data.stateProvince
    );
  }
}