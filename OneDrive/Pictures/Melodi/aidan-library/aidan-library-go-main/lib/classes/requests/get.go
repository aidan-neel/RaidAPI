package requests

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
)

func Get(url string, responseClass interface{}) interface{} {
	resp, err := http.Get(url)
	if err != nil {
		log.Fatalln(err)
	}

	// Read the response

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Fatalln(err)
	}

	// Unmarshal the JSON bytes into a map
	err = json.Unmarshal(body, &responseClass)
	if err != nil {
		log.Fatalln(err)
	}

	return responseClass
}
