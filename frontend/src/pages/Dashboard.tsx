import React, { useState, useEffect } from 'react';
import { apiGetAuth, apiPostAuth } from '../services/client';

interface UserUniversity {
  success: boolean;
  data: {
    user: {
      id: number;
      email: string;
      universityId: number;
      createdAt: string;
    };
    university: {
      id: number;
      name: string;
      country: string;
      domain: string;
    } | null;
  };
  message?: string;
}

const Dashboard: React.FC = () => {
  const [userUniversity, setUserUniversity] = useState<UserUniversity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('cognito_access_token');
        const expAt = Number(localStorage.getItem('cognito_expires_at') || '0');
        if (!token || Date.now() >= expAt) {
          setError('Your session is missing or expired. Please sign in again.');
          setLoading(false);
          return;
        }

        if (import.meta.env.DEV) {
          // Development: use backend API
          const userEmail = localStorage.getItem('userEmail') || 'ali.almuhtaseb@student.manchester.ac.uk';
          const idToken = localStorage.getItem('cognito_id_token') || undefined;
          
          // First authenticate/create user to get user ID
          const authResponse = await apiPostAuth<{success: boolean, data: {user: {id: number}, university: any, isNewUser: boolean}}>(
            '/api/users/authenticate', 
            token, 
            { email: userEmail },
            idToken ? { 'X-Id-Token': idToken } : undefined
          );
          
          // Then get dashboard data using the user ID
          const universityData = await apiGetAuth<UserUniversity>(`/api/users/${authResponse.data.user.id}/dashboard`, token, idToken ? { 'X-Id-Token': idToken } : undefined);
          setUserUniversity(universityData);
        } else {
          // Production: show message that backend is needed
          setUserUniversity({
            success: true,
            data: {
              user: { id: 0, email: '', universityId: 0, createdAt: '' },
              university: null
            },
            message: 'University detection requires backend deployment. Authentication works via Cognito.'
          });
        }

      } catch (err) {
        setError('Network error');
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" aria-label="Loading"></div>
          <p className="mt-2 text-muted small">Loading your dashboard...</p>
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

  return (
    <div className="min-vh-100 py-4" style={{
      background: 'radial-gradient(1200px 600px at 0% 0%, #eef2ff 0%, transparent 60%), radial-gradient(1200px 600px at 100% 0%, #ecfeff 0%, transparent 60%), linear-gradient(180deg,#f8fafc,#f1f5f9)'
    }}>
      <div className="container">
        {/* Header */}
        <div className="mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <h2 className="h4 mb-1">Dashboard</h2>
            <small className="text-muted">Welcome back! Here's your academic overview.</small>
          </div>
          <span className="badge rounded-pill text-bg-primary bg-gradient">Live</span>
        </div>

        {/* User Info Card */}
        <div className="card mb-4 border-0 shadow-sm glass-card hover-lift shimmer-border">
          <div className="card-body">
            <h5 className="card-title h6">Your Profile</h5>
            <div className="row g-3">
              {/* Email */}
              <div className="col-md-6">
                <label className="form-label small text-muted">Email</label>
                <div className="fw-medium">{localStorage.getItem('userEmail') || 'Not available'}</div>
              </div>

              {/* University */}
              <div className="col-md-6">
                <label className="form-label small text-muted">University</label>
                {userUniversity?.data?.university ? (
                  <div>
                    <div className="fw-semibold">{userUniversity.data.university.name}</div>
                    <div className="text-muted small">{userUniversity.data.university.country}</div>
                    <div className="text-muted small">Domain: {userUniversity.data.university.domain}</div>
                  </div>
                ) : (
                  <div>
                    <div className="text-muted">No university assigned</div>
                    <div className="text-muted small">
                      {userUniversity?.message || 'Your email domain could not be matched to a university'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Joined Classes Section */}
        <div className="card mb-4 border-0 shadow-sm glass-card hover-lift">
          <div className="card-body">
            <h5 className="card-title h6">Joined Classes</h5>
            <div className="text-center py-3">
              <div className="mx-auto mb-2" style={{ width: 24, height: 24 }}>
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="fw-semibold">No classes yet</div>
              <div className="text-muted small">You haven't joined any classes yet. Check back when class enrollment is available.</div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="row g-3">
          <div className="col-md-4">
            <div className="card text-center p-3 border-0 shadow-sm glass-card hover-lift">
              <div className="fs-4 fw-bold gradient-text">0</div>
              <div className="text-muted small mt-1">Classes Joined</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center p-3 border-0 shadow-sm glass-card hover-lift">
              <div className="fs-4 fw-bold" style={{color:'#10b981'}}>0</div>
              <div className="text-muted small mt-1">Files Uploaded</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center p-3 border-0 shadow-sm glass-card hover-lift">
              <div className="fs-4 fw-bold" style={{color:'#7c3aed'}}>{userUniversity?.data?.university ? '1' : '0'}</div>
              <div className="text-muted small mt-1">University Assigned</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;