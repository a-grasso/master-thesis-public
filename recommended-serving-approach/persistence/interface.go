package persistence

type Persistence interface {
	FetchFromPersistence(key string) float64
	GetAllKeys() []string
}
