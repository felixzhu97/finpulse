package application

import (
	"context"
	"errors"
	"testing"

	"finpulse/server-go/internal/domain"
)

type mockAuthRepo struct {
	creds      map[string]struct{ hash string }
	sessions   map[string]string
	customerID string
}

func (m *mockAuthRepo) GetCredentialByEmail(ctx context.Context, email string) (customerID, passwordHash string, found bool, err error) {
	if cred, ok := m.creds[email]; ok {
		return m.customerID, cred.hash, true, nil
	}
	return "", "", false, nil
}

func (m *mockAuthRepo) AddCredential(ctx context.Context, customerID, email, passwordHash string) error {
	if m.creds == nil {
		m.creds = make(map[string]struct{ hash string })
	}
	m.creds[email] = struct{ hash string }{hash: passwordHash}
	m.customerID = customerID
	return nil
}

func (m *mockAuthRepo) CreateSession(ctx context.Context, customerID string) (token string, err error) {
	token = "test-token-" + customerID
	if m.sessions == nil {
		m.sessions = make(map[string]string)
	}
	m.sessions[token] = customerID
	return token, nil
}

func (m *mockAuthRepo) GetCustomerIDByToken(ctx context.Context, token string) (customerID string, found bool, err error) {
	if cid, ok := m.sessions[token]; ok {
		return cid, true, nil
	}
	return "", false, nil
}

func (m *mockAuthRepo) DeleteSessionByToken(ctx context.Context, token string) error {
	delete(m.sessions, token)
	return nil
}

func (m *mockAuthRepo) UpdatePasswordHash(ctx context.Context, customerID, passwordHash string) error {
	return nil
}

type mockCustomerRepo struct {
	customers map[string]*domain.Customer
}

func (m *mockCustomerRepo) List(ctx context.Context, limit, offset int) ([]domain.Customer, error) {
	return nil, nil
}

func (m *mockCustomerRepo) GetByID(ctx context.Context, customerID string) (*domain.Customer, error) {
	if c, ok := m.customers[customerID]; ok {
		return c, nil
	}
	return nil, nil
}

func (m *mockCustomerRepo) Insert(ctx context.Context, name string, email *string, kycStatus *string) (*domain.Customer, error) {
	if m.customers == nil {
		m.customers = make(map[string]*domain.Customer)
	}
	c := &domain.Customer{
		CustomerID: "new-customer-id",
		Name:      name,
		Email:     email,
		KYCStatus: kycStatus,
	}
	m.customers[c.CustomerID] = c
	return c, nil
}

func (m *mockCustomerRepo) Add(ctx context.Context, c *domain.Customer) (*domain.Customer, error) {
	if m.customers == nil {
		m.customers = make(map[string]*domain.Customer)
	}
	m.customers[c.CustomerID] = c
	return c, nil
}

func (m *mockCustomerRepo) AddMany(ctx context.Context, entities []domain.Customer) ([]domain.Customer, error) {
	if m.customers == nil {
		m.customers = make(map[string]*domain.Customer)
	}
	for i := range entities {
		m.customers[entities[i].CustomerID] = &entities[i]
	}
	return entities, nil
}

func (m *mockCustomerRepo) Save(ctx context.Context, c *domain.Customer) (*domain.Customer, error) {
	if m.customers == nil {
		m.customers = make(map[string]*domain.Customer)
	}
	m.customers[c.CustomerID] = c
	return c, nil
}

func (m *mockCustomerRepo) Remove(ctx context.Context, customerID string) (bool, error) {
	delete(m.customers, customerID)
	return true, nil
}

type mockHasher struct {
	hashes map[string]string
}

func (m *mockHasher) Hash(password string) (string, error) {
	hash := "hashed-" + password
	if m.hashes == nil {
		m.hashes = make(map[string]string)
	}
	m.hashes[password] = hash
	return hash, nil
}

func (m *mockHasher) Verify(plain, hashed string) bool {
	return hashed == "hashed-"+plain || hashed == m.hashes[plain]
}

func TestNormalizeEmail(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"test@example.com", "test@example.com"},
		{"  Test@Example.COM  ", "test@example.com"},
		{"UPPERCASE@TEST.ORG", "uppercase@test.org"},
		{"  spaced@email.com", "spaced@email.com"},
		{"", ""},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			got := normalizeEmail(tt.input)
			if got != tt.expected {
				t.Errorf("normalizeEmail(%q) = %q; want %q", tt.input, got, tt.expected)
			}
		})
	}
}

func TestAuthService_Login(t *testing.T) {
	t.Run("successful login", func(t *testing.T) {
		authRepo := &mockAuthRepo{
			creds:      map[string]struct{ hash string }{},
			customerID: "cust-123",
		}
		authRepo.creds["test@example.com"] = struct{ hash string }{hash: "hashed-password"}
		customerRepo := &mockCustomerRepo{
			customers: map[string]*domain.Customer{
				"cust-123": {CustomerID: "cust-123", Name: "Test User", Email: strPtr("test@example.com")},
			},
		}
		hasher := &mockHasher{}
		svc := NewAuthService(authRepo, customerRepo, hasher)

		resp, err := svc.Login(context.Background(), domain.LoginRequest{
			Email:    "test@example.com",
			Password: "password",
		})

		if err != nil {
			t.Fatalf("Login() error = %v; want nil", err)
		}
		if resp.Customer.CustomerID != "cust-123" {
			t.Errorf("CustomerID = %q; want cust-123", resp.Customer.CustomerID)
		}
		if resp.Token == "" {
			t.Error("Token is empty")
		}
	})

	t.Run("invalid credentials - wrong password", func(t *testing.T) {
		authRepo := &mockAuthRepo{
			creds:      map[string]struct{ hash string }{},
			customerID: "cust-123",
		}
		authRepo.creds["test@example.com"] = struct{ hash string }{hash: "hashed-wrong"}
		customerRepo := &mockCustomerRepo{}
		hasher := &mockHasher{}
		svc := NewAuthService(authRepo, customerRepo, hasher)

		_, err := svc.Login(context.Background(), domain.LoginRequest{
			Email:    "test@example.com",
			Password: "password",
		})

		if !errors.Is(err, ErrInvalidCredentials) {
			t.Errorf("Login() error = %v; want ErrInvalidCredentials", err)
		}
	})

	t.Run("invalid credentials - email not found", func(t *testing.T) {
		authRepo := &mockAuthRepo{}
		customerRepo := &mockCustomerRepo{}
		hasher := &mockHasher{}
		svc := NewAuthService(authRepo, customerRepo, hasher)

		_, err := svc.Login(context.Background(), domain.LoginRequest{
			Email:    "nonexistent@example.com",
			Password: "password",
		})

		if !errors.Is(err, ErrInvalidCredentials) {
			t.Errorf("Login() error = %v; want ErrInvalidCredentials", err)
		}
	})
}

func TestAuthService_Register(t *testing.T) {
	t.Run("successful registration", func(t *testing.T) {
		authRepo := &mockAuthRepo{}
		customerRepo := &mockCustomerRepo{}
		hasher := &mockHasher{}
		svc := NewAuthService(authRepo, customerRepo, hasher)

		resp, err := svc.Register(context.Background(), domain.RegisterRequest{
			Name:     "New User",
			Email:    "new@example.com",
			Password: "password123",
		})

		if err != nil {
			t.Fatalf("Register() error = %v; want nil", err)
		}
		if resp.Customer.Name != "New User" {
			t.Errorf("Name = %q; want New User", resp.Customer.Name)
		}
		if resp.Token == "" {
			t.Error("Token is empty")
		}
	})

	t.Run("duplicate email", func(t *testing.T) {
		authRepo := &mockAuthRepo{}
		authRepo.creds = map[string]struct{ hash string }{}
		authRepo.creds["existing@example.com"] = struct{ hash string }{hash: "somehash"}
		customerRepo := &mockCustomerRepo{}
		hasher := &mockHasher{}
		svc := NewAuthService(authRepo, customerRepo, hasher)

		_, err := svc.Register(context.Background(), domain.RegisterRequest{
			Name:     "Duplicate User",
			Email:    "existing@example.com",
			Password: "password",
		})

		if !errors.Is(err, ErrEmailAlreadyRegistered) {
			t.Errorf("Register() error = %v; want ErrEmailAlreadyRegistered", err)
		}
	})
}

func TestAuthService_GetCustomerByToken(t *testing.T) {
	t.Run("valid token", func(t *testing.T) {
		authRepo := &mockAuthRepo{
			sessions:   map[string]string{"valid-token": "cust-123"},
			customerID: "cust-123",
		}
		customerRepo := &mockCustomerRepo{
			customers: map[string]*domain.Customer{
				"cust-123": {CustomerID: "cust-123", Name: "Test User"},
			},
		}
		hasher := &mockHasher{}
		svc := NewAuthService(authRepo, customerRepo, hasher)

		customer, err := svc.GetCustomerByToken(context.Background(), "valid-token")

		if err != nil {
			t.Fatalf("GetCustomerByToken() error = %v; want nil", err)
		}
		if customer.CustomerID != "cust-123" {
			t.Errorf("CustomerID = %q; want cust-123", customer.CustomerID)
		}
	})

	t.Run("invalid token", func(t *testing.T) {
		authRepo := &mockAuthRepo{}
		customerRepo := &mockCustomerRepo{}
		hasher := &mockHasher{}
		svc := NewAuthService(authRepo, customerRepo, hasher)

		customer, err := svc.GetCustomerByToken(context.Background(), "invalid-token")

		if !errors.Is(err, ErrInvalidCredentials) {
			t.Errorf("GetCustomerByToken() error = %v; want ErrInvalidCredentials", err)
		}
		if customer != nil {
			t.Error("customer should be nil for invalid token")
		}
	})
}

func TestAuthService_Logout(t *testing.T) {
	t.Run("logout succeeds", func(t *testing.T) {
		authRepo := &mockAuthRepo{
			sessions: map[string]string{"token-to-remove": "cust-123"},
		}
		customerRepo := &mockCustomerRepo{}
		hasher := &mockHasher{}
		svc := NewAuthService(authRepo, customerRepo, hasher)

		err := svc.Logout(context.Background(), "token-to-remove")

		if err != nil {
			t.Errorf("Logout() error = %v; want nil", err)
		}
	})
}

func TestAuthService_ChangePassword(t *testing.T) {
	t.Run("successful password change", func(t *testing.T) {
		email := "test@example.com"
		authRepo := &mockAuthRepo{
			creds:      map[string]struct{ hash string }{},
			customerID: "cust-123",
		}
		authRepo.creds[email] = struct{ hash string }{hash: "hashed-oldpassword"}
		customerRepo := &mockCustomerRepo{
			customers: map[string]*domain.Customer{
				"cust-123": {CustomerID: "cust-123", Email: &email},
			},
		}
		hasher := &mockHasher{}
		svc := NewAuthService(authRepo, customerRepo, hasher)

		err := svc.ChangePassword(context.Background(), "cust-123", domain.ChangePasswordRequest{
			CurrentPassword: "oldpassword",
			NewPassword:     "newpassword",
		})

		if err != nil {
			t.Errorf("ChangePassword() error = %v; want nil", err)
		}
	})

	t.Run("wrong current password", func(t *testing.T) {
		email := "test@example.com"
		authRepo := &mockAuthRepo{
			creds:      map[string]struct{ hash string }{},
			customerID: "cust-123",
		}
		authRepo.creds[email] = struct{ hash string }{hash: "hashed-correct"}
		customerRepo := &mockCustomerRepo{
			customers: map[string]*domain.Customer{
				"cust-123": {CustomerID: "cust-123", Email: &email},
			},
		}
		hasher := &mockHasher{}
		svc := NewAuthService(authRepo, customerRepo, hasher)

		err := svc.ChangePassword(context.Background(), "cust-123", domain.ChangePasswordRequest{
			CurrentPassword: "wrongpassword",
			NewPassword:     "newpassword",
		})

		if !errors.Is(err, ErrInvalidCredentials) {
			t.Errorf("ChangePassword() error = %v; want ErrInvalidCredentials", err)
		}
	})
}

func strPtr(s string) *string { return &s }
