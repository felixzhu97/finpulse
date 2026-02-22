package application

import (
	"context"
	"errors"
	"strings"

	"finpulse/portfolio-api-go/internal/domain"

	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	authRepo     AuthRepo
	customerRepo CustomerRepo
}

var (
	ErrInvalidCredentials      = errors.New("invalid email or password")
	ErrEmailAlreadyRegistered  = errors.New("email already registered")
)

type AuthRepo interface {
	GetCredentialByEmail(ctx context.Context, email string) (customerID, passwordHash string, found bool, err error)
	AddCredential(ctx context.Context, customerID, email, passwordHash string) error
	CreateSession(ctx context.Context, customerID string) (token string, err error)
	GetCustomerIDByToken(ctx context.Context, token string) (customerID string, found bool, err error)
	DeleteSessionByToken(ctx context.Context, token string) error
	UpdatePasswordHash(ctx context.Context, customerID, passwordHash string) error
}

type CustomerRepo interface {
	GetByID(ctx context.Context, customerID string) (*domain.Customer, error)
	Insert(ctx context.Context, name string, email *string, kycStatus *string) (*domain.Customer, error)
}

func NewAuthService(authRepo AuthRepo, customerRepo CustomerRepo) *AuthService {
	return &AuthService{authRepo: authRepo, customerRepo: customerRepo}
}

const bcryptCost = 10

func hashPassword(password string) (string, error) {
	b, err := bcrypt.GenerateFromPassword([]byte(password), bcryptCost)
	if err != nil {
		return "", err
	}
	return string(b), nil
}

func verifyPassword(plain, hashed string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashed), []byte(plain))
	return err == nil
}

func normalizeEmail(s string) string {
	return strings.TrimSpace(strings.ToLower(s))
}

func (s *AuthService) Login(ctx context.Context, req domain.LoginRequest) (domain.LoginResponse, error) {
	email := normalizeEmail(req.Email)
	customerID, passwordHash, found, err := s.authRepo.GetCredentialByEmail(ctx, email)
	if err != nil || !found || !verifyPassword(req.Password, passwordHash) {
		return domain.LoginResponse{}, ErrInvalidCredentials
	}
	token, err := s.authRepo.CreateSession(ctx, customerID)
	if err != nil {
		return domain.LoginResponse{}, err
	}
	customer, err := s.customerRepo.GetByID(ctx, customerID)
	if err != nil || customer == nil {
		return domain.LoginResponse{}, ErrInvalidCredentials
	}
	return domain.LoginResponse{Token: token, Customer: *customer}, nil
}

func (s *AuthService) Register(ctx context.Context, req domain.RegisterRequest) (domain.LoginResponse, error) {
	email := normalizeEmail(req.Email)
	_, _, found, err := s.authRepo.GetCredentialByEmail(ctx, email)
	if err != nil {
		return domain.LoginResponse{}, err
	}
	if found {
		return domain.LoginResponse{}, ErrEmailAlreadyRegistered
	}
	customer, err := s.customerRepo.Insert(ctx, strings.TrimSpace(req.Name), &email, nil)
	if err != nil {
		return domain.LoginResponse{}, err
	}
	hash, err := hashPassword(req.Password)
	if err != nil {
		return domain.LoginResponse{}, err
	}
	if err := s.authRepo.AddCredential(ctx, customer.CustomerID, email, string(hash)); err != nil {
		return domain.LoginResponse{}, err
	}
	token, err := s.authRepo.CreateSession(ctx, customer.CustomerID)
	if err != nil {
		return domain.LoginResponse{}, err
	}
	return domain.LoginResponse{Token: token, Customer: *customer}, nil
}

func (s *AuthService) GetCustomerByToken(ctx context.Context, token string) (*domain.Customer, error) {
	customerID, found, err := s.authRepo.GetCustomerIDByToken(ctx, token)
	if err != nil || !found {
		return nil, ErrInvalidCredentials
	}
	return s.customerRepo.GetByID(ctx, customerID)
}

func (s *AuthService) Logout(ctx context.Context, token string) error {
	return s.authRepo.DeleteSessionByToken(ctx, token)
}

func (s *AuthService) ChangePassword(ctx context.Context, customerID string, req domain.ChangePasswordRequest) error {
	// Get email from customer to look up credential
	customer, err := s.customerRepo.GetByID(ctx, customerID)
	if err != nil || customer == nil || customer.Email == nil {
		return ErrInvalidCredentials
	}
	_, passwordHash, found, err := s.authRepo.GetCredentialByEmail(ctx, *customer.Email)
	if err != nil || !found {
		return ErrInvalidCredentials
	}
	if !verifyPassword(req.CurrentPassword, passwordHash) {
		return ErrInvalidCredentials
	}
	hash, err := hashPassword(req.NewPassword)
	if err != nil {
		return err
	}
	return s.authRepo.UpdatePasswordHash(ctx, customerID, string(hash))
}
