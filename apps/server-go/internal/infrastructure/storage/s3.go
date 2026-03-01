package storage

import (
	"bytes"
	"context"
	"io"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type S3Client struct {
	client *minio.Client
	bucket string
}

type S3Config struct {
	Endpoint        string
	AccessKey       string
	SecretKey       string
	Secure          bool
	Bucket          string
}

func NewS3Client(cfg S3Config) (*S3Client, error) {
	client, err := minio.New(cfg.Endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.AccessKey, cfg.SecretKey, ""),
		Secure: cfg.Secure,
	})
	if err != nil {
		return nil, err
	}
	s3 := &S3Client{client: client, bucket: cfg.Bucket}
	if cfg.Bucket != "" {
		if err := s3.ensureBucket(context.Background()); err != nil {
			return nil, err
		}
	}
	return s3, nil
}

func (s *S3Client) ensureBucket(ctx context.Context) error {
	exists, err := s.client.BucketExists(ctx, s.bucket)
	if err != nil {
		return err
	}
	if !exists {
		return s.client.MakeBucket(ctx, s.bucket, minio.MakeBucketOptions{})
	}
	return nil
}

func (s *S3Client) PutObject(ctx context.Context, objectName string, data []byte) error {
	_, err := s.client.PutObject(ctx, s.bucket, objectName, bytes.NewReader(data), int64(len(data)), minio.PutObjectOptions{})
	return err
}

func (s *S3Client) GetObject(ctx context.Context, objectName string) ([]byte, error) {
	obj, err := s.client.GetObject(ctx, s.bucket, objectName, minio.GetObjectOptions{})
	if err != nil {
		return nil, err
	}
	defer obj.Close()
	return io.ReadAll(obj)
}

func (s *S3Client) ListObjects(ctx context.Context, prefix string) ([]string, error) {
	ch := s.client.ListObjects(ctx, s.bucket, minio.ListObjectsOptions{Prefix: prefix, Recursive: true})
	var names []string
	for obj := range ch {
		if obj.Err != nil {
			return nil, obj.Err
		}
		names = append(names, obj.Key)
	}
	return names, nil
}

func (s *S3Client) DeleteObject(ctx context.Context, objectName string) error {
	return s.client.RemoveObject(ctx, s.bucket, objectName, minio.RemoveObjectOptions{})
}

func (s *S3Client) Bucket() string {
	return s.bucket
}

func (s *S3Client) S3URI(path string) string {
	p := path
	if len(p) > 0 && p[0] == '/' {
		p = p[1:]
	}
	return "s3a://" + s.bucket + "/" + p
}
