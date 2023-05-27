package main

import (
	"fmt"
	"time"

	"github.com/aidan-neel/aidan-library-go/lib/classes/caches"
)

func main() {
	cache := caches.NewCache(60 * time.Minute)
	cache.Set("token", "hey", 60*time.Minute)
	fmt.Println(cache)
	fmt.Println(cache.Get("token", 60*time.Minute))
}
