package persistence

type Persistence interface {
	StoreInPersistence(key string, data float64)
}
