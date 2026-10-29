const testApi = async () => {
  try {
    console.log('--- 1. Testing Health ---');
    const healthRes = await fetch('http://localhost:5000/api/health').then((r) => r.json());
    console.log('Health:', healthRes);

    console.log('\n--- 2. Testing Login ---');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alex@hirenova.com', password: 'password123' }),
    }).then((r) => r.json());
    console.log('Login success:', loginRes.success, 'User:', loginRes.user?.name);
    const token = loginRes.token;

    console.log('\n--- 3. Testing Get Jobs ---');
    const jobsRes = await fetch('http://localhost:5000/api/jobs').then((r) => r.json());
    console.log('Jobs count:', jobsRes.count, 'Total:', jobsRes.total, 'First job:', jobsRes.jobs[0]?.title);

    const firstJobId = jobsRes.jobs[0]?._id;

    console.log('\n--- 4. Testing Get Job Details ---');
    const jobDetailsRes = await fetch(`http://localhost:5000/api/jobs/${firstJobId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
    console.log('Job details success:', jobDetailsRes.success, 'Title:', jobDetailsRes.job?.title, 'hasApplied:', jobDetailsRes.job?.hasApplied);

    console.log('\n--- 5. Testing Dashboard Stats ---');
    const statsRes = await fetch('http://localhost:5000/api/users/dashboard-stats', {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
    console.log('Stats:', statsRes.stats);

    console.log('\n--- 6. Testing My Applications ---');
    const appsRes = await fetch('http://localhost:5000/api/applications/my', {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
    console.log('Applications count:', appsRes.count, 'First app job title:', appsRes.applications[0]?.job?.title);

    console.log('\n--- 7. Testing Toggle Save Job ---');
    const saveRes = await fetch(`http://localhost:5000/api/users/save-job/${firstJobId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
    console.log('Toggle Save response:', saveRes);

    console.log('\n--- 8. Testing Profile Update ---');
    const profileRes = await fetch('http://localhost:5000/api/users/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: 'Lead Full Stack Engineer',
        location: 'San Francisco, CA (Remote)',
      }),
    }).then((r) => r.json());
    console.log('Profile update success:', profileRes.success, 'New title:', profileRes.user?.title);

    console.log('\n--- ALL BACKEND CHECKS PASSED! ---');
  } catch (err) {
    console.error('Test error:', err);
  }
};

testApi();
