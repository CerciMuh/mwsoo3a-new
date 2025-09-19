import React, { useState, useEffect } from 'react';
import { apiGet } from '../services/client';

interface University {
  id: number;
  name: string;
  country: string;
  domain: string;
}

const Universities: React.FC = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [filteredUniversities, setFilteredUniversities] = useState<University[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        // Accept both legacy array response and new object shape { universities: University[] }
        const payload = await apiGet<any>('/universities');
        const list: University[] = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.universities)
          ? payload.universities
          : [];
        setUniversities(list);
        setFilteredUniversities(list);
      } catch (err) {
        setError('Network error');
        console.error('Universities fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUniversities();
  }, []);

  useEffect(() => {
    let filtered = universities;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (uni) =>
          uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          uni.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
          uni.domain.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by country
    if (selectedCountry) {
      filtered = filtered.filter((uni) => uni.country === selectedCountry);
    }

    setFilteredUniversities(filtered);
    // Reset to first page on filter change
    setCurrentPage(1);
  }, [universities, searchTerm, selectedCountry]);

  // Get unique countries for filter dropdown
  const countries = Array.from(new Set((universities || []).map((uni) => uni.country))).sort();

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" aria-label="Loading"></div>
          <p className="mt-2 text-muted small">Loading universities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <div className="alert alert-danger" role="alert">
          <h6 className="alert-heading mb-2">Error</h6>
          <p className="mb-0">{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-danger btn-sm mt-3">Retry</button>
        </div>
      </div>
    );
  }

  // Pagination calculations
  const totalItems = filteredUniversities.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const clampedPage = Math.min(currentPage, totalPages);
  const startIdx = (clampedPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalItems);
  const pageItems = filteredUniversities.slice(startIdx, endIdx);

  const goToPage = (p: number) => setCurrentPage(Math.min(Math.max(1, p), totalPages));

  return (
    <div className="min-vh-100 py-4" style={{
      background: 'radial-gradient(1200px 600px at 0% 0%, #eef2ff 0%, transparent 60%), radial-gradient(1200px 600px at 100% 0%, #ecfeff 0%, transparent 60%), linear-gradient(180deg,#f8fafc,#f1f5f9)'
    }}>
      <div className="container">
        {/* Header */}
        <div className="mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <h2 className="h4 mb-1">Universities</h2>
            <small className="text-muted">Browse {universities.length} universities from around the world.</small>
          </div>
          <span className="badge rounded-pill text-bg-primary bg-gradient">New</span>
        </div>

        {/* Search and Filter Controls */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row g-3">
              {/* Search Input */}
              <div className="col-lg-8">
                <label htmlFor="search" className="form-label small text-muted">Search Universities</label>
                <input
                  type="text"
                  id="search"
                  className="form-control form-control-sm"
                  placeholder="Search by name, country, or domain..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Country Filter */}
              <div className="col-lg-4">
                <label htmlFor="country" className="form-label small text-muted">Filter by Country</label>
                <select
                  id="country"
                  className="form-select form-select-sm"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                >
                  <option value="">All Countries</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results count */}
            <div className="mt-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
              <div className="text-muted small">
                Showing {totalItems === 0 ? 0 : startIdx + 1}-{endIdx} of {totalItems} results
                {searchTerm && ` matching "${searchTerm}"`}
                {selectedCountry && ` in ${selectedCountry}`}
              </div>
              <div className="d-flex align-items-center gap-2">
                <label htmlFor="pageSize" className="small text-muted mb-0">Per page</label>
                <select
                  id="pageSize"
                  className="form-select form-select-sm"
                  style={{ width: 90 }}
                  value={pageSize}
                  onChange={(e) => {
                    const v = Number(e.target.value) || 12;
                    setPageSize(v);
                    setCurrentPage(1);
                  }}
                >
                  {[6, 12, 18, 24, 36, 48].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Universities Grid */}
        {filteredUniversities.length === 0 ? (
          <div className="card text-center p-4">
            <div className="mx-auto mb-2" style={{ width: 24, height: 24 }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="fw-semibold">No universities found</div>
            <div className="text-muted small">Try adjusting your search criteria or filters.</div>
          </div>
        ) : (
          <>
          <div className="row g-3">
            {pageItems.map((university) => (
              <div className="col-12 col-md-6 col-lg-4" key={university.id}>
                  <div className="card h-100 border-0 shadow-sm" style={{ transition: 'transform .2s ease, box-shadow .2s ease' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 .5rem 1rem rgba(0,0,0,.08)' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '' }}
                  >
                    <div className="card-body d-flex position-relative">
                    <div className="flex-grow-1">
                      <div className="fw-semibold mb-1">{university.name}</div>
                      <div className="text-muted small d-flex align-items-center mb-1">
                        <svg width="14" height="14" className="me-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {university.country}
                      </div>
                      <div className="text-muted small d-flex align-items-center">
                        <svg width="14" height="14" className="me-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                        </svg>
                        <a
                          href={`http://${university.domain}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-primary text-decoration-none"
                        >
                          {university.domain}
                        </a>
                      </div>
                    </div>
                    <div className="ms-3 d-flex align-items-start">
                      <span className="d-inline-flex align-items-center justify-content-center rounded-circle border" style={{width: 40, height: 40, background: '#f8fafc'}}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16" />
                        </svg>
                      </span>
                    </div>
                    <a className="stretched-link" href={`http://${university.domain}/`} target="_blank" rel="noopener noreferrer" aria-label={`Open ${university.name} website`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <nav className="mt-3" aria-label="Universities pagination">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${clampedPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => goToPage(clampedPage - 1)} aria-label="Previous">&laquo;</button>
                </li>
                {Array.from({ length: totalPages }).slice(
                  Math.max(0, clampedPage - 3),
                  Math.max(0, clampedPage - 3) + Math.min(totalPages, 5)
                ).map((_, idx) => {
                  const pageNum = Math.max(1, clampedPage - 3) + idx;
                  return (
                    <li key={pageNum} className={`page-item ${pageNum === clampedPage ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => goToPage(pageNum)}>{pageNum}</button>
                    </li>
                  );
                })}
                <li className={`page-item ${clampedPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => goToPage(clampedPage + 1)} aria-label="Next">&raquo;</button>
                </li>
              </ul>
            </nav>
          )}
          </>
        )}

      </div>
    </div>
  );
};

export default Universities;