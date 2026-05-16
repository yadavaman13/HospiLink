/**
 * Integration test runner for Super Admin flows.
 * Usage: from `server` folder run `node src/scripts/run_all_tests.js`
 * Requires Node 18+ (global fetch available). Set env vars to override defaults.
 */

const API_BASE = process.env.API_URL || 'http://localhost:3000/api';
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'admin@hospilink.com';
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'Admin123';

async function sendRequest({ method = 'GET', path = '/', token = null, cookie = null, body = null }) {
    const url = `${API_BASE}${path}`;
    const headers = {};
    if (body) headers['Content-Type'] = 'application/json';
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (cookie) headers['Cookie'] = cookie;

    const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });
    let text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch (e) { /* not json */ }
    return { status: res.status, json, text, headers: res.headers };
}

async function main() {
    console.log('Starting integration tests against', API_BASE);

    // 1) Login as super admin
    console.log('\n[1] Logging in as super admin...');
    const loginRes = await sendRequest({ method: 'POST', path: '/auth/login', body: { email: SUPER_ADMIN_EMAIL, password: SUPER_ADMIN_PASSWORD } });
    console.log('Login status:', loginRes.status);
    let token = null;
    let cookie = null;
    if (loginRes.json && (loginRes.json.token || (loginRes.json.data && loginRes.json.data.token))) {
        token = loginRes.json.token || loginRes.json.data.token;
        console.log('Token received (from JSON)');
    } else {
        // try to use set-cookie header
        const setCookie = loginRes.headers.get('set-cookie');
        if (setCookie) {
            cookie = setCookie.split(';')[0];
            console.log('Session cookie obtained');
        } else {
            console.warn('No token or cookie returned by login - subsequent requests may fail');
        }
    }

    // 2) List pending hospitals
    console.log('\n[2] Fetching pending hospitals...');
    const pending = await sendRequest({ path: '/super-admin/hospitals/pending', token, cookie });
    console.log('Pending status:', pending.status);
    console.log('Pending body:', pending.json ? JSON.stringify(pending.json, null, 2) : pending.text);

    const hospitals = (pending.json && pending.json.hospitals) ? pending.json.hospitals : [];

    // 3) Approve first pending hospital (if any)
    if (hospitals.length > 0) {
        const h = hospitals[0];
        const hid = h.hospitalId || h.hospitalId;
        console.log(`\n[3] Approving hospital ${hid} (${h.name || 'no-name'})`);
        const approve = await sendRequest({ method: 'POST', path: `/super-admin/hospitals/${hid}/approve`, token, cookie, body: { reviewNotes: 'Automated approval via test script' } });
        console.log('Approve status:', approve.status);
        console.log('Approve response:', approve.json ? JSON.stringify(approve.json, null, 2) : approve.text);
    } else {
        console.log('No pending hospitals to approve.');
    }

    // 4) Reject second pending hospital (if exists)
    if (hospitals.length > 1) {
        const h2 = hospitals[1];
        const hid2 = h2.hospitalId;
        console.log(`\n[4] Rejecting hospital ${hid2} (${h2.name || 'no-name'})`);
        const reject = await sendRequest({ method: 'POST', path: `/super-admin/hospitals/${hid2}/reject`, token, cookie, body: { reviewNotes: 'Automated rejection via test script: missing docs' } });
        console.log('Reject status:', reject.status);
        console.log('Reject response:', reject.json ? JSON.stringify(reject.json, null, 2) : reject.text);
    } else {
        console.log('No second pending hospital to reject.');
    }

    // 5) Overview
    console.log('\n[5] Fetching overview...');
    const overview = await sendRequest({ path: '/super-admin/overview', token, cookie });
    console.log('Overview status:', overview.status);
    console.log('Overview body:', overview.json ? JSON.stringify(overview.json, null, 2) : overview.text);

    // 6) Fetch hospitals list to verify statuses
    console.log('\n[6] Fetching all hospitals...');
    const allHosp = await sendRequest({ path: '/hospitals', token, cookie });
    console.log('Hospitals status:', allHosp.status);
    console.log('Hospitals body:', allHosp.json ? JSON.stringify(allHosp.json, null, 2) : allHosp.text);

    console.log('\nIntegration tests completed.');
}

main().catch(err => {
    console.error('Test runner error:', err);
    process.exit(1);
});
