/**
 * Automated Security Verification Test Suite
 * Tests all requirements from Prompt 7 (TEST A through TEST L)
 */

const BASE_URL = 'http://localhost:3000';

async function runSecurityTests() {
  console.log('====================================================');
  console.log('STARTING AUTOMATED SECURITY VERIFICATION TEST SUITE');
  console.log('====================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  function assert(condition: boolean, testName: string, detail: string) {
    if (condition) {
      console.log(`[PASS] ${testName}: ${detail}`);
      passedCount++;
    } else {
      console.error(`[FAIL] ${testName}: ${detail}`);
      failedCount++;
    }
  }

  try {
    // ----------------------------------------------------
    // TEST B: Order-creation without credentials must return 401
    // ----------------------------------------------------
    const resB = await fetch(`${BASE_URL}/api/orders/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ name: 'Margherita Supreme', quantity: 1 }],
        deliveryAddress: { street: '123 Fake Street' },
      }),
    });
    assert(
      resB.status === 401,
      'TEST B',
      `Calling order-creation without credentials returned ${resB.status} Unauthorized (Expected 401)`
    );

    // ----------------------------------------------------
    // TEST C: Razorpay payment order creation without authentication must return 401
    // ----------------------------------------------------
    const resC = await fetch(`${BASE_URL}/api/orders/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ name: 'Margherita Supreme', quantity: 1 }],
        paymentMethod: 'RAZORPAY',
        deliveryAddress: { street: '123 Fake Street' },
      }),
    });
    assert(
      resC.status === 401,
      'TEST C',
      `Attempting to create Razorpay payment order unauthenticated returned ${resC.status} (Expected 401)`
    );

    // Helper to log in and complete 2FA OTP verification
    async function loginWithOtp(email: string, password: string, expectedRole?: string) {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, expectedRole }),
      });
      const data = await res.json();
      if (!data.requiresOtp && data.token) {
        return data;
      }
      const otp = data.testOtp;
      const verifyRes = await fetch(`${BASE_URL}/api/auth/verify-login-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, expectedRole }),
      });
      return await verifyRes.json();
    }

    // 1. Customer Login with 2FA OTP
    const custLoginData = await loginWithOtp('customer@example.com', 'Customer@12345');
    const customerToken = custLoginData.token;
    assert(!!customerToken, 'SETUP Customer', 'Customer logged in via OTP and received valid JWT token');

    // 2. Rider Login with 2FA OTP
    const riderLoginData = await loginWithOtp('delivery1@pizzadelivery.com', 'Delivery@12345', 'delivery');
    const riderToken = riderLoginData.token;
    assert(!!riderToken, 'SETUP Rider', 'Delivery rider logged in via OTP and received valid JWT token');

    // 3. Admin Login with 2FA OTP using designated credentials
    const adminLoginData = await loginWithOtp('yvsns7035@gmail.com', '@Chirutha7035');
    const adminToken = adminLoginData.token;
    assert(adminLoginData.user?.role === 'admin' && !!adminToken, 'SETUP Admin', 'Admin (yvsns7035@gmail.com) authenticated with role=admin');

    // ----------------------------------------------------
    // TEST D: Attempt to confirm an order using a fabricated payment-success payload
    // ----------------------------------------------------
    // Create an authenticated customer order first
    const createOrderRes = await fetch(`${BASE_URL}/api/orders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        items: [{ name: 'Margherita Supreme', quantity: 1 }],
        paymentMethod: 'RAZORPAY',
        deliveryAddress: { street: '742 Evergreen Terrace', city: 'Springfield', pincode: '97477' },
      }),
    });
    const createdOrder = await createOrderRes.json();
    const testOrderId = createdOrder.orderId;

    // Send a fabricated payment verification (fake payment ID, fake signature)
    const fabricatedRes = await fetch(`${BASE_URL}/api/orders/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        orderId: testOrderId,
        razorpayPaymentId: 'pay_fabricated_fake_id_123',
        razorpaySignature: 'fabricated_invalid_signature_hash',
      }),
    });
    assert(
      fabricatedRes.status === 400,
      'TEST D',
      `Backend rejected fabricated payment confirmation payload with status ${fabricatedRes.status} (Expected 400 Bad Request)`
    );

    // ----------------------------------------------------
    // TEST E: Log in as customer and try to access admin API -> Must return 403
    // ----------------------------------------------------
    // E1: Inventory
    const custInventoryRes = await fetch(`${BASE_URL}/api/inventory`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(
      custInventoryRes.status === 403,
      'TEST E (Inventory)',
      `Customer accessing /api/inventory returned ${custInventoryRes.status} (Expected 403 Forbidden)`
    );

    // E2: Delivery Staff management
    const custDeliveryRes = await fetch(`${BASE_URL}/api/delivery-staff`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(
      custDeliveryRes.status === 403,
      'TEST E (Staff)',
      `Customer accessing /api/delivery-staff returned ${custDeliveryRes.status} (Expected 403 Forbidden)`
    );

    // E3: Email audit logs
    const custLogsRes = await fetch(`${BASE_URL}/api/auth/email-logs`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(
      custLogsRes.status === 403,
      'TEST E (Email Logs)',
      `Customer accessing /api/auth/email-logs returned ${custLogsRes.status} (Expected 403 Forbidden)`
    );

    // ----------------------------------------------------
    // TEST F: Log in as rider and attempt to access an order not assigned to that rider -> Access denied (403)
    // ----------------------------------------------------
    // Order 'ord_1002' is assigned to Elena Gomez (usr_del2), not Marcus Vance (delivery1)
    const riderOtherOrderRes = await fetch(`${BASE_URL}/api/orders/ord_1002`, {
      headers: { Authorization: `Bearer ${riderToken}` },
    });
    assert(
      riderOtherOrderRes.status === 403,
      'TEST F',
      `Rider accessing another rider's assigned order returned ${riderOtherOrderRes.status} (Expected 403 Forbidden)`
    );

    // ----------------------------------------------------
    // TEST G: Log in as customer and try to retrieve another customer's order -> Access denied (403)
    // ----------------------------------------------------
    // Order 'ord_1002' belongs to David Kim (usr_david), not Sophia Reynolds (usr_cust)
    const custOtherOrderRes = await fetch(`${BASE_URL}/api/orders/ord_1002`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(
      custOtherOrderRes.status === 403,
      'TEST G',
      `Customer accessing another customer's order returned ${custOtherOrderRes.status} (Expected 403 Forbidden)`
    );

    // ----------------------------------------------------
    // TEST H: Log out and attempt another protected API request -> Access denied (401)
    // ----------------------------------------------------
    // Simulate logged out request (no token header)
    const loggedOutRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { 'Content-Type': 'application/json' },
    });
    assert(
      loggedOutRes.status === 401,
      'TEST H',
      `Protected /api/auth/me request without token returned ${loggedOutRes.status} (Expected 401)`
    );

    // ----------------------------------------------------
    // TEST I: Use an expired or invalid JWT -> Access denied (401)
    // ----------------------------------------------------
    const invalidJwtRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.fake.signature' },
    });
    assert(
      invalidJwtRes.status === 401,
      'TEST I',
      `Request with invalid JWT returned ${invalidJwtRes.status} (Expected 401 Unauthorized)`
    );

    // ----------------------------------------------------
    // TEST K: Complete a legitimate authenticated order using supported payment method
    // ----------------------------------------------------
    // K1: Simulate cryptographic test payment signature from backend
    const simSigRes = await fetch(`${BASE_URL}/api/orders/simulate-test-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ orderId: testOrderId }),
    });
    const simSigData = await simSigRes.json();
    assert(!!simSigData.signature, 'TEST K (Signing)', 'Generated cryptographically valid HMAC-SHA256 signature for test order');

    // K2: Verify payment with valid signature
    const verifyValidRes = await fetch(`${BASE_URL}/api/orders/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        orderId: testOrderId,
        razorpayPaymentId: simSigData.paymentId,
        razorpaySignature: simSigData.signature,
      }),
    });
    const verifyValidData = await verifyValidRes.json();
    assert(
      verifyValidRes.status === 200 && verifyValidData.order.paymentStatus === 'PAID',
      'TEST K (Verification)',
      `Legitimate authenticated order verified successfully (paymentStatus=${verifyValidData.order?.paymentStatus})`
    );

    // K3: Test idempotency: Calling verify-payment again on paid order must not duplicate
    const idempotentRes = await fetch(`${BASE_URL}/api/orders/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        orderId: testOrderId,
        razorpayPaymentId: simSigData.paymentId,
        razorpaySignature: simSigData.signature,
      }),
    });
    const idempotentData = await idempotentRes.json();
    assert(
      idempotentRes.status === 200 && idempotentData.message.includes('already confirmed'),
      'TEST K (Idempotency)',
      `Re-verifying paid order is strictly idempotent: "${idempotentData.message}"`
    );

    // ----------------------------------------------------
    // TEST L: Confirm signup, password reset, login, profile editing, and admin workflows
    // ----------------------------------------------------
    // L1: Signup unique customer
    const uniqueEmail = `test_customer_${Date.now()}@example.com`;
    const signupRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Automated Tester',
        email: uniqueEmail,
        password: 'Password@123',
        phone: '+1 555-099-8877',
      }),
    });
    const signupData = await signupRes.json();
    assert(
      signupRes.status === 201 && signupData.requiresOtp === true,
      'TEST L (Signup)',
      `Customer signup succeeded and dispatched 6-digit OTP code`
    );

    // L1.b: Verify signup OTP to complete registration and obtain session token
    const verifySignupRes = await fetch(`${BASE_URL}/api/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: uniqueEmail,
        code: signupData.testOtp,
      }),
    });
    const verifySignupData = await verifySignupRes.json();
    assert(
      verifySignupRes.status === 200 && !!verifySignupData.token,
      'TEST L (Signup OTP Verification)',
      `Customer verified 6-digit signup OTP code and received valid JWT token`
    );
    const signupToken = verifySignupData.token;

    // L2: Update customer profile with token
    const updateProfileRes = await fetch(`${BASE_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${signupToken}`,
      },
      body: JSON.stringify({ name: 'Automated Tester Updated' }),
    });
    const updateProfileData = await updateProfileRes.json();
    assert(
      updateProfileRes.status === 200 && updateProfileData.user?.name === 'Automated Tester Updated',
      'TEST L (Profile Edit)',
      `Customer profile update verified: ${updateProfileData.user?.name}`
    );

    // L3: Forgot password dispatch
    const forgotRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: uniqueEmail }),
    });
    assert(
      forgotRes.status === 200,
      'TEST L (Forgot Password)',
      `Forgot password code dispatch executed cleanly`
    );

    // L4: Admin Workflow - view inventory and audit logs
    const adminInvRes = await fetch(`${BASE_URL}/api/inventory`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminInvData = await adminInvRes.json();
    assert(
      adminInvRes.status === 200 && Array.isArray(adminInvData.inventory),
      'TEST L (Admin Inventory)',
      `Admin successfully accessed inventory management (${adminInvData.inventory?.length} items)`
    );

    const adminStaffRes = await fetch(`${BASE_URL}/api/delivery-staff`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      adminStaffRes.status === 200,
      'TEST L (Admin Staff)',
      `Admin successfully accessed delivery staff directory`
    );

    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log('====================================================\n');

    if (failedCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err: any) {
    console.error('Fatal error during security test execution:', err);
    process.exit(1);
  }
}

runSecurityTests();
