package middleware

import (
	"net"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"golang.org/x/time/rate"
)

var dummyHandler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
})

func newTestRateLimiter(r rate.Limit, burst int) *RateLimiter {
	rl := &RateLimiter{
		visitors: make(map[string]*visitor),
		rate:     r,
		burst:    burst,
		cleanup:  time.Minute,
		ttl:      time.Minute,
		done:     make(chan struct{}),
	}
	go rl.cleanupLoop()
	return rl
}

func TestAllowsRequestsWithinLimit(t *testing.T) {
	rl := newTestRateLimiter(10, 10)
	defer rl.Stop()

	handler := rl.Middleware(dummyHandler)

	for i := 0; i < 10; i++ {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/test", nil)
		req.RemoteAddr = "192.168.1.1:12345"
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("request %d: expected status 200, got %d", i+1, rec.Code)
		}
	}
}

func TestBlocksExcessRequests(t *testing.T) {
	rl := newTestRateLimiter(1, 2)
	defer rl.Stop()

	handler := rl.Middleware(dummyHandler)

	allowed := 0
	blocked := 0

	for i := 0; i < 5; i++ {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/test", nil)
		req.RemoteAddr = "192.168.1.1:12345"
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if rec.Code == http.StatusOK {
			allowed++
		} else if rec.Code == http.StatusTooManyRequests {
			blocked++
		}
	}

	if allowed != 2 {
		t.Errorf("expected 2 allowed requests (burst), got %d", allowed)
	}
	if blocked != 3 {
		t.Errorf("expected 3 blocked requests, got %d", blocked)
	}
}

func TestRetryAfterHeader(t *testing.T) {
	rl := newTestRateLimiter(1, 1)
	defer rl.Stop()

	handler := rl.Middleware(dummyHandler)

	// Exhaust the burst
	req := httptest.NewRequest(http.MethodGet, "/api/v1/test", nil)
	req.RemoteAddr = "10.0.0.1:1234"
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	// This request should be rate limited
	req = httptest.NewRequest(http.MethodGet, "/api/v1/test", nil)
	req.RemoteAddr = "10.0.0.1:1234"
	rec = httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusTooManyRequests {
		t.Fatalf("expected status 429, got %d", rec.Code)
	}

	retryAfter := rec.Header().Get("Retry-After")
	if retryAfter != "1" {
		t.Errorf("expected Retry-After header to be '1', got %q", retryAfter)
	}
}

func TestDifferentIPsAreIndependent(t *testing.T) {
	rl := newTestRateLimiter(1, 1)
	defer rl.Stop()

	handler := rl.Middleware(dummyHandler)

	// First IP - should pass
	req1 := httptest.NewRequest(http.MethodGet, "/api/v1/test", nil)
	req1.RemoteAddr = "1.2.3.4:1234"
	rec1 := httptest.NewRecorder()
	handler.ServeHTTP(rec1, req1)

	if rec1.Code != http.StatusOK {
		t.Errorf("first IP: expected status 200, got %d", rec1.Code)
	}

	// Second IP - should also pass even though first IP's burst is exhausted
	req2 := httptest.NewRequest(http.MethodGet, "/api/v1/test", nil)
	req2.RemoteAddr = "5.6.7.8:5678"
	rec2 := httptest.NewRecorder()
	handler.ServeHTTP(rec2, req2)

	if rec2.Code != http.StatusOK {
		t.Errorf("second IP: expected status 200, got %d", rec2.Code)
	}

	// First IP again - should be blocked
	req3 := httptest.NewRequest(http.MethodGet, "/api/v1/test", nil)
	req3.RemoteAddr = "1.2.3.4:1234"
	rec3 := httptest.NewRecorder()
	handler.ServeHTTP(rec3, req3)

	if rec3.Code != http.StatusTooManyRequests {
		t.Errorf("first IP again: expected status 429, got %d", rec3.Code)
	}
}

func newTestRateLimiterWithProxies(r rate.Limit, burst int, proxies []*net.IPNet) *RateLimiter {
	rl := &RateLimiter{
		visitors:       make(map[string]*visitor),
		rate:           r,
		burst:          burst,
		cleanup:        time.Minute,
		ttl:            time.Minute,
		done:           make(chan struct{}),
		trustedProxies: proxies,
	}
	go rl.cleanupLoop()
	return rl
}

func mustParseCIDR(cidr string) *net.IPNet {
	_, n, err := net.ParseCIDR(cidr)
	if err != nil {
		panic(err)
	}
	return n
}

func TestExtractIP_XForwardedForFromTrustedProxy(t *testing.T) {
	rl := newTestRateLimiterWithProxies(10, 10, []*net.IPNet{mustParseCIDR("10.0.0.0/8")})
	defer rl.Stop()

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.RemoteAddr = "10.0.0.1:8080"
	req.Header.Set("X-Forwarded-For", "1.2.3.4, 10.0.0.1")

	ip := rl.extractIP(req)
	if ip != "1.2.3.4" {
		t.Errorf("expected '1.2.3.4', got %q", ip)
	}
}

func TestExtractIP_XForwardedForSingleFromTrustedProxy(t *testing.T) {
	rl := newTestRateLimiterWithProxies(10, 10, []*net.IPNet{mustParseCIDR("10.0.0.0/8")})
	defer rl.Stop()

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.RemoteAddr = "10.0.0.1:8080"
	req.Header.Set("X-Forwarded-For", "9.8.7.6")

	ip := rl.extractIP(req)
	if ip != "9.8.7.6" {
		t.Errorf("expected '9.8.7.6', got %q", ip)
	}
}

func TestExtractIP_XRealIPFromTrustedProxy(t *testing.T) {
	rl := newTestRateLimiterWithProxies(10, 10, []*net.IPNet{mustParseCIDR("10.0.0.0/8")})
	defer rl.Stop()

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.RemoteAddr = "10.0.0.1:8080"
	req.Header.Set("X-Real-IP", "1.2.3.4")

	ip := rl.extractIP(req)
	if ip != "1.2.3.4" {
		t.Errorf("expected '1.2.3.4', got %q", ip)
	}
}

func TestExtractIP_IgnoresHeadersFromUntrustedClient(t *testing.T) {
	rl := newTestRateLimiterWithProxies(10, 10, []*net.IPNet{mustParseCIDR("10.0.0.0/8")})
	defer rl.Stop()

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.RemoteAddr = "192.168.1.1:12345"
	req.Header.Set("X-Forwarded-For", "1.2.3.4")
	req.Header.Set("X-Real-IP", "5.6.7.8")

	ip := rl.extractIP(req)
	if ip != "192.168.1.1" {
		t.Errorf("expected '192.168.1.1' (RemoteAddr), got %q", ip)
	}
}

func TestExtractIP_NoTrustedProxiesIgnoresHeaders(t *testing.T) {
	rl := newTestRateLimiterWithProxies(10, 10, nil)
	defer rl.Stop()

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.RemoteAddr = "192.168.1.1:12345"
	req.Header.Set("X-Forwarded-For", "1.2.3.4")

	ip := rl.extractIP(req)
	if ip != "192.168.1.1" {
		t.Errorf("expected '192.168.1.1' (RemoteAddr), got %q", ip)
	}
}

func TestExtractIP_RemoteAddr(t *testing.T) {
	rl := newTestRateLimiterWithProxies(10, 10, nil)
	defer rl.Stop()

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.RemoteAddr = "192.168.1.1:12345"

	ip := rl.extractIP(req)
	if ip != "192.168.1.1" {
		t.Errorf("expected '192.168.1.1', got %q", ip)
	}
}

func TestCleanupEvictsStaleEntries(t *testing.T) {
	rl := &RateLimiter{
		visitors: make(map[string]*visitor),
		rate:     10,
		burst:    10,
		cleanup:  20 * time.Millisecond,
		ttl:      10 * time.Millisecond,
		done:     make(chan struct{}),
	}
	go rl.cleanupLoop()
	defer rl.Stop()

	// Create a visitor
	rl.getVisitor("1.2.3.4")

	rl.mu.Lock()
	count := len(rl.visitors)
	rl.mu.Unlock()
	if count != 1 {
		t.Fatalf("expected 1 visitor, got %d", count)
	}

	// Wait for cleanup to evict it
	time.Sleep(50 * time.Millisecond)

	rl.mu.Lock()
	count = len(rl.visitors)
	rl.mu.Unlock()
	if count != 0 {
		t.Errorf("expected 0 visitors after cleanup, got %d", count)
	}
}
