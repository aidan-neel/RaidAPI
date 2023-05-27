package requests

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
)

func Post(url string, requestBody interface{}, responseClass interface{}) interface{} {
	// Convert request body to JSON
	requestBodyBytes, err := json.Marshal(requestBody)
	if err != nil {
		log.Fatalln(err)
	}

	// Send POST request
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(requestBodyBytes))
	if err != nil {
		log.Fatalln(err)
	}

	// Read the response body
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Fatalln(err)
	}

	// Unmarshal the JSON bytes into the provided response class
	err = json.Unmarshal(body, &responseClass)
	if err != nil {
		log.Fatalln(err)
	}

	return responseClass
}
