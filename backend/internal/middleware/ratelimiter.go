package middleware

import (
	"log"
	"net"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"golang.org/x/time/rate"
)

type visitor struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

type RateLimiter struct {
	mu             sync.Mutex
	visitors       map[string]*visitor
	rate           rate.Limit
	burst          int
	cleanup        time.Duration
	ttl            time.Duration
	done           chan struct{}
	trustedProxies []*net.IPNet
}

func NewRateLimiter() *RateLimiter {
	rps := getEnvFloat("RATE_LIMIT_RPS", 10)
	burst := getEnvInt("RATE_LIMIT_BURST", 20)
	cleanupSec := getEnvInt("RATE_LIMIT_CLEANUP_SEC", 60)
	ttlSec := getEnvInt("RATE_LIMIT_TTL_SEC", 180)
	trustedProxies := parseTrustedProxies(os.Getenv("TRUSTED_PROXIES"))

	ratelimiter := &RateLimiter{
		visitors:       make(map[string]*visitor),
		rate:           rate.Limit(rps),
		burst:          burst,
		cleanup:        time.Duration(cleanupSec) * time.Second,
		ttl:            time.Duration(ttlSec) * time.Second,
		done:           make(chan struct{}),
		trustedProxies: trustedProxies,
	}

	go ratelimiter.cleanupLoop()

	log.Printf("Rate limiter initialized: %.1f req/s, burst %d, cleanup every %ds, TTL %ds, trusted proxies: %d",
		rps, burst, cleanupSec, ttlSec, len(trustedProxies))

	return ratelimiter
}

func parseTrustedProxies(raw string) []*net.IPNet {
	if raw == "" {
		return nil
	}

	var nets []*net.IPNet
	for _, entry := range strings.Split(raw, ",") {
		entry = strings.TrimSpace(entry)
		if entry == "" {
			continue
		}

		if !strings.Contains(entry, "/") {
			// Bare IP — convert to single-host CIDR
			ip := net.ParseIP(entry)
			if ip == nil {
				log.Printf("Warning: invalid trusted proxy IP %q, skipping", entry)
				continue
			}
			if ip.To4() != nil {
				entry += "/32"
			} else {
				entry += "/128"
			}
		}

		_, cidr, err := net.ParseCIDR(entry)
		if err != nil {
			log.Printf("Warning: invalid trusted proxy CIDR %q, skipping", entry)
			continue
		}
		nets = append(nets, cidr)
	}
	return nets
}

func (rl *RateLimiter) getVisitor(ip string) *rate.Limiter {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	v, exists := rl.visitors[ip]
	if !exists {
		limiter := rate.NewLimiter(rl.rate, rl.burst)
		rl.visitors[ip] = &visitor{limiter: limiter, lastSeen: time.Now()}
		return limiter
	}

	v.lastSeen = time.Now()
	return v.limiter
}

func (rl *RateLimiter) cleanupLoop() {
	ticker := time.NewTicker(rl.cleanup)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			rl.mu.Lock()
			threshold := time.Now().Add(-rl.ttl)
			for ip, v := range rl.visitors {
				if v.lastSeen.Before(threshold) {
					delete(rl.visitors, ip)
				}
			}
			rl.mu.Unlock()
		case <-rl.done:
			return
		}
	}
}

func (rl *RateLimiter) Stop() {
	close(rl.done)
}

func (rl *RateLimiter) extractIP(r *http.Request) string {
	remoteIP, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		remoteIP = r.RemoteAddr
	}

	if !rl.isTrustedProxy(remoteIP) {
		return remoteIP
	}

	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		if i := strings.Index(xff, ","); i != -1 {
			xff = xff[:i]
		}
		return strings.TrimSpace(xff)
	}

	if xri := r.Header.Get("X-Real-IP"); xri != "" {
		return strings.TrimSpace(xri)
	}

	return remoteIP
}

func (rl *RateLimiter) isTrustedProxy(ip string) bool {
	parsed := net.ParseIP(ip)
	if parsed == nil {
		return false
	}
	for _, cidr := range rl.trustedProxies {
		if cidr.Contains(parsed) {
			return true
		}
	}
	return false
}

func (rl *RateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := rl.extractIP(r)
		limiter := rl.getVisitor(ip)

		if !limiter.Allow() {
			w.Header().Set("Retry-After", "1")
			http.Error(w, "Too many requests. Please try again later.", http.StatusTooManyRequests)
			log.Printf("Rate limit exceeded for IP: %s on %s %s", ip, r.Method, r.URL.Path)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func getEnvInt(key string, fallback int) int {
	val := os.Getenv(key)
	if val == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(val)
	if err != nil {
		log.Printf("Warning: invalid value for %s=%q, using default %d", key, val, fallback)
		return fallback
	}
	return parsed
}

func getEnvFloat(key string, fallback float64) float64 {
	val := os.Getenv(key)
	if val == "" {
		return fallback
	}
	parsed, err := strconv.ParseFloat(val, 64)
	if err != nil {
		log.Printf("Warning: invalid value for %s=%q, using default %.1f", key, val, fallback)
		return fallback
	}
	return parsed
}
