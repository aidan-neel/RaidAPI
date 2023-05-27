package caches

import (
	"sync"
	"time"
)

type Cache struct {
	Data       map[string]interface{}
	ExpiresIn  map[string]time.Time
	Mutex      sync.RWMutex
	DefaultTTL time.Duration
}

func NewCache(defaultTTL time.Duration) *Cache {
	return &Cache{
		Data:       make(map[string]interface{}),
		ExpiresIn:  make(map[string]time.Time),
		Mutex:      sync.RWMutex{},
		DefaultTTL: defaultTTL,
	}
}

func (c *Cache) Set(key string, value string, ttl time.Duration) {
	c.Mutex.Lock()
	defer c.Mutex.Unlock()

	c.Data[key] = value
	c.ExpiresIn[key] = time.Now().Add(ttl)
}

func (c *Cache) Get(key string, ttl time.Duration) (interface{}, bool) {
	c.Mutex.RLock()
	defer c.Mutex.RUnlock()

	value, found := c.Data[key]
	if !found {
		return nil, false
	}

	expiry, exists := c.ExpiresIn[key]
	if !exists || expiry.Before(time.Now()) {
		delete(c.Data, key)
		delete(c.ExpiresIn, key)
		return nil, false
	}

	return value, true
}
