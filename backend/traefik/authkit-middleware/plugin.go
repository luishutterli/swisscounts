package auth_kit_traefik

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"log"
	"net"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"
)

func logInfo(format string, args ...interface{}) {
	log.Printf("[AuthKit Middleware] [INFO] "+format, args...)
}

func logError(format string, args ...interface{}) {
	log.Printf("[AuthKit Middleware] [ERROR] "+format, args...)
}

type Config struct {
	JWTCookieName     string `json:"jwtCookieName"`
	RefreshCookieName string `json:"refreshCookieName"`
	JWTSecret         string `json:"jwtSecret"`
	JWTAlgorithm      string `json:"jwtAlgorithm"`
}

func CreateConfig() *Config {
	return &Config{
		JWTCookieName:     "authkit_token",
		RefreshCookieName: "authkit_refresh",
		JWTSecret:         "supersecretsecret",
		JWTAlgorithm:      "HS256",
	}
}

func substituteEnvVars(value string) string {
	if strings.HasPrefix(value, "${") && strings.HasSuffix(value, "}") {
		envVarName := strings.TrimSuffix(strings.TrimPrefix(value, "${"), "}")
		if envValue := os.Getenv(envVarName); envValue != "" {
			return envValue
		}
		logError("Environment variable not found or empty: %s", envVarName)
	}
	return value
}

func processConfigWithEnvVars(config *Config) {
	config.JWTCookieName = substituteEnvVars(config.JWTCookieName)
	config.RefreshCookieName = substituteEnvVars(config.RefreshCookieName)
	config.JWTSecret = substituteEnvVars(config.JWTSecret)
	config.JWTAlgorithm = substituteEnvVars(config.JWTAlgorithm)
}

type Middleware struct {
	next   http.Handler
	config *Config
	name   string
}

var processedConfig *Config
var once sync.Once

func New(ctx context.Context, next http.Handler, config *Config, name string) (http.Handler, error) {
	logInfo("Initializing AuthKit middleware: %s", name)

	once.Do(func() {
		processedConfig = &Config{}
		*processedConfig = *config
		processConfigWithEnvVars(processedConfig)
	})

	return &Middleware{
		next:   next,
		config: processedConfig,
		name:   name,
	}, nil
}

func (m *Middleware) ServeHTTP(rw http.ResponseWriter, req *http.Request) {
	// Handle preflight requests
	if req.Method == http.MethodOptions {
		m.next.ServeHTTP(rw, req)
		return
	}

	ip := getIP(req)
	req.Header.Set("X-IP", ip)

	jwtCookie, jwtErr := req.Cookie(m.config.JWTCookieName)
	refreshCookie, refreshErr := req.Cookie(m.config.RefreshCookieName)

	if jwtErr == nil {
		if claims, valid := validateJWTAndGetClaims(jwtCookie.Value, m.config.JWTSecret, m.config.JWTAlgorithm); valid {
			setAuthHeaders(req, jwtCookie.Value, claims)
			m.next.ServeHTTP(rw, req)
			return
		} else {
			logError("Invalid JWT token from IP: %s", ip)
		}
	}

	if refreshErr == nil && validateJWT(refreshCookie.Value, m.config.JWTSecret, m.config.JWTAlgorithm) {
		http.Error(rw, "{\"success\": false, \"error\": {\"message\": \"REFRESH\"}}", http.StatusUnauthorized)
		return
	}

	logError("Authentication failed for IP: %s", ip)
	http.Error(rw, "{\"success\": false, \"error\": {\"message\": \"Unauthorized\"}}", http.StatusUnauthorized)
}

func validateJWT(token, secret, expectedAlg string) bool {
	_, valid := validateJWTAndGetClaims(token, secret, expectedAlg)
	return valid
}

func validateJWTAndGetClaims(token, secret, expectedAlg string) (JWTClaims, bool) {
	headerPart, payloadPart, sig, ok := splitToken(token)
	if !ok {
		logError("JWT token format invalid - failed to split token")
		return nil, false
	}

	hdr, ok := parseHeader(headerPart)
	if !ok {
		logError("JWT header parsing failed")
		return nil, false
	}

	if !isAlgSupported(hdr.Alg, expectedAlg) {
		logError("Unsupported JWT algorithm: %s (expected: %s)", hdr.Alg, expectedAlg)
		return nil, false
	}

	if !verifySignatureHS256(headerPart, payloadPart, secret, sig) {
		logError("JWT signature verification failed")
		return nil, false
	}

	claims, ok := parseClaims(payloadPart)
	if !ok {
		logError("JWT claims parsing failed")
		return nil, false
	}

	if !validateTimeClaims(claims, time.Now(), 30) {
		return nil, false
	}

	return claims, true
}

func splitToken(token string) (headerPart, payloadPart string, signature []byte, ok bool) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return "", "", nil, false
	}
	sig, err := base64.RawURLEncoding.DecodeString(parts[2])
	if err != nil {
		return "", "", nil, false
	}
	return parts[0], parts[1], sig, true
}

func decodeB64(s string) ([]byte, bool) {
	b, err := base64.RawURLEncoding.DecodeString(s)
	return b, err == nil
}

type jwtHeader struct {
	Alg string `json:"alg"`
	Typ string `json:"typ"`
}

func parseHeader(headerB64 string) (jwtHeader, bool) {
	b, ok := decodeB64(headerB64)
	if !ok {
		return jwtHeader{}, false
	}
	var h jwtHeader
	if err := json.Unmarshal(b, &h); err != nil {
		return jwtHeader{}, false
	}
	return h, true
}

func isAlgSupported(actual, expected string) bool {
	if expected == "" {
		expected = "HS256"
	}
	return strings.EqualFold(actual, expected) && strings.EqualFold(actual, "HS256")
}

func verifySignatureHS256(headerPart, payloadPart, secret string, sig []byte) bool {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(headerPart + "." + payloadPart))
	expected := mac.Sum(nil)
	return hmac.Equal(sig, expected)
}

type JWTClaims map[string]interface{}

func parseClaims(payloadB64 string) (JWTClaims, bool) {
	b, ok := decodeB64(payloadB64)
	if !ok {
		return nil, false
	}
	var c JWTClaims
	if err := json.Unmarshal(b, &c); err != nil {
		return nil, false
	}
	return c, true
}

func validateTimeClaims(claims JWTClaims, now time.Time, skewSeconds int64) bool {
	nowUnix := now.Unix()

	if nbf, ok := getNumericClaim(claims, "nbf"); ok && nowUnix+skewSeconds < nbf {
		return false
	}

	if exp, ok := getNumericClaim(claims, "exp"); ok && nowUnix-skewSeconds >= exp {
		return false
	}

	return true
}

func getNumericClaim(claims map[string]interface{}, key string) (int64, bool) {
	v, ok := claims[key]
	if !ok {
		return 0, false
	}

	switch t := v.(type) {
	case float64:
		return int64(t), true
	case int64:
		return t, true
	case json.Number:
		if i, err := t.Int64(); err == nil {
			return i, true
		}
	case string:
		if t != "" {
			if i, err := strconv.ParseInt(t, 10, 64); err == nil {
				return i, true
			}
		}
	}
	return 0, false
}

func setAuthHeaders(req *http.Request, token string, claims JWTClaims) {
	req.Header.Set("X-AuthKit-Valid", "true")
	req.Header.Set("X-AuthKit-Token", token)

	if userObj, ok := claims["user"]; ok {
		if userBytes, err := json.Marshal(userObj); err == nil {
			req.Header.Set("X-AuthKit-User", string(userBytes))
		}
	}
}

func getIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		return strings.Split(xff, ",")[0]
	}
	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return ""
	}
	return ip
}
