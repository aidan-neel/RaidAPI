package fileio

import (
	"fmt"
	"io/ioutil"
)

func WriteToFile(v string, filename string) bool {
	data := []byte(v)
	err := ioutil.WriteFile(filename, data, 0644)
	if err != nil {
		panic(err)
	} else {
		fmt.Println("Successfully written to file.")
		return true
	}
}

func ReadFromFile(filename string) string {
	data, err := ioutil.ReadFile(filename)
	if err != nil {
		panic(err)
	} else {
		return (string(data))
	}
}
